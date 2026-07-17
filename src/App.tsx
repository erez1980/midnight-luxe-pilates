import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Award, 
  FolderHeart, 
  BookOpen, 
  Compass, 
  ChevronRight, 
  CheckCircle,
  Menu,
  X,
  User,
  LogIn,
  Activity,
  Heart,
  Share2,
  Mail,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { Lesson } from './types';
import { INITIAL_LESSONS } from './data';
import ExerciseLibrary from './components/ExerciseLibrary';
import LessonBuilder from './components/LessonBuilder';
import MyLessons from './components/MyLessons';
import CoachingSession from './components/CoachingSession';
import { buildShareUrl, exportLessonsBundle, importLessonsBundle, readLessons, readSharedLessonFromUrl, readTemplates, writeLessons, writeTemplates } from './utils/storage';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'library' | 'builder' | 'lessons' | 'session'>('home');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeSessionLesson, setActiveSessionLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [templates, setTemplates] = useState<Lesson[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load lessons from localStorage on mount, fall back to initial ones
  useEffect(() => {
    try {
      const storedLessons = readLessons();
      setLessons(storedLessons.length ? storedLessons : INITIAL_LESSONS);
      if (!storedLessons.length) writeLessons(INITIAL_LESSONS);
      setTemplates(readTemplates());

      const sharedLesson = readSharedLessonFromUrl();
      if (sharedLesson) {
        setEditingLesson({ ...sharedLesson, id: `shared_${Date.now()}` });
        setActiveScreen('builder');
      }
    } catch (e) {
      console.warn('Failed to read from localStorage', e);
      setLessons(INITIAL_LESSONS);
    }
  }, []);

  // Save lessons to localStorage on updates
  const saveLessonsToStorage = (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
    try {
      writeLessons(updatedLessons);
    } catch (e) {
      console.warn('Failed to write to localStorage', e);
    }
  };

  const handleSaveTemplate = (lesson: Lesson) => {
    const updated = [lesson, ...templates.filter((item) => item.id !== lesson.id)];
    setTemplates(updated);
    writeTemplates(updated);
  };

  const handleExportBundle = () => {
    exportLessonsBundle(lessons, templates);
  };

  const handleImportBundle = async (file: File) => {
    try {
      const imported = await importLessonsBundle(file);
      if (imported.lessons?.length) saveLessonsToStorage(imported.lessons);
      if (imported.templates?.length) {
        setTemplates(imported.templates);
        writeTemplates(imported.templates);
      }
      alert('הגיבוי יובא בהצלחה.');
    } catch {
      alert('קובץ הגיבוי לא תקין.');
    }
  };

  const handleCopyShareLink = async (lesson: Lesson) => {
    const url = buildShareUrl(lesson);
    try {
      await navigator.clipboard.writeText(url);
      alert('קישור השיתוף הועתק.');
    } catch {
      window.prompt('העתק את הקישור:', url);
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
      setActiveScreen('lessons');
    }, 1000);
  };

  // Delete Lesson handler
  const handleDeleteLesson = (id: string) => {
    if (window.confirm('האם את בטוחה שברצונך למחוק מערך שיעור זה?')) {
      const updated = lessons.filter(l => l.id !== id);
      saveLessonsToStorage(updated);
    }
  };

  // Edit Lesson click handler
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setActiveScreen('builder');
  };

  // Launch Coaching Mode
  const handleStartLesson = (lesson: Lesson) => {
    setActiveSessionLesson(lesson);
    setActiveScreen('session');
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col relative overflow-x-hidden selection:bg-secondary selection:text-background">
      
      {/* Header Section */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/85 backdrop-blur-md border-b border-white/5 px-6 md:px-20 py-4 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => { setActiveScreen('home'); setEditingLesson(null); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-secondary/50 group-hover:border-secondary transition-all">
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 48 48">
                <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="serif-text text-xl font-bold tracking-wide gold-gradient select-none">Midnight Luxe Pilates</h2>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            <button
              onClick={() => { setActiveScreen('library'); setEditingLesson(null); }}
              className={`hover:text-secondary transition-all text-sm font-medium tracking-wide relative py-1 cursor-pointer ${
                activeScreen === 'library' ? 'text-secondary font-bold border-b border-secondary' : 'text-on-surface'
              }`}
            >
              מאגר תרגילים
            </button>
            <button
              onClick={() => { setActiveScreen('builder'); setEditingLesson(null); }}
              className={`hover:text-secondary transition-all text-sm font-medium tracking-wide relative py-1 cursor-pointer ${
                activeScreen === 'builder' ? 'text-secondary font-bold border-b border-secondary' : 'text-on-surface'
              }`}
            >
              בניית שיעור
            </button>
            <button
              onClick={() => { setActiveScreen('lessons'); setEditingLesson(null); }}
              className={`hover:text-secondary transition-all text-sm font-medium tracking-wide relative py-1 cursor-pointer ${
                activeScreen === 'lessons' ? 'text-secondary font-bold border-b border-secondary' : 'text-on-surface'
              }`}
            >
              השיעורים שלי
            </button>
          </nav>

          {/* User & Action area */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => alert('ממשק חיבור מחובר ומאובטח בהצלחה למדריכות פילאטיס.')}
              className="hidden sm:block px-6 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-background transition-all text-sm font-bold tracking-widest uppercase cursor-pointer"
            >
              התחברות
            </button>

            {/* User Instructor Portrait */}
            <div 
              className="w-10 h-10 rounded-full border border-white/20 bg-cover bg-center shadow-md cursor-pointer hover:border-secondary transition-all"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC9lUNx88cxMF1EAlQTAOtU6DQy5ks89h_QHNimKwk9fbKU0VYNY4z6vRsV12GAh_pMvbCGop-thsLnY7MLPToaG9_gXglIElkK9wW4aTLozxyO_N6-U5R7v54kRPcSqIAUjET7Pab1LMVbBVEGW5cwk7Z_YAPu_tlOLmE8yHGGa01h8uj4DgXmeo3FFlrhDMN2ZbBpcbjKVW33nFwAdP6-UMCu7vsuFOtTQiqUolP4ETzIWya9E3mhVM8YGJ68mEHoLw716rldKsM')" }}
              onClick={() => alert('שלום מדריכת Midnight Luxe! את מחוברת למרחב הניהול שלך.')}
            />

            {/* Mobile burger toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-on-surface-variant hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[72px] z-40 bg-background border-b border-white/10 p-6 flex flex-col gap-4 lg:hidden shadow-2xl"
          >
            <button
              onClick={() => { setActiveScreen('library'); setEditingLesson(null); setIsMobileMenuOpen(false); }}
              className={`text-right py-2 text-base font-semibold border-b border-white/5 ${activeScreen === 'library' ? 'text-secondary' : 'text-white'}`}
            >
              מאגר תרגילים
            </button>
            <button
              onClick={() => { setActiveScreen('builder'); setEditingLesson(null); setIsMobileMenuOpen(false); }}
              className={`text-right py-2 text-base font-semibold border-b border-white/5 ${activeScreen === 'builder' ? 'text-secondary' : 'text-white'}`}
            >
              בנייית שיעור
            </button>
            <button
              onClick={() => { setActiveScreen('lessons'); setEditingLesson(null); setIsMobileMenuOpen(false); }}
              className={`text-right py-2 text-base font-semibold border-b border-white/5 ${activeScreen === 'lessons' ? 'text-secondary' : 'text-white'}`}
            >
              השיעורים שלי
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); alert('ממשק התחברות מדריכות מובנה.'); }}
              className="mt-2 w-full text-center py-3 border border-secondary text-secondary font-bold text-sm tracking-widest uppercase"
            >
              התחברות
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN SCREEN ROUTING */}
      <main className="flex-grow pt-28 pb-16">
        
        {/* Screen: HOME / Landing page (Identical mock replica with interactive triggers) */}
        {activeScreen === 'home' && (
          <div className="space-y-0">
            
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden -mt-28">
              {/* Background image underlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{ 
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXAl95YHGH-F5kaLMkqTA2daHzOPPxSWIjprKasVFV01N8WYnOJtlN-QYeor3aB_es0L7bnVl-wEs-KVDtdPVmeSB3r4LDir4QfKITEwX9HSWi098cE6tsYIpQP2F6y32FNOYKiFiJwCJaMCPmWIsTKSjQ_DwXlellyOgcMfD97uXssrdFghEIf_aFZHCatZIchk_QZUCsNDilfet9-rMsH0qR8dwja8ia5-yPU2WOvU1XhRhq1ddPovidpJtwvzUp7QQR6drYsEtjU')" 
                }}
              />
              <div className="absolute inset-0 hero-overlay" />
              
              {/* Floating aesthetic lights */}
              <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10 w-full max-w-[1000px] px-6 text-center py-20 mt-16">
                <div className="inline-block mb-6 px-4 py-1 border-l border-r border-secondary/40">
                  <span className="uppercase tracking-[0.3em] text-secondary text-xs md:text-sm font-semibold">
                    מרחב עבודה למדריכת פילאטיס
                  </span>
                </div>
                
                <h1 className="serif-text text-4xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8">
                  כל התרגילים.<br/>
                  <span className="gold-gradient">שיעור אחד בנוי,</span><br/>
                  בקצב הנשימה שלך.
                </h1>
                
                <p className="text-lg md:text-xl text-on-surface-variant font-light max-w-[700px] mx-auto mb-10 leading-relaxed">
                  מאגר תרגילים עם וידאו הדגמה, ובנייה של שיעור מלא - בלי טופס אקסל, בלי בלגן.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button 
                    onClick={() => setActiveScreen('builder')}
                    className="min-w-[200px] h-14 bg-secondary text-background hover:bg-white transition-all font-bold tracking-widest uppercase flex items-center justify-center gap-2 group cursor-pointer shadow-lg"
                  >
                    התחילי עכשיו
                    <ChevronLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                  </button>
                  <button 
                    onClick={() => setActiveScreen('library')}
                    className="min-w-[200px] h-14 border border-white/30 text-white hover:bg-white/10 transition-all font-bold tracking-widest uppercase cursor-pointer"
                  >
                    לצפייה במאגר
                  </button>
                </div>
              </div>

              {/* Decorative Scroll indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                <div className="w-[1px] h-14 bg-gradient-to-b from-secondary/0 via-secondary to-secondary/0 animate-pulse" />
              </div>
            </section>

            {/* Features Module Section */}
            <section className="py-24 bg-surface px-6 md:px-20 relative">
              {/* Backdrop glow */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
                <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary rounded-full blur-[150px]" />
              </div>

              <div className="max-w-[1280px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                  <div className="max-w-[600px]">
                    <h2 className="serif-text text-4xl md:text-5xl font-bold text-white mb-6">הכלים שלך להצלחה</h2>
                    <p className="text-on-surface-variant text-lg leading-relaxed">
                      כל מה שאת צריכה לניהול השיעורים במקום אחד, בממשק יוקרתי שנועד לפנות לך זמן לדברים החשובים באמת.
                    </p>
                  </div>
                  <div className="w-24 h-[2px] bg-secondary hidden md:block" />
                </div>

                {/* Features Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Feature 1: Exercise Database */}
                  <div 
                    onClick={() => setActiveScreen('library')}
                    className="group p-8 border border-white/5 bg-surface-container-high hover:border-secondary/30 transition-all duration-500 relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="mb-8 w-14 h-14 flex items-center justify-center bg-background border border-white/10 group-hover:border-secondary transition-colors text-secondary">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    
                    <h3 className="serif-text text-2xl font-bold text-white mb-4">מאגר תרגילים</h3>
                    <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                      גישה מהירה למאות תרגילי פילאטיס מצולמים באיכות גבוהה, מסודרים לפי רמות ועזרים.
                    </p>
                    
                    <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                      גלי עכשיו
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Feature 2: Lesson Builder */}
                  <div 
                    onClick={() => setActiveScreen('builder')}
                    className="group p-8 border border-white/5 bg-surface-container-high hover:border-secondary/30 transition-all duration-500 relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="mb-8 w-14 h-14 flex items-center justify-center bg-background border border-white/10 group-hover:border-secondary transition-colors text-secondary">
                      <Sliders className="w-7 h-7" />
                    </div>
                    
                    <h3 className="serif-text text-2xl font-bold text-white mb-4">בנייית שיעור</h3>
                    <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                      תכנון שיעור זורם ומקצועי בדקות ספורות בעזרת ממשק Drag &amp; Drop חכם ואינטואיטיבי.
                    </p>
                    
                    <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                      התחילי לבנות
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Feature 3: My Lessons */}
                  <div 
                    onClick={() => setActiveScreen('lessons')}
                    className="group p-8 border border-white/5 bg-surface-container-high hover:border-secondary/30 transition-all duration-500 relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="mb-8 w-14 h-14 flex items-center justify-center bg-background border border-white/10 group-hover:border-secondary transition-colors text-secondary">
                      <FolderHeart className="w-7 h-7" />
                    </div>
                    
                    <h3 className="serif-text text-2xl font-bold text-white mb-4">השיעורים שלי</h3>
                    <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                      ניהול וצפייה בכל מערכי השיעור ששמרת. הספרייה האישית שלך, תמיד זמינה מכל מכשיר.
                    </p>
                    
                    <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                      לספרייה שלי
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>

                </div>
              </div>
            </section>

            {/* Parallax Quote Split Image Section */}
            <div className="w-full h-[400px] relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-fixed bg-center bg-cover"
                style={{ 
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6dNJiCrMADWX-EfAYPTzxMFTn8lgZAVN0UeaBy-bUrJVTOMmZPsoKWeTbpi-QJ3Ymuy1QHeQROS-BWFhvdPYpLbkyJEl0JT_Ilko4409ILnfCigRAvtGjHTkXxad3bMOPfKs54I-Cmo33BT5CyG8XhFQVjOpjN3b3YZfoTp48Q0mM9QDAdPrROijdtYhN3aSYqaZLtWA1kUfa2WNGz9rgIQ1Lqhv5SWPposQIltcxriQ5V9eRslUAORKnRAfCpFzkEwLsonCTwK8')" 
                }}
              />
              <div className="absolute inset-0 bg-background/60" />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <h3 className="serif-text text-2xl md:text-5xl text-white font-black text-center tracking-wide italic leading-normal max-w-4xl">
                  "פילאטיס זה לא רק אימון, זו אמנות של תנועה."
                </h3>
              </div>
            </div>

            {/* Final Call to Action with Live Counter Stats */}
            <section className="py-24 relative overflow-hidden bg-background">
              <div className="max-w-[800px] mx-auto px-6 text-center">
                <h2 className="serif-text text-4xl md:text-6xl font-bold text-white mb-6">מוכנה לשדרג את השיעור הבא?</h2>
                <p className="text-on-surface-variant text-lg md:text-xl mb-12 font-light">
                  הצטרפי לקהילת המדריכות המובילות שנהנות מניהול מקצועי ויוקרתי.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14">
                  <div className="flex flex-col items-center">
                    <span className="text-secondary text-5xl font-black mb-2">500+</span>
                    <span className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">מדריכות פעילות</span>
                  </div>
                  
                  <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
                  
                  <div className="flex flex-col items-center">
                    <span className="text-secondary text-5xl font-black mb-2">10k+</span>
                    <span className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">תרגילי וידאו</span>
                  </div>
                  
                  <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
                  
                  <button 
                    onClick={() => setActiveScreen('builder')}
                    className="px-12 h-16 bg-secondary text-background font-black tracking-widest uppercase hover:bg-white transition-all shadow-2xl cursor-pointer"
                  >
                    ניסיון חינם
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Screen: EXERCISE DATABASE LIBRARY */}
        {activeScreen === 'library' && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <ExerciseLibrary />
          </div>
        )}

        {/* Screen: LESSON BUILDER WORKSPACE */}
        {activeScreen === 'builder' && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <LessonBuilder 
              onSaveLesson={handleSaveLesson}
              existingLessonToEdit={editingLesson}
            />
          </div>
        )}

        {/* Screen: MY SAVED WORKOUTS */}
        {activeScreen === 'lessons' && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <MyLessons 
              lessons={lessons}
              templates={templates}
              onStartLesson={handleStartLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
              onCreateNewLesson={() => { setEditingLesson(null); setActiveScreen('builder'); }}
              onSaveTemplate={handleSaveTemplate}
              onExportBundle={handleExportBundle}
              onImportBundle={handleImportBundle}
              onCopyShareLink={handleCopyShareLink}
            />
          </div>
        )}

        {/* Screen: REALTIME ACTIVE COACHING SESSION */}
        {activeScreen === 'session' && activeSessionLesson && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <CoachingSession 
              lesson={activeSessionLesson}
              onFinishSession={() => { setActiveSessionLesson(null); setActiveScreen('lessons'); }}
            />
          </div>
        )}

      </main>

      {/* Footer Section */}
      <footer className="py-12 bg-surface-container-lowest border-t border-white/5 px-6 md:px-20 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div 
            onClick={() => { setActiveScreen('home'); setEditingLesson(null); }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border border-secondary/40 flex items-center justify-center">
              <div className="w-4 h-4 bg-secondary rounded-full" />
            </div>
            <span className="serif-text font-bold tracking-widest text-secondary uppercase text-sm">Midnight Luxe</span>
          </div>
          
          <p className="text-on-surface-variant text-sm text-center">
            © 2026 Midnight Luxe Pilates. כל הזכויות שמורות למרחב העבודה של מדריכות הפילאטיס שלך.
          </p>
          
          {/* Social icons */}
          <div className="flex gap-6">
            <button onClick={() => alert('שיתוף לקהילת מדריכות פילאטיס.')} className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={() => alert('שילוב משפחתי למיתוג יוקרתי.')} className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
              <Award className="w-5 h-5" />
            </button>
            <button onClick={() => alert('צור קשר ישיר עם התמיכה: support@midnightluxe.com')} className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
              <Mail className="w-5 h-5" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
