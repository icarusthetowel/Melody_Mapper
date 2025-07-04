'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Student, ProgressLog, Instrument } from '@/lib/types';
import { allStudents as initialStudents } from '@/lib/data';

interface StudentsContextType {
  students: Student[];
  addStudent: (newStudentData: Omit<Student, 'id' | 'progressHistory'>) => void;
  updateStudent: (updatedStudent: Student) => void;
  deleteStudent: (studentId: string) => void;
  assignTeacher: (studentId: string, teacherId: string | null) => void;
  getStudentById: (studentId: string) => Student | undefined;
}

type NewStudentData = {
  name: string;
  instrument: Instrument;
  progress: number;
  avatarUrl: string;
  aiHint: string;
  teacherId: string | null;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function useStudents() {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
}

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedStudents = localStorage.getItem('students');
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents(initialStudents);
      }
    } catch (e) {
      console.error("Could not parse students from localStorage", e);
      setStudents(initialStudents);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students, isInitialized]);

  const addStudent = (newStudentData: NewStudentData) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `student-${Date.now()}`,
      progressHistory: [
        {
          date: new Date().toISOString(),
          notes: 'Student account created.',
          progress: 0,
        },
      ],
    };
    setStudents(prevStudents => [...prevStudents, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prevStudents => 
      prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    );
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
  };
    
  const assignTeacher = (studentId: string, teacherId: string | null) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, teacherId: teacherId } : s));
  };

  const getStudentById = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const value = { students, addStudent, updateStudent, deleteStudent, assignTeacher, getStudentById };

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
}
