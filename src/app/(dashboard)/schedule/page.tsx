
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { add, format, set } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import type { Lesson, Student } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useStudents } from '@/contexts/StudentsContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, Timestamp, writeBatch, query, where, getDocs } from 'firebase/firestore';


// Helper to compare dates by ignoring time
const isSameDay = (dateA: Date, dateB: Date) => {
  return dateA.toDateString() === dateB.toDateString();
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { students: allStudents, currentUser } = useStudents();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  
  // Form state
  const [lessonStudentId, setLessonStudentId] = useState('');
  const [lessonStartTime, setLessonStartTime] = useState('09:00');
  const [lessonEndTime, setLessonEndTime] = useState('10:00');
  const [lessonRecurrence, setLessonRecurrence] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const lessonsCollectionRef = collection(db, 'lessons');
    const unsubscribe = onSnapshot(lessonsCollectionRef, (snapshot) => {
      const fetchedLessons = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
        } as Lesson;
      });
      setLessons(fetchedLessons);
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to fetch lessons:", error);
      toast({ title: "Error", description: "Could not fetch lessons.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const lessonsForSelectedDay = useMemo(() => {
    return lessons
      .filter((lesson) => isSameDay(lesson.date, selectedDate))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [lessons, selectedDate]);

  const getStudentById = useCallback((id: string): Student | undefined => {
    return allStudents.find((s) => s.id === id);
  }, [allStudents]);

  const resetForm = () => {
    setLessonStudentId('');
    setLessonStartTime('09:00');
    setLessonEndTime('10:00');
    setLessonRecurrence(false);
  }
  
  const handleOpenAddDialog = () => {
    resetForm();
    setEditingLesson(null);
    setIsDialogOpen(true);
  }

  const handleOpenEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonStudentId(lesson.studentId);
    setLessonStartTime(lesson.startTime);
    setLessonEndTime(lesson.endTime);
    setLessonRecurrence(false); // Can't edit recurrence for now
    setIsDialogOpen(true);
  }

  const handleLessonSubmit = async () => {
    if (!lessonStudentId || !lessonStartTime || !lessonEndTime) {
       toast({
        title: 'Error',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (editingLesson) { // Handle Update
      const lessonRef = doc(db, 'lessons', editingLesson.id);
      await updateDoc(lessonRef, { studentId: lessonStudentId, startTime: lessonStartTime, endTime: lessonEndTime });
      toast({ title: 'Success!', description: 'Lesson has been updated.' });
    } else { // Handle Add
      const lessonDate = selectedDate;
      const lessonData = {
        studentId: lessonStudentId,
        date: Timestamp.fromDate(lessonDate),
        startTime: lessonStartTime,
        endTime: lessonEndTime,
      };

      if (lessonRecurrence) {
        const batch = writeBatch(db);
        const seriesId = doc(collection(db, 'lessons')).id; // Generate a unique ID for the series
        for (let i = 0; i < 4; i++) {
          const recurringDate = add(lessonDate, { weeks: i });
          const newLessonRef = doc(collection(db, 'lessons'));
          batch.set(newLessonRef, { ...lessonData, date: Timestamp.fromDate(recurringDate), seriesId });
        }
        await batch.commit();
        toast({ title: 'Success!', description: 'Recurring lessons have been added.'});
      } else {
        await addDoc(collection(db, 'lessons'), lessonData);
        toast({ title: 'Success!', description: 'Lesson has been added.'});
      }
    }
    
    setIsDialogOpen(false);
    setEditingLesson(null);
  };
  
  const handleRemoveLesson = async (scope: 'one' | 'all') => {
    if (!lessonToDelete) return;

    if (scope === 'all' && lessonToDelete.seriesId) {
        const batch = writeBatch(db);
        const q = query(collection(db, 'lessons'), where('seriesId', '==', lessonToDelete.seriesId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    } else {
        await deleteDoc(doc(db, 'lessons', lessonToDelete.id));
    }
     toast({
      title: 'Success!',
      description: 'Lesson has been removed.',
    });
    setLessonToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Schedule</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Calendar</CardTitle>
                <CardDescription>
                  View your scheduled lessons at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-[338px] rounded-md" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Lessons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const LessonFormDialog = (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add a New Lesson'}</DialogTitle>
          <DialogDescription>
          Schedule a lesson for {format(editingLesson ? editingLesson.date : selectedDate, 'MMMM d, yyyy')}.
        </DialogDescription>
      </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student" className="text-right">Student</Label>
              <Select onValueChange={setLessonStudentId} value={lessonStudentId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">Start Time</Label>
              <Input id="startTime" type="time" value={lessonStartTime} onChange={e => setLessonStartTime(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">End Time</Label>
              <Input id="endTime" type="time" value={lessonEndTime} onChange={e => setLessonEndTime(e.target.value)} className="col-span-3" />
            </div>
            {!editingLesson && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurrence" className="text-right">Repeat</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox id="recurrence" checked={lessonRecurrence} onCheckedChange={(checked) => setLessonRecurrence(!!checked)} />
                  <label htmlFor="recurrence" className="text-sm font-medium leading-none">
                    Weekly for 4 weeks
                  </label>
                </div>
              </div>
            )}
        </div>
        <DialogFooter>
          <Button onClick={handleLessonSubmit}>{editingLesson ? 'Save Changes' : 'Save Lesson'}</Button>
        </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Schedule</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Calendar</CardTitle>
              <CardDescription>
                View your scheduled lessons. Select a day to see details and manage events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border w-full"
                modifiers={{ booked: lessons.map((l) => l.date) }}
                modifiersStyles={{
                  booked: {
                    border: '2px solid hsl(var(--primary))',
                    borderRadius: 'var(--radius)',
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  Lessons for {format(selectedDate, 'MMMM d')}
                </CardTitle>
              </div>
              {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                 <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setEditingLesson(null); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={handleOpenAddDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </DialogTrigger>
                    {LessonFormDialog}
                  </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {lessonsForSelectedDay.length > 0 ? (
                 <div className="space-y-4">
                  {lessonsForSelectedDay.map((lesson) => {
                    const student = getStudentById(lesson.studentId);
                    if (!student) return null;
                    return (
                       <div key={lesson.id} className="flex items-center gap-4 group">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={student.avatarUrl}
                              alt={student.name}
                              data-ai-hint={student.aiHint}
                            />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.instrument}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {lesson.startTime} - {lesson.endTime}
                            </p>
                          </div>
                           {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(lesson)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog onOpenChange={(isOpen) => !isOpen && setLessonToDelete(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLessonToDelete(lesson)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                       {lessonToDelete?.seriesId
                                          ? "This is a recurring lesson. Delete only this instance or the entire series?"
                                          : `This will permanently delete the lesson for ${getStudentById(lessonToDelete?.studentId || '')?.name} at ${lessonToDelete?.startTime}.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                     {lessonToDelete?.seriesId && (
                                      <AlertDialogAction onClick={() => handleRemoveLesson('all')}>
                                        Delete Series
                                      </AlertDialogAction>
                                    )}
                                    <AlertDialogAction onClick={() => handleRemoveLesson('one')}>
                                      {lessonToDelete?.seriesId ? 'Delete This Instance' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                           )}
                       </div>
                    );
                  })}
                 </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No lessons scheduled for this day.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
