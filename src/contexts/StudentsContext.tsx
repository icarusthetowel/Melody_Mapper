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
  type DocumentReference,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface StudentsContextType {
  students: Student[];
  addStudent: (newStudentData: Omit<Student, 'id' | 'progressHistory'>) => void;
  updateStudent: (updatedStudent: Student) => void;
  deleteStudent: (studentId: string) => void;
  assignTeacher: (studentId: string, teacherId: string | null) => void;
  assignStudentUser: (studentId: string, studentUserId: string | null) => void;
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

// Helper to get the path from a ref
function getRefPath(ref: DocumentReference | CollectionReference | Query) {
    if ('path' in ref) {
        return ref.path;
    }
    // For queries, we have to reconstruct the path. This is a simplification.
    const queryRef = ref as Query;
    // This is a hacky way to get the path, but it's good enough for our debugging purposes.
    // @ts-ignore
    return queryRef._query.path.segments.join('/');
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
    } else if (currentUser.role === 'teacher') {
      // Teacher sees only their students (or students assigned to their email)
      q = query(studentsCollectionRef, where('teacherId', '==', currentUser.email));
    } else { // student
      // Student sees only their assigned profile
      q = query(studentsCollectionRef, where('studentUserId', '==', currentUser.uid));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];
      setStudents(studentsData);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: getRefPath(q),
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
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
    const studentsCollection = collection(db, 'students');
    addDoc(studentsCollection, newStudent).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: getRefPath(studentsCollection),
            operation: 'create',
            requestResourceData: newStudent,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, []);

  const updateStudent = useCallback(async (updatedStudent: Student) => {
    const studentRef = doc(db, 'students', updatedStudent.id);
    const { id, ...dataToUpdate } = updatedStudent;
    updateDoc(studentRef, dataToUpdate).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: getRefPath(studentRef),
            operation: 'update',
            requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, []);

  const deleteStudent = useCallback(async (studentId: string) => {
    const studentRef = doc(db, 'students', studentId);
    deleteDoc(studentRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: getRefPath(studentRef),
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, []);
    
  const assignTeacher = useCallback(async (studentId: string, teacherId: string | null) => {
    const studentRef = doc(db, 'students', studentId);
    const dataToUpdate = { teacherId };
    updateDoc(studentRef, dataToUpdate).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: getRefPath(studentRef),
            operation: 'update',
            requestResourceData: dataToUpdate
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, []);

  const assignStudentUser = useCallback(async (studentId: string, studentUserId: string | null) => {
    const studentRef = doc(db, 'students', studentId);
    const dataToUpdate = { studentUserId };
    updateDoc(studentRef, dataToUpdate).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: getRefPath(studentRef),
            operation: 'update',
            requestResourceData: dataToUpdate
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, []);

  const getStudentById = useCallback((studentId: string) => {
    return students.find(s => s.id === studentId);
  }, [students]);

  const value = { students, addStudent, updateStudent, deleteStudent, assignTeacher, assignStudentUser, getStudentById, currentUser };

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
}
