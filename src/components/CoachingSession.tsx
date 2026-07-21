import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle, Volume2, VolumeX, X, HelpCircle, Activity, Award, Clock3, Layers3, Sparkles, ArrowRight } from 'lucide-react';
import { Lesson, LessonExercise } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Button from './ui/Button';

interface CoachingSessionProps {
  lesson: Lesson;
  onFinishSession: () => void;
}

export default function CoachingSession({ lesson, onFinishSession }: CoachingSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number | null>(null);
  
  const currentLessonExercise = lesson.exercises[currentIndex];
  const nextLessonExercise = currentIndex < lesson.exercises.length - 1 ? lesson.exercises[currentIndex + 1] : null;

  // Reset the clock for the current exercise. Deliberately does NOT touch
  // isPlaying: a running session flows straight into the next exercise, and a
  // paused one stays paused.
  useEffect(() => {
    if (currentLessonExercise) {
      setTimeLeft(currentLessonExercise.customDuration * 60);
    }
  }, [currentIndex, currentLessonExercise]);

  // Main countdown logic.
  // Anchored to an absolute deadline rather than chaining setTimeout(1000):
  // chained timeouts accumulate drift and are throttled hard when the tab is
  // backgrounded, so a 5-minute exercise could run noticeably long.
  useEffect(() => {
    if (!isPlaying) {
      deadlineRef.current = null;
      return;
    }

    const secondsRemaining = timeLeft > 0 ? timeLeft : (currentLessonExercise?.customDuration ?? 0) * 60;
    deadlineRef.current = Date.now() + secondsRemaining * 1000;

    const tick = () => {
      if (deadlineRef.current === null) return;
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        playBeep();
        if (currentIndex < lesson.exercises.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setShowSummary(true);
        }
      }
    };

    timerRef.current = setInterval(tick, 250);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // timeLeft is read to seed the deadline, but must not re-trigger the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex]);

  // Play browser beep using Web Audio API
  const playBeep = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 300);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (currentLessonExercise) {
      setTimeLeft(currentLessonExercise.customDuration * 60);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < lesson.exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setShowSummary(true);
    }
  };

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Manual "next" press on the final exercise ends the whole session, so ask
  // first — an accidental tap otherwise drops the instructor into the summary
  // mid-class with no way back.
  const handleNextPressed = () => {
    const isLast = currentIndex === lesson.exercises.length - 1;
    if (isLast) {
      setShowFinishConfirm(true);
      return;
    }
    handleNext();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Convert seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Keep the screen awake while teaching — a phone that dims and locks
  // mid-class is the single biggest usability failure of a coaching timer.
  // Re-acquired on tab return since the browser releases the lock on hide.
  const [wakeLockActive, setWakeLockActive] = useState(false);
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    let disposed = false;

    const acquire = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<any> } };
        if (!nav.wakeLock) return;
        lock = await nav.wakeLock.request('screen');
        if (disposed) { lock?.release(); return; }
        setWakeLockActive(true);
        (lock as any).addEventListener?.('release', () => setWakeLockActive(false));
      } catch {
        setWakeLockActive(false);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      lock?.release().catch(() => {});
    };
  }, []);

  // Progress calculations — overall progress is time-based (elapsed minutes of
  // the whole lesson), not exercise-count-based, so a long exercise doesn't
  // make the bar look stuck.
  const totalDurationSeconds = lesson.exercises.reduce((acc, curr) => acc + curr.customDuration * 60, 0);
  const elapsedBeforeCurrent = lesson.exercises.slice(0, currentIndex).reduce((acc, curr) => acc + curr.customDuration * 60, 0);
  const elapsedInCurrent = currentLessonExercise ? currentLessonExercise.customDuration * 60 - timeLeft : 0;
  const totalElapsedSeconds = elapsedBeforeCurrent + Math.max(0, elapsedInCurrent);
  const totalRemainingMinutes = Math.max(0, Math.ceil((totalDurationSeconds - totalElapsedSeconds) / 60));
  const currentProgressPercent = totalDurationSeconds > 0 ? (totalElapsedSeconds / totalDurationSeconds) * 100 : 0;
  const currentTimeProgressPercent = currentLessonExercise
    ? ((currentLessonExercise.customDuration * 60 - timeLeft) / (currentLessonExercise.customDuration * 60)) * 100
    : 0;

  // Equipment transition warning: give the coach a heads-up when the next
  // exercise moves to a different apparatus, so the changeover is prepared
  // before the timer runs out.
  const apparatusChange = nextLessonExercise &&
    nextLessonExercise.exercise.apparatus !== currentLessonExercise?.exercise.apparatus
      ? nextLessonExercise.exercise.apparatusLabel
      : null;

  if (showSummary) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface-container-high border border-secondary/30 p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="w-20 h-20 bg-secondary/10 border border-secondary/50 rounded-full flex items-center justify-center mx-auto text-secondary">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs tracking-wider font-semibold">
              שיעור הושלם
            </div>
            <h2 className="serif-text text-3xl font-bold text-on-surface">השיעור הושלם!</h2>
            <p className="text-on-surface-variant text-sm">
              כל הכבוד! העברת בהצלחה את השיעור <strong>{lesson.name}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-outline/20 py-6">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">סך הכל זמן</p>
              <p className="text-2xl font-mono text-on-surface font-bold">{lesson.totalDuration} דק׳</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">תרגילים שבוצעו</p>
              <p className="text-2xl font-mono text-on-surface font-bold">{lesson.exercises.length}</p>
            </div>
          </div>

          <Button onClick={onFinishSession} variant="primary" size="lg" fullWidth>
            חזרה לרשימת השיעורים
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 md:py-8 px-4 md:px-6">
      {/* Compact sticky session bar: name, live overall progress, sound. The
          coach glances here mid-class, so it stays visible while scrolling. */}
      <div className="sticky top-[64px] md:top-[72px] z-30 mb-6 rounded-2xl border border-outline/30 bg-background/90 backdrop-blur-md px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onFinishSession}
              className="shrink-0 inline-flex items-center gap-1 text-xs text-secondary hover:text-on-surface transition-colors"
              title="חזרה לשיעורים"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h3 className="serif-text font-bold text-on-surface text-sm leading-tight truncate">{lesson.name}</h3>
              <div className="text-[11px] text-on-surface-variant">
                תרגיל {currentIndex + 1}/{lesson.exercises.length} · נותרו ~{totalRemainingMinutes} דק׳
                {wakeLockActive && <span className="mr-1.5 text-secondary">· המסך נשאר דולק</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              isSoundEnabled
                ? 'border-secondary/40 bg-secondary/10 text-secondary'
                : 'border-outline/30 text-on-surface-variant'
            }`}
            title={isSoundEnabled ? 'כיבוי צליל המעבר בין תרגילים' : 'הפעלת צליל המעבר בין תרגילים'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            צליל מעבר {isSoundEnabled ? 'פועל' : 'כבוי'}
          </button>
        </div>

        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-secondary h-full transition-all duration-500 ease-out"
            style={{ width: `${currentProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Coach note — the instructor's own emphasis for this lesson, pinned
          above everything so it isn't forgotten mid-class. */}
      {currentLessonExercise.notes && (
        <div className="mb-5 rounded-2xl bg-secondary/10 border-r-4 border-secondary px-4 py-3">
          <span className="text-[10px] font-bold text-secondary uppercase block mb-0.5">הדגש שלך לשיעור הזה</span>
          <p className="text-base md:text-lg text-on-surface font-semibold leading-snug">"{currentLessonExercise.notes}"</p>
        </div>
      )}

      {/* Main Grid: timer panel + teaching panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

        {/* Timer & controls */}
        <div className="lg:col-span-5 rounded-3xl bg-surface-container-high border border-outline/20 p-6 md:p-8 text-center flex flex-col items-center relative overflow-hidden lg:sticky lg:top-[150px]">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/20 to-secondary/0"></div>

          <span className="text-xs uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-3 py-1 mb-4 rounded-full">
            {currentLessonExercise.exercise.apparatusLabel}
          </span>

          <h2 className="serif-text text-2xl md:text-3xl font-black text-on-surface mb-1">
            {currentLessonExercise.exercise.name}
          </h2>
          <p className="text-xs font-mono text-on-surface-variant mb-6">{currentLessonExercise.exercise.englishName}</p>

          {/* Interactive Circle Timer */}
          <div className="w-44 h-44 md:w-48 md:h-48 rounded-full border-2 border-outline/20 flex flex-col items-center justify-center relative mb-6">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 192 192">
              <circle
                cx="96"
                cy="96"
                r="92"
                stroke="rgba(127, 146, 113, 0.2)"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="92"
                stroke="#7f9271"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="578"
                strokeDashoffset={578 - (578 * (100 - currentTimeProgressPercent)) / 100}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            <span className="text-5xl font-mono font-bold text-on-surface mb-1 tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">מתוך {currentLessonExercise.customDuration} דק׳</span>
          </div>

          {/* Breathing cue lives next to the timer — it's a pacing tool. */}
          <div className="mb-6 rounded-2xl border border-outline/20 bg-surface-container px-4 py-2.5 max-w-xs">
            <span className="text-[10px] text-secondary font-bold uppercase block mb-0.5">נשימה וקצב</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">{currentLessonExercise.exercise.breathing}</p>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 md:gap-6 mb-4">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="surface"
              size="icon"
              title="לתרגיל הקודם"
              aria-label="לתרגיל הקודם"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleTogglePlay}
              variant="primary"
              className="w-16 h-16 rounded-full p-0 shadow-lg group"
              aria-label={isPlaying ? 'השהה' : 'נגן'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-background" />
              ) : (
                <Play className="w-6 h-6 fill-background translate-x-[-1px]" />
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="surface"
              size="icon"
              title="איפוס זמן תרגיל"
              aria-label="איפוס זמן תרגיל"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleNextPressed}
              variant="surface"
              size="icon"
              title="לתרגיל הבא"
              aria-label="לתרגיל הבא"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Teaching panel: steps front and center, then prep-ahead info */}
        <div className="lg:col-span-7 space-y-5">
          {/* Execution steps — the core teaching content, sized to be readable
              at a glance from a distance. */}
          <div className="bg-surface-container-high border border-outline/20 p-5 md:p-6 rounded-3xl">
            <h3 className="serif-text text-lg md:text-xl font-bold text-on-surface mb-4 border-b border-outline/20 pb-3">
              שלבי ביצוע והנחיה
            </h3>

            <ol className="space-y-4 mb-5">
              {currentLessonExercise.exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-base md:text-lg text-on-surface leading-relaxed">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm flex items-center justify-center font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="pt-4 border-t border-outline/20">
              <span className="text-xs text-secondary font-bold uppercase block mb-1.5">שרירי מטרה</span>
              <div className="flex flex-wrap gap-1.5">
                {currentLessonExercise.exercise.targetMuscles.map((muscle, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Up next: enough detail to prepare the transition, not just a name */}
          {nextLessonExercise ? (
            <div className="rounded-3xl border border-outline/20 bg-surface-container p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase text-secondary tracking-widest">הבא בתור</span>
                <span className="text-xs text-on-surface-variant bg-surface-container-high rounded-full px-2.5 py-1">
                  {nextLessonExercise.customDuration} דק׳
                </span>
              </div>
              <div className="text-on-surface font-bold text-base mb-1">{nextLessonExercise.exercise.name}</div>
              <div className="text-xs text-on-surface-variant mb-3">{nextLessonExercise.exercise.englishName} · {nextLessonExercise.exercise.apparatusLabel}</div>

              {apparatusChange && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-on-surface flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  מעבר ציוד בתרגיל הבא: {apparatusChange} — כדאי להכין מראש
                </div>
              )}

              {nextLessonExercise.notes && (
                <div className="mt-2 text-xs text-on-surface-variant">
                  דגש מתוכנן: {nextLessonExercise.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-secondary/20 bg-secondary/5 p-5 text-sm text-on-surface-variant">
              זהו התרגיל האחרון בשיעור — בסיום, מעבר טבעי לשחרור ולסיכום.
            </div>
          )}
        </div>

      </div>

      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl border border-secondary/20 bg-surface-container-high p-6 shadow-2xl">
            <div className="text-xs tracking-[0.2em] text-secondary font-bold mb-3">סיום שיעור</div>
            <h3 className="serif-text text-2xl text-on-surface font-bold mb-3">לסיים את השיעור ולעבור לסיכום?</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              זהו התרגיל האחרון. המשך מכאן מוביל למסך הסיכום של השיעור.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="surface" size="md" onClick={() => setShowFinishConfirm(false)}>
                חזרה לשיעור
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setShowFinishConfirm(false);
                  handleNext();
                }}
              >
                סיום שיעור
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
