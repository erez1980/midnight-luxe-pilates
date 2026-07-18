// Curated embeds for specific "hero" exercises that get matched by name/keyword.
// Sourced from established Pilates instruction channels on YouTube.
// NOTE: embedding availability is controlled by the video owner and can change;
// if a video ever gets embedding disabled, YouTube's own iframe shows a graceful
// "watch on YouTube" fallback rather than breaking the page.
// Curated embeds keyed by exercise `id` — a direct, unambiguous lookup rather
// than name/keyword matching (which risked false-positive matches, e.g. a
// Cadillac exercise with "Teaser" in its name picking up the Mat Teaser video
// just because the word matched). Sourced from established Pilates instruction
// channels on YouTube (Howcast's Pilates series, Well+Good, Pilates Anytime,
// Jessica Valant Pilates, intsoport).
// NOTE: embedding availability is controlled by the video owner and can change;
// if a video ever gets embedding disabled, YouTube's own iframe shows a graceful
// "watch on YouTube" fallback rather than breaking the page.
export const curatedVideoEmbeds: Record<string, { embedUrl: string; label: string }> = {
  mat_hundred: { embedUrl: 'https://www.youtube.com/embed/On2BPeK4q2Y', label: 'The Hundred — הדגמה מלאה' },
  mat_roll_up: { embedUrl: 'https://www.youtube.com/embed/BNyuCH_B6Vo', label: 'Roll Up — הדגמה מלאה' },
  mat_teaser: { embedUrl: 'https://www.youtube.com/embed/18p-DZkqtP4', label: 'Teaser — הדרכה לכל הרמות' },
  reformer_footwork: { embedUrl: 'https://www.youtube.com/embed/QDBzjlhKsco', label: 'Reformer Footwork — הדגמה מלאה' },
  reformer_hundred_straps: { embedUrl: 'https://www.youtube.com/embed/vx4DdBWY6kQ', label: 'Reformer Hundred — הדגמה מלאה' },
  reformer_elephant: { embedUrl: 'https://www.youtube.com/embed/OxdhCdThIcg', label: 'Elephant — הדגמה מלאה' },
  cadillac_roll_back: { embedUrl: 'https://www.youtube.com/embed/Z9VgaB2Difo', label: 'Roll Back on Cadillac — הדגמה מלאה' },
  cadillac_tower: { embedUrl: 'https://www.youtube.com/embed/yzpqC9pQ_bc', label: 'Push Through Bar (Tower) — הדגמה מלאה' },
  chair_swan: { embedUrl: 'https://www.youtube.com/embed/hcfuKC4dHnQ', label: 'Swan on Wunda Chair — הדגמה מלאה' },
  chair_pushups: { embedUrl: 'https://www.youtube.com/embed/CCUpfiL8XAs', label: 'Push Ups on Wunda Chair — הדגמה מלאה' },
  props_magic_circle_thighs: { embedUrl: 'https://www.youtube.com/embed/2dWCf8bmPhI', label: 'Magic Circle — ירך פנימית — הדגמה מלאה' },
  props_bridge_ball: { embedUrl: 'https://www.youtube.com/embed/Iv3r2kulhI8', label: 'Bridge — הדרכה נכונה' },
  reformer_1_1: { embedUrl: 'https://www.youtube.com/embed/8HfgZLz9QS0', label: 'Rowing Series — הדגמה מלאה' },
  reformer_11_1: { embedUrl: 'https://www.youtube.com/embed/N-8seOdKqiU', label: 'Coordination — הדגמה מלאה' },
  reformer_41_3: { embedUrl: 'https://www.youtube.com/embed/BfRY99Ka-zQ', label: 'Long Stretch — הדגמה מלאה' },
  // Phase 1+2 real exercises — dedicated matches (verified via title/channel, Howcast "How to Do" mat series unless noted)
  mat_0_1: { embedUrl: 'https://www.youtube.com/embed/pg4WRNkbnjA', label: 'Single Leg Circle — הדגמה מלאה' },
  mat_5_1: { embedUrl: 'https://www.youtube.com/embed/Go6UA7SHdoE', label: 'Corkscrew — הדגמה מלאה' },
  mat_10_1: { embedUrl: 'https://www.youtube.com/embed/G5zO03AJlwU', label: 'Seal — הדגמה מלאה' },
  mat_15_1: { embedUrl: 'https://www.youtube.com/embed/yso-Y3Ik2BM', label: 'Spine Stretch Forward — הדגמה מלאה' },
  mat_25_2: { embedUrl: 'https://www.youtube.com/embed/LLULnAA8_pE', label: 'Side Kick Series — הדגמה מלאה' },
  mat_30_2: { embedUrl: 'https://www.youtube.com/embed/IdsOhji7Hjg', label: 'Single Leg Stretch — הדגמה מלאה' },
  mat_40_3: { embedUrl: 'https://www.youtube.com/embed/ZbtEw_pcPp4', label: 'Open Leg Rocker — הדגמה מלאה' },
  mat_45_3: { embedUrl: 'https://www.youtube.com/embed/N-jZas9tMSU', label: 'Double Leg Stretch — הדגמה מלאה' },
  mat_50_3: { embedUrl: 'https://www.youtube.com/embed/QlyHs841Ezg', label: 'Neck Pull — הדגמה מלאה' },
  mat_55_3: { embedUrl: 'https://www.youtube.com/embed/1XcU-WsTcaU', label: 'Saw — הדגמה מלאה' },
  mat_70_4: { embedUrl: 'https://www.youtube.com/embed/jCSfXZToPCI', label: 'Shoulder Bridge — הדגמה מלאה' },
  mat_80_5: { embedUrl: 'https://www.youtube.com/embed/EfVURwxctv8', label: 'Rolling Like a Ball — הדגמה מלאה' },
  mat_85_5: { embedUrl: 'https://www.youtube.com/embed/gzaCxDVQL90', label: 'Criss Cross — הדגמה מלאה' },
  mat_95_5: { embedUrl: 'https://www.youtube.com/embed/bY6ZyiO_7ek', label: 'Swimming — הדגמה מלאה' },
  reformer_66_4: { embedUrl: 'https://www.youtube.com/embed/iEUBi98L16M', label: 'Mermaid — הדגמה מלאה' },
  props_59_3: { embedUrl: 'https://www.youtube.com/embed/vUIVMQnSpH8', label: 'Plank — הדגמה מלאה' }
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
