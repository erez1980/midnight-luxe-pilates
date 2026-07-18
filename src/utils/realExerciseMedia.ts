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
  reformer_51_3: { embedUrl: 'https://www.youtube.com/embed/q4aSiZC1yjo', label: 'Up Stretch — הדגמה מלאה' },
  cadillac_27_2: { embedUrl: 'https://www.youtube.com/embed/KQePaN-Qfvk', label: 'Monkey — הדגמה מלאה' },
  reformer_16_1: { embedUrl: 'https://www.youtube.com/embed/7TDdzbuLiUI', label: 'Tendon Stretch — הדגמה מלאה' },
  reformer_21_2: { embedUrl: 'https://www.youtube.com/embed/I2j_Y0JsuN0', label: 'Knee Stretches - Round Back — הדגמה מלאה' },
  reformer_61_4: { embedUrl: 'https://www.youtube.com/embed/A3vkIu44sVs', label: 'Knee Stretches - Arched Back — הדגמה מלאה' },
  reformer_106_6: { embedUrl: 'https://www.youtube.com/embed/yCGEhRigHm4', label: 'Down Stretch — הדגמה מלאה' },
  chair_3_1: { embedUrl: 'https://www.youtube.com/embed/pxQFdPnjlrE', label: 'Going Up Front — הדגמה מלאה' },
  reformer_56_3: { embedUrl: 'https://www.youtube.com/embed/U15uc-WpQok', label: 'Semi-Circle — הדגמה מלאה' },
  reformer_86_5: { embedUrl: 'https://www.youtube.com/embed/I7SxZUn1EaI', label: 'Stomach Massage - Round Back — הדגמה מלאה' },
  reformer_101_6: { embedUrl: 'https://www.youtube.com/embed/VzMG_pzUEmA', label: 'Backstroke — הדגמה מלאה' },
  cadillac_37_2: { embedUrl: 'https://www.youtube.com/embed/mE-m7zsv6P0', label: 'Teaser on the Cadillac — הדגמה מלאה' },
  chair_8_1: { embedUrl: 'https://www.youtube.com/embed/bSXE3TQy-G4', label: 'Achilles Stretch — הדגמה מלאה' },
  chair_58_3: { embedUrl: 'https://www.youtube.com/embed/hc6GGdUV1GE', label: 'Mermaid on the Chair — הדגמה מלאה' },
  reformer_71_4: { embedUrl: 'https://www.youtube.com/embed/iNB8ZS9yj4I', label: 'Front Splits — הדגמה מלאה' },
  chair_13_1: { embedUrl: 'https://www.youtube.com/embed/YDM1g6f9aDA', label: 'Twist with Straight Arms — הדגמה מלאה' },
  reformer_6_1: { embedUrl: 'https://www.youtube.com/embed/FLVpQ2P_9QA', label: 'Pelvic Lift on Reformer — הדגמה מלאה' },
  reformer_31_2: { embedUrl: 'https://www.youtube.com/embed/NpJYV2iVfZA', label: 'Running — הדגמה מלאה' },
  reformer_36_2: { embedUrl: 'https://www.youtube.com/embed/7dnKsRPiPtY', label: 'Chest Expansion with Arm Springs — הדגמה מלאה' },
  reformer_81_5: { embedUrl: 'https://www.youtube.com/embed/Zic_h-K3gSI', label: 'Pulling Straps 1 & 2 — הדגמה מלאה' },
  reformer_116_6: { embedUrl: 'https://www.youtube.com/embed/rPr2MzfWoJg', label: 'Short Box Twist and Reach — הדגמה מלאה' },
  cadillac_7_1: { embedUrl: 'https://www.youtube.com/embed/zndg1zSOi6c', label: 'Leg Springs Series (Frog) — הדגמה מלאה' },
  cadillac_67_4: { embedUrl: 'https://www.youtube.com/embed/zndg1zSOi6c', label: 'Leg Springs Series (Bicycle) — הדגמה מלאה' },
  cadillac_102_6: { embedUrl: 'https://www.youtube.com/embed/zndg1zSOi6c', label: 'Leg Springs Series (Circles) — הדגמה מלאה' },
  cadillac_22_2: { embedUrl: 'https://www.youtube.com/embed/OVTzlzL7f4o', label: 'Side Leg Springs — הדגמה מלאה' },
  cadillac_62_4: { embedUrl: 'https://www.youtube.com/embed/OVTzlzL7f4o', label: 'Side Leg Springs — הדגמה מלאה' },
  cadillac_52_3: { embedUrl: 'https://www.youtube.com/embed/ZAn5hFFn-0U', label: 'Standing Arm Springs Chest Expansion — הדגמה מלאה' },
  cadillac_32_2: { embedUrl: 'https://www.youtube.com/embed/ujGsFG4jbs8', label: 'Cat Stretch on Push Through Bar — הדגמה מלאה' },
  chair_23_2: { embedUrl: 'https://www.youtube.com/embed/3BlntX8WwV8', label: 'Spine Stretch Forward on Chair — הדגמה מלאה' },
  mat_35_2: { embedUrl: 'https://www.youtube.com/embed/DmC80q6xp9I', label: 'Double Leg Kick — הדגמה מלאה' },
  mat_60_4: { embedUrl: 'https://www.youtube.com/embed/3GBwBBt63Xw', label: 'Pelvic Clock — הדגמה מלאה' },
  mat_65_4: { embedUrl: 'https://www.youtube.com/embed/wj6myBe54cQ', label: 'Leg Pull Front — הדגמה מלאה' },
  mat_110_6: { embedUrl: 'https://www.youtube.com/embed/wj6myBe54cQ', label: 'Leg Pull Back — הדגמה מלאה' },
  cadillac_2_1: { embedUrl: 'https://www.youtube.com/embed/Z9VgaB2Difo', label: 'Roll Down with Roll Back Bar — הדגמה מלאה' },
  cadillac_42_3: { embedUrl: 'https://www.youtube.com/embed/Z9VgaB2Difo', label: 'Roll Down with Roll Back Bar — הדגמה מלאה' },
  cadillac_87_5: { embedUrl: 'https://www.youtube.com/embed/Z9VgaB2Difo', label: 'Roll Down with Roll Back Bar — הדגמה מלאה' },
  reformer_91_5: { embedUrl: 'https://www.youtube.com/embed/8HfgZLz9QS0', label: 'Rowing Series — הדגמה מלאה' },
  reformer_46_3: { embedUrl: 'https://www.youtube.com/embed/OVTzlzL7f4o', label: 'Side Leg Springs — הדגמה מלאה' },
  cadillac_57_3: { embedUrl: 'https://www.youtube.com/embed/ZAn5hFFn-0U', label: 'Standing Arm Springs — הדגמה מלאה' },
  cadillac_92_5: { embedUrl: 'https://www.youtube.com/embed/ZAn5hFFn-0U', label: 'Standing Arm Springs — הדגמה מלאה' },
  cadillac_97_5: { embedUrl: 'https://www.youtube.com/embed/ZAn5hFFn-0U', label: 'Standing Arm Springs — הדגמה מלאה' },
  chair_38_2: { embedUrl: 'https://www.youtube.com/embed/fuM8rP7tLF4', label: 'Pumping One Leg — הדגמה מלאה' },
  chair_73_4: { embedUrl: 'https://www.youtube.com/embed/3oiMtUtorTU', label: 'Single Leg Pull Up — הדגמה מלאה' },
  chair_83_5: { embedUrl: 'https://www.youtube.com/embed/ixa3nCqq-LU', label: 'Going Up Side — הדגמה מלאה' },
  chair_103_6: { embedUrl: 'https://www.youtube.com/embed/Y0XdJQkqBrU', label: 'Frog on Chair — הדגמה מלאה' },
  chair_18_1: { embedUrl: 'https://www.youtube.com/embed/1-2mya5qSyk', label: 'Kneeling Cat Stretch — הדגמה מלאה' },
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
