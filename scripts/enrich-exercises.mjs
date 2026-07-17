import fs from 'fs';

const path = '/home/erez/.openclaw/workspace/tmp_midnight_luxe/src/data.ts';
let text = fs.readFileSync(path, 'utf8');

const categories = [
  ['warmup', 'חימום'],
  ['core', 'ליבה'],
  ['glutes', 'ישבן ורגליים'],
  ['mobility', 'מוביליות'],
  ['balance', 'שיווי משקל'],
  ['upper-body', 'פלג גוף עליון'],
  ['cooldown', 'שחרור'],
  ['full-body', 'גוף מלא'],
];

let i = 0;
text = text.replace(/difficultyLabel: '([^']+)',\n\s+targetMuscles:/g, (m, diff) => {
  const [category, label] = categories[i % categories.length];
  i += 1;
  return `difficultyLabel: '${diff}',\n    category: '${category}',\n    categoryLabel: '${label}',\n    targetMuscles:`;
});

fs.writeFileSync(path, text);
console.log('enriched exercises with categories:', i);
