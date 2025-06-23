export type Instrument = 'Guitar' | 'Piano' | 'Violin' | 'Drums';

export interface ProgressLog {
  date: string;
  notes: string;
  progress: number;
}

export interface Student {
  id: string;
  name: string;
  instrument: Instrument;
  progress: number;
  avatarUrl: string;
  aiHint?: string;
  progressHistory: ProgressLog[];
}

export interface Lesson {
    id: string;
    studentName: string;
    instrument: 'Guitar' | 'Piano';
    date: Date;
    avatarUrl: string;
    aiHint?: string;
}
