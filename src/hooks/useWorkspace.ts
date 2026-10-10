import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '../types';
import { supabaseEnabled } from '../lib/supabase';
import { pullCloudLessons, pushCloudChange, SyncConflict } from '../utils/cloudSync';
import { acknowledge, changeCollection, emptyWorkspace, itemKey, mergeRemote, readWorkspace, writeWorkspace } from '../utils/workspace';
import type { CloudRow, Collection, Workspace } from '../utils/workspace';

type Status = 'idle' | 'syncing' | 'synced' | 'error';
type Store = { scope: string; value: Workspace; loaded: boolean; blocked: boolean };
export function useWorkspace(userId: string | null, authReady: boolean, notice: (message: string) => void) {
  const scope = userId || 'guest';
  const store = useRef<Store>({ scope: '', value: emptyWorkspace(), loaded: false, blocked: false });
  const [, render] = useState(0);
  const [cloudStatus, setCloudStatus] = useState<Status>('idle');
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [retry, setRetry] = useState(0);
  const remote = useRef<CloudRow[]>([]);
  // One serialized queue across rerenders AND account switches. A request already
  // sent for account A may finish, but cannot write to B's local state or records.
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [generation, setGeneration] = useState(0);
  const noticeRef = useRef(notice);
  noticeRef.current = notice;

  const publish = (owner: Store, next: Workspace): boolean => {
    if (store.current !== owner) return false;
    try {
      writeWorkspace(owner.scope, next);
    } catch {
      owner.blocked = true;
      noticeRef.current('השמירה במכשיר נכשלה. יש לפנות מקום או לאפשר אחסון. לא נשלחו שינויים חדשים לענן.');
      return false;
    }
    owner.value = next;
    render((n) => n + 1);
    return true;
  };

  useEffect(() => {
    if (!authReady) return;
    const owner: Store = { scope, value: emptyWorkspace(), loaded: false, blocked: false };
    store.current = owner;
    setCloudStatus('idle');
    setConflicts([]);
    remote.current = [];
    try {
      owner.value = readWorkspace(scope);
      owner.loaded = true;
    } catch {
      // Do not overwrite a corrupt/blocked store with an empty array.
      owner.blocked = true;
      setCloudStatus('error');
      noticeRef.current('לא ניתן לקרוא את הגיבוי המקומי. הנתונים המקוריים נשארו במכשיר; יש לייצא אותם לפני איפוס האחסון.');
    }
    render((n) => n + 1);
    setGeneration((n) => n + 1);
    return () => { if (store.current === owner) store.current = { scope: '', value: emptyWorkspace(), loaded: false, blocked: false }; };
  }, [scope, authReady]);

  const pendingSignature = Object.values(store.current.scope === scope ? store.current.value.pending : {}).map((p) => p.token).join(',');
  useEffect(() => {
    const owner = store.current;
    if (!authReady || !userId || !supabaseEnabled || !owner.loaded || owner.blocked || owner.scope !== scope) return;
    let disposed = false;
    const isCurrent = () => !disposed && store.current === owner && !owner.blocked;
    // Cleanup only invalidates results. The promise queue still waits for the
    // previous write to finish before beginning any new read/write sequence.
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (!isCurrent()) return;
      setCloudStatus('syncing');
      try {
        const rows = await pullCloudLessons(userId);
        if (!isCurrent()) return;
        remote.current = rows;
        const merged = mergeRemote(owner.value, rows);
        if (!publish(owner, merged.workspace)) { setCloudStatus('error'); return; }
        setConflicts(merged.conflicts);
        if (merged.conflicts.length) { setCloudStatus('error'); return; }
        // Changes are read from the current store so edits made during a pull
        // cannot be dropped or replaced by an earlier render's snapshot.
        while (isCurrent()) {
          const change = Object.values(owner.value.pending)[0];
          if (!change) break;
          const revision = await pushCloudChange(userId, change);
          // Even if the effect was superseded, remember a completed write for
          // this same owner so the next queued edit has the correct revision.
          if (store.current !== owner) return;
          if (!publish(owner, acknowledge(owner.value, change, revision))) { setCloudStatus('error'); return; }
        }
        if (isCurrent()) setCloudStatus('synced');
      } catch (error) {
        if (!isCurrent()) return;
        setCloudStatus('error');
        if (error instanceof SyncConflict) {
          // Re-read to show the actual conflict, without retrying an overwrite.
          const rows = await pullCloudLessons(userId).catch(() => null);
          if (!isCurrent()) return;
          if (rows) {
            remote.current = rows;
            const merged = mergeRemote(owner.value, rows);
            publish(owner, merged.workspace);
            setConflicts(merged.conflicts);
          }
        }
        noticeRef.current(error instanceof Error ? error.message : 'הסנכרון נכשל. הנתונים נשארו במכשיר.');
      }
    });
    return () => { disposed = true; };
  }, [scope, authReady, userId, generation, pendingSignature, retry]);

  useEffect(() => {
    const refresh = () => { if (!document.hidden) setRetry((n) => n + 1); };
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const replace = (collection: Collection, lessons: Lesson[]) => {
    const owner = store.current;
    if (owner.scope !== scope || !owner.loaded || owner.blocked) { noticeRef.current('הסביבה עדיין אינה מוכנה לשמירה'); return false; }
    try { return publish(owner, changeCollection(owner.value, collection, lessons)); }
    catch (error) { noticeRef.current(error instanceof Error ? error.message : 'השיעור אינו תקין'); return false; }
  };
  const resolve = (preferLocal: boolean) => {
    const owner = store.current;
    if (owner.scope !== scope) return;
    const pending = { ...owner.value.pending };
    for (const key of conflicts) {
      if (!pending[key]) continue;
      if (preferLocal) pending[key] = { ...pending[key], expectedRevision: remote.current.find((r) => itemKey(r.collection, r.id) === key)?.revision ?? null, token: crypto.randomUUID() };
      else {
        delete pending[key];
        if (!remote.current.some((r) => itemKey(r.collection, r.id) === key)) {
          const change = owner.value.pending[key];
          owner.value = { ...owner.value, [change.collection]: owner.value[change.collection].filter((l) => l.id !== change.id) };
        }
      }
    }
    const merged = mergeRemote({ ...owner.value, pending }, remote.current);
    if (publish(owner, merged.workspace)) { setConflicts([]); setRetry((n) => n + 1); }
  };
  const current = store.current.scope === scope && authReady ? store.current.value : emptyWorkspace();
  return { lessons: current.lessons, templates: current.templates, scope, cloudStatus, conflicts,
    loaded: authReady && store.current.scope === scope && store.current.loaded && !store.current.blocked,
    blocked: store.current.scope === scope && store.current.blocked,
    setLessons: (lessons: Lesson[]) => replace('lessons', lessons), setTemplates: (lessons: Lesson[]) => replace('templates', lessons),
    setCollections: (lessons: Lesson[], templates: Lesson[]) => {
      const owner = store.current;
      if (owner.scope !== scope || !owner.loaded || owner.blocked) return false;
      try { return publish(owner, changeCollection(changeCollection(owner.value, 'lessons', lessons), 'templates', templates)); }
      catch { noticeRef.current('הייבוא לא נשמר. הנתונים הקיימים נשארו ללא שינוי.'); return false; }
    },
    retrySync: () => setRetry((n) => n + 1), resolveConflicts: resolve };
}
