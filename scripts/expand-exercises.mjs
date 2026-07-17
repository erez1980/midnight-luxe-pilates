import fs from 'fs';
import path from 'path';

const file = path.resolve('/home/erez/.openclaw/workspace/tmp_midnight_luxe/src/data.ts');
const source = fs.readFileSync(file, 'utf8');

const apparatuses = [
  ['mat', 'מזרן (Mat)'],
  ['reformer', 'רפורמר (Reformer)'],
  ['cadillac', 'קאדילק (Cadillac)'],
  ['chair', 'כיסא (Wunda Chair)'],
  ['props', 'עזרים (Props)'],
];
const difficulties = [
  ['beginner', 'מתחילים'],
  ['intermediate', 'בינוני'],
  ['advanced', 'מתקדם'],
];
const focusPools = [
  ['ליבה', 'יציבה', 'שרירי בטן עמוקים'],
  ['ירך אחורית', 'ישבן', 'הארכת עמוד שדרה'],
  ['כתפיים', 'חזה', 'שכמות'],
  ['רצפת אגן', 'מקרבי ירך', 'שליטה'],
  ['גמישות', 'נשימה', 'איזון'],
  ['אגן', 'שרשרת אחורית', 'מוביליות'],
  ['זוקפי גב', 'יציבות', 'שליטה עצבית'],
];
const baseNames = [
  ['Arc Flow', 'זרימת קשת'],
  ['Core Precision', 'דיוק ליבה'],
  ['Spine Wake Up', 'התעוררות עמוד שדרה'],
  ['Length & Lift', 'אורך והרמה'],
  ['Controlled Fire', 'אש מבוקרת'],
  ['Deep Center', 'מרכז עמוק'],
  ['Fluid Balance', 'איזון זורם'],
  ['Power Glide', 'גלישת כוח'],
  ['Pulse & Hold', 'פולס והחזקה'],
  ['Mobility Reset', 'איפוס מוביליות'],
  ['Athletic Flow', 'זרימה אתלטית'],
  ['Graceful Strength', 'כוח אלגנטי'],
  ['Studio Sculpt', 'פיסול סטודיו'],
  ['Dynamic Reach', 'הושטות דינמית'],
  ['Twist Control', 'שליטת רוטציה'],
  ['Posterior Lift', 'הרמת שרשרת אחורית'],
  ['Breath Driven Flow', 'זרימה מונעת נשימה'],
  ['Precision Lines', 'קווים מדויקים'],
  ['Luxe Burn', 'שריפה אלגנטית'],
  ['Reset & Lengthen', 'איפוס והארכה']
];

function buildExercise(index) {
  const [apparatus, apparatusLabel] = apparatuses[index % apparatuses.length];
  const [difficulty, difficultyLabel] = difficulties[index % difficulties.length];
  const [enBase, heBase] = baseNames[index % baseNames.length];
  const focus = focusPools[index % focusPools.length];
  const variant = Math.floor(index / baseNames.length) + 1;
  const englishName = `${enBase} ${variant}`;
  const name = `${heBase} ${variant}`;
  const durationMinutes = 4 + (index % 5);
  return `  {\n    id: '${apparatus}_${index}_${variant}',\n    name: '${name}',\n    englishName: '${englishName}',\n    apparatus: '${apparatus}',\n    apparatusLabel: '${apparatusLabel}',\n    difficulty: '${difficulty}',\n    difficultyLabel: '${difficultyLabel}',\n    targetMuscles: ['${focus[0]}', '${focus[1]}', '${focus[2]}'],\n    durationMinutes: ${durationMinutes},\n    instructions: [\n      'התחילי במנח מאורגן, אספי מרכז והגדירי נשימה שקטה ומדויקת.',\n      'בצעי את התנועה בטווח נקי ומבוקר, תוך שמירה על רצף, אורך ויציבות.',\n      'שימי לב למנח האגן, החזה והשכמות, והתאימי עומס לפי רמת המתאמנת.',\n      'הוסיפי 6-10 חזרות או 3-4 נשימות החזקה בהתאם לקצב השיעור.',\n      'סיימי בהאטה, שחרור איכותי והכנה חלקה למעבר לתרגיל הבא.'\n    ],\n    benefits: 'משפר שליטה, איכות תנועה, יציבות ליבה וזרימה חכמה במערך השיעור.',\n    breathing: 'שאיפה להכנה ולהארכה, נשיפה לביצוע ולאיסוף המרכז.'\n  }`;
}

const extras = [];
for (let i = 0; i < 240; i++) extras.push(buildExercise(i));

const marker = 'export const INITIAL_LESSONS: Lesson[] = [';
const idx = source.indexOf(marker);
if (idx === -1) throw new Error('marker not found');
const head = source.slice(0, idx);
const tail = source.slice(idx);
const beforeLessons = head.replace(/\];\s*$/, `,\n${extras.join(',\n')}\n];\n\n`);
fs.writeFileSync(file, beforeLessons + tail);
console.log('expanded exercises:', extras.length);
