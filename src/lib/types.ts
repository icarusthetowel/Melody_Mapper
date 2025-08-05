
export type Instrument = 'Guitar' | 'Piano' | 'Violin' | 'Drums' | 'Bass' | 'Ukulele';

export interface ProgressLog {
  date: string;
  notes: string;
  progress: number;
}

export type UserRole = 'admin' | 'teacher';

export interface User {
  uid: string; // Firebase Auth UID
  fullName: string;
  email: string;
  role: UserRole;
}

export interface Document {
  name: string;
  url: string;
  path: string; // Full path in Firebase Storage for deletion
}

export interface Student {
  id: string; // Firestore document ID
  name:string;
  instrument: Instrument;
  progress: number;
  avatarUrl: string;
  aiHint?: string;
  progressHistory: ProgressLog[];
  teacherId?: string | null;
  documents?: Document[];
}

export interface Lesson {
  id: string; // Firestore document ID
  studentId: string;
  date: any; // Stored as Timestamp in Firestore
  startTime: string;
  endTime: string;
  seriesId?: string; // Used to link recurring lessons
}
