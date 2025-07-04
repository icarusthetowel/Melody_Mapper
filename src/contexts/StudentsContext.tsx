'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Student, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
} from 'firebase/firestore';

interface StudentsContextType {
  students: Student[];
  addStudent: (newStudentData: Omit<Student, 'id' | 'progressHistory'>) => Promise<void>;
  updateStudent: (updatedStudent: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  assignTeacher: (studentId: string, teacherId: string | null) => Promise<void>;
  getStudentById: (studentId: string) => Student | undefined;
  currentUser: User | null;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function useStudents() {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
}

export function StudentsProvider({ children, currentUser }: { children: ReactNode, currentUser: User | null }) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const studentsCollectionRef = collection(db, 'students');
    let q;

    if (currentUser.role === 'admin') {
      // Admin sees all students
      q = query(studentsCollectionRef);
    } else {
      // Teacher sees only their students (or students assigned to their email)
      q = query(studentsCollectionRef, where('teacherId', '==', currentUser.email));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];
      setStudents(studentsData);
    }, (error) => {
        console.error("Error fetching students:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addStudent = useCallback(async (newStudentData: Omit<Student, 'id' | 'progressHistory'>) => {
    const newStudent = {
      ...newStudentData,
      progressHistory: [
        {
          date: new Date().toISOString(),
          notes: 'Student account created.',
          progress: 0,
        },
      ],
    };
    await addDoc(collection(db, 'students'), newStudent);
  }, []);

  const updateStudent = useCallback(async (updatedStudent: Student) => {
    const studentRef = doc(db, 'students', updatedStudent.id);
    const { id, ...dataToUpdate } = updatedStudent;
    await updateDoc(studentRef, dataToUpdate);
  }, []);

  const deleteStudent = useCallback(async (studentId: string) => {
    const studentRef = doc(db, 'students', studentId);
    await deleteDoc(studentRef);
  }, []);
    
  const assignTeacher = useCallback(async (studentId: string, teacherId: string | null) => {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, { teacherId });
  }, []);

  const getStudentById = useCallback((studentId: string) => {
    return students.find(s => s.id === studentId);
  }, [students]);

  const value = { students, addStudent, updateStudent, deleteStudent, assignTeacher, getStudentById, currentUser };

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
}
