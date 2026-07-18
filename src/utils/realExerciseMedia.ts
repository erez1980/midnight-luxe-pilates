// Curated embeds for specific "hero" exercises that get matched by name/keyword.
// Sourced from established Pilates instruction channels on YouTube.
// NOTE: embedding availability is controlled by the video owner and can change;
// if a video ever gets embedding disabled, YouTube's own iframe shows a graceful
// "watch on YouTube" fallback rather than breaking the page.
export const curatedVideoEmbeds: Record<string, { embedUrl: string; label: string }> = {
  hundred: {
    embedUrl: 'https://www.youtube.com/embed/On2BPeK4q2Y',
    label: 'The Hundred — הדגמה מלאה'
  },
  roll_up: {
    embedUrl: 'https://www.youtube.com/embed/BNyuCH_B6Vo',
    label: 'Roll Up — הדגמה מלאה'
  },
  teaser: {
    embedUrl: 'https://www.youtube.com/embed/18p-DZkqtP4',
    label: 'Teaser — הדרכה לכל הרמות'
  },
  footwork: {
    embedUrl: 'https://www.youtube.com/embed/QDBzjlhKsco',
    label: 'Reformer Footwork — הדגמה מלאה'
  },
  mermaid: {
    embedUrl: 'https://www.youtube.com/embed/iEUBi98L16M',
    label: 'Mermaid — הדגמה מלאה'
  },
  bridge: {
    embedUrl: 'https://www.youtube.com/embed/Iv3r2kulhI8',
    label: 'Bridge — הדרכה נכונה'
  },
  plank: {
    embedUrl: 'https://www.youtube.com/embed/vUIVMQnSpH8',
    label: 'Plank Prep — הדגמה מלאה'
  }
};

// Category-level fallback embeds: used for any exercise that doesn't have a
// curated 1:1 video match, so every card in the library still has real video.
export const categoryVideoEmbeds: Record<string, { embedUrl: string; label: string }> = {
  warmup: {
    embedUrl: 'https://www.youtube.com/embed/F2MzENuR9X4',
    label: 'חימום גוף מלא — 10 דקות'
  },
  core: {
    embedUrl: 'https://www.youtube.com/embed/yXAUmMprEkc',
    label: 'ליבה ובטן — 10 דקות'
  },
  glutes: {
    embedUrl: 'https://www.youtube.com/embed/anFVLMbs-EU',
    label: 'ישבן ורגליים — 10 דקות'
  },
  mobility: {
    embedUrl: 'https://www.youtube.com/embed/n4DcW4S0dlk',
    label: 'מוביליות ומתיחות — 10 דקות'
  },
  balance: {
    embedUrl: 'https://www.youtube.com/embed/0x0RkYXoIYk',
    label: 'שיווי משקל בעמידה — 10 דקות'
  },
  'upper-body': {
    embedUrl: 'https://www.youtube.com/embed/b1zU6ySKPs4',
    label: 'פלג גוף עליון וזרועות — 10 דקות'
  },
  cooldown: {
    embedUrl: 'https://www.youtube.com/embed/7eFn5bwbWl8',
    label: 'שחרור וסיום שיעור — 6 דקות'
  },
  'full-body': {
    embedUrl: 'https://www.youtube.com/embed/qyhJtu0yWQA',
    label: 'גוף מלא — 10 דקות'
  }
};
