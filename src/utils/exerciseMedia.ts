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

const manualExerciseMedia: Array<{ match: RegExp; id: string; label: string }> = [
  { match: /(hundred|המאות)/i, id: 'tE6wQGJd7uI', label: 'The Hundred' },
  { match: /(roll up|גלגול מעלה)/i, id: 'cM-6Yz1j2Yg', label: 'Roll Up' },
  { match: /(roll over|rollover)/i, id: 'L7J6Y9A0mMM', label: 'Roll Over' },
  { match: /(single leg stretch|רגל אחת)/i, id: '9xS8fD0gUJ4', label: 'Single Leg Stretch' },
  { match: /(double leg stretch|שתי רגליים)/i, id: 'T2xM6C4p8K0', label: 'Double Leg Stretch' },
  { match: /(spine stretch|מתיחת עמוד שדרה)/i, id: 'g_tea8ZNk5A', label: 'Spine Stretch' },
  { match: /(swan|ברבור)/i, id: 'iJ0l7Xc9wKs', label: 'Swan' },
  { match: /(teaser|טיזר)/i, id: 'R6DQaQv7sWU', label: 'Teaser' },
  { match: /(plank|פלאנק)/i, id: 'ASdvN_XEl_c', label: 'Plank' },
  { match: /(bridge|גשר)/i, id: 'N3YVZcW9m1E', label: 'Bridge' },
  { match: /(side kick|בעיטות צד)/i, id: 'I9S3Qk8mP4Y', label: 'Side Kick' },
  { match: /(mermaid|מרמייד)/i, id: '7w2mH8m9YgQ', label: 'Mermaid' },
  { match: /(elephant|הפיל)/i, id: 'kL-2uW5XkY8', label: 'Elephant' },
  { match: /(footwork|עבודת רגליים)/i, id: 'pA8m9QK4Q2I', label: 'Footwork' },
  { match: /(long stretch|מתיחה ארוכה)/i, id: 'TZ0Z4x0sK7g', label: 'Long Stretch' },
  { match: /(short box|קופסה קצרה)/i, id: 'P8W9Rk3fT1Y', label: 'Short Box' },
  { match: /(rowing|חתירה)/i, id: '8m4f7gL2sQ0', label: 'Rowing' },
  { match: /(pulling straps|רצועות)/i, id: 'S6o9F2kLm2I', label: 'Pulling Straps' },
  { match: /(leg circles|מעגלי רגליים)/i, id: 'Y4s2K0mL9qA', label: 'Leg Circles' },
  { match: /(cat stretch|חתול)/i, id: 'R2n6M8xQw5E', label: 'Cat Stretch' }
];

const fallbackByApparatus: Record<string, string> = {
  mat: 'lCg_gh_fppI',
  reformer: '9on9d4FK580',
  cadillac: 'vHrmiyyxRkA',
  chair: '6h1nNa1Vf8Y',
  props: 'EzdT2xagKxA'
};

const coverByCategory: Record<string, string> = {
  warmup: '/covers/warmup.svg',
  core: '/covers/core.svg',
  glutes: '/covers/glutes.svg',
  mobility: '/covers/mobility.svg',
  balance: '/covers/balance.svg',
  'upper-body': '/covers/upper-body.svg',
  cooldown: '/covers/cooldown.svg',
  'full-body': '/covers/full-body.svg'
};

const coverByApparatus: Record<string, string> = {
  mat: '/covers/mat.svg',
  reformer: '/covers/reformer.svg',
  cadillac: '/covers/cadillac.svg',
  chair: '/covers/chair.svg',
  props: '/covers/props.svg'
};

export function getExerciseMedia(exercise: Exercise) {
  const matched = manualExerciseMedia.find((item) => item.match.test(exercise.name) || item.match.test(exercise.englishName));
  const youtubeId = matched?.id || fallbackByApparatus[exercise.apparatus] || 'lCg_gh_fppI';

  const searchQuery = encodeURIComponent([
    exercise.englishName,
    apparatusQueries[exercise.apparatus],
    exercise.category ? categoryQueries[exercise.category] : ''
  ].filter(Boolean).join(' '));

  return {
    youtubeId,
    watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    searchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
    coverUrl: (exercise.category && coverByCategory[exercise.category]) || coverByApparatus[exercise.apparatus],
    mediaLabel: matched?.label || `${exercise.apparatusLabel} demo`
  };
}
