import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, LogIn, Trash2, Video } from 'lucide-react';
import { supabase, supabaseEnabled } from '../lib/supabase';
import { GALLERY_BUCKET, GalleryRow, galleryPublicUrl, isGalleryAdmin } from '../utils/gallery';
import Button from './ui/Button';

// Gallery manager (/app/?page=gallery): Rotem uploads photos and videos that
// appear in the "גלריה" section of the marketing site. Access is enforced by
// the database (public.is_gallery_admin); this screen only mirrors it.

const MAX_VIDEO_MB = 50; // Supabase free-plan per-file limit
const MAX_IMAGE_EDGE = 1800;

// Phone photos are often 4–8 MB; resize to a web-friendly WebP before upload.
// Anything the browser can't decode (e.g. HEIC outside Safari) goes up as-is.
async function prepareImage(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
    if (blob) return { blob, ext: 'webp', type: 'image/webp' };
  } catch {
    // fall through to the original file
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  return { blob: file, ext, type: file.type || 'image/jpeg' };
}

export default function GalleryManager({
  email,
  onGoogleLogin,
}: {
  email?: string | null;
  onGoogleLogin: () => void;
}) {
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const admin = isGalleryAdmin(email);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('gallery_items')
      .select('*')
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false });
    if (loadError) setError(`לא ניתן לטעון את הגלריה: ${loadError.message}`);
    setRows((data as GalleryRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (admin) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const upload = async (files: FileList | null) => {
    if (!files?.length || !supabase) return;
    setError('');
    // New items go first: give them sort values below the current minimum.
    let sort = (rows.length ? Math.min(...rows.map((r) => r.sort)) : 0) - files.length;
    for (const [i, file] of Array.from(files).entries()) {
      setBusy(`מעלה ${i + 1} מתוך ${files.length}…`);
      const isVideo = file.type.startsWith('video/');
      if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
        setError(`״${file.name}״ גדול מ-${MAX_VIDEO_MB}MB. אפשר לקצר או לכווץ את הסרטון ולנסות שוב.`);
        continue;
      }
      const prepared = isVideo
        ? { blob: file as Blob, ext: (file.name.split('.').pop() || 'mp4').toLowerCase(), type: file.type }
        : await prepareImage(file);
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${prepared.ext}`;
      const { error: upError } = await supabase.storage
        .from(GALLERY_BUCKET)
        .upload(path, prepared.blob, { contentType: prepared.type, cacheControl: '31536000' });
      if (upError) {
        setError(`ההעלאה של ״${file.name}״ נכשלה: ${upError.message}`);
        continue;
      }
      const { error: rowError } = await supabase
        .from('gallery_items')
        .insert({ path, kind: isVideo ? 'video' : 'image', sort: sort++ });
      if (rowError) {
        setError(`הקובץ עלה אבל לא נשמר בגלריה: ${rowError.message}`);
        await supabase.storage.from(GALLERY_BUCKET).remove([path]);
      }
    }
    setBusy('');
    if (fileInput.current) fileInput.current.value = '';
    load();
  };

  const saveCaption = async (row: GalleryRow, field: 'caption_he' | 'caption_en', value: string) => {
    if (!supabase || row[field] === value) return;
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, [field]: value } : r)));
    const { error: saveError } = await supabase.from('gallery_items').update({ [field]: value }).eq('id', row.id);
    if (saveError) setError(`שמירת הכיתוב נכשלה: ${saveError.message}`);
  };

  const move = async (index: number, delta: -1 | 1) => {
    const other = index + delta;
    if (!supabase || other < 0 || other >= rows.length) return;
    // Renumber the whole list so equal sort values can't make swaps no-ops.
    const reordered = [...rows];
    [reordered[index], reordered[other]] = [reordered[other], reordered[index]];
    const renumbered = reordered.map((r, i) => ({ ...r, sort: i }));
    setRows(renumbered);
    await Promise.all(
      renumbered.map((r) => supabase!.from('gallery_items').update({ sort: r.sort }).eq('id', r.id))
    );
  };

  const remove = async (row: GalleryRow) => {
    if (!supabase || !window.confirm('למחוק את הפריט מהגלריה?')) return;
    const { error: delError } = await supabase.from('gallery_items').delete().eq('id', row.id);
    if (delError) {
      setError(`המחיקה נכשלה: ${delError.message}`);
      return;
    }
    await supabase.storage.from(GALLERY_BUCKET).remove([row.path]);
    setRows((current) => current.filter((r) => r.id !== row.id));
  };

  const shell = (children: React.ReactNode) => (
    <div className="max-w-[1100px] mx-auto px-6 md:px-20 py-10">
      <h2 className="serif-text text-3xl md:text-5xl font-bold text-on-surface mb-3">ניהול גלריה</h2>
      <p className="text-on-surface-variant mb-8 max-w-2xl">
        תמונות וסרטונים שמעלים כאן מופיעים בסקשן ״גלריה״ באתר, בעברית ובאנגלית. הפריט הראשון ברשימה מוצג ראשון.
      </p>
      {children}
    </div>
  );

  if (!supabaseEnabled) {
    return shell(<p className="text-on-surface-variant">הגלריה דורשת חיבור ל-Supabase, שאינו מוגדר בגרסה הזו.</p>);
  }
  if (!email) {
    return shell(
      <Button type="button" onClick={onGoogleLogin} variant="primary" size="md">
        <LogIn className="w-4 h-4" />
        התחברות עם Google
      </Button>
    );
  }
  if (!admin) {
    return shell(<p className="text-on-surface-variant">לחשבון {email} אין הרשאה לנהל את הגלריה.</p>);
  }

  return shell(
    <>
      <div className="mb-8 rounded-2xl border border-dashed border-secondary/40 bg-secondary/5 p-6 text-center">
        <input
          ref={fileInput}
          id="gallery-upload"
          type="file"
          multiple
          accept="image/*,video/mp4,video/quicktime,video/webm"
          onChange={(e) => upload(e.target.files)}
          className="sr-only"
        />
        <label
          htmlFor="gallery-upload"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-6 py-3 font-bold text-on-secondary hover:bg-secondary-fixed"
        >
          <ImagePlus className="w-5 h-5" />
          העלאת תמונות וסרטונים
        </label>
        <p className="mt-3 text-xs text-on-surface-variant">
          אפשר לבחור כמה קבצים יחד. תמונות מוקטנות אוטומטית; סרטונים עד {MAX_VIDEO_MB}MB.
        </p>
        {busy && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" /> {busy}
          </p>
        )}
      </div>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">{error}</div>}

      {loading ? (
        <p className="text-on-surface-variant">טוען…</p>
      ) : rows.length === 0 ? (
        <p className="text-on-surface-variant">הגלריה ריקה. אחרי ההעלאה הראשונה הסקשן יופיע באתר.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li key={row.id} className="flex flex-col gap-4 rounded-2xl border border-outline/20 bg-surface-container p-3 sm:flex-row sm:items-center">
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container-high sm:w-40">
                {row.kind === 'video' ? (
                  <>
                    <video src={`${galleryPublicUrl(row.path)}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <Video className="absolute top-2 left-2 w-4 h-4 text-white drop-shadow" />
                  </>
                ) : (
                  <img src={galleryPublicUrl(row.path)} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <input
                  defaultValue={row.caption_he}
                  onBlur={(e) => saveCaption(row, 'caption_he', e.target.value.trim())}
                  placeholder="כיתוב בעברית (לא חובה)"
                  className="rounded-xl border border-outline/30 bg-background px-3 py-2 text-sm"
                />
                <input
                  dir="ltr"
                  defaultValue={row.caption_en}
                  onBlur={(e) => saveCaption(row, 'caption_en', e.target.value.trim())}
                  placeholder="English caption (optional)"
                  className="rounded-xl border border-outline/30 bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 self-end sm:self-center">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="למעלה" className="p-2 text-on-surface-variant hover:text-on-surface disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} title="למטה" className="p-2 text-on-surface-variant hover:text-on-surface disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(row)} title="מחיקה" className="p-2 text-error/80 hover:text-error">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
