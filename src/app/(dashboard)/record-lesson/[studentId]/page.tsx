'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudents } from '@/contexts/StudentsContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Mic, StopCircle, User, Redo, Save, AlertTriangle, ChevronRight, MicOff, ListMusic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeLesson } from '@/ai/flows/summarize-lesson-flow';
import type { ProgressLog, Student } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

type WizardStep = 'selectDevice' | 'recording' | 'processing' | 'review';

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function RecordLessonPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const studentId = params.studentId as string;
  const { getStudentById, updateStudent, currentUser } = useStudents();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [step, setStep] = useState<WizardStep>('selectDevice');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch student data
  useEffect(() => {
    const fetchedStudent = getStudentById(studentId);
    if (fetchedStudent) {
      setStudent(fetchedStudent);
    } else {
       // If student not found in context (e.g., on page refresh), it might still be loading
       // This is a basic handling, a more robust solution might involve a global loading state
       setTimeout(() => {
         const refetched = getStudentById(studentId);
         if(refetched) setStudent(refetched)
       }, 1000)
    }
  }, [studentId, getStudentById]);

  // Get audio devices
  useEffect(() => {
    async function getAudioDevices() {
      try {
        // Prompt for permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = allDevices.filter(
          (device) => device.kind === 'audioinput'
        );
        setDevices(audioInputDevices);
        if (audioInputDevices.length > 0) {
          setSelectedDeviceId(audioInputDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting audio devices:', error);
        toast({
          title: 'Microphone Access Denied',
          description:
            'Please allow microphone access in your browser settings to record lessons.',
          variant: 'destructive',
        });
      }
    }
    getAudioDevices();
  }, [toast]);

  const startRecording = async () => {
    if (!selectedDeviceId) {
      toast({
        title: 'No microphone selected',
        description: 'Please select a microphone to start recording.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: selectedDeviceId } },
      });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setStep('processing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert Blob to Data URI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async function () {
          const base64Audio = reader.result as string;
           try {
            const result = await summarizeLesson({
              audioDataUri: base64Audio,
              studentName: student?.name || 'the student',
              instrument: student?.instrument || 'the instrument'
            });
            setSummary(result.summary);
            setStep('review');
          } catch (e) {
             console.error(e);
             toast({ title: 'Transcription Failed', description: 'Could not process the audio. Please try again.', variant: 'destructive'});
             setStep('recording'); // Go back to recording step
          }
        };

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStep('recording');
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: 'Recording Error',
        description: 'Could not start recording. Please check your microphone permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleSave = async () => {
     if (!summary || !student) return;
     setIsSaving(true);
     
     const newHistoryEntry: ProgressLog = {
      date: new Date().toISOString(),
      notes: summary,
      progress: student.progress, // We don't update progress here, just log the lesson
    };

    const updatedStudent: Student = {
      ...student,
      progressHistory: [...(student.progressHistory || []), newHistoryEntry],
    };

    try {
      await updateStudent(updatedStudent);
      toast({
        title: 'Success!',
        description: 'Lesson summary has been saved to the student\'s progress history.',
      });
      router.push(`/student/${student.id}`);
    } catch (error) {
       console.error("Failed to save summary:", error);
        toast({
            title: "Save Failed",
            description: "Could not save the summary.",
            variant: "destructive"
        })
    } finally {
        setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSummary('');
    setRecordingTime(0);
    setStep('selectDevice');
  };
  
  if (!student) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading student data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
       <CardHeader className="p-0">
          <CardTitle className="text-3xl font-bold font-headline flex items-center gap-3">
             <ListMusic className="w-8 h-8 text-primary" />
             Record Lesson for {student.name}
          </CardTitle>
          <CardDescription>
            Record, transcribe, and summarize a music lesson in three simple steps.
          </CardDescription>
        </CardHeader>
        
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
            >
                {step === 'selectDevice' && (
                    <Card>
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mic className="w-5 h-5"/> Step 1: Select Your Microphone</CardTitle>
                        </CardHeader>
                        <CardContent>
                        {devices.length > 0 ? (
                            <Select onValueChange={setSelectedDeviceId} value={selectedDeviceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a microphone" />
                            </SelectTrigger>
                            <SelectContent>
                                {devices.map((device) => (
                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Microphone ${devices.indexOf(device) + 1}`}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        ) : (
                             <Alert variant="destructive">
                                <MicOff className="h-4 w-4" />
                                <AlertTitle>No Microphones Found</AlertTitle>
                                <AlertDescription>
                                    Please ensure you have a microphone connected and have granted permission for this site to access it.
                                </AlertDescription>
                            </Alert>
                        )}
                        </CardContent>
                        <CardFooter>
                        <Button onClick={startRecording} disabled={!selectedDeviceId || devices.length === 0} className="w-full">
                            Start Recording <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 'recording' && (
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 justify-center"><StopCircle className="w-5 h-5 text-red-500 animate-pulse"/> Step 2: Recording in Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="text-6xl font-mono font-bold text-primary">
                                {formatTime(recordingTime)}
                            </div>
                            <p className="text-muted-foreground">The lesson is being recorded. Click stop when finished.</p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={stopRecording} variant="destructive" className="w-full">
                                <StopCircle className="mr-2 h-4 w-4" />
                                Stop Recording
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 'processing' && (
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle>Processing Audio</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4 py-8">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-muted-foreground">Please wait while we transcribe and summarize the lesson...</p>
                        </CardContent>
                    </Card>
                )}
                
                {step === 'review' && (
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Step 3: Review Summary</CardTitle>
                             <CardDescription>Review the generated summary. You can save it to the student's log or discard it and start over.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none rounded-md border p-4 h-64 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                             <Button variant="outline" onClick={handleDiscard}>
                                <Redo className="mr-2 h-4 w-4" />
                                Discard & Restart
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                {isSaving ? 'Saving...' : 'Save to Log'}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

            </motion.div>
        </AnimatePresence>
    </div>
  );
}
