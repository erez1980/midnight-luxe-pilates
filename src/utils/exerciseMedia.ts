import { Exercise } from '../types';

const apparatusQueries: Record<string, string> = {
  mat: 'pilates mat exercise',
  reformer: 'pilates reformer exercise',
  cadillac: 'pilates cadillac exercise',
  chair: 'pilates wunda chair exercise',
  props: 'pilates props exercise'
};

const categoryQueries: Record<string, string> = {
  warmup: 'warm up',
  core: 'core',
  glutes: 'glutes legs',
  mobility: 'mobility stretch',
  balance: 'balance stability',
  'upper-body': 'upper body arms',
  cooldown: 'cool down stretch',
  'full-body': 'full body'
};

const youtubeMap: Array<{ match: RegExp; id: string }> = [
  { match: /(hundred|המאות)/i, id: 'tE6wQGJd7uI' },
  { match: /(roll up|גלגול מעלה)/i, id: 'cM-6Yz1j2Yg' },
  { match: /(teaser|טיזר)/i, id: 'R6DQaQv7sWU' },
  { match: /(footwork|עבודת רגליים)/i, id: 'pA8m9QK4Q2I' },
  { match: /(elephant|הפיל)/i, id: 'kL-2uW5XkY8' },
  { match: /(mermaid|מרמייד)/i, id: '7w2mH8m9YgQ' },
  { match: /(bridge|גשר)/i, id: 'N3YVZcW9m1E' },
  { match: /(plank|פלאנק)/i, id: 'ASdvN_XEl_c' },
  { match: /(side kick|בעיטות צד)/i, id: 'I9S3Qk8mP4Y' },
  { match: /(spine stretch|מתיחת עמוד שדרה)/i, id: 'g_tea8ZNk5A' },
  { match: /(swan|ברבור)/i, id: 'iJ0l7Xc9wKs' }
];

const fallbackByApparatus: Record<string, string> = {
  mat: 'lCg_gh_fppI',
  reformer: '9on9d4FK580',
  cadillac: 'vHrmiyyxRkA',
  chair: '6h1nNa1Vf8Y',
  props: 'EzdT2xagKxA'
};

export function getExerciseMedia(exercise: Exercise) {
  const matched = youtubeMap.find((item) => item.match.test(exercise.name) || item.match.test(exercise.englishName));
  const youtubeId = matched?.id || fallbackByApparatus[exercise.apparatus] || 'lCg_gh_fppI';

  const searchQuery = encodeURIComponent([
    exercise.englishName,
    apparatusQueries[exercise.apparatus],
    exercise.category ? categoryQueries[exercise.category] : ''
  ].filter(Boolean).join(' '));

  return {
    youtubeId,
    embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    searchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`
  };
}
