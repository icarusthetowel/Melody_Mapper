
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Student, ProgressLog, Document as DocType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Edit, Loader2, AlertTriangle, Link as LinkIcon, File, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useStudents } from '@/contexts/StudentsContext';

const progressFormSchema = z.object({
  progress: z.number().min(0).max(100),
  notes: z
    .string()
    .min(10, { message: 'Notes must be at least 10 characters long.' }),
});

const documentFormSchema = z.object({
  name: z.string().min(1, { message: 'Document name is required.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});


export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const studentId = params.id as string;
  const [isSaving, setIsSaving] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);

  const { students, getStudentById, updateStudent, currentUser } = useStudents();
  // For students, the context only loads their profile, so we can find it directly.
  // For teachers/admins, it loads multiple, so we use getStudentById.
  const student = currentUser?.role === 'student' ? students[0] : getStudentById(studentId);

  const progressForm = useForm<z.infer<typeof progressFormSchema>>({
    resolver: zodResolver(progressFormSchema),
    defaultValues: {
      progress: student?.progress || 0,
      notes: '',
    },
  });
  
  const documentForm = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: '',
      url: '',
    },
  });

  useEffect(() => {
    if (student) {
      progressForm.reset({
        progress: student.progress,
        notes: '',
      });
    }
  }, [student, progressForm]);
  
  // Security check: Redirect student if they try to access a profile that isn't theirs
  useEffect(() => {
    if (currentUser?.role === 'student' && students.length > 0 && student?.studentUserId !== currentUser.uid) {
      router.push('/dashboard');
    }
  }, [currentUser, student, students, router]);


  const canEdit = currentUser?.role === 'admin' || (currentUser?.role === 'teacher' && student?.teacherId === currentUser?.email);

  async function onProgressSubmit(values: z.infer<typeof progressFormSchema>) {
    if (isSaving || !student) return;
    
    setIsSaving(true);
    
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
      
      progressForm.reset({
        progress: values.progress,
        notes: '',
      });
    } catch(error) {
        console.error("Failed to update student progress:", error);
        toast({
            title: "Update Failed",
            description: "Could not save progress. You may not have permission for this action.",
            variant: "destructive"
        })
    } finally {
        setIsSaving(false);
    }
  }

  async function onDocumentSubmit(values: z.infer<typeof documentFormSchema>) {
    if (!student || !canEdit) return;

    const newDocument: DocType = {
      id: new Date().toISOString(), // Simple unique ID
      name: values.name,
      url: values.url,
    };
    
    const updatedDocuments = [...(student.documents || []), newDocument];
    
    try {
        await updateStudent({ ...student, documents: updatedDocuments });
        toast({
            title: 'Success!',
            description: 'Document link added.',
        });
        documentForm.reset();
        setIsDocDialogOpen(false);
    } catch(error) {
        console.error("Failed to add document link:", error);
        toast({
            title: "Save Failed",
            description: "Could not save the document link.",
            variant: "destructive"
        });
    }
  }

  const handleDeleteDocument = async (docId: string) => {
     if (!student || !canEdit) return;

    const updatedDocuments = student.documents?.filter(d => d.id !== docId);

    try {
      await updateStudent({ ...student, documents: updatedDocuments });
      toast({
        title: 'Document Link Deleted',
        description: 'The link has been removed.',
      });
    } catch(error) {
      console.error("Error deleting document link:", error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the document link.',
        variant: 'destructive',
      });
    }
  };


  if (students.length === 0 && !student) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading student data...</span>
      </div>
    );
  }

  if (!student) {
    return (
       <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested student could not be found or you do not have permission to view them.</p>
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

          {canEdit && (
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
                <Form {...progressForm}>
                  <form
                    onSubmit={progressForm.handleSubmit(onProgressSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={progressForm.control}
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
                              disabled={!canEdit || isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={progressForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Practiced scales for 20 minutes..."
                              {...field}
                              disabled={!canEdit || isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={!canEdit || isSaving} className="w-full">
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isSaving ? 'Saving...' : 'Save Progress'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
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

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Documents
                </CardTitle>
                <CardDescription>
                    Manage and view document links for this student.
                </CardDescription>
            </CardHeader>
            <CardContent>
              {student.documents && student.documents.length > 0 ? (
                <div className="space-y-2">
                  {student.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-md border group">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline truncate">
                        <LinkIcon className="h-4 w-4" />
                        <span className="truncate">{doc.name}</span>
                      </a>
                       {canEdit && (
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the link: {doc.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDocument(doc.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No document links have been added for this student.</p>
                </div>
              )}
            </CardContent>
            {canEdit && (
              <CardFooter className="border-t pt-6">
                 <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
                    <DialogTrigger asChild>
                       <Button className="w-full">
                         <LinkIcon className="mr-2 h-4 w-4" />
                          Add Document Link
                       </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Document Link</DialogTitle>
                          <DialogDescription>
                            Enter a name and the shareable URL for the document.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...documentForm}>
                            <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-4">
                               <FormField
                                  control={documentForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Document Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., Weekly Sheet Music" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={documentForm.control}
                                  name="url"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Document URL</FormLabel>
                                      <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button type="submit">Save Link</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
