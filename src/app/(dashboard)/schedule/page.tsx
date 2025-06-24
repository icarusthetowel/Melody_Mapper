
'use client';

import { useState, useEffect, useMemo } from 'react';
import { add, format } from 'date-fns';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { allStudents } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// Helper to compare dates by ignoring time
const isSameDay = (dateA: Date, dateB: Date) => {
  return dateA.toDateString() === dateB.toDateString();
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { toast } = useToast();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLessonStudentId, setNewLessonStudentId] = useState('');
  const [newLessonTime, setNewLessonTime] = useState('09:00');

  useEffect(() => {
    setIsClient(true);
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);

    try {
      const storedLessons = localStorage.getItem('lessons');
      if (storedLessons) {
        // Re-hydrate dates from ISO strings
        const parsedLessons = JSON.parse(storedLessons).map((l: any) => ({
          ...l,
          date: new Date(l.date),
        }));
        setLessons(parsedLessons);
      } else {
        // Set initial lessons if none in storage
        const initialLessons = [
          { id: '1', studentId: '1', date: add(new Date(), { days: 0 }), time: '15:00' },
          { id: '2', studentId: '2', date: add(new Date(), { days: 1 }), time: '11:00' },
          { id: '3', studentId: '3', date: add(new Date(), { days: 3 }), time: '14:00' },
        ];
        setLessons(initialLessons);
      }
    } catch (error) {
      console.error('Failed to parse lessons from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('lessons', JSON.stringify(lessons));
    }
  }, [lessons, isClient]);

  const lessonsForSelectedDay = useMemo(() => {
    return lessons
      .filter((lesson) => isSameDay(lesson.date, selectedDate))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [lessons, selectedDate]);

  const getStudentById = (id: string): Student | undefined => {
    return allStudents.find((s) => s.id === id);
  };
  
  const handleAddLesson = () => {
    if (!newLessonStudentId || !newLessonTime) {
       toast({
        title: 'Error',
        description: 'Please select a student and enter a time.',
        variant: 'destructive',
      });
      return;
    }
    
    const newLesson: Lesson = {
      id: new Date().toISOString(),
      studentId: newLessonStudentId,
      date: selectedDate,
      time: newLessonTime,
    };
    
    setLessons(prev => [...prev, newLesson]);
    toast({
      title: 'Success!',
      description: 'Lesson has been added to the schedule.',
    });
    
    // Reset form
    setNewLessonStudentId('');
    setNewLessonTime('09:00');
    setIsDialogOpen(false);
  };
  
  const handleRemoveLesson = (lessonId: string) => {
    setLessons(prev => prev.filter(l => l.id !== lessonId));
     toast({
      title: 'Success!',
      description: 'Lesson has been removed.',
    });
  };

  if (!isClient) {
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Schedule</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Calendar</CardTitle>
              <CardDescription>
                View your scheduled lessons at a glance. Select a day to see details.
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
              {role === 'admin' && (
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a new lesson</DialogTitle>
                         <DialogDescription>
                          Schedule a new lesson for {format(selectedDate, 'MMMM d, yyyy')}.
                        </DialogDescription>
                      </DialogHeader>
                       <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="student" className="text-right">Student</Label>
                             <Select onValueChange={setNewLessonStudentId} value={newLessonStudentId}>
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
                             <Label htmlFor="time" className="text-right">Time</Label>
                              <Input id="time" type="time" value={newLessonTime} onChange={e => setNewLessonTime(e.target.value)} className="col-span-3" />
                           </div>
                       </div>
                       <DialogFooter>
                          <Button onClick={handleAddLesson}>Save Lesson</Button>
                       </DialogFooter>
                    </DialogContent>
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
                              {lesson.time}
                            </p>
                          </div>
                           {role === 'admin' && (
                             <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the lesson for {student.name} at {lesson.time}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveLesson(lesson.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
