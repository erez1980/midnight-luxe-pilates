import React from 'react';

// Detailed pose illustrations, drawn to match the site's gold-on-dark identity.
// Two axes: the body pose (from the instruction text) and the apparatus context
// (from the exercise itself), so a supine position on the Reformer reads
// differently from the same position on the Mat.
//
// These are shared across exercises by design — many exercises legitimately
// start from the same position. They are a positional aid, not a claim to
// depict one specific exercise.

export type PoseKey =
  | 'supine'
  | 'supine_curl'
  | 'legs_up'
  | 'inverted'
  | 'prone'
  | 'side_lying'
  | 'seated'
  | 'seated_fold'
  | 'standing'
  | 'standing_reach'
  | 'kneeling'
  | 'all_fours'
  | 'bridge'
  | 'plank'
  | 'side_plank';

export type ApparatusKey = 'mat' | 'reformer' | 'cadillac' | 'chair' | 'props';

// Ordered most-specific first — the first match wins.
const POSE_RULES: Array<[RegExp, PoseKey]> = [
  [/פלאנק צידי|פלאנק הפוך|על הצד.*פלאנק/, 'side_plank'],
  [/פלאנק/, 'plank'],
  [/גשר/, 'bridge'],
  [/מעל הראש|הפוך|גלגלי.*מעל|היפוך/, 'inverted'],
  [/ארבע/, 'all_fours'],
  [/כרע/, 'kneeling'],
  [/הושיטי|הרימי את הזרועות|מושטות מעל/, 'standing_reach'],
  [/עמד/, 'standing'],
  [/התכופפי קדימה|גלגלי קדימה|קפלי את הגוף|התכופפי/, 'seated_fold'],
  [/שב/, 'seated'],
  [/שכב.*(בטן|פנים)/, 'prone'],
  [/שכב.*צד/, 'side_lying'],
  [/רגליים ישרות (וצמודות )?כלפי מעלה|ברצועות/, 'legs_up'],
  [/הרימי את הראש והכתפיים|ראש והכתפיים מהרצפה/, 'supine_curl'],
  [/שכב/, 'supine'],
];

export function pickPose(stepText: string): PoseKey {
  for (const [pattern, key] of POSE_RULES) {
    if (pattern.test(stepText)) return key;
  }
  return 'standing';
}

const GOLD = '#e9c349';
const GOLD_SOFT = 'rgba(233, 195, 73, 0.55)';
const GOLD_FILL = 'rgba(233, 195, 73, 0.16)';
const GOLD_FAINT = 'rgba(233, 195, 73, 0.3)';

