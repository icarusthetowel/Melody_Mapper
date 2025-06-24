import type { Student, User } from './types';

// A test teacher account for the dropdown
export const allTeachers: User[] = [
  {
    id: 'teacher1',
    fullName: 'Jane Doe',
    email: 'teacher@example.com',
  },
];

export const allStudents: Student[] = [
  {
    id: '1',
    name: 'Ella Vance',
    instrument: 'Piano',
    progress: 75,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'girl smiling',
    teacherId: 'teacher@example.com',
    progressHistory: [
      {
        date: '2024-07-15T10:00:00Z',
        notes:
          'Practiced C major scale for 20 minutes and improved finger dexterity.',
        progress: 70,
      },
      {
        date: '2024-07-22T10:00:00Z',
        notes:
          'Mastered the first section of "Für Elise". Timing is becoming more consistent.',
        progress: 75,
      },
    ],
  },
  {
    id: '2',
    name: 'Liam Foster',
    instrument: 'Guitar',
    progress: 40,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy playing guitar',
    teacherId: null,
    progressHistory: [
      {
        date: '2024-07-18T11:00:00Z',
        notes:
          'Learned the basic G, C, and D chords. Struggling with smooth transitions.',
        progress: 35,
      },
      {
        date: '2024-07-25T11:00:00Z',
        notes: 'Chord transitions are smoother. Can play a simple progression.',
        progress: 40,
      },
    ],
  },
  {
    id: '3',
    name: 'Noah Hayes',
    instrument: 'Piano',
    progress: 90,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy glasses',
    teacherId: null,
    progressHistory: [
      {
        date: '2024-07-20T14:00:00Z',
        notes: 'Began working on Chopin\'s "Nocturne in E-flat Major".',
        progress: 88,
      },
      {
        date: '2024-07-27T14:00:00Z',
        notes: 'Can play the first page flawlessly. Excellent dynamics.',
        progress: 90,
      },
    ],
  },
  {
    id: '4',
    name: 'Olivia Chen',
    instrument: 'Guitar',
    progress: 60,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'girl asian',
    teacherId: null,
    progressHistory: [
      {
        date: '2024-07-19T16:00:00Z',
        notes: 'Practiced fingerpicking patterns. Improving accuracy.',
        progress: 55,
      },
      {
        date: '2024-07-26T16:00:00Z',
        notes: 'Learned the intro to "Stairway to Heaven".',
        progress: 60,
      },
    ],
  },
];
