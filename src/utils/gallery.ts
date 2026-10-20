// Shared by the marketing site (read-only) and the app's gallery manager.
// The site fetches over plain REST so it doesn't pull in supabase-js.

export type GalleryKind = 'image' | 'video';

export interface GalleryItem {
  id: string;
  url: string;
  kind: GalleryKind;
  caption_he: string;
  caption_en: string;
}

export interface GalleryRow {
  id: string;
  path: string;
  kind: GalleryKind;
  caption_he: string;
  caption_en: string;
  sort: number;
  created_at: string;
}

// Must match public.is_gallery_admin() in supabase/migrations/20261020_gallery.sql
// (the database enforces it; this list only decides what the app shows).
export const GALLERY_ADMINS = ['rotem1980.shapira@gmail.com', 'erez1980@gmail.com'];

export const GALLERY_BUCKET = 'gallery';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function galleryPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${GALLERY_BUCKET}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

export function isGalleryAdmin(email?: string | null) {
  return Boolean(email && GALLERY_ADMINS.includes(email.toLowerCase()));
}

// Items uploaded through the app. Any failure (Supabase not configured,
// project paused, table missing) just means "no uploaded items".
export async function fetchUploadedGallery(): Promise<GalleryItem[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gallery_items?select=id,path,kind,caption_he,caption_en&order=sort.asc,created_at.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as GalleryRow[];
    return rows.map((row) => ({
      id: row.id,
      url: galleryPublicUrl(row.path),
      kind: row.kind,
      caption_he: row.caption_he || '',
      caption_en: row.caption_en || '',
    }));
  } catch {
    return [];
  }
}
