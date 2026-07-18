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

// A limb is a gently curved capsule (not a straight stick) with a small
// rounded cap at the free end standing in for a hand or foot. `bend` offsets
// the curve's control point perpendicular to the start-end line — small
// values read as a relaxed joint, larger ones as a bent elbow/knee.
function Limb({
  x1, y1, x2, y2, bend = 0, w = 13, dim = false, cap = true,
}: { x1: number; y1: number; x2: number; y2: number; bend?: number; w?: number; dim?: boolean; cap?: boolean }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  const stroke = dim ? GOLD_SOFT : GOLD;
  return (
    <>
      <path d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
      {cap && <ellipse cx={x2} cy={y2} rx={w * 0.55} ry={w * 0.4} fill={stroke} />}
    </>
  );
}

// `waist` is a short cross-line (x1,y1,x2,y2) marking where a fitted top
// meets leggings — purely a clothing cue, breaks up the flat silhouette.
function GroundShadow({ cx, cy, rx = 34 }: { cx: number; cy: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={6} fill={GOLD} opacity={0.12} />;
}

function Torso({ d, waist }: { d: string; waist?: [number, number, number, number] }) {
  return (
    <>
      <path d={d} fill={GOLD_FILL} stroke={GOLD} strokeWidth={3.5} strokeLinejoin="round" />
      {waist && (
        <line
          x1={waist[0]} y1={waist[1]} x2={waist[2]} y2={waist[3]}
          stroke={GOLD} strokeWidth={2} strokeLinecap="round" opacity={0.6}
        />
      )}
    </>
  );
}

// faceDir: which way the profile nose points, relative to the bun (so the
// head always "looks" away from the hair, toward the direction of motion).
function Head({
  x, y, bunX, bunY, faceDir = 1,
}: { x: number; y: number; bunX: number; bunY: number; faceDir?: 1 | -1 }) {
  const noseX = x + faceDir * 13;
  const noseY = y + 3;
  return (
    <>
      <circle cx={x} cy={y} r={15} fill={GOLD_FILL} stroke={GOLD} strokeWidth={3.5} />
      <path
        d={`M${x + faceDir * 10},${y - 2} Q${noseX},${noseY} ${x + faceDir * 9},${y + 7}`}
        fill="none"
        stroke={GOLD}
        strokeWidth={2}
        strokeLinecap="round"
      />
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
          <Torso d="M124,158 C166,162 206,168 240,174 L238,192 C204,186 164,180 122,176 Z" waist={[178, 165, 184, 183]} />
          <Limb x1={240} y1={182} x2={290} y2={178} bend={-8} w={15} />
          <Limb x1={290} y1={178} x2={338} y2={186} bend={6} w={12} />
          <Limb x1={130} y1={168} x2={196} y2={176} bend={-10} w={10} dim />
          <Head x={99} y={156} bunX={82} bunY={148} faceDir={1} />
        </g>
      );
    case 'supine_curl':
      return (
        <g>
          <Torso d="M120,140 C162,150 202,163 234,174 L230,192 C194,181 154,169 118,162 Z" waist={[172, 149, 178, 167]} />
          <Limb x1={234} y1={180} x2={258} y2={122} bend={12} w={15} />
          <Limb x1={258} y1={122} x2={322} y2={130} bend={-10} w={12} />
          <Limb x1={126} y1={152} x2={200} y2={168} bend={-8} w={10} dim />
          <Head x={95} y={140} bunX={78} bunY={131} faceDir={1} />
        </g>
      );
    case 'legs_up':
      return (
        <g>
          <Torso d="M126,162 C168,164 208,168 242,172 L240,190 C206,186 166,182 124,180 Z" waist={[180, 169, 186, 187]} />
          <Limb x1={242} y1={180} x2={276} y2={94} bend={-14} w={15} />
          <Limb x1={276} y1={94} x2={296} y2={30} bend={8} w={12} />
          <Limb x1={132} y1={172} x2={198} y2={180} bend={-8} w={10} dim />
          <Head x={101} y={160} bunX={84} bunY={152} faceDir={1} />
        </g>
      );
    case 'inverted':
      return (
        <g>
          <Torso d="M138,182 C160,150 178,118 192,90 L172,80 C156,110 138,144 120,176 Z" />
          <Limb x1={192} y1={92} x2={210} y2={40} bend={10} w={14} />
          <Limb x1={182} y1={86} x2={198} y2={40} bend={-8} w={12} dim />
          <Limb x1={130} y1={184} x2={190} y2={192} bend={6} w={10} dim />
          <Head x={121} y={186} bunX={104} bunY={182} faceDir={1} />
        </g>
      );
    case 'prone':
      return (
        <g>
          <Torso d="M122,164 C164,166 204,172 238,178 L236,194 C202,190 162,184 120,180 Z" waist={[178, 171, 182, 189]} />
          <Limb x1={238} y1={186} x2={294} y2={186} bend={-10} w={14} />
          <Limb x1={294} y1={186} x2={328} y2={166} bend={8} w={11} />
          <Limb x1={128} y1={170} x2={78} y2={160} bend={8} w={9} dim />
          <Head x={97} y={160} bunX={82} bunY={150} faceDir={1} />
        </g>
      );
    case 'side_lying':
      return (
        <g>
          <Torso d="M110,146 C150,150 190,155 222,161 L220,182 C186,176 146,171 108,168 Z" waist={[164, 156, 168, 174]} />
          <Limb x1={222} y1={176} x2={282} y2={184} bend={8} w={14} dim />
          <Limb x1={282} y1={184} x2={338} y2={192} bend={-6} w={11} dim />
          <Limb x1={220} y1={162} x2={278} y2={126} bend={-14} w={15} />
          <Limb x1={278} y1={126} x2={340} y2={104} bend={10} w={12} />
          <Limb x1={114} y1={154} x2={92} y2={182} bend={8} w={10} />
          <Head x={90} y={143} bunX={73} bunY={135} faceDir={1} />
        </g>
      );
    case 'seated':
      return (
        <g>
          <Torso d="M180,74 C186,104 190,134 192,162 L166,164 C164,134 162,104 158,76 Z" waist={[164, 130, 190, 132]} />
          <Limb x1={190} y1={164} x2={254} y2={178} bend={-10} w={15} />
          <Limb x1={254} y1={178} x2={316} y2={186} bend={8} w={12} />
          <Limb x1={176} y1={92} x2={236} y2={106} bend={-8} w={10} dim />
          <Head x={169} y={56} bunX={152} bunY={46} faceDir={1} />
        </g>
      );
    case 'seated_fold':
      return (
        <g>
          <Torso d="M172,88 C186,112 198,134 208,152 L186,166 C174,144 160,120 148,96 Z" />
          <Limb x1={206} y1={158} x2={264} y2={176} bend={-8} w={15} />
          <Limb x1={264} y1={176} x2={320} y2={186} bend={6} w={12} />
          <Limb x1={186} y1={94} x2={252} y2={124} bend={-10} w={10} dim />
          <Head x={158} y={78} bunX={142} bunY={64} faceDir={1} />
        </g>
      );
    case 'standing':
      return (
        <g>
          <GroundShadow cx={180} cy={196} rx={30} />
          <Torso d="M186,66 C190,96 192,122 194,148 L166,150 C164,124 162,96 158,68 Z" waist={[165, 116, 191, 118]} />
          <Limb x1={192} y1={150} x2={200} y2={190} bend={4} w={15} />
          <Limb x1={168} y1={150} x2={158} y2={190} bend={-4} w={15} dim />
          <Limb x1={184} y1={84} x2={208} y2={128} bend={8} w={10} dim />
          <Limb x1={164} y1={84} x2={144} y2={128} bend={-8} w={10} dim />
          <Head x={173} y={48} bunX={156} bunY={38} faceDir={1} />
        </g>
      );
    case 'standing_reach':
      return (
        <g>
          <GroundShadow cx={180} cy={196} rx={30} />
          <Torso d="M186,74 C190,102 192,126 194,150 L166,152 C164,126 162,102 158,76 Z" waist={[165, 122, 191, 124]} />
          <Limb x1={192} y1={152} x2={202} y2={190} bend={4} w={15} />
          <Limb x1={168} y1={152} x2={158} y2={190} bend={-4} w={15} dim />
          <Limb x1={184} y1={84} x2={204} y2={36} bend={-10} w={10} />
          <Limb x1={164} y1={84} x2={146} y2={36} bend={10} w={10} dim />
          <Head x={173} y={56} bunX={156} bunY={46} faceDir={1} />
        </g>
      );
    case 'kneeling':
      return (
        <g>
          <Torso d="M186,80 C190,106 192,128 194,148 L166,150 C164,130 162,106 158,82 Z" waist={[165, 128, 191, 130]} />
          <Limb x1={192} y1={150} x2={214} y2={178} bend={10} w={15} />
          <Limb x1={214} y1={178} x2={176} y2={192} bend={-8} w={12} />
          <Limb x1={168} y1={150} x2={152} y2={186} bend={-10} w={14} dim />
          <Limb x1={182} y1={96} x2={230} y2={112} bend={-8} w={10} dim />
          <Head x={173} y={62} bunX={156} bunY={52} faceDir={1} />
        </g>
      );
    case 'all_fours':
      return (
        <g>
          <Torso d="M140,110 C180,108 220,110 254,114 L252,134 C218,130 178,128 138,130 Z" />
          <Limb x1={144} y1={128} x2={132} y2={186} bend={8} w={13} />
          <Limb x1={250} y1={130} x2={272} y2={186} bend={-8} w={14} dim />
          <Limb x1={172} y1={126} x2={166} y2={176} bend={4} w={12} dim />
          <Limb x1={228} y1={128} x2={238} y2={178} bend={-4} w={13} dim />
          <Head x={124} y={116} bunX={108} bunY={108} faceDir={-1} />
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
          <Limb x1={250} y1={166} x2={280} y2={190} bend={-6} w={14} />
          <Limb x1={140} y1={182} x2={90} y2={190} bend={6} w={10} dim />
          <Head x={124} y={182} bunX={108} bunY={178} faceDir={1} />
        </g>
      );
    case 'plank':
      return (
        <g>
          <Torso d="M132,140 C176,146 218,154 252,162 L250,180 C216,172 174,164 130,158 Z" waist={[192, 158, 196, 176]} />
          <Limb x1={136} y1={152} x2={122} y2={188} bend={6} w={12} />
          <Limb x1={252} y1={170} x2={300} y2={186} bend={-8} w={14} dim />
          <Limb x1={300} y1={186} x2={332} y2={192} bend={6} w={11} dim />
          <Head x={114} y={134} bunX={98} bunY={126} faceDir={1} />
        </g>
      );
    case 'side_plank':
      return (
        <g>
          <Torso d="M138,124 C180,140 220,158 254,174 L246,190 C210,174 170,156 130,140 Z" waist={[194, 148, 198, 166]} />
          <Limb x1={136} y1={136} x2={120} y2={188} bend={6} w={12} />
          <Limb x1={252} y1={182} x2={310} y2={190} bend={-8} w={13} dim />
          <Limb x1={144} y1={124} x2={156} y2={48} bend={10} w={10} />
          <Head x={120} y={118} bunX={104} bunY={108} faceDir={1} />
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
