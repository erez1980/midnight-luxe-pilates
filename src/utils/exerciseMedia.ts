import { Exercise } from '../types';
import { curatedVideoEmbeds, categoryVideoEmbeds } from './realExerciseMedia';

const manualKeys: Array<{ match: RegExp; key: keyof typeof curatedVideoEmbeds; label: string }> = [
  { match: /(hundred|המאות)/i, key: 'hundred' as keyof typeof curatedVideoEmbeds, label: 'The Hundred' },
  { match: /(roll up|גלגול מעלה)/i, key: 'roll_up' as keyof typeof curatedVideoEmbeds, label: 'Roll Up' },
  { match: /(teaser|טיזר)/i, key: 'teaser' as keyof typeof curatedVideoEmbeds, label: 'Teaser' },
  { match: /(footwork|עבודת רגליים)/i, key: 'footwork' as keyof typeof curatedVideoEmbeds, label: 'Reformer Footwork' },
  { match: /(mermaid|מרמייד)/i, key: 'mermaid' as keyof typeof curatedVideoEmbeds, label: 'Mermaid' },
  { match: /(bridge|גשר)/i, key: 'bridge' as keyof typeof curatedVideoEmbeds, label: 'Bridge' },
  { match: /(plank|פלאנק)/i, key: 'plank' as keyof typeof curatedVideoEmbeds, label: 'Plank' }
];

const coverByCategory: Record<string, string> = {
  warmup: './covers/warmup.svg',
  core: './covers/core.svg',
  glutes: './covers/glutes.svg',
  mobility: './covers/mobility.svg',
  balance: './covers/balance.svg',
  'upper-body': './covers/upper-body.svg',
  cooldown: './covers/cooldown.svg',
  'full-body': './covers/full-body.svg'
};

const coverByApparatus: Record<string, string> = {
  mat: './covers/mat.svg',
  reformer: './covers/reformer.svg',
  cadillac: './covers/cadillac.svg',
  chair: './covers/chair.svg',
  props: './covers/props.svg'
};

export function getExerciseMedia(exercise: Exercise) {
  const matched = manualKeys.find((item) => item.match.test(exercise.name) || item.match.test(exercise.englishName));
  const curated = matched ? curatedVideoEmbeds[matched.key] : undefined;
  const coverUrl = exercise.imageUrl || (exercise.category && coverByCategory[exercise.category]) || coverByApparatus[exercise.apparatus];

  // Choose inline embed: curated first, then category fallback
  const categoryEmbed = exercise.category ? categoryVideoEmbeds[exercise.category] : undefined;
  const inlineVideo = curated || categoryEmbed;
  return {
    hasInlineVideo: Boolean(inlineVideo?.embedUrl),
    embedUrl: inlineVideo?.embedUrl,
    thumbnailUrl: coverUrl,
    coverUrl,
    mediaLabel: inlineVideo?.label || curated?.label || matched?.label || 'תמונת תרגיל והנחיות ביצוע'
  };
}
