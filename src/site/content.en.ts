import { HE, type SiteContent } from './content';

// English version of the site (/en/), aimed mainly at collaborations with
// activewear brands. Same shape as the Hebrew content in content.ts — when a
// section changes there, update it here too. Pricing and locations stay
// hidden, as on the Hebrew site.

export const EN: SiteContent = {
  lang: 'en',

  BRAND: {
    name: 'Pilates in Motion',
    owner: 'Rotem',
    fullName: 'Rotem Shapira',
    photoAlt: 'Rotem Shapira, mat and apparatus Pilates instructor',
    certification: 'Certified mat & apparatus Pilates instructor · Martha Pilates Center',
  },

  CONTACT: {
    ...HE.CONTACT,
    phone: '+972 54-802-4606',
    preferredChannelLabel: 'WhatsApp',
    whatsappGreeting: 'Hi Rotem, I found you through your website and would love to talk 🙂',
  },

  PHOTOS: HE.PHOTOS,

  NAV_LINKS: [
    { href: '#about', label: 'About' },
    { href: '#classes', label: 'Classes' },
    { href: '#book', label: 'Collaborations' },
    { href: '#tool', label: 'For instructors' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contact', label: 'Contact' },
  ],

  HERO: {
    eyebrow: 'Rotem · Pilates instructor · Israel',
    title: ['Movement', 'that begins', 'within.'],
    subtitle:
      'Mat and apparatus Pilates — in the studio, at your event, or wherever your community moves. Open to collaborations with activewear brands.',
    primaryCta: 'Work with me',
    secondaryCta: 'Explore the classes',
    secondaryHref: '#classes',
    highlights: ['Certified in mat & apparatus', 'Based in Emek Izrael Valley, Israel', 'Private, pair, event & group classes'],
  },

  PRINCIPLES_TICKER: ['Breath', 'Centering', 'Control', 'Precision', 'Flow', 'Concentration'],

  ABOUT: {
    title: 'Hi, I’m Rotem',
    paragraphs: [
      'I’m Rotem, a certified mat and apparatus Pilates instructor based in Israel.',
      'My classes focus on breath, posture and controlled movement — with close attention to each person’s level and needs.',
    ],
    signature: 'Rotem',
  },

  CERTIFICATES: [
    { ...HE.CERTIFICATES[0], title: 'Mat Pilates Instructor Course', details: '209 hours · February 2026' },
    { ...HE.CERTIFICATES[1], title: 'Apparatus Pilates Instructor Course', details: '304 hours · June 2026' },
  ],

  CLASSES: [
    {
      id: 'mat',
      title: 'Mat Pilates',
      text: 'The foundation of the method: bodyweight, breath and control. It builds deep core strength, improves posture and flexibility — and teaches the body to move well outside the class too.',
      points: ['Deep core strength', 'Better posture and flexibility', 'Groups of up to 15'],
    },
    {
      id: 'apparatus',
      title: 'Apparatus Pilates',
      text: 'Reformer and other Pilates apparatus, where springs add resistance and support exactly where they’re needed. Varied, challenging and gentle on the joints.',
      points: ['Resistance adapted to every body', 'Precise, controlled work', 'Small groups, by number of machines'],
    },
  ],

  SHOW_PRICING: HE.SHOW_PRICING,
  PRICING: HE.PRICING,

  BOOKING: {
    title: 'Let’s move together.',
    intro:
      'I work independently and collaborate with brands, studios and communities. Tell me what you have in mind, and we’ll shape the right session together.',
    options: [
      {
        id: 'brand',
        title: 'Activewear collaborations',
        text: 'Ambassador programs, product testing in real classes, and Pilates sessions that show how your pieces move.',
        points: ['Certified mat & apparatus instructor', 'Real classes, real movement'],
      },
      {
        id: 'event',
        title: 'Brand events & community classes',
        text: 'Launch events, store activations and community sessions — a guided mat class your guests will remember.',
        points: ['Mat Pilates for groups', 'Tailored to the audience and the space'],
      },
      {
        id: 'private',
        title: 'Private & pair sessions',
        text: 'One-on-one or pair sessions built around your body, pace and goals — in the Emek Izrael Valley area, Israel.',
        points: ['50 minutes', 'Mat or apparatus'],
      },
    ],
    form: {
      title: 'Tell me about your idea',
      note: 'The form opens a ready-to-send WhatsApp message — you can edit it before sending.',
      submit: 'Send on WhatsApp',
    },
  },

  TOOL: {
    title: 'Build a class. Fit to the body in front of you.',
    intro:
      'A working tool for Pilates instructors: an exercise library, lesson planning and a live coaching mode — with guidance for injuries and special conditions such as pregnancy and postnatal.',
    features: [
      { id: 'library', title: 'Exercise library', text: 'Hundreds of mat and apparatus exercises, with cues, breathing and key points.' },
      { id: 'conditions', title: 'Special conditions', text: 'Pick a condition — lower back, pregnancy, postnatal and more — and see what fits, what needs modifying and what to avoid.' },
      { id: 'builder', title: 'Lesson planning', text: 'Arrange warm-up, main work and cool-down — and save it to reuse.' },
      { id: 'coach', title: 'Live coaching mode', text: 'Teach from your phone, exercise by exercise, with a timer.' },
    ],
    cta: 'Open the tool (Hebrew)',
  },

  AUDIENCE: [
    'Beginners who want to start moving safely',
    'Experienced practitioners who want to refine their practice',
    'People who sit for hours and feel it in their back',
    'Anyone looking for a joint-friendly workout that truly strengthens',
    'Athletes who want a strong core and efficient movement',
    'Anyone who wants to leave a workout calmer than they came in',
  ],

  // The six classic Pilates principles.
  PRINCIPLES: [
    { title: 'Breath', text: 'Breath leads the movement and connects body and mind.' },
    { title: 'Centering', text: 'Every movement starts from the core — the body’s “powerhouse”.' },
    { title: 'Control', text: 'Nothing is accidental. Every exercise is done with full control.' },
    { title: 'Precision', text: 'Fewer repetitions, done right. Quality over quantity.' },
    { title: 'Flow', text: 'Smooth, continuous movement from one exercise to the next.' },
    { title: 'Concentration', text: 'Full presence in class — real time for yourself.' },
  ],

  SHOW_LOCATIONS: HE.SHOW_LOCATIONS,
  LOCATIONS: HE.LOCATIONS,

  TESTIMONIALS: [],

  FAQ: [
    {
      q: 'Do you collaborate with activewear brands?',
      a: 'Yes — ambassador programs, product testing in real classes, brand events and community sessions. Send a short message with what you have in mind on any of these channels and I’ll get back to you:',
      contact: true,
    },
    {
      q: 'Where are you based?',
      a: 'In the Emek Izrael Valley, in northern Israel. I teach across the area and come to wherever the session is — for collaborations further away, let’s talk.',
    },
    {
      q: 'What’s the difference between mat and apparatus Pilates?',
      a: 'On the mat you work with your body weight and small props. On the apparatus, such as the reformer, a spring system adds resistance and support — making it possible both to challenge and to assist. The two complement each other.',
    },
    {
      q: 'What is your certification?',
      a: 'I’m a certified mat and apparatus Pilates instructor, trained at the Martha Pilates Center: a 209-hour mat course and a 304-hour apparatus course.',
    },
    {
      q: 'Who is the lesson builder for?',
      a: 'Pilates instructors who want structured lessons, adapted for clients with injuries or special conditions. It’s currently available in Hebrew, and it’s a professional aid — not a substitute for medical advice.',
    },
    {
      q: 'What’s the best way to reach you?',
      a: 'WhatsApp is the fastest (+972 54-802-4606). You can also email me or reach me on Instagram:',
      contact: true,
    },
  ],

  FOOTER_PAGES: [{ href: 'exercises/', label: 'Exercise library (HE)' }],

  APP_PROMO: {
    ...HE.APP_PROMO,
    title: 'Lesson-planning tools',
    text: 'Hundreds of exercises, lesson planning and a live coaching mode — a working tool for Pilates instructors.',
    cta: 'Open the lesson builder',
    navigationLabel: 'Lesson builder (HE)',
  },

  UI: {
    skipToContent: 'Skip to content',
    toTop: 'back to top',
    mainNav: 'Main navigation',
    footerNav: 'Footer navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Site language',
    heroBadgeTitle: 'Mat · Apparatus',
    heroBadgeSub: 'Certified · Martha Pilates Center',
    certificatesTitle: 'Certifications',
    certificatesIssuer: 'Martha Pilates Center',
    certificateView: 'View certificate',
    certificateAlt: 'Certificate',
    bookingMore: 'Learn more',
    exerciseLibraryLink: 'Browse the exercise library (HE)',
    aboutEyebrow: 'About Rotem',
    classesEyebrow: 'Classes',
    classesTitle: 'Two ways to move. One goal.',
    classesIntro: 'On the mat or on the apparatus — every class is built around your body, your level and your goals.',
    audienceTitle: 'Who is it for?',
    audienceSub: 'Almost everyone.',
    pricingEyebrow: 'Classes & pricing',
    pricingFeatured: 'Best place to start',
    bookingEyebrow: 'Collaborations & bookings',
    form: {
      typeLegend: 'What are you looking for?',
      name: 'Name',
      date: 'Timing',
      datePlaceholder: 'e.g. spring 2027, or a specific date',
      place: 'Brand / location',
      placePlaceholder: 'Company, city or venue',
      participants: 'Expected participants',
      participantsPlaceholder: 'e.g. 20',
      notes: 'Anything else I should know?',
      notesPlaceholder: 'Goals, audience, timeline…',
      submitEmail: 'Send by email',
    },
    message: {
      hello: 'Hi Rotem, I found you through your website 🙂',
      request: 'I’m interested in:',
      name: 'Name:',
      date: 'Timing:',
      place: 'Brand / location:',
      participants: 'Participants:',
      notes: 'Details:',
      fallbackSubject: 'Website inquiry',
    },
    contactLabels: { whatsapp: 'Chat on WhatsApp', phone: 'Call me', email: 'Send an email' },
    bookSubject: 'Pilates inquiry',
    scheduleSubject: 'Class schedule and location',
    scheduleGreeting: 'Hi Rotem, I found you through your website and would like the group class schedule and location 🙂',
    toolEyebrow: 'For instructors',
    toolPreviewCaption: 'Condition: pregnancy',
    toolPreviewTag: 'Example',
    toolPreviewStatus: { suitable: 'Suitable', modify: 'Modify', avoid: 'Avoid' },
    toolDisclaimer: 'An aid for certified instructors. Not a substitute for medical advice.',
    toolLanguageNote: 'The lesson builder is currently available in Hebrew.',
    methodEyebrow: 'The method',
    methodTitle: ['Six principles.', 'One body.'],
    methodIntro: 'Joseph Pilates built his method on six simple principles. They guide every class I teach — from the first breath to the final exercise.',
    locationsAreas: 'Areas:',
    locationsTeachesAt: 'Teaching at',
    locationsStudioDetails: 'Studio details',
    locationsSchedule: 'Class schedule',
    locationsRequest: 'Ask for schedule & location',
    testimonialsEyebrow: 'Kind words',
    testimonialsTitle: 'What people say',
    faqEyebrow: 'FAQ',
    faqTitle: 'Everything you wanted to ask',
    faqNotFound: 'Didn’t find an answer?',
    faqWriteMe: 'Write to me',
    faqHappyToHelp: '— happy to help.',
    instagram: 'Instagram',
    facebook: 'Facebook',
    contactTitle: ['The first step', 'is the easiest.'],
    contactIntro: 'Send me a message, tell me a little about your idea — and we’ll take it from there.',
    privacy: 'Privacy (Hebrew)',
    terms: 'Terms (Hebrew)',
    footerSignoff: 'With love,',
    channels: { whatsapp: 'WhatsApp', email: 'Email', instagram: 'Instagram', website: 'Website' },
    galleryNav: 'Gallery',
    galleryEyebrow: 'Gallery',
    galleryTitle: 'Moments in motion',
    galleryIntro: 'From classes, events and everything in between.',
    galleryOpen: 'Open full size',
    galleryClose: 'Close',
    galleryPrev: 'Previous',
    galleryNext: 'Next',
    galleryVideo: 'Video',
  },
};
