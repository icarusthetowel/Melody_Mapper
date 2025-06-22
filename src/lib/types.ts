export type Instrument = 'Guitar' | 'Piano' | 'Violin' | 'Drums';

export interface Student {
  id: string;
  name: string;
  instrument: Instrument;
  progress: number;
  avatarUrl: string;
  aiHint?: string;
}

export interface Lesson {
    id: string;
    studentName: string;
    instrument: 'Guitar' | 'Piano';
    date: Date;
    avatarUrl: string;
    aiHint?: string;
}
