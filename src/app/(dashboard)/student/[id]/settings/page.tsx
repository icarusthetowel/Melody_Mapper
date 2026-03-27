'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudents } from '@/contexts/StudentsContext';
import type { Instrument } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const instruments: Instrument[] = ['Guitar', 'Piano', 'Violin', 'Drums', 'Bass', 'Ukulele'];

export default function StudentSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const studentId = params.id as string;
  const { students, getStudentById, updateStudent, currentUser } = useStudents();

  const student = currentUser?.role === 'student' ? students[0] : getStudentById(studentId);
  const canEdit = currentUser?.role === 'admin' || (currentUser?.role === 'teacher' && student?.teacherId === currentUser?.email);

  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState<Instrument>('Guitar');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setInstrument(student.instrument);
    }
  }, [student]);

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (currentUser && !canEdit) {
      router.push(`/student/${studentId}`);
    }
  }, [currentUser, canEdit, studentId, router]);

  async function handleSave() {
    if (!student || !canEdit || isSaving) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: 'Validation Error',
        description: 'Student name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateStudent({
        ...student,
        name: trimmedName,
        instrument,
      });
      toast({
        title: 'Settings Saved',
        description: `${trimmedName}'s profile has been updated.`,
      });
      router.push(`/student/${studentId}`);
    } catch (error) {
      console.error('Failed to update student settings:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save student settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <Button variant="outline" onClick={() => router.push(`/student/${studentId}`)} className="w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Student Settings</CardTitle>
          <CardDescription>
            Edit {student.name}&apos;s profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="student-name">Name</Label>
            <Input
              id="student-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-instrument">Instrument</Label>
            <Select
              value={instrument}
              onValueChange={(val) => setInstrument(val as Instrument)}
              disabled={isSaving}
            >
              <SelectTrigger id="student-instrument">
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
