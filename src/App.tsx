import React, { Suspense, lazy, useState, useEffect } from 'react';
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
  Sun,
  Moon,
  Download
} from 'lucide-react';
import { Lesson } from './types';
import { INITIAL_LESSONS } from './data';
const ExerciseLibrary = lazy(() => import('./components/ExerciseLibrary'));
const LessonBuilder = lazy(() => import('./components/LessonBuilder'));
const MyLessons = lazy(() => import('./components/MyLessons'));
const CoachingSession = lazy(() => import('./components/CoachingSession'));
import { PrivacyPolicy, TermsOfUse } from './components/LegalPages';
import { buildShareUrl, buildShortShareUrl, exportLessonsBundle, importLessonsBundle, readLessons, readSharedLessonFromUrl, readTemplates, writeLessons, writeTemplates } from './utils/storage';
import { pullCloudLessons, pushCloudLessons, createSharedLesson, fetchSharedLesson } from './utils/cloudSync';
import { supabaseEnabled } from './lib/supabase';
import { AuthProfile, getAuthProfile, listenToAuthChanges, signInWithGoogle, signOut } from './utils/auth';
import { ProfileDetails, fetchProfileDetails, upsertProfile } from './utils/profile';
import { Subscription, FREE_SUBSCRIPTION, ensureSubscription, fetchSubscription } from './utils/subscription';
import ProfileSetup from './components/ProfileSetup';
import { LogoMark } from './components/Logo';
import { motion, AnimatePresence } from 'motion/react';
import Button from './components/ui/Button';

