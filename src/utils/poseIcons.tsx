import React from 'react';

// Picks a simple pose category from the Hebrew instruction text so we can show
// a generic (not exercise-specific) stick-figure icon next to each step.
// This is intentionally coarse — it's a visual anchor for "what position am I
// in", not an illustration of the exercise itself.
export type PoseKey =
  | 'lying_back'
  | 'lying_front'
  | 'lying_side'
  | 'seated'
  | 'standing'
  | 'kneeling'
  | 'all_fours'
  | 'bridge'
  | 'plank'
  | 'neutral';

const RULES: Array<[RegExp, PoseKey]> = [
  [/גשר/, 'bridge'],
  [/פלאנק/, 'plank'],
  [/ארבע/, 'all_fours'],
  [/כרע/, 'kneeling'],
  [/עמד/, 'standing'],
  [/שב/, 'seated'],
  [/שכב.*(בטן|פנים)/, 'lying_front'],
  [/שכב.*צד/, 'lying_side'],
  [/שכב/, 'lying_back'],
];

export function pickPoseIcon(stepText: string): PoseKey {
  for (const [pattern, key] of RULES) {
    if (pattern.test(stepText)) return key;
  }
  return 'neutral';
}

const STROKE = '#e9c349';
const STROKE_DIM = 'rgba(233, 195, 73, 0.45)';

// Each icon is a minimal stick figure in a 48x48 box, drawn with the site's
// gold accent color. Deliberately generic — see pickPoseIcon above.
export function PoseIcon({ pose, className }: { pose: PoseKey; className?: string }) {
  const common = {
    fill: 'none',
    stroke: STROKE,
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const head = (cx: number, cy: number) => (
    <circle cx={cx} cy={cy} r={4} fill={STROKE} stroke="none" />
  );

  let content: React.ReactNode;
  switch (pose) {
    case 'lying_back':
      content = (
        <>
          {head(10, 24)}
          <line x1="14" y1="24" x2="34" y2="24" {...common} />
          <line x1="34" y1="24" x2="40" y2="18" {...common} />
          <line x1="40" y1="18" x2="44" y2="24" {...common} stroke={STROKE_DIM} />
          <line x1="20" y1="24" x2="16" y2="16" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    case 'lying_front':
      content = (
        <>
          {head(10, 22)}
          <line x1="14" y1="23" x2="36" y2="26" {...common} />
          <line x1="36" y1="26" x2="42" y2="22" {...common} stroke={STROKE_DIM} />
          <line x1="18" y1="24" x2="12" y2="30" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    case 'lying_side':
      content = (
        <>
          {head(10, 20)}
          <line x1="14" y1="21" x2="36" y2="24" {...common} />
          <line x1="24" y1="22" x2="28" y2="30" {...common} stroke={STROKE_DIM} />
          <line x1="30" y1="23" x2="34" y2="31" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    case 'seated':
      content = (
        <>
          {head(24, 10)}
          <line x1="24" y1="14" x2="24" y2="26" {...common} />
          <line x1="24" y1="26" x2="36" y2="26" {...common} />
          <line x1="16" y1="18" x2="24" y2="20" {...common} stroke={STROKE_DIM} />
          <line x1="32" y1="18" x2="24" y2="20" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    case 'standing':
      content = (
        <>
          {head(24, 8)}
          <line x1="24" y1="12" x2="24" y2="30" {...common} />
          <line x1="24" y1="18" x2="16" y2="24" {...common} stroke={STROKE_DIM} />
          <line x1="24" y1="18" x2="32" y2="24" {...common} stroke={STROKE_DIM} />
          <line x1="24" y1="30" x2="18" y2="42" {...common} />
          <line x1="24" y1="30" x2="30" y2="42" {...common} />
        </>
      );
      break;
    case 'kneeling':
      content = (
        <>
          {head(20, 10)}
          <line x1="20" y1="14" x2="20" y2="28" {...common} />
          <line x1="20" y1="28" x2="30" y2="34" {...common} />
          <line x1="30" y1="34" x2="30" y2="40" {...common} />
          <line x1="20" y1="28" x2="16" y2="40" {...common} stroke={STROKE_DIM} />
          <line x1="20" y1="18" x2="30" y2="20" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    case 'all_fours':
      content = (
        <>
          {head(12, 16)}
          <line x1="14" y1="17" x2="32" y2="17" {...common} />
          <line x1="14" y1="18" x2="12" y2="30" {...common} stroke={STROKE_DIM} />
          <line x1="32" y1="18" x2="34" y2="30" {...common} stroke={STROKE_DIM} />
          <line x1="20" y1="18" x2="18" y2="30" {...common} stroke={STROKE_DIM} />
          <line x1="26" y1="18" x2="28" y2="30" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    case 'bridge':
      content = (
        <>
          {head(10, 26)}
          <path d="M14,26 Q24,10 34,26" {...common} />
          <line x1="34" y1="26" x2="38" y2="34" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    case 'plank':
      content = (
        <>
          {head(10, 20)}
          <line x1="14" y1="20" x2="38" y2="24" {...common} />
          <line x1="14" y1="20" x2="14" y2="30" {...common} stroke={STROKE_DIM} />
          <line x1="38" y1="24" x2="38" y2="32" {...common} stroke={STROKE_DIM} />
        </>
      );
      break;
    default:
      content = (
        <>
          {head(24, 10)}
          <line x1="24" y1="14" x2="24" y2="28" {...common} />
          <line x1="16" y1="20" x2="32" y2="20" {...common} stroke={STROKE_DIM} />
          <line x1="24" y1="28" x2="18" y2="40" {...common} />
          <line x1="24" y1="28" x2="30" y2="40" {...common} />
        </>
      );
  }

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {content}
    </svg>
  );
}
