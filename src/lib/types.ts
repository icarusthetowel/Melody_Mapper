export interface Student {
  id: string;
  name: string;
  instrument: 'Guitar' | 'Piano';
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