export default function App() {
  // Feature flag: pricing is hidden until a real payment decision + processor
  // are in place. Flip to true to bring the section back - the markup is kept.
  const SHOW_PRICING = false;
  const [activeScreen, setActiveScreen] = useState<'home' | 'library' | 'builder' | 'lessons' | 'session' | 'privacy' | 'terms'>('home');
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('pilates-theme-mode');
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    } catch {
      return 'system';
    }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  );
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeSessionLesson, setActiveSessionLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [templates, setTemplates] = useState<Lesson[]>([]);
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [hydrated, setHydrated] = useState(false);
  const [uiNotice, setUiNotice] = useState('');
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

  // Load lessons from localStorage on mount, fall back to initial ones
  useEffect(() => {
    try {
      const storedLessons = readLessons();
      setLessons(storedLessons.length ? storedLessons : INITIAL_LESSONS);
      if (!storedLessons.length) writeLessons(INITIAL_LESSONS);
      setTemplates(readTemplates());
    } catch (e) {
      console.warn('Failed to read from localStorage', e);
      setLessons(INITIAL_LESSONS);
    } finally {
      // Only after local state has a real value do we allow cloud sync to run -
      // otherwise an auto-push could fire with an empty array before localStorage
      // has loaded and wipe out a real cloud backup.
      setHydrated(true);
    }
  }, []);

  // Resolve a shared lesson from the URL, if there is one. Tries the short
  // server-stored link first (?s=<id>), then falls back to the legacy
  // base64-in-URL link (?sharedLesson=<data>) for links created before this
  // was added. Either way, the recipient is taken straight to the lesson -
  // including guests who aren't logged in, since a shared lesson is meant to
  // be viewable without an account.
  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const shortId = url.searchParams.get('s');
      let sharedLesson: Lesson | null = null;

      if (shortId) {
        sharedLesson = await fetchSharedLesson(shortId);
        if (!sharedLesson) setUiNotice('קישור השיתוף לא נמצא או פג תוקף.');
      } else {
        sharedLesson = readSharedLessonFromUrl();
      }

      if (sharedLesson) {
        const nextSharedLesson = { ...sharedLesson, id: `shared_${Date.now()}` };
        setEditingLesson(nextSharedLesson);
        setActiveScreen('builder');
        window.history.replaceState({ screen: 'builder', lessonId: null, editingLessonId: nextSharedLesson.id }, '');
      }
    })();
  }, []);

  // Runs after every confirmed sign-in: enrolls the user on the free plan
  // (no-op if they already have a subscription row), loads their saved
  // profile details, and opens the one-time setup form if it was never
  // completed. Details fetch failing (or Supabase disabled) skips the form —
  // it must never appear when saving would be impossible.
  const bootstrapCustomer = async (profile: AuthProfile) => {
    if (!supabaseEnabled) return;
    ensureSubscription(profile.id);
    fetchSubscription(profile.id).then(setSubscription);
    const details = await fetchProfileDetails(profile.id);
    setProfileDetails(details);
    if (details && !details.onboardingCompletedAt) {
      setProfileSetupOpen(true);
    }
  };

  useEffect(() => {
    getAuthProfile().then((profile) => {
      setAuthProfile(profile);
      if (profile) upsertProfile(profile).then(() => bootstrapCustomer(profile));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = listenToAuthChanges((profile, event) => {
      // Only update on events that actually change who's signed in. Supabase
      // also fires transient events (token refresh, etc.) - if one arrives
      // with a momentarily-empty session, blindly overwriting authProfile
      // with null silently "logs out" the UI for a render cycle, which broke
      // buttons that re-check auth at click time.
      if (event === 'SIGNED_OUT') {
        setAuthProfile(null);
        return;
      }
      if (profile) {
        setAuthProfile(profile);
      }
      if (event === 'SIGNED_IN' && profile) {
        setUiNotice('ההתחברות עם Google הצליחה. מסנכרנים שיעורים...');
        upsertProfile(profile).then(() => bootstrapCustomer(profile));
        mergeCloudOnLogin();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAuthenticated = Boolean(authProfile);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (event: MediaQueryListEvent) => {
      if (themeMode === 'system') setTheme(event.matches ? 'light' : 'dark');
    };
    setTheme(themeMode === 'system' ? (media.matches ? 'light' : 'dark') : themeMode);
    media.addEventListener?.('change', handler);
    return () => media.removeEventListener?.('change', handler);
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem('pilates-theme-mode', themeMode);
    } catch {
      // ignore storage issues for theme preference
    }
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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

  useEffect(() => {
    if (!uiNotice) return;
    const timer = window.setTimeout(() => setUiNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [uiNotice]);

  const goToProtected = (screen: 'builder' | 'lessons' | 'session') => {
    if (!isAuthenticated) {
      navigateTo(screen === 'session' ? 'builder' : screen, { lesson: null });
      setUiNotice('יש להתחבר עם Google כדי לפתוח את סביבת העבודה המלאה: builder, ספריית שיעורים, תבניות וסנכרון.');
      return;
    }
    navigateTo(screen);
  };

  // Called right after a Google sign-in. Pulls whatever is already saved in the
  // cloud for this account and merges it with whatever is currently in the
  // browser (e.g. lessons a guest built before logging in), so nothing is lost
  // in either direction. Cloud copies win on id collisions; local-only items are
  // kept. The merged result is written back to both localStorage and the cloud.
  const mergeCloudOnLogin = async () => {
    setCloudStatus('syncing');
    try {
      const pulled = await pullCloudLessons();
      const mergeById = (localItems: Lesson[], cloudItems: Lesson[]) => {
        const cloudIds = new Set(cloudItems.map((l) => l.id));
        const localOnly = localItems.filter((l) => !cloudIds.has(l.id));
        return [...cloudItems, ...localOnly];
      };

      setLessons((currentLessons) => {
        const merged = mergeById(currentLessons, pulled.lessons);
        writeLessons(merged);
        return merged;
      });
      setTemplates((currentTemplates) => {
        const merged = mergeById(currentTemplates, pulled.templates);
        writeTemplates(merged);
        return merged;
      });
      setCloudStatus('synced');
    } catch (e) {
      console.warn('Cloud merge on login failed', e);
      setCloudStatus('error');
      setUiNotice('הסנכרון עם הענן נכשל. השיעורים המקומיים עדיין שמורים אצלך.');
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (!result.ok) {
      setUiNotice(result.reason === 'disabled' ? 'Google דורש חיבור Supabase ו-Google OAuth. כרגע האתר במצב אורח מוגבל.' : `Google login failed: ${result.reason}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setAuthProfile(null);
    setCloudStatus('idle');
    setProfileDetails(null);
    setProfileSetupOpen(false);
    setSubscription(FREE_SUBSCRIPTION);
    navigateTo('home', { replace: true, lesson: null, editingLesson: null });
    setUiNotice('ההתנתקות הושלמה.');
  };

  // Save lessons to localStorage on updates
  const saveLessonsToStorage = (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
    try {
      writeLessons(updatedLessons);
    } catch (e) {
      console.warn('Failed to write to localStorage', e);
      setUiNotice('שמירת השיעור נכשלה במכשיר הזה (ייתכן שאין מספיק מקום אחסון). מומלץ לגבות לקובץ.');
    }
  };

  // Push to Supabase whenever the authenticated user's lessons/templates change.
  // Guarded by `hydrated` so this never fires with an empty array before the
  // initial localStorage read completes (that would wipe a real cloud backup).
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !supabaseEnabled) return;
    let cancelled = false;
    setCloudStatus('syncing');
    pushCloudLessons(lessons, templates).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setCloudStatus('synced');
      } else {
        setCloudStatus('error');
        if (result.reason !== 'disabled') {
          setUiNotice(`הגיבוי לענן נכשל: ${result.reason}. השיעור עדיין שמור במכשיר הזה.`);
        }
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, templates, hydrated, isAuthenticated]);

  const handleExportBundle = () => {
    exportLessonsBundle(lessons, templates);
    setUiNotice('קובץ הגיבוי הורד בהצלחה.');
  };

  const handleImportBundle = async (file: File) => {
    try {
      const imported = await importLessonsBundle(file);
      if (imported.lessons?.length) saveLessonsToStorage(imported.lessons);
      if (imported.templates?.length) {
        setTemplates(imported.templates);
        writeTemplates(imported.templates);
      }
      setUiNotice('הגיבוי יובא בהצלחה.');
    } catch {
      setUiNotice('קובץ הגיבוי לא תקין.');
    }
  };

  const handleCopyShareLink = async (lesson: Lesson) => {
    // Prefer a short server-stored link (works in WhatsApp, SMS, short-link
    // services). Only falls back to the old base64-in-URL link if Supabase
    // isn't configured or the save fails - that old link can be very long for
    // lessons with many exercises, but it's better than no link at all.
    const sharedId = await createSharedLesson(lesson);
    const url = sharedId ? buildShortShareUrl(sharedId) : buildShareUrl(lesson);

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
      setUiNotice(sharedId ? 'קישור השיתוף הועתק.' : 'קישור השיתוף הועתק (גרסה ארוכה - Cloud לא היה זמין).');
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
    saveLessonsToStorage(updated);
    setEditingLesson(null);
    
    // Transition to saved playlist screen with delay so user sees success toast
    setTimeout(() => {
      navigateTo('lessons');
    }, 1000);
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
    <div className="min-h-screen bg-background text-on-background flex flex-col relative overflow-clip selection:bg-secondary selection:text-on-secondary transition-colors duration-300">
      
      {/* Header Section */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/85 backdrop-blur-md border-b border-outline/20 px-4 sm:px-6 md:px-20 py-3 md:py-4 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <button
            onClick={() => navigateTo('home', { editingLesson: null })}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <LogoMark theme={theme} className="w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105" />
            <h2 className="serif-text text-base sm:text-xl font-bold tracking-wide text-[#c9a227] select-none">פילאטיס ותנועה</h2>
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
                  className="w-10 h-10 rounded-full border border-outline/30 bg-cover bg-center shadow-md cursor-pointer hover:border-secondary transition-all overflow-hidden bg-surface-container"
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

            <Button
              onClick={() => setThemeMode((current) => current === 'light' ? 'dark' : 'light')}
              variant="surface"
              size="icon"
              aria-label={theme === 'light' ? 'מעבר למצב כהה' : 'מעבר למצב בהיר'}
              title={theme === 'light' ? 'מעבר למצב כהה' : 'מעבר למצב בהיר'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation — replaces the burger drawer with an
          app-like, always-visible bar. Hidden on lg where the top nav exists. */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-t border-outline/20 pb-[env(safe-area-inset-bottom)]">
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
            fetchProfileDetails(authProfile.id).then(setProfileDetails);
          }}
        />
      )}

      {/* MAIN SCREEN ROUTING */}
      <main className="flex-grow pt-28 pb-28 lg:pb-16">
        {uiNotice && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20 mb-4">
            <div className="rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-on-surface flex items-center justify-between gap-3">
              <span>{uiNotice}</span>
              <button onClick={() => setUiNotice('')} className="text-secondary hover:text-on-surface">סגירה</button>
            </div>
          </div>
        )}
        
        {/* Screen: HOME / Landing page (Identical mock replica with interactive triggers) */}
        {activeScreen === 'home' && (
          <div className="space-y-0">
            
            {/* Hero Section */}
            <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-28">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-zoom"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXAl95YHGH-F5kaLMkqTA2daHzOPPxSWIjprKasVFV01N8WYnOJtlN-QYeor3aB_es0L7bnVl-wEs-KVDtdPVmeSB3r4LDir4QfKITEwX9HSWi098cE6tsYIpQP2F6y32FNOYKiFiJwCJaMCPmWIsTKSjQ_DwXlellyOgcMfD97uXssrdFghEIf_aFZHCatZIchk_QZUCsNDilfet9-rMsH0qR8dwja8ia5-yPU2WOvU1XhRhq1ddPovidpJtwvzUp7QQR6drYsEtjU')"
                }}
              />
              <div className="absolute inset-0 hero-overlay" />
              <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-secondary/15 rounded-full blur-[130px] pointer-events-none breathe" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-tertiary/20 rounded-full blur-[110px] pointer-events-none breathe-slow" />

              <div className="relative z-10 max-w-[1280px] mx-auto w-full px-6 md:px-20 pt-32 md:pt-36 pb-16 md:pb-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-10 items-center">
                <div className="max-w-[760px]">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-secondary/30 bg-surface-container/80 backdrop-blur-sm"
                  >
                    <span className="uppercase tracking-[0.3em] text-secondary text-xs md:text-sm font-semibold">
                      פילאטיס ותנועה
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="serif-text text-4xl md:text-7xl lg:text-8xl font-black text-on-surface leading-tight mb-6 md:mb-8"
                  >
                    שיעורי פילאטיס
                    <span className="brand-gradient block">מקצועיים תוך דקות</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="text-base md:text-2xl text-on-surface max-w-[700px] mb-5 md:mb-6 leading-relaxed"
                  >
                    כלי עבודה למדריכות ומדריכי פילאטיס: בניית שיעורים מהירה, מערכים מסודרים, והוראה עם יותר ביטחון ופחות בלגן.
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="text-sm md:text-lg text-on-surface-variant max-w-[680px] mb-8 md:mb-10 leading-relaxed"
                  >
                    מאגר של 255 תרגילים, builder חכם, ספריית שיעורים, שיתוף מהיר ומצב הדרכה חי — הכל במקום אחד.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={() => goToProtected('builder')}
                      className="min-w-[240px] w-full sm:w-auto group"
                    >
                      להתחיל לבנות שיעור
                      <ChevronLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigateTo('library')}
                      className="min-w-[220px] w-full sm:w-auto border-outline/40 text-on-surface hover:bg-surface-container-high hover:border-outline"
                    >
                      לצפייה במאגר התרגילים
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.62 }}
                    className="flex flex-wrap gap-6 text-sm text-on-surface"
                  >
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary" /> בניית שיעור לפי מטרה, רמה ומשך</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary" /> ספריית שיעורים פרטית</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary" /> שיתוף, הדפסה ו־teach mode</div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-4"
                >
                  <div className="rounded-3xl border border-outline/20 bg-surface-container/90 backdrop-blur-md p-6 md:p-7 shadow-2xl">
                    <div className="text-xs uppercase tracking-[0.25em] text-secondary mb-3">למה זה שווה את הזמן</div>
                    <h3 className="serif-text text-2xl text-on-surface font-bold mb-4">פחות זמן תכנון. יותר מקצועיות מול הלקוחות.</h3>
                    <div className="space-y-4 text-sm text-on-surface-variant">
                      <div className="flex items-start gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-secondary" /><p>שיעור חדש נבנה תוך דקות במקום להתחיל כל פעם מדף ריק.</p></div>
                      <div className="flex items-start gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-secondary" /><p>תבניות ומערכים נשמרים לשימוש חוזר לפי רמות, ציוד וקבוצות.</p></div>
                      <div className="flex items-start gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-secondary" /><p>מגיעים לשיעור עם flow ברור, דגשי הדרכה ושיתוף מיידי כשצריך.</p></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-outline/20 bg-surface-container-high p-5 lift">
                      <div className="text-3xl font-black text-secondary mb-2">3 דק'</div>
                      <div className="text-sm text-on-surface">לבניית שלד שיעור מקצועי</div>
                    </div>
                    <div className="rounded-2xl border border-outline/20 bg-surface-container-high p-5 lift">
                      <div className="text-3xl font-black text-secondary mb-2">1 מקום</div>
                      <div className="text-sm text-on-surface">לתרגילים, מערכים ושיתוף</div>
                    </div>
                    <div className="rounded-2xl border border-outline/20 bg-surface-container-high p-5 lift">
                      <div className="text-3xl font-black text-secondary mb-2">255</div>
                      <div className="text-sm text-on-surface">תרגילים מקצועיים במאגר</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                <div className="w-[1px] h-14 bg-gradient-to-b from-secondary/0 via-secondary to-secondary/0 animate-pulse" />
              </div>
            </section>

            {/* Features Module Section */}
            <section className="py-24 bg-surface px-6 md:px-20 relative">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
                <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary rounded-full blur-[150px]" />
              </div>

              <div className="max-w-[1280px] mx-auto">
                <Reveal>
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-[760px]">
                      <h2 className="serif-text text-4xl md:text-5xl font-bold text-on-surface mb-6">מה מקבלים כאן באמת</h2>
                      <p className="text-on-surface-variant text-lg leading-relaxed">
                        לא עוד קטלוג תרגילים. סביבת עבודה מלאה לבנייה, שמירה, התאמה והעברה של שיעורי פילאטיס ברמה מקצועית.
                      </p>
                    </div>
                    <div className="w-24 h-[2px] bg-secondary hidden md:block" />
                  </div>
                </Reveal>

                {/* Features Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* Feature 1: Exercise Database */}
                  <Reveal delay={0}>
                    <div
                      onClick={() => setActiveScreen('library')}
                      className="group h-full p-8 border border-outline/20 bg-surface-container-high hover:border-secondary/30 lift hover:shadow-xl relative overflow-hidden cursor-pointer rounded-3xl"
                    >
                      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <div className="mb-8 w-14 h-14 flex items-center justify-center rounded-2xl bg-background border border-outline/20 group-hover:border-secondary transition-colors text-secondary">
                        <BookOpen className="w-7 h-7" />
                      </div>

                      <h3 className="serif-text text-2xl font-bold text-on-surface mb-4">מאגר תרגילים</h3>
                      <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                        חיפוש מהיר בתרגילים לפי רמה, ציוד ומטרה - כדי להתחיל כל שיעור עם בסיס חכם ולא מאלתור.
                      </p>

                      <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                        לגלות את המאגר
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </Reveal>

                  {/* Feature 2: Lesson Builder */}
                  <Reveal delay={0.12}>
                    <div
                      onClick={() => goToProtected('builder')}
                      className="group h-full p-8 border border-outline/20 bg-surface-container-high hover:border-secondary/30 lift hover:shadow-xl relative overflow-hidden cursor-pointer rounded-3xl"
                    >
                      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <div className="mb-8 w-14 h-14 flex items-center justify-center rounded-2xl bg-background border border-outline/20 group-hover:border-secondary transition-colors text-secondary">
                        <Sliders className="w-7 h-7" />
                      </div>

                      <h3 className="serif-text text-2xl font-bold text-on-surface mb-4">בניית שיעור</h3>
                      <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                        תכנון שיעור זורם ומקצועי בדקות ספורות בעזרת ממשק בנייה חכם ואינטואיטיבי.
                      </p>

                      <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                        להתחיל לבנות
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </Reveal>

                  {/* Feature 3: My Lessons */}
                  <Reveal delay={0.24}>
                    <div
                      onClick={() => goToProtected('lessons')}
                      className="group h-full p-8 border border-outline/20 bg-surface-container-high hover:border-secondary/30 lift hover:shadow-xl relative overflow-hidden cursor-pointer rounded-3xl"
                    >
                      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <div className="mb-8 w-14 h-14 flex items-center justify-center rounded-2xl bg-background border border-outline/20 group-hover:border-secondary transition-colors text-secondary">
                        <FolderHeart className="w-7 h-7" />
                      </div>

                      <h3 className="serif-text text-2xl font-bold text-on-surface mb-4">השיעורים שלי</h3>
                      <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                        ספריית מערכים פרטית לשכפול, התאמה ושימוש חוזר - כדי שכל שיעור חדש יתחיל חצי מוכן.
                      </p>

                      <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                        לספרייה שלי
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </Reveal>

                </div>
              </div>
            </section>

            {/* Parallax Quote Split Image Section */}
            <div className="w-full h-[400px] relative overflow-hidden">
              {/* bg-fixed only from md up — mobile Safari/Chrome don't support
                  fixed backgrounds and render a broken, oversized image. */}
              <div
                className="absolute inset-0 md:bg-fixed bg-center bg-cover"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6dNJiCrMADWX-EfAYPTzxMFTn8lgZAVN0UeaBy-bUrJVTOMmZPsoKWeTbpi-QJ3Ymuy1QHeQROS-BWFhvdPYpLbkyJEl0JT_Ilko4409ILnfCigRAvtGjHTkXxad3bMOPfKs54I-Cmo33BT5CyG8XhFQVjOpjN3b3YZfoTp48Q0mM9QDAdPrROijdtYhN3aSYqaZLtWA1kUfa2WNGz9rgIQ1Lqhv5SWPposQIltcxriQ5V9eRslUAORKnRAfCpFzkEwLsonCTwK8')"
                }}
              />
              <div className="absolute inset-0 bg-background/60" />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <Reveal>
                  <h3 className="serif-text text-2xl md:text-5xl text-on-surface font-black text-center tracking-wide italic leading-normal max-w-4xl">
                    "כשמערך השיעור ברור, גם ההוראה נראית אחרת."
                  </h3>
                </Reveal>
              </div>
            </div>

            {/* Pricing / Subscription framing - hidden until payments are real (SHOW_PRICING) */}
            {SHOW_PRICING && (
            <section className="py-24 bg-surface px-6 md:px-20">
              <div className="max-w-[1280px] mx-auto">
                <div className="max-w-[760px] mb-14">
                  <h2 className="serif-text text-4xl md:text-5xl font-bold text-on-surface mb-6">מודל מנוי שמתאים למדריכות ומדריכי פילאטיס</h2>
                  <p className="text-on-surface-variant text-lg leading-relaxed">
                    המוצר הזה בנוי להיות כלי עבודה קבוע, לא שימוש חד-פעמי. לכן המסגור הנכון הוא מנוי חודשי שמחזיר את עצמו בזמן תכנון, סדר מקצועי ושימוש חוזר חכם במערכים.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  <div className="rounded-3xl border border-outline/30 bg-surface-container p-8">
                    <div className="text-xs tracking-[0.2em] text-on-surface-variant mb-3">מסלול התחלה</div>
                    <div className="text-on-surface text-3xl font-black mb-2">₪79<span className="text-sm font-medium text-on-surface-variant"> / חודש</span></div>
                    <p className="text-sm text-on-surface-variant mb-6">למי שעובד באופן עצמאי ורוצה builder, ספריית שיעורים ותבניות.</p>
                    <div className="space-y-3 text-sm text-on-surface-variant mb-8">
                      <div>• בניית שיעורים ללא הגבלה</div>
                      <div>• שמירת מערכים ותבניות</div>
                      <div>• שיתוף, PDF ו־teach mode</div>
                    </div>
                    <Button size="md" variant="outline" onClick={() => goToProtected('builder')} className="w-full">מתאים להתחלה</Button>
                  </div>

                  <div className="rounded-3xl border border-secondary/30 bg-secondary/10 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-4 left-4 rounded-full bg-secondary text-on-secondary text-[11px] font-bold px-3 py-1">מומלץ</div>
                    <div className="text-xs tracking-[0.2em] text-secondary mb-3">מסלול מקצועי</div>
                    <div className="text-on-surface text-4xl font-black mb-2">₪149<span className="text-sm font-medium text-on-surface-variant"> / חודש</span></div>
                    <p className="text-sm text-on-surface-variant mb-6">למי שמלמד באופן קבוע ורוצה שהמערכת תהיה סביבת העבודה המרכזית.</p>
                    <div className="space-y-3 text-sm text-on-surface-variant mb-8">
                      <div>• כל מה שבמסלול ההתחלה</div>
                      <div>• סנכרון מלא לענן</div>
                      <div>• ייצוא ממותג ושיתופים מתקדמים</div>
                      <div>• חבילות תבניות וזרימות פרימיום</div>
                    </div>
                    <Button size="md" variant="primary" onClick={() => goToProtected('builder')} className="w-full">זה המסלול המומלץ</Button>
                  </div>

                  <div className="rounded-3xl border border-outline/30 bg-surface-container p-8">
                    <div className="text-xs tracking-[0.2em] text-on-surface-variant mb-3">לסטודיו</div>
                    <div className="text-on-surface text-3xl font-black mb-2">מותאם אישית</div>
                    <p className="text-sm text-on-surface-variant mb-6">לסטודיו עם כמה מדריכות ומדריכים, ספריית תוכן משותפת ו־workflow צוותי.</p>
                    <div className="space-y-3 text-sm text-on-surface-variant mb-8">
                      <div>• ריבוי משתמשים</div>
                      <div>• ספריית סטודיו משותפת</div>
                      <div>• onboarding והטמעה</div>
                    </div>
                    <Button size="md" variant="outline" onClick={() => setUiNotice('מסלול סטודיו עדיין לא מחובר לטופס מכירה. אפשר להתחיל כרגע עם המסלול המקצועי.')} className="w-full">לבדיקת התאמה</Button>
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Final Call to Action with Live Counter Stats */}
            <section className="py-24 relative overflow-hidden bg-background">
              <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-[130px] pointer-events-none breathe" />
              <div className="max-w-[800px] mx-auto px-6 text-center relative">
                <Reveal>
                  <h2 className="serif-text text-4xl md:text-6xl font-bold text-on-surface mb-6">מוכנים לבנות את השיעור הבא?</h2>
                  <p className="text-on-surface-variant text-lg md:text-xl mb-12 font-light">
                    מתחילים מהמאגר הפתוח, מרכיבים מערך אישי ב-builder, ומלמדים אותו במצב הדרכה חי — הכל במקום אחד.
                  </p>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14">
                    <div className="flex flex-col items-center">
                      <span className="text-secondary text-5xl font-black mb-2">חיסכון</span>
                      <span className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">בזמן תכנון</span>
                    </div>

                    <div className="w-[1px] h-12 bg-outline/30 hidden md:block" />

                    <div className="flex flex-col items-center">
                      <span className="text-secondary text-5xl font-black mb-2">סדר</span>
                      <span className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">במערכים ובתבניות</span>
                    </div>

                    <div className="w-[1px] h-12 bg-outline/30 hidden md:block" />

                    <Button
                      size="lg"
                      variant="primary"
                      onClick={() => goToProtected('builder')}
                    >
                      להתחיל לבנות
                    </Button>
                  </div>
                </Reveal>
              </div>
            </section>

          </div>
        )}

        <Suspense
        fallback={
          <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-24">
            <div className="rounded-3xl border border-outline/30 bg-surface-container p-8 text-center text-on-surface-variant">
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
            {isAuthenticated || editingLesson?.id.startsWith('shared_') ? (
              <LessonBuilder 
                onSaveLesson={handleSaveLesson}
                existingLessonToEdit={editingLesson}
              />
            ) : (
              <LockedWorkspace onGoogleLogin={handleGoogleLogin} />
            )}
          </div>
        )}

        {/* Screen: MY SAVED WORKOUTS */}
        {activeScreen === 'lessons' && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            {isAuthenticated ? (
              <MyLessons 
                lessons={lessons}
                templates={templates}
                onStartLesson={handleStartLesson}
                onEditLesson={handleEditLesson}
                onDeleteLesson={handleDeleteLesson}
                onCreateNewLesson={() => { setEditingLesson(null); goToProtected('builder'); }}
                onCopyShareLink={handleCopyShareLink}
                onBackHome={() => navigateTo('home')}
                onExportBundle={handleExportBundle}
                onImportBundle={handleImportBundle}
                cloudStatus={supabaseEnabled ? cloudStatus : null}
              />
            ) : (
              <LockedWorkspace onGoogleLogin={handleGoogleLogin} />
            )}
          </div>
        )}

        {/* Screen: REALTIME ACTIVE COACHING SESSION */}
        {activeScreen === 'session' && activeSessionLesson && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <CoachingSession 
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
      <footer className="pt-10 pb-28 lg:py-10 bg-surface-container-lowest border-t border-outline/20 px-6 md:px-20 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

          <div
            onClick={() => { navigateTo('home'); }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <LogoMark theme={theme} className="w-8 h-8" />
            <span className="serif-text font-bold tracking-widest text-[#c9a227] text-sm">פילאטיס ותנועה</span>
          </div>

          <p className="text-on-surface-variant text-sm text-center">
            © 2026 פילאטיס ותנועה. מרחב העבודה של מדריכות ומדריכי פילאטיס.
          </p>

          <div className="flex items-center gap-5 text-sm">
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
              מאגר התרגילים פתוח לצפייה חופשית. ה-builder, ספריית השיעורים, התבניות והסנכרון לענן נפתחים אחרי התחברות — למי שמנהל כאן את סביבת העבודה.
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
            <div className="rounded-2xl border border-outline/30 bg-surface-container p-4">
              <div className="text-on-surface font-bold mb-2">בניית שיעור חכמה</div>
              <div className="text-sm text-on-surface-variant">בניית שיעורים לפי מטרה, רמה, משך וציוד.</div>
            </div>
            <div className="rounded-2xl border border-outline/30 bg-surface-container p-4">
              <div className="text-on-surface font-bold mb-2">תבניות</div>
              <div className="text-sm text-on-surface-variant">שכפול והתאמה של מערכים בלי להתחיל כל פעם מאפס.</div>
            </div>
            <div className="rounded-2xl border border-outline/30 bg-surface-container p-4">
              <div className="text-on-surface font-bold mb-2">סנכרון לענן</div>
              <div className="text-sm text-on-surface-variant">ספריית שיעורים מסונכרנת ונגישה מכל מכשיר.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
