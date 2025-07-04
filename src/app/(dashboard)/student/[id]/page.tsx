
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { allStudents as initialStudents } from '@/lib/data';
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

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const storedStudents = localStorage.getItem('students');
      const students: Student[] = storedStudents
        ? JSON.parse(storedStudents)
        : initialStudents;
      const foundStudent = students.find((s) => s.id === studentId);

      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        setError('Student not found.');
      }
    } catch (e) {
      console.error('Failed to load student data:', e);
      setError('Could not load student data. It might be corrupted.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

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
    if (form.formState.isSubmitting) return;

    setStudent((prevStudent) => {
      if (!prevStudent) return null;

      const newHistoryEntry: ProgressLog = {
        date: new Date().toISOString(),
        notes: values.notes,
        progress: values.progress,
      };

      const updatedStudent = {
        ...prevStudent,
        progress: values.progress,
        progressHistory: [
          ...(prevStudent.progressHistory || []),
          newHistoryEntry,
        ],
      };

      try {
        const storedStudents = localStorage.getItem('students');
        const students: Student[] = storedStudents ? JSON.parse(storedStudents) : [];
        const studentIndex = students.findIndex((s) => s.id === studentId);
        if (studentIndex !== -1) {
          students[studentIndex] = updatedStudent;
          localStorage.setItem('students', JSON.stringify(students));
        }
      } catch (e) {
        console.error("Failed to update student in localStorage", e);
        toast({
          title: 'Error Saving',
          description: 'Could not save progress due to a storage issue.',
          variant: 'destructive',
        });
      }

      return updatedStudent;
    });

    toast({
      title: 'Success!',
      description: `Progress for ${student?.name} has been updated.`,
    });
    form.reset({
      progress: values.progress,
      notes: '',
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading student data...</span>
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">An Error Occurred</h2>
        <p className="text-destructive mb-6">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!student) {
    // This case is unlikely if error handling is working, but it's a good fallback.
    return (
       <div className="flex items-center justify-center h-full min-h-[50vh]">
         <p>Student data could not be loaded.</p>
       </div>
    )
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
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
