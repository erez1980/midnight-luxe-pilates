import { Exercise } from '../types';
import { curatedVideoEmbeds, categoryVideoEmbeds } from './realExerciseMedia';

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
  // Direct id lookup — unambiguous, no risk of a name/keyword accidentally
  // matching the wrong exercise's video.
  const curated = curatedVideoEmbeds[exercise.id];
  const coverUrl = exercise.imageUrl || (exercise.category && coverByCategory[exercise.category]) || coverByApparatus[exercise.apparatus];

  // Choose inline embed: curated (exact match for this exercise) first, then category fallback
  const categoryEmbed = exercise.category ? categoryVideoEmbeds[exercise.category] : undefined;
  const inlineVideo = curated || categoryEmbed;
  return {
    hasInlineVideo: Boolean(inlineVideo?.embedUrl),
    isDedicatedVideo: Boolean(curated?.embedUrl),
    embedUrl: inlineVideo?.embedUrl,
    coverUrl,
    mediaLabel: inlineVideo?.label || 'תמונת תרגיל והנחיות ביצוע'
  };
}
