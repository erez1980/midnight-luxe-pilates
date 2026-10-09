import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import {
  Play,
  Search,
  FolderHeart,
  BookOpen,
  Compass,
  ChevronRight,
  CheckCircle,
  User,
  LogIn,
  Activity,
  Heart,
  Mail,
  Sliders,
  ChevronLeft,
  Download
} from 'lucide-react';
import { Lesson } from './types';
import { INITIAL_LESSONS, INITIAL_EXERCISES } from './data';
const ExerciseLibrary = lazy(() => import('./components/ExerciseLibrary'));
const LessonBuilder = lazy(() => import('./components/LessonBuilder'));
const MyLessons = lazy(() => import('./components/MyLessons'));
const CoachingSession = lazy(() => import('./components/CoachingSession'));
import { PrivacyPolicy, TermsOfUse } from './components/LegalPages';
import { buildShareUrl, buildShortShareUrl, exportLessonsBundle, exportRawWorkspace, importLessonsBundle, readSharedLessonFromUrl, readLegacyBundle, hasLegacyBundle } from './utils/storage';
import { createSharedLesson, fetchSharedLesson, revokeSharedLessons } from './utils/cloudSync';
import { supabaseEnabled } from './lib/supabase';
import { AuthProfile, getAuthProfile, listenToAuthChanges, signInWithGoogle, signOut } from './utils/auth';
import { ProfileDetails, fetchProfileDetails, upsertProfile } from './utils/profile';
import { Subscription, FREE_SUBSCRIPTION, ensureSubscription, fetchSubscription } from './utils/subscription';
import ProfileSetup from './components/ProfileSetup';
import { LogoMark } from './components/Logo';
import { motion, AnimatePresence } from 'motion/react';
import Button from './components/ui/Button';
import Dialog from './components/ui/Dialog';
import { useWorkspace } from './hooks/useWorkspace';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'library' | 'builder' | 'lessons' | 'session' | 'privacy' | 'terms'>(() => {
    // The marketing site's footer deep-links here with ?page=privacy|terms.
    const page = new URLSearchParams(window.location.search).get('page');
    return page === 'privacy' || page === 'terms' ? page : 'home';
  });
  const theme = 'light' as const;
  const [activeSessionLesson, setActiveSessionLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);
  const [uiNotice, setUiNotice] = useState('');
  const [authReady, setAuthReady] = useState(!supabaseEnabled);
  const workspace = useWorkspace(authProfile?.id ?? null, authReady, setUiNotice);
  const { lessons, templates, setLessons, setTemplates, cloudStatus } = workspace;
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [importBundle, setImportBundle] = useState<{ lessons: Lesson[]; templates: Lesson[] } | null>(null);
  const [conflictChoice, setConflictChoice] = useState<'local' | 'remote' | null>(null);
  const accountRef = useRef<string | null>(null);
  accountRef.current = authProfile?.id ?? null;
  const [legacyAvailable, setLegacyAvailable] = useState(() => { try { return hasLegacyBundle(); } catch { return false; } });
  useEffect(() => {
    try { setLegacyAvailable(hasLegacyBundle() && !localStorage.getItem(`pilates:legacy-imported:v3:${workspace.scope}`)); }
    catch { setLegacyAvailable(false); }
  }, [workspace.scope]);
  // Customer-management state (billing readiness Phase 1): profile details
  // collected by the one-time setup form, and the user's subscription row.
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>(FREE_SUBSCRIPTION);
  // PWA install: browsers fire beforeinstallprompt when the app qualifies for
  // installation; stashing the event lets us show our own "התקנה" button.
  const [installPrompt, setInstallPrompt] = useState<{ prompt: () => void; userChoice: Promise<unknown> } | null>(null);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as unknown as { prompt: () => void; userChoice: Promise<unknown> });
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const navigateTo = (
    screen: 'home' | 'library' | 'builder' | 'lessons' | 'session' | 'privacy' | 'terms',
    options?: { lesson?: Lesson | null; editingLesson?: Lesson | null; replace?: boolean }
  ) => {
    const nextLesson = options?.lesson ?? (screen === 'session' ? activeSessionLesson : null);
    const nextEditingLesson = options?.editingLesson ?? (screen === 'builder' ? editingLesson : null);

    if (screen === 'session') {
      setActiveSessionLesson(nextLesson ?? null);
    } else if (activeSessionLesson) {
      setActiveSessionLesson(null);
    }

    if (screen === 'builder') {
      setEditingLesson(nextEditingLesson ?? null);
    } else if (editingLesson) {
      setEditingLesson(null);
    }

    setActiveScreen(screen);

    const state = {
      screen,
      lessonId: nextLesson?.id ?? null,
      editingLessonId: nextEditingLesson?.id ?? null,
    };

    if (options?.replace) {
      window.history.replaceState(state, '');
    } else {
      window.history.pushState(state, '');
    }
  };

  // Resolve a shared lesson from the URL, if there is one. Tries the short
  // server-stored link first (?s=<id>), then falls back to the legacy
  // base64-in-URL link (?sharedLesson=<data>) for links created before this
  // was added. Either way, the recipient is taken straight to the lesson -
  // including guests who aren't logged in, since a shared lesson is meant to
  // be viewable without an account.
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const url = new URL(window.location.href);
        const shortId = url.searchParams.get('s');
        const sharedLesson = shortId ? await fetchSharedLesson(shortId) : readSharedLessonFromUrl();
        if (disposed) return;
        if (shortId && !sharedLesson) setUiNotice('קישור השיתוף לא נמצא, בוטל או פג תוקף.');
        if (sharedLesson) {
          const next = { ...sharedLesson, id: `shared_${crypto.randomUUID()}` };
          setEditingLesson(next); setActiveScreen('builder');
          window.history.replaceState({ screen: 'builder', editingLessonId: next.id }, '');
        }
      } catch (error) {
        if (!disposed) setUiNotice(error instanceof Error ? error.message : 'קישור השיתוף אינו תקין.');
      }
    })();
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    let disposed = false;
    let authEventReceived = false;
    const subscription = listenToAuthChanges((profile, event) => {
      if (disposed) return;
      if (!profile && event !== 'SIGNED_OUT' && event !== 'INITIAL_SESSION') return;
      authEventReceived = true;
      setAuthProfile(profile);
      setAuthReady(true);
      if (event === 'SIGNED_IN') setUiNotice('ההתחברות הצליחה. טוענים את השיעורים שלך.');
    });
    getAuthProfile().then((profile) => {
      if (!disposed && !authEventReceived) { setAuthProfile(profile); setAuthReady(true); }
    }).catch(() => {
      if (!disposed && !authEventReceived) { setAuthReady(true); setUiNotice('טעינת החשבון נכשלה. אפשר לנסות להתחבר שוב.'); }
    });
    return () => { disposed = true; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const profile = authProfile;
    setProfileDetails(null);
    setProfileSetupOpen(false);
    setSubscription(FREE_SUBSCRIPTION);
    if (!profile) return;
    let disposed = false;
    (async () => {
      await upsertProfile(profile);
      await ensureSubscription(profile.id);
      const [details, subscription] = await Promise.all([fetchProfileDetails(profile.id), fetchSubscription(profile.id)]);
      if (!disposed && accountRef.current === profile.id) { setProfileDetails(details); setSubscription(subscription); }
      // Optional business details are opened from account settings, after use.
    })().catch(() => { if (!disposed) setUiNotice('פרטי החשבון לא נטענו. אפשר להמשיך לבנות שיעור.'); });
    return () => { disposed = true; };
  }, [authProfile?.id]);

  const previousAccount = useRef<string | null>(null);
  useEffect(() => {
    if (previousAccount.current && previousAccount.current !== authProfile?.id) {
      setEditingLesson(null); setActiveSessionLesson(null); setActiveScreen('home');
      setLegacyOpen(false); setImportBundle(null); setConflictChoice(null);
      window.history.replaceState({ screen: 'home' }, '');
    }
    previousAccount.current = authProfile?.id ?? null;
  }, [authProfile?.id]);

  const isAuthenticated = Boolean(authProfile);

  useEffect(() => {
    const initialState = {
      screen: 'home',
      lessonId: null,
      editingLessonId: null,
    };
    window.history.replaceState(window.history.state ?? initialState, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state?.screen) {
        setActiveSessionLesson(null);
        setEditingLesson(null);
        setActiveScreen('home');
        return;
      }

      const nextScreen = state.screen as 'home' | 'library' | 'builder' | 'lessons' | 'session' | 'privacy' | 'terms';
      setActiveScreen(nextScreen);

      if (nextScreen === 'session' && state.lessonId) {
        const lesson = lessons.find((item) => item.id === state.lessonId) ?? null;
        setActiveSessionLesson(lesson);
      } else {
        setActiveSessionLesson(null);
      }

      if (nextScreen === 'builder' && state.editingLessonId) {
        const lesson = lessons.find((item) => item.id === state.editingLessonId) ?? null;
        setEditingLesson(lesson);
      } else {
        setEditingLesson(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lessons]);

  const goToProtected = (screen: 'builder' | 'lessons' | 'session') => {
    if (!isAuthenticated) {
      navigateTo(screen === 'session' ? 'builder' : screen, { lesson: null });
      setUiNotice('יש להתחבר עם Google כדי לבנות ולשמור שיעורים בחשבון שלך.');
      return;
    }
    navigateTo(screen);
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (!result.ok) {
      setUiNotice(result.reason === 'disabled' ? 'ההתחברות אינה זמינה כרגע. מאגר התרגילים פתוח לצפייה.' : 'ההתחברות נכשלה. אפשר לנסות שוב.');
    }
  };

  const handleLogout = async () => {
    try { await signOut(); } catch { setUiNotice('ההתנתקות נכשלה. יש לנסות שוב.'); return; }
    setAuthProfile(null);
    setProfileDetails(null);
    setProfileSetupOpen(false);
    setSubscription(FREE_SUBSCRIPTION);
    navigateTo('home', { replace: true, lesson: null, editingLesson: null });
    setUiNotice('ההתנתקות הושלמה.');
  };

  const saveLessonsToStorage = (updatedLessons: Lesson[]) => setLessons(updatedLessons);

  const handleExportBundle = () => {
    if (workspace.blocked) {
      try { exportRawWorkspace(workspace.scope); setUiNotice('הורד עותק גולמי לשחזור הנתונים. זה אינו קובץ ייבוא רגיל.'); } catch { setUiNotice('הדפדפן חסם גם קריאת גיבוי. יש לאפשר אחסון ולנסות שוב.'); }
      return;
    }
    exportLessonsBundle(lessons, templates);
    setUiNotice('קובץ הגיבוי הורד בהצלחה.');
  };

  const handleImportBundle = async (file: File) => {
    try { setImportBundle(await importLessonsBundle(file)); }
    catch (error) { setUiNotice(error instanceof Error ? error.message : 'קובץ הגיבוי אינו תקין.'); }
  };
  const addBundleCopies = (bundle: { lessons: Lesson[]; templates: Lesson[] }) => {
    const copies = (items: Lesson[]) => items.map((lesson) => ({ ...lesson, id: `imported_${crypto.randomUUID()}`, isCustom: true }));
    const ok = workspace.setCollections([...lessons, ...copies(bundle.lessons)], [...templates, ...copies(bundle.templates)]);
    if (ok) setUiNotice('השיעורים והתבניות נוספו כעותקים. הנתונים הקיימים נשמרו.');
    return ok;
  };

  const handleCopyShareLink = async (lesson: Lesson) => {
    // Prefer a short server-stored link (works in WhatsApp, SMS, short-link
    // services). Only falls back to the old base64-in-URL link if Supabase
    // isn't configured or the save fails - that old link can be very long for
    // lessons with many exercises, but it's better than no link at all.
    const owner = accountRef.current;
    let url: string;
    let sharedId: string | null;
    try {
      sharedId = await createSharedLesson(lesson);
      if (accountRef.current !== owner) return;
      url = sharedId ? buildShortShareUrl(sharedId) : buildShareUrl(lesson);
    } catch (error) {
      setUiNotice(error instanceof Error ? error.message : 'השיתוף נכשל. אפשר לנסות שוב.');
      return;
    }

    // The OS share sheet (WhatsApp / mail / messages) is the useful path on
    // phones; clipboard copy is the desktop fallback.
    if (navigator.share) {
      try {
        await navigator.share({ title: lesson.name, text: `מערך שיעור: ${lesson.name}`, url });
        return;
      } catch (e) {
        // AbortError = user closed the sheet; anything else falls through to copy.
        if ((e as DOMException)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setUiNotice(sharedId ? 'קישור השיתוף הועתק. הוא זמין ל־30 יום.' : 'קישור השיתוף הועתק. הקישור מכיל עותק של השיעור ואינו ניתן לביטול.');
    } catch {
      setUiNotice(`העתקת הקישור נכשלה. אפשר להעתיק ידנית: ${url}`);
    }
  };

  // Add / Edit Lesson handler
  const handleSaveLesson = (savedLesson: Lesson) => {
    let updated: Lesson[];
    const exists = lessons.some(l => l.id === savedLesson.id);
    if (exists) {
      updated = lessons.map(l => l.id === savedLesson.id ? savedLesson : l);
    } else {
      updated = [savedLesson, ...lessons];
    }
    if (!saveLessonsToStorage(updated)) return false;
    setEditingLesson(null);
    
    // Transition to saved playlist screen with delay so user sees success toast
    navigateTo('lessons');
    setUiNotice('השיעור נשמר במכשיר. מצב הסנכרון מופיע בספרייה.');
    return true;
  };

  // Delete Lesson handler
  const handleDeleteLesson = (id: string) => {
    const updated = lessons.filter(l => l.id !== id);
    saveLessonsToStorage(updated);
  };

  // Edit Lesson click handler
  const handleEditLesson = (lesson: Lesson) => {
    // No auth re-check: only reachable from screens already gated at render
    // time, and a click-time re-check risks a transient auth flicker silently
    // swallowing the action.
    navigateTo('builder', { editingLesson: lesson });
  };

  // Launch Coaching Mode
  const handleStartLesson = (lesson: Lesson) => {
    // Same rationale as handleEditLesson - gated by the parent screen already.
    navigateTo('session', { lesson });
  };

  return (
    // overflow-clip (not overflow-x-hidden): hiding only one axis forces the
    // other to compute to `auto`, turning this div into a scroll container and
    // breaking any `position: sticky` inside it.
    <div className="min-h-screen bg-background text-on-background flex flex-col relative overflow-clip selection:bg-gold-soft selection:text-ink transition-colors duration-300">
      
      {/* Header Section */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/85 backdrop-blur-md border-b border-line px-4 sm:px-6 md:px-20 py-3 md:py-4 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <button
            onClick={() => navigateTo('home', { editingLesson: null })}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <LogoMark theme={theme} className="w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105" />
            <h2 className="serif-text text-base sm:text-xl font-bold tracking-wide text-ink select-none">פילאטיס בתנועה</h2>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            <button
              onClick={() => navigateTo('library', { editingLesson: null })}
              className={`hover:text-secondary transition-all text-sm font-medium tracking-wide relative py-1 cursor-pointer ${
                activeScreen === 'library' ? 'text-secondary font-bold border-b border-secondary' : 'text-on-surface'
              }`}
            >
              מאגר תרגילים
            </button>
            <button
              onClick={() => { setEditingLesson(null); goToProtected('builder'); }}
              className={`hover:text-secondary transition-all text-sm font-medium tracking-wide relative py-1 cursor-pointer ${
                activeScreen === 'builder' ? 'text-secondary font-bold border-b border-secondary' : 'text-on-surface'
              }`}
            >
              בניית שיעור
            </button>
            <button
              onClick={() => { setEditingLesson(null); goToProtected('lessons'); }}
              className={`hover:text-secondary transition-all text-sm font-medium tracking-wide relative py-1 cursor-pointer ${
                activeScreen === 'lessons' ? 'text-secondary font-bold border-b border-secondary' : 'text-on-surface'
              }`}
            >
              השיעורים שלי
            </button>
          </nav>

          {/* User & Action area */}
          <div className="flex items-center gap-3 sm:gap-5">
            {authProfile ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-on-surface font-semibold leading-tight">{authProfile.name}</div>
                </div>
                <button
                  onClick={() => goToProtected('lessons')}
                  className="w-10 h-10 rounded-full border border-line bg-cover bg-center shadow-md cursor-pointer hover:border-secondary transition-all overflow-hidden bg-surface-container"
                  title={authProfile.name}
                >
                  {authProfile.avatarUrl ? (
                    <img src={authProfile.avatarUrl} alt={authProfile.name || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 mx-auto text-secondary" />
                  )}
                </button>
                <button onClick={() => setProfileSetupOpen(true)} className="hidden sm:block text-xs text-on-surface-variant hover:text-secondary transition-colors">
                  הפרופיל שלי
                </button>
                <button onClick={handleLogout} className="hidden sm:block text-xs text-on-surface-variant hover:text-secondary transition-colors">
                  יציאה
                </button>
              </div>
            ) : (
              <>
                {/* span wrappers: Button's own inline-flex would fight a
                    responsive `hidden` utility placed directly on it. */}
                <span className="hidden sm:block">
                  <Button onClick={handleGoogleLogin} variant="outline" size="sm" latin>
                    <LogIn className="w-4 h-4" />
                    Google
                  </Button>
                </span>
                <span className="sm:hidden">
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    size="icon-sm"
                    aria-label="התחברות עם Google"
                    title="התחברות עם Google"
                  >
                    <LogIn className="w-4 h-4" />
                  </Button>
                </span>
              </>
            )}

            {installPrompt && (
              <>
                <span className="hidden md:block">
                  <Button onClick={handleInstallApp} variant="primary" size="sm">
                    <Download className="w-4 h-4" />
                    התקנת האפליקציה
                  </Button>
                </span>
                <span className="md:hidden">
                  <Button
                    onClick={handleInstallApp}
                    variant="primary"
                    size="icon-sm"
                    aria-label="התקנת האפליקציה"
                    title="התקנת האפליקציה"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </span>
              </>
            )}



          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation — replaces the burger drawer with an
          app-like, always-visible bar. Hidden on lg where the top nav exists. */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {([
            { key: 'home', label: 'בית', icon: Compass, action: () => navigateTo('home', { editingLesson: null }) },
            { key: 'library', label: 'מאגר', icon: BookOpen, action: () => navigateTo('library', { editingLesson: null }) },
            { key: 'builder', label: 'בנייה', icon: Sliders, action: () => { setEditingLesson(null); goToProtected('builder'); } },
            { key: 'lessons', label: 'שיעורים', icon: FolderHeart, action: () => { setEditingLesson(null); goToProtected('lessons'); } },
          ] as const).map((item) => {
            const isActive = activeScreen === item.key || (item.key === 'lessons' && activeScreen === 'session');
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={item.action}
                className="relative flex flex-col items-center gap-1 py-2.5 min-h-[56px] justify-center"
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute top-1.5 h-7 w-12 rounded-full bg-secondary/15"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className={`relative w-5 h-5 transition-colors ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`} />
                <span className={`relative text-[11px] font-semibold transition-colors ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* One-time customer-details form after first sign-in */}
      {authProfile && (
        <ProfileSetup
          open={profileSetupOpen}
          userId={authProfile.id}
          userName={authProfile.name}
          initialDetails={profileDetails}
          onClose={() => setProfileSetupOpen(false)}
          onSaved={() => {
            setProfileSetupOpen(false);
            setUiNotice('הפרטים נשמרו, תודה!');
            const owner = authProfile.id;
            fetchProfileDetails(owner).then((details) => { if (accountRef.current === owner) setProfileDetails(details); });
          }}
        />
      )}

      {isAuthenticated && (legacyAvailable || cloudStatus === 'error' || workspace.conflicts.length > 0) && (
        <aside className="mx-auto mt-28 w-[calc(100%-2rem)] max-w-5xl rounded-2xl border border-line bg-surface-container p-4" aria-label="גיבוי וסנכרון">
          {legacyAvailable && <div className="mb-3"><p className="text-sm mb-2">נמצאו שיעורים מהגרסה הקודמת במכשיר. הם לא הועברו לחשבון באופן אוטומטי.</p><Button variant="surface" onClick={() => setLegacyOpen(true)}>בחירת הנתונים להעברה</Button></div>}
          {cloudStatus === 'error' && <div><p role="status" className="text-sm mb-3">{workspace.conflicts.length ? 'נמצאו שינויים שונים במכשיר ובענן. שתי הגרסאות נשמרות עד לבחירה שלך.' : 'הסנכרון לא הושלם. אפשר לנסות שוב או להוריד גיבוי.'}</p>
            <div className="flex flex-wrap gap-2"><Button variant="surface" onClick={workspace.retrySync}>ניסיון סנכרון נוסף</Button><Button variant="surface" onClick={handleExportBundle}>הורדת גיבוי מקומי</Button>
              {workspace.conflicts.length > 0 && <><Button variant="outline" onClick={() => setConflictChoice('local')}>להשתמש בגרסאות המקומיות</Button><Button variant="outline" onClick={() => setConflictChoice('remote')}>להשתמש בגרסאות הענן</Button></>}
            </div></div>}
        </aside>
      )}
      <Dialog open={legacyOpen} onClose={() => setLegacyOpen(false)} label="העברת נתונים מהגרסה הקודמת">
        <h2 className="text-xl font-bold mb-3">להוסיף את השיעורים הישנים לחשבון הנוכחי?</h2>
        <p className="mb-5 text-on-surface-variant">יש לוודא שהנתונים שייכים לך. במחשב משותף הם עשויים להיות של משתמש אחר. הנתונים יתווספו כעותקים; המקור יישאר במכשיר.</p>
        <div className="flex flex-wrap gap-3"><Button variant="surface" onClick={() => setLegacyOpen(false)}>ביטול</Button><Button onClick={() => { try { if (addBundleCopies(readLegacyBundle())) { try { localStorage.setItem(`pilates:legacy-imported:v3:${workspace.scope}`, 'true'); } catch { /* Data itself was already persisted. */ } setLegacyAvailable(false); setLegacyOpen(false); } } catch { setUiNotice('הנתונים הישנים אינם תקינים. לא בוצעה העברה.'); } }}>כן, הנתונים שלי — להוסיף עותקים</Button></div>
      </Dialog>
      <Dialog open={Boolean(importBundle)} onClose={() => setImportBundle(null)} label="ייבוא גיבוי">
        <h2 className="text-xl font-bold mb-3">להוסיף את הגיבוי לספרייה?</h2>
        <p className="mb-5 text-on-surface-variant">{importBundle?.lessons.length || 0} שיעורים ו־{importBundle?.templates.length || 0} תבניות יתווספו כעותקים. השיעורים הקיימים יישארו.</p>
        <div className="flex gap-3"><Button variant="surface" onClick={() => setImportBundle(null)}>ביטול</Button><Button onClick={() => { if (importBundle && addBundleCopies(importBundle)) setImportBundle(null); }}>הוספת עותקים</Button></div>
      </Dialog>
      <Dialog open={Boolean(conflictChoice)} onClose={() => setConflictChoice(null)} label="בחירת גרסה לסנכרון">
        <h2 className="text-xl font-bold mb-3">{conflictChoice === 'local' ? 'להחליף את גרסאות הענן בגרסאות מהמכשיר?' : 'להחליף את הגרסאות שבמכשיר בגרסאות הענן?'}</h2>
        <p className="mb-5 text-on-surface-variant">הבחירה חלה על {workspace.conflicts.length} פריטים בהתנגשות. מומלץ להוריד גיבוי מקומי לפני המשך.</p>
        <div className="flex flex-wrap gap-3"><Button variant="surface" onClick={handleExportBundle}>הורדת גיבוי</Button><Button variant="surface" onClick={() => setConflictChoice(null)}>ביטול</Button><Button onClick={() => { workspace.resolveConflicts(conflictChoice === 'local'); setConflictChoice(null); }}>אישור הבחירה</Button></div>
      </Dialog>

      {/* MAIN SCREEN ROUTING */}
      <main className="flex-grow pt-28 pb-28 lg:pb-16">
        {uiNotice && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20 mb-4">
            <div role="status" aria-live="polite" className="rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-on-surface flex items-center justify-between gap-3 break-all">
              <span>{uiNotice}</span>
              <button onClick={() => setUiNotice('')} className="text-secondary hover:text-on-surface">סגירה</button>
            </div>
          </div>
        )}
        
        {activeScreen === 'home' && (
          <section className="mx-auto max-w-5xl px-5 py-10 sm:py-16" aria-labelledby="workspace-title">
            <p className="text-sm text-secondary mb-3">כלי עבודה למדריכות ולמדריכי פילאטיס</p>
            <h1 id="workspace-title" className="serif-text text-4xl sm:text-5xl text-on-surface">{authProfile ? `נעים לראות אותך, ${authProfile.name || 'מדריך/ה'}` : 'השיעור הבא מתחיל כאן'}</h1>
            <p className="mt-5 max-w-2xl text-on-surface-variant leading-relaxed">חיפוש תרגילים, בניית מערך לפי זמן ורמה, ושעון הדרכה לשיעור — במקום אחד.</p>
            <div className="my-8 flex flex-wrap gap-3">
              <Button onClick={() => goToProtected('builder')} size="lg">בניית שיעור חדש</Button>
              <Button onClick={() => navigateTo('library')} variant="outline" size="lg">למאגר התרגילים</Button>
              {authProfile && <Button onClick={() => navigateTo('lessons')} variant="surface" size="lg">השיעורים שלי ({lessons.length})</Button>}
            </div>
            {!authProfile && <p className="text-sm text-on-surface-variant">המאגר פתוח לצפייה. לשמירת שיעורים וסנכרון בין מכשירים יש להתחבר עם Google.</p>}
            <p className="text-sm text-on-surface-variant mb-8">{INITIAL_EXERCISES.length} תרגילים במאגר · מזרן ומכשירים · הדרכה בעברית</p>
            {authProfile && lessons.length > 0 && <div className="grid gap-4 sm:grid-cols-3">{lessons.slice(0, 3).map((lesson) => (
              <article key={lesson.id} className="rounded-2xl border border-line bg-surface-container p-5">
                <h2 className="font-bold text-lg">{lesson.name}</h2>
                <p className="my-3 text-sm text-on-surface-variant">{lesson.totalDuration} דקות · {lesson.levelLabel}</p>
                <Button variant="surface" onClick={() => handleEditLesson(lesson)}>פתיחת מערך</Button>
              </article>
            ))}</div>}
            <a href="../" className="mt-10 inline-block text-secondary underline underline-offset-4">לאתר של פילאטיס בתנועה</a>
          </section>
        )}

        <Suspense
        fallback={
          <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-24">
            <div className="rounded-3xl border border-line bg-surface-container p-8 text-center text-on-surface-variant">
              טוען את סביבת העבודה...
            </div>
          </div>
        }
      >
        {/* Screen: EXERCISE DATABASE LIBRARY */}
        {activeScreen === 'library' && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <ExerciseLibrary />
          </div>
        )}

        {/* Screen: LESSON BUILDER WORKSPACE */}
        {activeScreen === 'builder' && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            {workspace.loaded && (isAuthenticated || editingLesson?.id.startsWith('shared_')) ? (
              <LessonBuilder
                key={`${workspace.scope}:${editingLesson?.id || 'new'}`}
                storageScope={workspace.scope}
                onSaveLesson={handleSaveLesson}
                existingLessonToEdit={editingLesson}
              />
            ) : (
              isAuthenticated ? <p role="status" className="py-10">טוענים את סביבת העבודה. אם הגיבוי המקומי אינו תקין, הנתונים המקוריים נשארים במכשיר.</p> : <LockedWorkspace onGoogleLogin={handleGoogleLogin} />
            )}
          </div>
        )}

        {/* Screen: MY SAVED WORKOUTS */}
        {activeScreen === 'lessons' && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            {isAuthenticated && workspace.loaded ? (
              <MyLessons 
                lessons={lessons}
                templates={templates}
                onStartLesson={handleStartLesson}
                onEditLesson={handleEditLesson}
                onDeleteLesson={handleDeleteLesson}
                onCreateNewLesson={() => { setEditingLesson(null); goToProtected('builder'); }}
                onCopyShareLink={handleCopyShareLink}
                onRevokeShareLinks={async (lesson) => { try { await revokeSharedLessons(lesson.id); setUiNotice('קישורי השיתוף של השיעור בוטלו. עותקים שכבר נשמרו אצל נמענים אינם נמחקים.'); } catch (error) { setUiNotice(error instanceof Error ? error.message : 'ביטול הקישורים נכשל.'); } }}
                onAddExamples={() => addBundleCopies({ lessons: INITIAL_LESSONS, templates: [] })}
                onBackHome={() => navigateTo('home')}
                onExportBundle={handleExportBundle}
                onImportBundle={handleImportBundle}
                cloudStatus={supabaseEnabled ? cloudStatus : null}
              />
            ) : (
              isAuthenticated ? <p role="status" className="py-10">טוענים את סביבת העבודה. אם הגיבוי המקומי אינו תקין, הנתונים המקוריים נשארים במכשיר.</p> : <LockedWorkspace onGoogleLogin={handleGoogleLogin} />
            )}
          </div>
        )}

        {/* Screen: REALTIME ACTIVE COACHING SESSION */}
        {activeScreen === 'session' && activeSessionLesson && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <CoachingSession
              key={`${workspace.scope}:${activeSessionLesson.id}`}
              lesson={activeSessionLesson}
              onFinishSession={() => navigateTo('lessons', { lesson: null })}
            />
          </div>
        )}
      </Suspense>

      {/* Screen: LEGAL — plain text, no need for lazy loading or auth */}
      {activeScreen === 'privacy' && (
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <PrivacyPolicy onBack={() => navigateTo('home')} />
        </div>
      )}
      {activeScreen === 'terms' && (
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <TermsOfUse onBack={() => navigateTo('home')} />
        </div>
      )}

      </main>

      {/* Footer Section */}
      {/* pb accounts for the fixed mobile bottom nav so footer links (privacy/
          terms) aren't hidden underneath it. */}
      <footer className="pt-10 pb-28 lg:py-10 bg-surface-container-lowest border-t border-line px-6 md:px-20 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

          <div
            onClick={() => { navigateTo('home'); }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <LogoMark theme={theme} className="w-8 h-8" />
            <span className="serif-text font-bold tracking-widest text-secondary text-sm">פילאטיס בתנועה</span>
          </div>

          <p className="text-on-surface-variant text-sm text-center">
            © 2026 פילאטיס בתנועה. מרחב העבודה של מדריכות ומדריכי פילאטיס.
          </p>

          <div className="flex items-center gap-5 text-sm">
            <a href="../" className="text-on-surface-variant hover:text-secondary transition-colors">
              לאתר הסטודיו
            </a>
            <button onClick={() => navigateTo('privacy')} className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
              מדיניות פרטיות
            </button>
            <button onClick={() => navigateTo('terms')} className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
              תנאי שימוש
            </button>
            <a href="mailto:erez1980@gmail.com" className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" aria-label="יצירת קשר במייל">
              <Mail className="w-5 h-5" />
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}

// Soft scroll-reveal wrapper: content floats up and fades in the first time it
// enters the viewport. `delay` staggers siblings for a breathing rhythm.
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function LockedWorkspace({ onGoogleLogin }: { onGoogleLogin: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <div className="max-w-4xl w-full rounded-3xl border border-secondary/20 bg-surface-container-high p-6 md:p-12 shadow-2xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center">
          <div>
            <div className="mb-6 h-16 w-16 rounded-full border border-secondary/30 bg-secondary/10 flex items-center justify-center text-secondary">
              <LogIn className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] tracking-[0.2em] text-secondary mb-4">
              סביבת עבודה מקצועית
            </div>
            <h2 className="serif-text text-3xl md:text-4xl font-bold text-on-surface mb-4">האזור הזה נפתח אחרי התחברות</h2>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              מאגר התרגילים פתוח לצפייה חופשית. בונה השיעורים, ספריית השיעורים, התבניות והסנכרון לענן נפתחים אחרי התחברות — למי שמנהל כאן את סביבת העבודה.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={onGoogleLogin} size="md" variant="primary" className="w-full sm:w-auto">
                <LogIn className="w-5 h-5" />
                התחברות עם Google
              </Button>
            </div>
            {!supabaseEnabled && (
              <p className="mt-4 text-xs text-on-surface-variant">
                מצב פיתוח: Supabase/Google OAuth עדיין לא מוגדר, לכן האתר נשאר מוגבל לאורחים.
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-line bg-surface-container p-4">
              <div className="text-on-surface font-bold mb-2">בניית שיעור חכמה</div>
              <div className="text-sm text-on-surface-variant">בניית שיעורים לפי מטרה, רמה, משך וציוד.</div>
            </div>
            <div className="rounded-2xl border border-line bg-surface-container p-4">
              <div className="text-on-surface font-bold mb-2">תבניות</div>
              <div className="text-sm text-on-surface-variant">שכפול והתאמה של מערכים בלי להתחיל כל פעם מאפס.</div>
            </div>
            <div className="rounded-2xl border border-line bg-surface-container p-4">
              <div className="text-on-surface font-bold mb-2">סנכרון לענן</div>
              <div className="text-sm text-on-surface-variant">ספריית שיעורים מסונכרנת ונגישה מכל מכשיר.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
