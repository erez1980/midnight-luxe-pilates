export interface Exercise {
  id: string;
  name: string;
  englishName: string;
  apparatus: 'mat' | 'reformer' | 'cadillac' | 'chair' | 'props';
  apparatusLabel: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficultyLabel: string;
  category?: 'warmup' | 'core' | 'glutes' | 'mobility' | 'balance' | 'upper-body' | 'cooldown' | 'full-body';
  categoryLabel?: string;
  targetMuscles: string[];
  durationMinutes: number;
  instructions: string[];
  benefits: string;
  breathing: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface LessonExercise {
  exercise: Exercise;
  customDuration: number; // in minutes
  notes?: string;
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  levelLabel: string;
  targetFocus: string;
  exercises: LessonExercise[];
  totalDuration: number; // in minutes
  createdAt: string;
  isCustom?: boolean;
}
