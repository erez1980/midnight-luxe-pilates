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

// Opens WhatsApp (app on mobile, web on desktop) with the lesson text ready to
// send — no clipboard dance. Returns false only if the window was blocked.
export function shareLessonToWhatsapp(lesson: Lesson) {
  const url = `https://wa.me/?text=${encodeURIComponent(lessonToWhatsappText(lesson))}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  return Boolean(win);
}

function buildPrintHtml(lesson: Lesson) {
  return `
    <!doctype html>
    <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${lesson.name}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #fff; color: #33362d; padding: 32px; line-height: 1.6; }
          h1 { margin: 0 0 8px; font-size: 28px; font-family: Georgia, serif; color: #5f7154; }
          .meta { margin-bottom: 24px; color: #55584c; }
          .card { border: 1px solid #e4ddcd; border-radius: 14px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
          .index { display:inline-block; width: 28px; height: 28px; border-radius: 999px; background: #7f9271; color: #fff; text-align:center; line-height: 28px; margin-left: 8px; }
          .tags span { display:inline-block; padding: 4px 10px; margin: 0 0 6px 6px; background:#f2eee3; border-radius:999px; font-size:12px; }
          .notes { margin-top: 8px; color: #5f7154; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <h1>${lesson.name}</h1>
        <div class="meta">
          <div><strong>רמה:</strong> ${lesson.levelLabel}</div>
          <div><strong>פוקוס:</strong> ${lesson.targetFocus}</div>
          <div><strong>משך:</strong> ${lesson.totalDuration} דקות</div>
          ${lesson.description ? `<div><strong>תיאור:</strong> ${lesson.description}</div>` : ''}
        </div>
        ${lesson.exercises.map((item, index) => `
          <div class="card">
            <div><span class="index">${index + 1}</span><strong>${item.exercise.name}</strong> <span style="color:#8a8d7c">(${item.exercise.englishName})</span></div>
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
      </body>
    </html>
  `;
}

// Prints via a hidden same-origin iframe instead of window.open — popup
// blockers kill a fresh window even on direct user clicks, which made the old
// export button look broken. The browser's print dialog includes "Save as PDF".
export function openLessonPrint(lesson: Lesson) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(buildPrintHtml(lesson));
  doc.close();

  // Give the iframe a tick to lay out before printing; remove it only after
  // the print dialog closes (afterprint) with a timed fallback.
  const cleanup = () => window.setTimeout(() => iframe.remove(), 500);
  iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true });
  window.setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Fallback removal in case afterprint never fires (some mobile browsers).
      window.setTimeout(() => {
        if (document.body.contains(iframe)) iframe.remove();
      }, 60_000);
    } catch {
      iframe.remove();
    }
  }, 150);
  return true;
}
