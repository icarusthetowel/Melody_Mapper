export type Instrument = 'Guitar' | 'Piano' | 'Violin' | 'Drums';

export interface ProgressLog {
  date: string;
  notes: string;
  progress: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface Student {
  id: string;
  name: string;
  instrument: Instrument;
  progress: number;
  avatarUrl: string;
  aiHint?: string;
  progressHistory: ProgressLog[];
  teacherId?: string | null;
}

export interface Lesson {
  id: string;
  studentName: string;
  instrument: 'Guitar' | 'Piano';
  date: Date;
  avatarUrl: string;
  aiHint?: string;
}
