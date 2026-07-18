import React, { useRef } from 'react';
import { Play, Pencil, Trash2, Calendar, Dumbbell, Award, Plus, FolderHeart, Copy, Bookmark, Download, Upload, CloudCheck, CloudAlert, RefreshCw } from 'lucide-react';
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

  const cloudStatusDisplay = {
    idle: null,
    syncing: { icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, text: 'מסנכרן לענן...', className: 'text-on-surface-variant' },
    synced: { icon: <CloudCheck className="w-3.5 h-3.5" />, text: 'מגובה בענן', className: 'text-emerald-400' },
    error: { icon: <CloudAlert className="w-3.5 h-3.5" />, text: 'סנכרון נכשל - מגובה מקומית בלבד', className: 'text-rose-400' }
  }[cloudStatus || 'idle'];
  return (
    <div className="w-full">
      {/* Intro Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button onClick={onBackHome} className="mb-4 text-sm text-secondary hover:text-white transition-colors">
            ← חזרה לדף הבית
          </button>
          <div className="inline-block mb-3 px-4 py-1 border-l border-r border-secondary/40">
            <span className="uppercase tracking-[0.2em] text-secondary text-xs font-semibold">MY SAVED PLAYLISTS</span>
          </div>
          <h2 className="serif-text text-3xl md:text-5xl font-bold text-white mb-4">השיעורים השמורים שלי</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            מרחב התכנונים האישי שלך. כאן תמצאי את כל השיעורים שבנית וערכת. לחצי על ״התחילי שיעור״ כדי לעבור למצב הדרכה אינטראקטיבי בזמן אמת.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Button onClick={onCreateNewLesson} variant="primary" size="md" className="group whitespace-nowrap">
              <Plus className="w-4 h-4" />
              בני שיעור חדש
            </Button>
            <Button onClick={onExportBundle} variant="surface" size="sm" title="הורדת קובץ גיבוי מקומי לכל השיעורים והתבניות">
              <Download className="w-3.5 h-3.5" />
              ייצוא גיבוי
            </Button>
            <Button onClick={() => importInputRef.current?.click()} variant="surface" size="sm" title="שחזור מקובץ גיבוי">
              <Upload className="w-3.5 h-3.5" />
              ייבוא גיבוי
            </Button>
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

      {templates.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-secondary">
            <Bookmark className="w-4 h-4" />
            <h3 className="text-lg font-bold">Saved Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl border border-secondary/15 bg-secondary/5 p-5">
                <div className="text-white font-bold mb-1">{lesson.name}</div>
                <div className="text-xs text-on-surface-variant mb-4">{lesson.levelLabel} · {lesson.totalDuration} דק׳</div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => onEditLesson(lesson)} variant="primary" size="sm">השתמשי כתבנית</Button>
                  <Button onClick={() => onCopyShareLink(lesson)} variant="surface" size="sm"><Copy className="w-3.5 h-3.5" />שיתוף</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Lessons */}
      {lessons.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-lg max-w-3xl mx-auto flex flex-col items-center">
          <FolderHeart className="w-12 h-12 text-secondary/20 mb-4" />
          <h3 className="serif-text text-2xl font-bold text-white mb-2">לא נמצאו שיעורים שמורים</h3>
          <p className="text-on-surface-variant mb-8 max-w-md text-sm leading-relaxed">
            עדיין לא שמרת אף מערך שיעור מותאם אישית. לחצי על הכפתור למטה כדי ליצור את הזרימה האישית שלך עכשיו.
          </p>
          <Button onClick={onCreateNewLesson} variant="outline" size="md">
            בניית שיעור פילאטיס ראשון
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group border border-white/5 bg-surface-container-high hover:border-secondary/30 transition-all duration-500 relative flex flex-col justify-between"
            >
              {/* Decorative top gold hover line */}
              <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/40 to-secondary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {/* Lesson Card Body */}
              <div className="p-8">
                {/* Meta details */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono uppercase bg-white/5 text-on-surface-variant px-2.5 py-1 rounded-sm flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-secondary" />
                    {lesson.createdAt}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-secondary/80 font-bold">
                    {lesson.isCustom ? 'מערך מותאם' : 'שיעור ספרייה קלאסי'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="serif-text text-2xl font-bold text-white mb-3 group-hover:text-secondary transition-colors">
                  {lesson.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                  {lesson.description}
                </p>

                {/* Workout attributes in list form */}
                <div className="space-y-3.5 border-t border-b border-white/5 py-4 mb-6">
                  <div className="flex items-center gap-3.5 text-xs text-on-surface-variant">
                    <Award className="w-4 h-4 text-secondary/70 flex-shrink-0" />
                    <span>רמה: <strong>{lesson.levelLabel}</strong></span>
                  </div>
                  <div className="flex items-center gap-3.5 text-xs text-on-surface-variant">
                    <Dumbbell className="w-4 h-4 text-secondary/70 flex-shrink-0" />
                    <span>מיקוד: <strong>{lesson.targetFocus}</strong></span>
                  </div>
                  <div className="flex items-center gap-3.5 text-xs text-on-surface-variant">
                    <span className="w-4 h-4 rounded-full border border-secondary/40 text-[9px] flex items-center justify-center font-bold text-secondary flex-shrink-0">
                      T
                    </span>
                    <span>סך הכל: <strong>{lesson.exercises.length} תרגילים ({lesson.totalDuration} דק׳)</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-background/40 p-6 border-t border-white/5 flex items-center justify-between mt-auto">
                {/* Main Action: Play Lesson */}
                <Button onClick={() => onStartLesson(lesson)} variant="primary" size="sm">
                  <Play className="w-3.5 h-3.5 fill-background" />
                  התחילי שיעור
                </Button>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {lesson.isCustom && (
                    <>
                      <Button
                        onClick={() => onSaveTemplate(lesson)}
                        variant="surface"
                        size="icon-sm"
                        title="שמירה כתבנית"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => onCopyShareLink(lesson)}
                        variant="surface"
                        size="icon-sm"
                        title="העתקת קישור שיתוף"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => onEditLesson(lesson)}
                        variant="surface"
                        size="icon-sm"
                        title="עריכת שיעור"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => onDeleteLesson(lesson.id)}
                        variant="danger"
                        size="icon-sm"
                        title="מחיקת שיעור"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
