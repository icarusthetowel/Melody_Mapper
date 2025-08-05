
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Edit, Loader2, AlertTriangle, Upload, File, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useStudents } from '@/contexts/StudentsContext';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const canEdit = currentUser?.role === 'admin' || student?.teacherId === currentUser?.email;

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
      
      form.reset({
        progress: values.progress,
        notes: '',
      });
    } catch(error) {
        console.error("Failed to update student progress:", error);
        toast({
            title: "Update Failed",
            description: "Could not save progress. You may not have permission for this action. Please check your Firestore rules and try again.",
            variant: "destructive"
        })
    } finally {
        setIsSaving(false);
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!student || !canEdit) return;
    setIsUploading(true);

    try {
      const storage = getStorage();
      const filePath = `students/${student.id}/documents/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const newDocument: DocType = {
        name: file.name,
        url: downloadURL,
        path: filePath,
      };

      const updatedDocuments = [...(student.documents || []), newDocument];
      await updateStudent({ ...student, documents: updatedDocuments });

      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded.`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload the document. Please check storage rules and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (docToDelete: DocType) => {
     if (!student || !canEdit) return;

    try {
      // 1. Delete from Storage
      const storage = getStorage();
      const fileRef = ref(storage, docToDelete.path);
      await deleteObject(fileRef);

      // 2. Delete from Firestore
      const updatedDocuments = student.documents?.filter(d => d.path !== docToDelete.path);
      await updateStudent({ ...student, documents: updatedDocuments });
      
      toast({
        title: 'Document Deleted',
        description: `${docToDelete.name} has been removed.`,
      });

    } catch(error) {
      console.error("Error deleting document:", error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the document. Please check storage rules and try again.',
        variant: 'destructive',
      });
    }
  };


  // The context's student list is empty on the first render while it loads.
  if (students.length === 0 && !student) {
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
                            disabled={!canEdit || isSaving}
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
                    Manage and view documents for this student.
                </CardDescription>
            </CardHeader>
            <CardContent>
              {student.documents && student.documents.length > 0 ? (
                <div className="space-y-2">
                  {student.documents.map((doc) => (
                    <div key={doc.path} className="flex items-center justify-between p-2 rounded-md border group">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline truncate">
                        <File className="h-4 w-4" />
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
                                This will permanently delete the document: {doc.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDocument(doc)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No documents uploaded for this student.</p>
                </div>
              )}
            </CardContent>
            {canEdit && (
              <CardFooter className="border-t pt-6">
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload New Document'}
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
