import { Exercise, Lesson } from './types';

export const INITIAL_EXERCISES: Exercise[] = [
  // MAT EXERCISES
  {
    id: 'mat_hundred',
    name: 'המאות (The Hundred)',
    englishName: 'The Hundred',
    apparatus: 'mat',
    apparatusLabel: 'מזרן (Mat)',
    difficulty: 'beginner',
    difficultyLabel: 'מתחילים',
    targetMuscles: ['שרירי בטן עמוקים', 'סרעפת', 'יציבה'],
    durationMinutes: 5,
    instructions: [
      'שכבי על הגב בתנוחת נייטרל, רגליים בזווית Tabletop (90 מעלות).',
      'נשפי, אספי את הבטן והרימי ראש ושכמות מהמזרן, ידיים ארוכות לצידי הגוף בגובה האגן.',
      'התחילי להניע את הידיים מעלה ומטה בצורה נמרצת אך מבוקרת.',
      'שאפי אוויר לאורך 5 פעימות ידיים, ונשפי החוצה לאורך 5 פעימות ידיים.',
      'השלימי 10 מחזורי נשימה מלאים (סה"כ 100 פעימות).'
    ],
    benefits: 'חימום זרימת הדם, הפעלת מרכז הגוף (Core) ושיפור הריכוז.',
    breathing: 'שאיפה דרך האף ל-5 פעימות, נשיפה עמוקה דרך הפה ל-5 פעימות.'
  },
  {
    id: 'mat_roll_up',
    name: 'גלגול מעלה (Roll Up)',
    englishName: 'The Roll Up',
    apparatus: 'mat',
    apparatusLabel: 'מזרן (Mat)',
    difficulty: 'intermediate',
    difficultyLabel: 'בינוני',
    targetMuscles: ['בטן ישרה', 'גמישות עמוד שדרה', 'מכופפי ירך'],
    durationMinutes: 6,
    instructions: [
      'שכבי שטוח על הגב, רגליים צמודות ומתוחות קדימה, ידיים ישרות מעבר לראש.',
      'שאפי, הרימי את הידיים לתקרה והתחילי לנתק ראש וצוואר.',
      'נשפי, אספי בטן פנימה וגלגלי את עמוד השדרה חוליה אחר חוליה מעלה וקדימה מעל הרגליים (בצורת האות C).',
      'שאפי בשיא המתיחה קדימה, כשהכתפיים רחוקות מהאוזניים.',
      'נשפי והתחילי לחזור חזרה למזרן בצורה איטית, חוליה אחרי חוליה, תוך שמירה על שליטה מלאה.'
    ],
    benefits: 'הארכה וגמישות של הגב ועמוד השדרה, חיזוק אינטנסיבי של שרירי הבטן.',
    breathing: 'שאיפה לתחילת התנועה והרמת ראש, נשיפה בעלייה ובמתיחה, שאיפה בשיא, נשיפה בירידה הדרגתית.'
  },
  {
    id: 'mat_teaser',
    name: 'טיזר (The Teaser)',
    englishName: 'The Teaser',
    apparatus: 'mat',
    apparatusLabel: 'מזרן (Mat)',
    difficulty: 'advanced',
    difficultyLabel: 'מתקדם',
    targetMuscles: ['שיווי משקל', 'שרירי בטן אלכסוניים', 'גב עליון'],
    durationMinutes: 7,
    instructions: [
      'שכבי על הגב, ידיים ארוכות מעבר לראש ורגליים מתוחות ל-45 מעלות.',
      'בבת אחת, שאפי ואספי את מרכז הגוף כדי להרים את פלג הגוף העליון והרגליים יחד לצורת V.',
      'הידיים מקבילות לרגליים והחזה פתוח, הכתפיים שמוטות מטה.',
      'החזיקי בנקודת האיזון במשך 3 שניות.',
      'נשפי ורדי בחזרה למזרן בשליטה מוחלטת, תוך שמירה על הרגליים יציבות כמה שניתן.'
    ],
    benefits: 'פיתוח כוח בטן מתקדם, קואורדינציה, שיווי משקל ומיקוד מנטלי.',
    breathing: 'שאיפה בעלייה למצב V, שמירה על המצב תוך כדי נשיפה, ושאיפה/נשיפה בירידה בשליטה.'
  },

  // REFORMER EXERCISES
  {
    id: 'reformer_footwork',
    name: 'עבודת רגליים (Footwork)',
    englishName: 'Footwork on Reformer',
    apparatus: 'reformer',
    apparatusLabel: 'רפורמר (Reformer)',
    difficulty: 'beginner',
    difficultyLabel: 'מתחילים',
    targetMuscles: ['ארבע ראשי', 'ירכיים אחוריות', 'שרירי שוקיים', 'מנח אגן'],
    durationMinutes: 8,
    instructions: [
      'שכבי על הרפורמר עם הראש על משענת הראש, הניחי את כריות כפות הרגליים על הבר (Footbar) ברוחב האגן.',
      'שמרי על אגן נייטרלי (Neutral Pelvis) וכתפיים משוחררות.',
      'נשפי ודחפי את העגלה החוצה על ידי יישור הברכיים (בלי לנעול אותן).',
      'שאפי והחזירי את העגלה באיטיות ובשליטה מלאה להתנגדות הקפיצים.',
      'בצעי סדרות שונות: כריות רגליים (Toes), עקבים (Heels), קשתות (Arches) ופילאטיס V.'
    ],
    benefits: 'יישור וחיזוק פלג גוף תחתון, יציבות אגן ופיתוח דפוס תנועה נכון.',
    breathing: 'נשיפה בדחיפה החוצה (כנגד הקפיץ), שאיפה בחזרה המבוקרת פנימה.'
  },
  {
    id: 'reformer_hundred_straps',
    name: 'מאה עם רצועות (Hundred with Straps)',
    englishName: 'Reformer Hundred',
    apparatus: 'reformer',
    apparatusLabel: 'רפורמר (Reformer)',
    difficulty: 'intermediate',
    difficultyLabel: 'בינוני',
    targetMuscles: ['ליבה', 'כתפיים', 'זרועות', 'יציבות שכמות'],
    durationMinutes: 5,
    instructions: [
      'שכבי על הגב, אחזי ברצועות הידיים כאשר הידיים מתוחות לכיוון התקרה.',
      'הביאי את הרגליים לתנוחת Tabletop.',
      'נשפי, הרימי ראש ושכמות ובמקביל לחצי את הרצועות מטה קרוב למזרן.',
      'התחילי להניע ידיים מעלה ומטה תוך ביצוע נשימות קצובות (5 שאיפה, 5 נשיפה) למשך 100 פעימות.'
    ],
    benefits: 'חיזוק פלג גוף עליון משולב עם התנגדות דינמית, שיפור יציבות הליבה.',
    breathing: 'קצב מהיר ומקביל של 5 שאיפות ו-5 נשיפות.'
  },
  {
    id: 'reformer_elephant',
    name: 'הפיל (The Elephant)',
    englishName: 'The Elephant',
    apparatus: 'reformer',
    apparatusLabel: 'רפורמר (Reformer)',
    difficulty: 'intermediate',
    difficultyLabel: 'בינוני',
    targetMuscles: ['ירך אחורית', 'שרירי בטן עמוקים', 'הארכת עמוד שדרה'],
    durationMinutes: 6,
    instructions: [
      'עמדי על המכשיר: עקבים צמודים לכתפיות, כפות ידיים על הבר ברוחב הכתפיים.',
      'עגלי את הגב לצורת C עגולה, הרימי את קשתות כף הרגל ומשכי את הבטן לתקרה.',
      'דחפי את העגלה החוצה מהאגן והירכיים (לא מהכתפיים) כמה סנטימטרים.',
      'נשפי והשתמשי בשרירי הבטן התחתונה כדי למשוך את העגלה חזרה פנימה עד הסוף.',
      'שמרי על הראש שמוט בין הזרועות והכתפיים רחוקות מהבר.'
    ],
    benefits: 'מתיחה יוצאת מן הכלל לשרשרת האחורית, שליטה עמוקה בשרירי הבטן התחתונה.',
    breathing: 'שאיפה בדחיפת העגלה החוצה, נשיפה באיסוף העגלה פנימה.'
  },

  // CADILLAC EXERCISES
  {
    id: 'cadillac_roll_back',
    name: 'גלגול לאחור עם מוט (Roll Back with Bar)',
    englishName: 'Roll Back on Cadillac',
    apparatus: 'cadillac',
    apparatusLabel: 'קאדילק (Cadillac)',
    difficulty: 'beginner',
    difficultyLabel: 'מתחילים',
    targetMuscles: ['עמוד שדרה מותני', 'בטן', 'חגורת כתפיים'],
    durationMinutes: 6,
    instructions: [
      'שבי עם הפנים לכיוון המוט הנייד (Roll-back Bar), רגליים ישרות ונוגעות בעמודים.',
      'אחזי במוט בידיים ישרות ברוחב הכתפיים.',
      'שאפי, נשפי והתחילי לעגל את האגן לאחור, להניח חוליה אחר חוליה על המיטה.',
      'שאפי בשכיבה, הרימי ראש והתחילי להתגלגל חזרה למעלה.',
      'נשפי בשיא העלייה ופתחי את בית החזה.'
    ],
    benefits: 'הפחתת מתח בגב התחתון, גיוס הדרגתי של שרירי הבטן עם תמיכת קפיצים.',
    breathing: 'נשיפה בגלגול למטה, שאיפה בשכיבה ומעבר לעלייה, נשיפה בעלייה הסופית.'
  },
  {
    id: 'cadillac_tower',
    name: 'תרגיל המגדל (The Tower)',
    englishName: 'The Tower',
    apparatus: 'cadillac',
    apparatusLabel: 'קאדילק (Cadillac)',
    difficulty: 'advanced',
    difficultyLabel: 'מתקדם',
    targetMuscles: ['הארכת עמוד שדרה', 'הקלה על גב תחתון', 'ירך אחורית'],
    durationMinutes: 8,
    instructions: [
      'שכבי על הגב מתחת למוט הפוש-ת׳רו (Push-Through Bar), רגליים מונחות על המוט כשהברכיים כפופות.',
      'התחילי ליישר את הרגליים כלפי מעלה לכיוון התקרה.',
      'דחפי את המוט מעלה והרימי את האגן והגב חוליה אחר חוליה למצב גשר גבוה.',
      'כופפי ויישרי את הברכיים במצב המורם כדי לעבוד על הירך האחורית.',
      'רדי חזרה באיטיות ובשליטה מבוקרת, חוליה אחר חוליה.'
    ],
    benefits: 'הזנה מפרקית לעמוד השדרה, מתיחה אינטנסיבית של הירך האחורית וחיזוק הישבן.',
    breathing: 'נשיפה בעלייה לגשר, שאיפה ונשיפה תוך עבודה למעלה, שאיפה בירידה.'
  },

  // CHAIR EXERCISES
  {
    id: 'chair_swan',
    name: 'סוואן על הכיסא (Swan on Chair)',
    englishName: 'Swan on Wunda Chair',
    apparatus: 'chair',
    apparatusLabel: 'כיסא (Wunda Chair)',
    difficulty: 'intermediate',
    difficultyLabel: 'בינוני',
    targetMuscles: ['זוקפי גב', 'ישבן', 'כתפיים וחזה'],
    durationMinutes: 6,
    instructions: [
      'שכבי על הבטן לאורך מושב הכיסא, אגן במרכז המושב, כפות הידיים מונחות על הדוושה (Pedal).',
      'שאפי, לחצי את הדוושה מטה והאריכי את כל הגוף כשהרגליים מתוחות באוויר.',
      'נשפי, התחילי להרים את החזה מעלה תוך מתן אפשרות לדוושה לעלות למעלה, שמרי על מרפקים ישרים למחצה וכתפיים נמוכות.',
      'שאפי בשיא הגובה כשהגב פתוח והבטן אוספת את המותן.',
      'נשפי וחזרי למצב ההתחלתי תוך לחיצת הדוושה מטה.'
    ],
    benefits: 'פתיחה של פלג גוף קדמי, חיזוק שרשרת אחורית ושיפור היציבה נגד כפיפות.',
    breathing: 'נשיפה בעלייה ופתיחת בית החזה, שאיפה בירידה בשליטה.'
  },
  {
    id: 'chair_pushups',
    name: 'שכיבות סמיכה בכיסא (Chair Push Ups)',
    englishName: 'Wunda Chair Pushups',
    apparatus: 'chair',
    apparatusLabel: 'כיסא (Wunda Chair)',
    difficulty: 'advanced',
    difficultyLabel: 'מתקדם',
    targetMuscles: ['חזה', 'תלת-ראשי (Triceps)', 'ייצוב ליבה'],
    durationMinutes: 7,
    instructions: [
      'עמדי מול הכיסא, הניחי את כפות הידיים על המושב ורדי לתנוחת פלאנק (שכיבת סמיכה), כשהרגליים מונחות על הדוושה.',
      'בצעי כפיפת מרפקים (Push-up) תוך שמירה על גוף ישר כמו קרש.',
      'וריאציה מתקדמת: לחצי את הדוושה מטה ומעלה באמצעות תנועת אגן ובטן במצב פלאנק.',
      'שמרי על הראש בהמשך לעמוד השדרה והצוואר ארוך.'
    ],
    benefits: 'חיזוק פלג גוף עליון חזק במיוחד, ייצוב אולטימטיבי של הכתפיים והליבה.',
    breathing: 'שאיפה בכפיפת המרפקים מטה, נשיפה חזקה בדחיפה מעלה.'
  },

  // PROPS EXERCISES (Magic Circle / Balls / Bands)
  {
    id: 'props_magic_circle_thighs',
    name: 'לחיצת ירכיים עם חישוק (Inner Thigh Squeeze)',
    englishName: 'Magic Circle Squeeze',
    apparatus: 'props',
    apparatusLabel: 'עזרים (Props)',
    difficulty: 'beginner',
    difficultyLabel: 'מתחילים',
    targetMuscles: ['מקרבי ירך', 'רצפת אגן', 'בטן תחתונה'],
    durationMinutes: 5,
    instructions: [
      'שכבי על הגב, ברכיים כפופות וכפות רגליים מונחות שטוח על המזרן ברוחב האגן.',
      'מקמי את חישוק הפילאטיס (Magic Circle) בין הירכיים מעט מעל הברכיים.',
      'שאפי והרחיבי את הצלעות.',
      'נשפי, אספי את רצפת האגן והבטן פנימה, ולחצי את החישוק בעזרת שתי הירכיים.',
      'החזיקי 2 שניות, ושחררי באיטיות בחצי חזרה תוך שמירה על מתח קל בחישוק.'
    ],
    benefits: 'הפעלת מקרבי הירך וחיזוק רצפת אגן בשילוב שרירי בטן עמוקים.',
    breathing: 'נשיפה ארוכה בזמן הלחיצה ואיסוף רצפת האגן, שאיפה בשחרור.'
  },
  {
    id: 'props_bridge_ball',
    name: 'גשר עם כדור קטן (Bridge with Mini Ball)',
    englishName: 'Mini Ball Pelvic Bridge',
    apparatus: 'props',
    apparatusLabel: 'עזרים (Props)',
    difficulty: 'beginner',
    difficultyLabel: 'מתחילים',
    targetMuscles: ['ישבן', 'ירך אחורית', 'זוקפי גב'],
    durationMinutes: 6,
    instructions: [
      'שכבי על הגב, ברכיים כפופות, מקמי כדור פילאטיס רך קטן מתחת לעקבים או בין הברכיים.',
      'נשפי, לחצי את הגב התחתון למזרן והתחילי לקלף את האגן ועמוד השדרה מעלה.',
      'שמרי על קו ישר מהכתפיים לברכיים, כשהכדור נשמר יציב.',
      'בצעי לחיצות קטנות על הכדור בחלק העליון של הגשר.',
      'שאפי ורדי חזרה באטיות מוחלטת חוליה אחר חוליה.'
    ],
    benefits: 'חיזוק פלג גוף תחתון, שיפור היציבות הדינמית ועבודה על שרירים מייצבים.',
    breathing: 'נשיפה בעלייה ובלחיצה על הכדור, שאיפה בירידה.'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson_classic_mat',
    name: 'קלאסיקה על מזרן: חימום וליבה',
    description: 'מערך שיעור מזרן מסורתי המתמקד בבניית כוח ליבה יציב, שיפור גמישות עמוד השדרה והתעוררות הגוף.',
    level: 'beginner',
    levelLabel: 'מתחילים - בינוני',
    targetFocus: 'ליבה ויציבה',
    totalDuration: 22,
    createdAt: '2026-07-01',
    isCustom: false,
    exercises: [
      { exercise: INITIAL_EXERCISES[0], customDuration: 5, notes: 'להתחיל בנשימות איטיות, להקפיד על תנועת ידיים נמרצת.' }, // Hundred
      { exercise: INITIAL_EXERCISES[1], customDuration: 6, notes: 'להשתמש במודיפיקציה עם ברכיים כפופות למתקשים.' }, // Roll up
      { exercise: INITIAL_EXERCISES[10], customDuration: 5, notes: 'מיקוד ברצפת האגן והפעלת מקרבי הירך.' }, // Magic circle thighs
      { exercise: INITIAL_EXERCISES[11], customDuration: 6, notes: 'לסיים את השיעור במתיחה קלה על המזרן.' } // Bridge with ball
    ]
  },
  {
    id: 'lesson_reformer_strength',
    name: 'רפורמר דינמי: כוח ויציבה',
    description: 'אימון רפורמר קצבי המשלב עבודת רגליים מדויקת, יציבות פלג גוף עליון ומתיחה מלאה של עמוד השדרה.',
    level: 'intermediate',
    levelLabel: 'בינוני',
    targetFocus: 'כוח רגליים וגב',
    totalDuration: 19,
    createdAt: '2026-07-05',
    isCustom: false,
    exercises: [
      { exercise: INITIAL_EXERCISES[3], customDuration: 8, notes: 'לעשות 4 סטים של 10 חזרות בכל מנח רגליים.' }, // Footwork
      { exercise: INITIAL_EXERCISES[4], customDuration: 5, notes: 'לשמור על עגלה יציבה וקפיץ אדום אחד/כחול אחד.' }, // Reformer hundred
      { exercise: INITIAL_EXERCISES[5], customDuration: 6, notes: 'להתמקד במשיכת העגלה פנימה משרירי הבטן התחתונה.' } // Elephant
    ]
  },
  {
    id: 'lesson_advanced_combo',
    name: 'אתגר המאסטר: קומבו מכשירים',
    description: 'שיעור אינטנסיבי ויוקרתי המשלב אלמנטים מתקדמים מהמזרן, הרפורמר והכיסא. מתאים למתאמנים מנוסים.',
    level: 'advanced',
    levelLabel: 'מתקדם',
    targetFocus: 'אתגר שיווי משקל וכוח',
    totalDuration: 28,
    createdAt: '2026-07-10',
    isCustom: false,
    exercises: [
      { exercise: INITIAL_EXERCISES[2], customDuration: 7, notes: 'לשמור על חזה פתוח ומבט מעלה.' }, // Teaser
      { exercise: INITIAL_EXERCISES[7], customDuration: 8, notes: 'עלייה מבוקרת לגשר וזרימה בתנועה.' }, // Tower
      { exercise: INITIAL_EXERCISES[9], customDuration: 7, notes: 'להקפיד על מנח פלאנק מיושר לחלוטין.' }, // Chair pushups
      { exercise: INITIAL_EXERCISES[8], customDuration: 6, notes: 'סגירה מושלמת לעבודת הגב והכתפיים.' } // Swan
    ]
  }
];