function Limb({ d, w = 13, dim = false }: { d: string; w?: number; dim?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={dim ? GOLD_SOFT : GOLD}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Torso({ d }: { d: string }) {
  return <path d={d} fill={GOLD_FILL} stroke={GOLD} strokeWidth={3.5} strokeLinejoin="round" />;
}

function Head({ x, y, bunX, bunY }: { x: number; y: number; bunX: number; bunY: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={15} fill={GOLD_FILL} stroke={GOLD} strokeWidth={3.5} />
      <circle cx={bunX} cy={bunY} r={7.5} fill={GOLD} />
    </>
  );
}

// Apparatus drawn behind the figure — gives each illustration real context.
function Apparatus({ apparatus }: { apparatus: ApparatusKey }) {
  switch (apparatus) {
    case 'reformer':
      return (
        <g>
          <rect x="22" y="188" width="356" height="10" rx="4" fill="none" stroke={GOLD_FAINT} strokeWidth="3" />
          <rect x="60" y="168" width="250" height="20" rx="5" fill="none" stroke={GOLD_FAINT} strokeWidth="3" />
          <line x1="316" y1="150" x2="316" y2="188" stroke={GOLD_FAINT} strokeWidth="4" strokeLinecap="round" />
          <line x1="300" y1="150" x2="332" y2="150" stroke={GOLD_FAINT} strokeWidth="4" strokeLinecap="round" />
          <path d="M40,178 q8,-8 16,0 q8,8 16,0" fill="none" stroke={GOLD_FAINT} strokeWidth="2.5" />
        </g>
      );
    case 'cadillac':
      return (
        <g>
          <line x1="30" y1="196" x2="370" y2="196" stroke={GOLD_FAINT} strokeWidth="3" strokeLinecap="round" />
          <line x1="336" y1="26" x2="336" y2="196" stroke={GOLD_FAINT} strokeWidth="5" strokeLinecap="round" />
          <line x1="52" y1="26" x2="52" y2="196" stroke={GOLD_FAINT} strokeWidth="5" strokeLinecap="round" />
          <line x1="52" y1="30" x2="336" y2="30" stroke={GOLD_FAINT} strokeWidth="4" strokeLinecap="round" />
          <line x1="248" y1="96" x2="336" y2="96" stroke={GOLD_SOFT} strokeWidth="6" strokeLinecap="round" />
          <path d="M300,96 l6,-14 m6,14 l6,-14" stroke={GOLD_FAINT} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'chair':
      return (
        <g>
          <line x1="30" y1="196" x2="370" y2="196" stroke={GOLD_FAINT} strokeWidth="3" strokeLinecap="round" />
          <rect x="252" y="112" width="96" height="84" rx="6" fill="none" stroke={GOLD_FAINT} strokeWidth="3.5" />
          <line x1="252" y1="164" x2="216" y2="176" stroke={GOLD_SOFT} strokeWidth="6" strokeLinecap="round" />
          <path d="M258,150 l-14,6 m14,10 l-14,6" stroke={GOLD_FAINT} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'props':
      return (
        <g>
          <line x1="30" y1="196" x2="370" y2="196" stroke={GOLD_FAINT} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="342" cy="168" rx="22" ry="26" fill="none" stroke={GOLD_FAINT} strokeWidth="3.5" />
          <line x1="322" y1="168" x2="330" y2="168" stroke={GOLD_FAINT} strokeWidth="5" strokeLinecap="round" />
          <line x1="354" y1="168" x2="362" y2="168" stroke={GOLD_FAINT} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <line x1="30" y1="196" x2="370" y2="196" stroke={GOLD_FAINT} strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="196" x2="42" y2="188" stroke={GOLD_FAINT} strokeWidth="3" strokeLinecap="round" />
          <line x1="370" y1="196" x2="358" y2="188" stroke={GOLD_FAINT} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
  }
}

function Figure({ pose }: { pose: PoseKey }) {
  switch (pose) {
    case 'supine':
      return (
        <g>
          <Torso d="M124,158 C166,162 206,168 240,174 L238,192 C204,186 164,180 122,176 Z" />
          <Limb d="M240,182 L286,178" w={15} />
          <Limb d="M286,178 L332,182" w={12} />
          <Limb d="M332,182 L344,172" w={8} />
          <Limb d="M130,168 L196,176" w={10} dim />
          <Limb d="M114,160 L124,163" w={9} />
          <Head x={99} y={156} bunX={82} bunY={148} />
        </g>
      );
    case 'supine_curl':
      return (
        <g>
          <Torso d="M120,140 C162,150 202,163 234,174 L230,192 C194,181 154,169 118,162 Z" />
          <Limb d="M234,180 L258,122" w={15} />
          <Limb d="M258,122 L318,128" w={12} />
          <Limb d="M318,128 L332,118" w={8} />
          <Limb d="M126,152 L200,168" w={10} dim />
          <Limb d="M110,146 L120,150" w={9} />
          <Head x={95} y={140} bunX={78} bunY={131} />
        </g>
      );
    case 'legs_up':
      return (
        <g>
          <Torso d="M126,162 C168,164 208,168 242,172 L240,190 C206,186 166,182 124,180 Z" />
          <Limb d="M242,180 L268,110" w={15} />
          <Limb d="M268,110 L288,46" w={12} />
          <Limb d="M288,46 L296,34" w={8} />
          <Limb d="M132,172 L198,180" w={10} dim />
          <Limb d="M116,164 L126,167" w={9} />
          <Head x={101} y={160} bunX={84} bunY={152} />
        </g>
      );
    case 'inverted':
      return (
        <g>
          <Torso d="M138,182 C160,150 178,118 192,90 L172,80 C156,110 138,144 120,176 Z" />
          <Limb d="M192,92 L206,52" w={14} />
          <Limb d="M206,52 L214,26" w={11} />
          <Limb d="M182,86 L200,50" w={12} dim />
          <Limb d="M130,184 L188,192" w={10} dim />
          <Head x={121} y={186} bunX={104} bunY={182} />
        </g>
      );
    case 'prone':
      return (
        <g>
          <Torso d="M122,164 C164,166 204,172 238,178 L236,194 C202,190 162,184 120,180 Z" />
          <Limb d="M238,186 L288,190" w={14} />
          <Limb d="M288,190 L326,168" w={11} />
          <Limb d="M128,170 L74,158" w={9} dim />
          <Limb d="M112,166 L122,168" w={9} />
          <Head x={97} y={160} bunX={82} bunY={150} />
        </g>
      );
    case 'side_lying':
      return (
        <g>
          <Torso d="M110,146 C150,150 190,155 222,161 L220,182 C186,176 146,171 108,168 Z" />
          <Limb d="M222,176 L280,184" w={14} dim />
          <Limb d="M280,184 L336,190" w={11} dim />
          <Limb d="M220,162 L274,130" w={15} />
          <Limb d="M274,130 L332,110" w={12} />
          <Limb d="M332,110 L346,104" w={8} />
          <Limb d="M114,154 L94,178" w={9} />
          <Limb d="M94,178 L120,192" w={8} />
          <Head x={90} y={143} bunX={73} bunY={135} />
        </g>
      );
    case 'seated':
      return (
        <g>
          <Torso d="M180,74 C186,104 190,134 192,162 L166,164 C164,134 162,104 158,76 Z" />
          <Limb d="M190,164 L250,176" w={15} />
          <Limb d="M250,176 L310,182" w={12} />
          <Limb d="M310,182 L322,172" w={8} />
          <Limb d="M176,92 L236,106" w={10} dim />
          <Head x={169} y={56} bunX={152} bunY={46} />
        </g>
      );
    case 'seated_fold':
      return (
        <g>
          <Torso d="M172,88 C186,112 198,134 208,152 L186,166 C174,144 160,120 148,96 Z" />
          <Limb d="M206,158 L262,174" w={15} />
          <Limb d="M262,174 L318,182" w={12} />
          <Limb d="M186,94 L252,124" w={10} dim />
          <Head x={158} y={78} bunX={142} bunY={64} />
        </g>
      );
    case 'standing':
      return (
        <g>
          <Torso d="M186,66 C190,96 192,122 194,148 L166,150 C164,124 162,96 158,68 Z" />
          <Limb d="M192,150 L200,190" w={15} />
          <Limb d="M200,190 L204,196" w={12} />
          <Limb d="M168,150 L160,190" w={15} dim />
          <Limb d="M160,190 L156,196" w={12} dim />
          <Limb d="M184,84 L206,132" w={10} dim />
          <Limb d="M164,84 L146,132" w={10} dim />
          <Head x={173} y={48} bunX={156} bunY={38} />
        </g>
      );
    case 'standing_reach':
      return (
        <g>
          <Torso d="M186,74 C190,102 192,126 194,150 L166,152 C164,126 162,102 158,76 Z" />
          <Limb d="M192,152 L200,190" w={15} />
          <Limb d="M168,152 L160,190" w={15} dim />
          <Limb d="M184,84 L202,36" w={10} />
          <Limb d="M164,84 L148,36" w={10} dim />
          <Head x={173} y={56} bunX={156} bunY={46} />
        </g>
      );
    case 'kneeling':
      return (
        <g>
          <Torso d="M186,80 C190,106 192,128 194,148 L166,150 C164,130 162,106 158,82 Z" />
          <Limb d="M192,150 L212,182" w={15} />
          <Limb d="M212,182 L172,192" w={12} />
          <Limb d="M168,150 L152,184" w={14} dim />
          <Limb d="M182,96 L232,110" w={10} dim />
          <Head x={173} y={62} bunX={156} bunY={52} />
        </g>
      );
    case 'all_fours':
      return (
        <g>
          <Torso d="M140,110 C180,108 220,110 254,114 L252,134 C218,130 178,128 138,130 Z" />
          <Limb d="M144,128 L138,178" w={13} />
          <Limb d="M138,178 L128,190" w={10} />
          <Limb d="M250,130 L262,178" w={14} dim />
          <Limb d="M262,178 L276,190" w={11} dim />
          <Limb d="M172,126 L166,176" w={12} dim />
          <Limb d="M228,128 L238,178" w={13} dim />
          <Head x={124} y={116} bunX={108} bunY={108} />
        </g>
      );
    case 'bridge':
      return (
        <g>
          <path
            d="M136,178 C160,120 216,112 250,166"
            fill="none"
            stroke={GOLD}
            strokeWidth="22"
            strokeLinecap="round"
          />
          <Limb d="M250,166 L268,190" w={14} />
          <Limb d="M268,190 L292,192" w={10} />
          <Limb d="M140,182 L96,190" w={10} dim />
          <Head x={124} y={182} bunX={108} bunY={178} />
        </g>
      );
    case 'plank':
      return (
        <g>
          <Torso d="M132,140 C176,146 218,154 252,162 L250,180 C216,172 174,164 130,158 Z" />
          <Limb d="M136,152 L128,188" w={12} />
          <Limb d="M252,170 L292,186" w={14} dim />
          <Limb d="M292,186 L326,192" w={11} dim />
          <Limb d="M190,156 L184,188" w={10} dim />
          <Head x={114} y={134} bunX={98} bunY={126} />
        </g>
      );
    case 'side_plank':
      return (
        <g>
          <Torso d="M138,124 C180,140 220,158 254,174 L246,190 C210,174 170,156 130,140 Z" />
          <Limb d="M136,136 L124,186" w={12} />
          <Limb d="M252,182 L306,190" w={13} dim />
          <Limb d="M144,124 L152,52" w={10} />
          <Head x={120} y={118} bunX={104} bunY={108} />
        </g>
      );
    default:
      return null;
  }
}

export function PoseIllustration({
  pose,
  apparatus,
  className,
}: {
  pose: PoseKey;
  apparatus: ApparatusKey;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 400 220" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <Apparatus apparatus={apparatus} />
      <Figure pose={pose} />
    </svg>
  );
}
