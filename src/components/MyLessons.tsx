import React, { useMemo, useRef, useState } from 'react';
import { Play, Pencil, Trash2, Plus, FolderHeart, Copy, Bookmark, Download, Upload, CloudCheck, CloudAlert, RefreshCw, MoreVertical, Search, X, Sparkles, Clock3, Layers3, ArrowUpRight } from 'lucide-react';
import { Lesson } from '../types';
import { motion } from 'motion/react';
import Button from './ui/Button';

interface MyLessonsProps {
  lessons: Lesson[];
  templates: Lesson[];
  onStartLesson: (lesson: Lesson) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onCreateNewLesson: () => void;
  onSaveTemplate: (lesson: Lesson) => void;
  onCopyShareLink: (lesson: Lesson) => void;
  onBackHome: () => void;
  onExportBundle: () => void;
  onImportBundle: (file: File) => void;
  cloudStatus: 'idle' | 'syncing' | 'synced' | 'error' | null;
}

type SortMode = 'recent' | 'duration' | 'name';

export default function MyLessons({
  lessons,
  templates,
  onStartLesson,
  onEditLesson,
  onDeleteLesson,
  onCreateNewLesson,
  onSaveTemplate,
  onCopyShareLink,
  onBackHome,
  onExportBundle,
  onImportBundle,
  cloudStatus
}: MyLessonsProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  // One open menu at a time: 'page' for the header overflow menu, or a lesson id.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [pendingDeleteLesson, setPendingDeleteLesson] = useState<Lesson | null>(null);

  const cloudStatusDisplay = {
    idle: null,
    syncing: { icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, text: 'מסנכרן לענן...', className: 'text-on-surface-variant' },
    synced: { icon: <CloudCheck className="w-3.5 h-3.5" />, text: 'מגובה בענן', className: 'text-emerald-400' },
    error: { icon: <CloudAlert className="w-3.5 h-3.5" />, text: 'סנכרון נכשל - מגובה מקומית בלבד', className: 'text-rose-400' }
  }[cloudStatus || 'idle'];

  const visibleLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? lessons.filter((l) =>
          [l.name, l.description, l.targetFocus, l.levelLabel]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(q))
        )
      : [...lessons];
    if (sortMode === 'duration') list.sort((a, b) => (b.totalDuration || 0) - (a.totalDuration || 0));
    if (sortMode === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    // 'recent' keeps the natural order (new saves are prepended).
    return list;
  }, [lessons, query, sortMode]);

  const closeMenu = () => setOpenMenu(null);

  return (
    <div className="w-full">
      {/* Click-away layer for any open dropdown */}
      {openMenu && <div className="fixed inset-0 z-30" onClick={closeMenu} aria-hidden="true" />}

      {/* Intro Header - compact */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button onClick={onBackHome} className="mb-4 text-sm text-secondary hover:text-on-surface transition-colors">
            ← חזרה לדף הבית
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-secondary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            פילאטיס ותנועה
          </div>
          <h2 className="serif-text text-3xl md:text-5xl font-bold text-on-surface mb-2">השיעורים שלי</h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            כל השיעורים שבנית, במקום אחד — מוכנים להדרכה, עריכה, שכפול ושיתוף.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-3">
            <Button onClick={onCreateNewLesson} variant="primary" size="md" className="whitespace-nowrap">
              <Plus className="w-4 h-4" />
              בני שיעור חדש
            </Button>

            {/* Page-level overflow menu: backup actions live here now */}
            <div className="relative">
              <Button
                onClick={() => setOpenMenu(openMenu === 'page' ? null : 'page')}
                variant="surface"
                size="icon"
                aria-label="פעולות נוספות"
                title="פעולות נוספות"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              {openMenu === 'page' && (
                <div className="absolute left-0 top-full mt-2 z-40 min-w-[200px] rounded-lg border border-outline/30 bg-surface-container-high shadow-2xl py-1.5">
                  <button
                    onClick={() => { closeMenu(); onExportBundle(); }}
                    className="w-full text-right px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2.5"
                  >
                    <Download className="w-4 h-4 text-secondary/80" />
                    ייצוא גיבוי לקובץ
                  </button>
                  <button
                    onClick={() => { closeMenu(); importInputRef.current?.click(); }}
                    className="w-full text-right px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2.5"
                  >
                    <Upload className="w-4 h-4 text-secondary/80" />
                    ייבוא גיבוי מקובץ
                  </button>
                </div>
              )}
            </div>

            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportBundle(file);
                e.target.value = '';
              }}
            />
          </div>
          {cloudStatusDisplay && (
            <div className={`flex items-center gap-1.5 text-xs ${cloudStatusDisplay.className}`}>
              {cloudStatusDisplay.icon}
              <span>{cloudStatusDisplay.text}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="rounded-3xl border border-outline/30 bg-surface-container p-5">
          <div className="flex items-center gap-2 text-secondary mb-3"><Layers3 className="w-4 h-4" /><span className="text-xs tracking-[0.2em] font-bold">תמונת מצב</span></div>
          <div className="text-3xl font-black text-on-surface mb-1">{lessons.length}</div>
          <div className="text-sm text-on-surface-variant">שיעורים שמורים ומוכנים לעבודה</div>
        </div>
        <div className="rounded-3xl border border-outline/30 bg-surface-container p-5">
          <div className="flex items-center gap-2 text-secondary mb-3"><Bookmark className="w-4 h-4" /><span className="text-xs tracking-[0.2em] font-bold">תבניות</span></div>
          <div className="text-3xl font-black text-on-surface mb-1">{templates.length}</div>
          <div className="text-sm text-on-surface-variant">תבניות מוכנות לשימוש חוזר</div>
        </div>
        <div className="rounded-3xl border border-outline/30 bg-surface-container p-5">
          <div className="flex items-center gap-2 text-secondary mb-3"><Clock3 className="w-4 h-4" /><span className="text-xs tracking-[0.2em] font-bold">משך ממוצע</span></div>
          <div className="text-3xl font-black text-on-surface mb-1">{lessons.length ? Math.round(lessons.reduce((sum, lesson) => sum + (lesson.totalDuration || 0), 0) / lessons.length) : 0} דק׳</div>
          <div className="text-sm text-on-surface-variant">אורך ממוצע למערך בספרייה</div>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-secondary">
            <Bookmark className="w-4 h-4" />
            <h3 className="text-lg font-bold">תבניות שמורות</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl border border-secondary/15 bg-secondary/5 p-5">
                <div className="text-on-surface font-bold mb-1">{lesson.name || 'שיעור ללא שם'}</div>
                <div className="text-xs text-on-surface-variant mb-4">{lesson.levelLabel || 'מותאם אישית'} · {lesson.totalDuration || 0} דק׳</div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => onEditLesson(lesson)} variant="primary" size="sm">השתמשי כתבנית</Button>
                  <Button onClick={() => onCopyShareLink(lesson)} variant="surface" size="sm"><Copy className="w-3.5 h-3.5" />שיתוף</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + sort toolbar (only useful once there are lessons) */}
      {lessons.length > 0 && (
        <div className="mb-6 rounded-3xl border border-outline/30 bg-surface-container p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/[0.03] to-transparent rounded-r-lg pointer-events-none" />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש בשיעורים..."
              className="w-full h-11 pr-10 pl-10 rounded-2xl bg-background border border-outline/30 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary/60 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                aria-label="ניקוי חיפוש"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-11 px-4 rounded-2xl bg-background border border-outline/30 text-sm text-on-surface focus:outline-none focus:border-secondary/60 cursor-pointer"
            aria-label="מיון שיעורים"
          >
            <option value="recent" className="bg-surface-container-high">מיון: חדש → ישן</option>
            <option value="duration" className="bg-surface-container-high">מיון: לפי משך</option>
            <option value="name" className="bg-surface-container-high">מיון: לפי שם</option>
          </select>
        </div>
      )}

      {/* Grid of Lessons */}
      {lessons.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-outline/30 rounded-lg max-w-3xl mx-auto flex flex-col items-center">
          <FolderHeart className="w-12 h-12 text-secondary/20 mb-4" />
          <h3 className="serif-text text-2xl font-bold text-on-surface mb-2">לא נמצאו שיעורים שמורים</h3>
          <p className="text-on-surface-variant mb-8 max-w-md text-sm leading-relaxed">
            עדיין לא שמרת אף מערך שיעור מותאם אישית. לחצי על הכפתור למטה כדי ליצור את הזרימה האישית שלך עכשיו.
          </p>
          <Button onClick={onCreateNewLesson} variant="outline" size="md">
            בניית שיעור פילאטיס ראשון
          </Button>
        </div>
      ) : visibleLessons.length === 0 ? (
        <div className="py-16 text-center text-on-surface-variant">
          לא נמצאו שיעורים שתואמים את החיפוש "{query}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group border border-outline/20 bg-surface-container-high hover:border-secondary/30 transition-all duration-500 relative overflow-hidden flex flex-col rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
            >
              {/* Decorative top gold hover line */}
              <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {/* Lesson Card Body - compact */}
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-outline/20 bg-surface-container px-3 py-1 text-[10px] tracking-[0.18em] text-on-surface-variant">
                    <ArrowUpRight className="w-3 h-3" />
                    מוכן להדרכה
                  </span>
                </div>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="serif-text text-xl font-bold text-on-surface group-hover:text-secondary transition-colors">
                    {lesson.name}
                  </h3>
                  <span className="shrink-0 text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">
                    {lesson.createdAt || 'ללא תאריך'}
                  </span>
                </div>

                {lesson.description && (
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                {/* Meta as one compact chip row (replaces the old 3-line list) */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">{lesson.levelLabel}</span>
                  {lesson.targetFocus && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline/20">{lesson.targetFocus}</span>
                  )}
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline/20">
                    {(lesson.exercises?.length || 0)} תרגילים · {lesson.totalDuration || 0} דק׳
                  </span>
                </div>

                <div className="rounded-2xl border border-outline/30 bg-surface-container-high p-4 mb-5">
                  <div className="text-xs tracking-[0.18em] text-secondary font-bold mb-2">סיכום מהיר</div>
                  <div className="text-sm text-on-surface-variant leading-relaxed">
                    {lesson.description || 'מערך מוכן להוראה, עריכה או שיתוף. אפשר להמשיך ממנו לשיעור הבא בלי להתחיל מאפס.'}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-surface-container px-5 py-4 border-t border-outline/20 flex items-center justify-between gap-2">
                <Button onClick={() => onStartLesson(lesson)} variant="primary" size="sm">
                  <Play className="w-3.5 h-3.5 fill-background" />
                  התחילי שיעור
                </Button>

                {lesson.isCustom && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => onEditLesson(lesson)}
                      variant="surface"
                      size="sm"
                      aria-label={`עריכת ${lesson.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      עריכה
                    </Button>
                    <Button
                      onClick={() => onCopyShareLink(lesson)}
                      variant="surface"
                      size="sm"
                      aria-label={`שיתוף ${lesson.name}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      שיתוף
                    </Button>

                    {/* Per-card overflow menu: template + delete (kept away from frequent actions) */}
                    <div className="relative">
                      <Button
                        onClick={() => setOpenMenu(openMenu === lesson.id ? null : lesson.id)}
                        variant="surface"
                        size="icon-sm"
                        aria-label="פעולות נוספות"
                        title="פעולות נוספות"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                      {openMenu === lesson.id && (
                        <div className="absolute left-0 bottom-full mb-2 z-40 min-w-[190px] rounded-lg border border-outline/30 bg-surface-container-high shadow-2xl py-1.5">
                          <button
                            onClick={() => { closeMenu(); onSaveTemplate(lesson); }}
                            className="w-full text-right px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2.5"
                          >
                            <Bookmark className="w-4 h-4 text-secondary/80" />
                            שמירה כתבנית
                          </button>
                          <div className="my-1 h-px bg-outline/20" />
                          <button
                            onClick={() => { closeMenu(); setPendingDeleteLesson(lesson); }}
                            className="w-full text-right px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5"
                          >
                            <Trash2 className="w-4 h-4" />
                            מחיקת שיעור
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pendingDeleteLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-surface-container-high p-6 shadow-2xl">
            <div className="text-xs tracking-[0.2em] text-rose-300 font-bold mb-3">מחיקת שיעור</div>
            <h3 className="serif-text text-2xl text-on-surface font-bold mb-3">למחוק את "{pendingDeleteLesson.name}"?</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              המחיקה תסיר את המערך מספריית השיעורים שלך. אם זה שיעור שתרצי למחזר בעתיד, עדיף קודם לשמור אותו כתבנית.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="surface" size="md" onClick={() => setPendingDeleteLesson(null)}>
                ביטול
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  onDeleteLesson(pendingDeleteLesson.id);
                  setPendingDeleteLesson(null);
                }}
                className="!bg-rose-500 hover:!bg-rose-400 !text-white"
              >
                <Trash2 className="w-4 h-4" />
                מחקי שיעור
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
