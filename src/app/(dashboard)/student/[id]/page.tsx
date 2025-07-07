
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Student, ProgressLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Edit, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useStudents } from '@/contexts/StudentsContext';

const formSchema = z.object({
  progress: z.number().min(0).max(100),
  notes: z
    .string()
    .min(10, { message: 'Notes must be at least 10 characters long.' }),
});

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const studentId = params.id as string;

  const { students, getStudentById, updateStudent, currentUser } = useStudents();
  const student = getStudentById(studentId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progress: student?.progress || 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        progress: student.progress,
        notes: '',
      });
    }
  }, [student, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (form.formState.isSubmitting || !student) return;
    
    const newHistoryEntry: ProgressLog = {
      date: new Date().toISOString(),
      notes: values.notes,
      progress: values.progress,
    };

    const updatedStudent: Student = {
      ...student,
      progress: values.progress,
      progressHistory: [...(student.progressHistory || []), newHistoryEntry],
    };

    try {
      await updateStudent(updatedStudent);

      toast({
        title: 'Success!',
        description: `Progress for ${student.name} has been updated.`,
      });
      
      form.reset({
        progress: values.progress,
        notes: '',
      });
    } catch(error) {
        console.error("Failed to update student progress:", error);
        toast({
            title: "Update Failed",
            description: "Could not save progress. You may not have permission to edit this student. Please check the console for details.",
            variant: "destructive"
        })
    }
  }

  // The context's student list is empty on the first render while it loads from localStorage.
  // We show a loader until the list is populated.
  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading student data...</span>
      </div>
    );
  }

  // If the student list is loaded but the specific student isn't found, show an error.
  if (!student) {
    return (
       <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested student could not be found. They may have been deleted.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" onClick={() => router.back()} className="w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={student.avatarUrl}
                  alt={student.name}
                  data-ai-hint={student.aiHint}
                />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <CardDescription>{student.instrument}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Overall Progress</span>
                <span>{student.progress}%</span>
              </div>
              <Progress value={student.progress} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Log Progress
              </CardTitle>
              <CardDescription>
                Update the student's progress and add notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Progress: {field.value}%</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            disabled={currentUser?.role !== 'admin' && student.teacherId !== currentUser?.email}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Practiced scales for 20 minutes..."
                            {...field}
                             disabled={currentUser?.role !== 'admin' && student.teacherId !== currentUser?.email}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting || (currentUser?.role !== 'admin' && student.teacherId !== currentUser?.email)} className="w-full">
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Progress
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Progress History
              </CardTitle>
              <CardDescription>
                A log of all past progress updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.progressHistory && student.progressHistory.length > 0 ? (
                <div className="space-y-4">
                  {[...student.progressHistory]
                    .reverse()
                    .map((log, index) => (
                      <div
                        key={index}
                        className="flex gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-muted">
                            <span className="text-lg font-bold text-primary">
                              {log.progress}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {format(new Date(log.date), 'MMMM d, yyyy')}
                          </p>
                          <p className="text-muted-foreground">{log.notes}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No progress has been logged yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
