import type { GalleryItem } from '../utils/gallery';

// Gallery items that ship with the site itself (files in public/gallery/).
// Items Rotem uploads through the app (/app/?page=gallery) are loaded at
// runtime and shown after these. The section stays hidden while both are empty.
//
// Example:
//   { id: 'studio-1', url: 'gallery/studio-1.webp', kind: 'image', caption_he: 'שיעור מזרן', caption_en: 'Mat class' },
export const STATIC_GALLERY: GalleryItem[] = [];
