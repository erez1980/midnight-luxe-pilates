import { Lesson } from '../types';

export function lessonToWhatsappText(lesson: Lesson) {
  const lines = [
    `*${lesson.name}*`,
    `רמה: ${lesson.levelLabel}`,
    `פוקוס: ${lesson.targetFocus}`,
    `משך כולל: ${lesson.totalDuration} דקות`,
    lesson.description ? `תיאור: ${lesson.description}` : '',
    '',
    '*מבנה השיעור:*',
    ...lesson.exercises.map((item, index) => {
      const extra = item.notes ? ` | דגש: ${item.notes}` : '';
      return `${index + 1}. ${item.exercise.name} - ${item.customDuration} דק׳${extra}`;
    })
  ].filter(Boolean);

  return lines.join('\n');
}

export function openLessonPrint(lesson: Lesson) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1200');
  if (!printWindow) return false;

  const content = `
    <!doctype html>
    <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${lesson.name}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #fff; color: #111; padding: 32px; line-height: 1.6; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          .meta { margin-bottom: 24px; color: #444; }
          .card { border: 1px solid #ddd; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
          .index { display:inline-block; width: 28px; height: 28px; border-radius: 999px; background: #111; color: #fff; text-align:center; line-height: 28px; margin-left: 8px; }
          .tags span { display:inline-block; padding: 4px 10px; margin: 0 0 6px 6px; background:#f3f3f3; border-radius:999px; font-size:12px; }
          .notes { margin-top: 8px; color: #333; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <h1>${lesson.name}</h1>
        <div class="meta">
          <div><strong>רמה:</strong> ${lesson.levelLabel}</div>
          <div><strong>פוקוס:</strong> ${lesson.targetFocus}</div>
          <div><strong>משך:</strong> ${lesson.totalDuration} דקות</div>
          <div><strong>תיאור:</strong> ${lesson.description}</div>
        </div>
        ${lesson.exercises.map((item, index) => `
          <div class="card">
            <div><span class="index">${index + 1}</span><strong>${item.exercise.name}</strong> <span style="color:#666">(${item.exercise.englishName})</span></div>
            <div class="tags">
              <span>${item.exercise.apparatusLabel}</span>
              <span>${item.exercise.difficultyLabel}</span>
              ${item.exercise.categoryLabel ? `<span>${item.exercise.categoryLabel}</span>` : ''}
              <span>${item.customDuration} דקות</span>
            </div>
            <div>${item.exercise.benefits}</div>
            ${item.notes ? `<div class="notes"><strong>דגש:</strong> ${item.notes}</div>` : ''}
          </div>
        `).join('')}
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  return true;
}
