import { Exercise } from '../types';
import { curatedYoutubeLinks } from './realExerciseMedia';

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

const manualExerciseMedia: Array<{ match: RegExp; key: keyof typeof curatedYoutubeLinks }> = [
  { match: /(hundred|המאות)/i, key: 'hundred' },
  { match: /(roll up|גלגול מעלה)/i, key: 'roll_up' },
  { match: /(roll over|rollover)/i, key: 'roll_over' },
  { match: /(single leg stretch|רגל אחת)/i, key: 'single_leg_stretch' },
  { match: /(double leg stretch|שתי רגליים)/i, key: 'double_leg_stretch' },
  { match: /(spine stretch|מתיחת עמוד שדרה)/i, key: 'spine_stretch' },
  { match: /(swan|ברבור)/i, key: 'swan' },
  { match: /(teaser|טיזר)/i, key: 'teaser' },
  { match: /(plank|פלאנק)/i, key: 'plank' },
  { match: /(bridge|גשר)/i, key: 'bridge' },
  { match: /(side kick|בעיטות צד)/i, key: 'side_kick' },
  { match: /(mermaid|מרמייד)/i, key: 'mermaid' },
  { match: /(elephant|הפיל)/i, key: 'elephant' },
  { match: /(footwork|עבודת רגליים)/i, key: 'footwork' },
  { match: /(long stretch|מתיחה ארוכה)/i, key: 'long_stretch' },
  { match: /(short box|קופסה קצרה)/i, key: 'short_box' },
  { match: /(rowing|חתירה)/i, key: 'rowing' },
  { match: /(pulling straps|רצועות)/i, key: 'pulling_straps' },
  { match: /(leg circles|מעגלי רגליים)/i, key: 'leg_circles' },
  { match: /(cat stretch|חתול)/i, key: 'cat_stretch' }
];

const fallbackByApparatus: Record<string, string> = {
  mat: 'https://www.youtube.com/results?search_query=pilates+mat+exercise',
  reformer: 'https://www.youtube.com/results?search_query=pilates+reformer+exercise',
  cadillac: 'https://www.youtube.com/results?search_query=pilates+cadillac+exercise',
  chair: 'https://www.youtube.com/results?search_query=pilates+wunda+chair+exercise',
  props: 'https://www.youtube.com/results?search_query=pilates+props+exercise'
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
  const curated = matched ? curatedYoutubeLinks[matched.key] : null;

  const searchQuery = encodeURIComponent([
    exercise.englishName,
    apparatusQueries[exercise.apparatus],
    exercise.category ? categoryQueries[exercise.category] : ''
  ].filter(Boolean).join(' '));

  return {
    watchUrl: curated?.watchUrl || fallbackByApparatus[exercise.apparatus],
    thumbnailUrl: exercise.imageUrl || ((exercise.category && coverByCategory[exercise.category]) || coverByApparatus[exercise.apparatus]),
    searchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
    coverUrl: (exercise.category && coverByCategory[exercise.category]) || coverByApparatus[exercise.apparatus],
    mediaLabel: curated?.label || `${exercise.apparatusLabel} demo`
  };
}
