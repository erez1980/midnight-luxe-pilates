import type { Lesson } from '../types';
import { parseLesson, parseLessons } from './lessonValidation.ts';

export type Collection = 'lessons' | 'templates';
export type CloudRow = { collection: Collection; id: string; lesson: Lesson; revision: string; deleted: boolean };
export type PendingChange = { collection: Collection; id: string; lesson: Lesson; deleted: boolean; expectedRevision: string | null; token: string };
export type Workspace = { lessons: Lesson[]; templates: Lesson[]; revisions: Record<string, string>; pending: Record<string, PendingChange> };
export const emptyWorkspace = (): Workspace => ({ lessons: [], templates: [], revisions: {}, pending: {} });
export const itemKey = (collection: Collection, id: string) => `${collection}:${id}`;
export const workspaceKey = (scope: string) => `pilates:workspace:v3:${scope}`;
export const draftKey = (scope: string, lessonId = 'new') => `pilates:draft:v3:${scope}:${lessonId}`;

export function readWorkspace(scope: string): Workspace {
  const raw = localStorage.getItem(workspaceKey(scope));
  if (!raw) return emptyWorkspace();
  const v = JSON.parse(raw) as Workspace;
  const result = { ...emptyWorkspace(), lessons: parseLessons(v.lessons), templates: parseLessons(v.templates) };
  if (!v.revisions || !v.pending || typeof v.revisions !== 'object' || typeof v.pending !== 'object') throw new Error('הגיבוי המקומי אינו תקין');
  for (const [key, revision] of Object.entries(v.revisions)) {
    if (typeof revision !== 'string') throw new Error('גרסת גיבוי אינה תקינה');
    result.revisions[key] = revision;
  }
  for (const [key, change] of Object.entries(v.pending)) {
    if (!change || !['lessons', 'templates'].includes(change.collection) || typeof change.token !== 'string' || (change.expectedRevision !== null && typeof change.expectedRevision !== 'string')) throw new Error('שינוי מקומי אינו תקין');
    const lesson = parseLesson(change.lesson);
    if (itemKey(change.collection, lesson.id) !== key || change.id !== lesson.id) throw new Error('מזהה שינוי אינו תקין');
    result.pending[key] = { ...change, lesson, deleted: Boolean(change.deleted) };
  }
  return result;
}
export function writeWorkspace(scope: string, workspace: Workspace) {
  localStorage.setItem(workspaceKey(scope), JSON.stringify(workspace));
}
export function changeCollection(workspace: Workspace, collection: Collection, next: Lesson[]): Workspace {
  const valid = parseLessons(next);
  const previous = new Map(workspace[collection].map((lesson) => [lesson.id, lesson]));
  const upcoming = new Map(valid.map((lesson) => [lesson.id, lesson]));
  const pending = { ...workspace.pending };
  for (const id of new Set([...previous.keys(), ...upcoming.keys()])) {
    const before = previous.get(id);
    const after = upcoming.get(id);
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    const key = itemKey(collection, id);
    pending[key] = { collection, id, lesson: after || before!, deleted: !after,
      expectedRevision: pending[key] ? pending[key].expectedRevision : workspace.revisions[key] ?? null, token: crypto.randomUUID() };
  }
  return { ...workspace, [collection]: valid, pending };
}
export function mergeRemote(workspace: Workspace, rows: CloudRow[]) {
  const collections = { lessons: new Map(workspace.lessons.map((l) => [l.id, l])), templates: new Map(workspace.templates.map((l) => [l.id, l])) };
  const revisions = { ...workspace.revisions };
  const conflicts: string[] = [];
  const remote = new Map(rows.map((row) => [itemKey(row.collection, row.id), row]));
  for (const row of rows) {
    const key = itemKey(row.collection, row.id);
    revisions[key] = row.revision;
    if (!workspace.pending[key]) {
      if (row.deleted) collections[row.collection].delete(row.id);
      else collections[row.collection].set(row.id, row.lesson);
    }
  }
  for (const [key, change] of Object.entries(workspace.pending)) {
    if ((remote.get(key)?.revision ?? null) !== change.expectedRevision) conflicts.push(key);
  }
  return { workspace: { ...workspace, lessons: [...collections.lessons.values()], templates: [...collections.templates.values()], revisions }, conflicts };
}
export function acknowledge(workspace: Workspace, sent: PendingChange, revision: string): Workspace {
  const key = itemKey(sent.collection, sent.id);
  const pending = { ...workspace.pending };
  if (pending[key]?.token === sent.token) delete pending[key];
  else if (pending[key]) pending[key] = { ...pending[key], expectedRevision: revision };
  return { ...workspace, pending, revisions: { ...workspace.revisions, [key]: revision } };
}
