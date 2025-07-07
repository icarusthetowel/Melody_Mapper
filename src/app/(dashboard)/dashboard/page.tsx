
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Student, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Music, PlusCircle, Trash2, Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudents } from '@/contexts/StudentsContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const StudentCard = ({
  student,
  onDelete,
  teachers,
  onAssignTeacher,
}: {
  student: Student;
  onDelete?: (studentId: string) => void;
  teachers?: User[];
  onAssignTeacher?: (studentId: string, teacherId: string | null) => void;
}) => (
  <Card className="flex flex-col w-full hover:shadow-lg transition-shadow duration-200 relative group h-full">
    {onDelete && (
      <div onClick={(e) => e.stopPropagation()}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete {student.name}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {student.name} and all their associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(student.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )}
    <CardHeader className="flex items-center gap-4 flex-row">
      <Avatar className="h-12 w-12">
        <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint={student.aiHint} />
        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <CardTitle>{student.name}</CardTitle>
        <CardDescription>{student.instrument}</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>Progress</span>
        <span>{student.progress}%</span>
      </div>
      <Progress value={student.progress} aria-label={`${student.name}'s progress`} />
    </CardContent>
    {onAssignTeacher && teachers && (
      <CardFooter>
        <div className="w-full" onClick={(e) => e.stopPropagation()}>
          <Label htmlFor={`teacher-select-${student.id}`} className="text-xs text-muted-foreground">Assign Teacher</Label>
          <Select
            defaultValue={student.teacherId || 'none'}
            onValueChange={(value) => onAssignTeacher(student.id, value === 'none' ? null : value)}
          >
            <SelectTrigger id={`teacher-select-${student.id}`} className="h-9 mt-1">
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.uid} value={teacher.email}>{teacher.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    )}
  </Card>
);


const AdminDashboard = ({ allStudents, addStudent, assignTeacher, deleteStudent }: { allStudents: Student[]; addStudent: (data: any) => void; assignTeacher: (studentId: string, teacherId: string | null) => void; deleteStudent: (studentId: string) => void; }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentInstrument, setNewStudentInstrument] = useState<'Guitar' | 'Piano' | 'Violin' | 'Drums'>('Piano');
  const [teachers, setTeachers] = useState<User[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersCollectionRef = collection(db, 'users');
        const q = query(teachersCollectionRef, where('role', '==', 'teacher'));
        const querySnapshot = await getDocs(q);
        const teachersData = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[];
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast({
            title: "Error Loading Teachers",
            description: "Could not load the list of teachers. Check console for details.",
            variant: "destructive"
        });
      }
    };
    fetchTeachers();
  }, [toast]);

  const handleRegisterStudent = () => {
    if (!newStudentName || !newStudentInstrument) return;
    
    addStudent({
      name: newStudentName,
      instrument: newStudentInstrument,
      progress: 0,
      avatarUrl: 'https://placehold.co/100x100.png',
      aiHint: 'person student',
      teacherId: null,
    });
    setNewStudentName('');
    setNewStudentInstrument('Piano');
    setIsDialogOpen(false);
  };
  
  const handleCardClick = (studentId: string) => {
    router.push(`/student/${studentId}`);
  };
  
  const instruments = allStudents.reduce((acc, student) => {
    if (!acc.includes(student.instrument)) {
      acc.push(student.instrument);
    }
    return acc;
  }, [] as Array<'Guitar' | 'Piano' | 'Violin' | 'Drums'>);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Students" value={allStudents.length.toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Upcoming Lessons" value="3" icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Instruments" value={instruments.length.toString()} icon={<Music className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-headline">All Student Progress</h2>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Add a new student to the platform. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="col-span-3" placeholder="Ella Vance" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="instrument" className="text-right">
                      Instrument
                    </Label>
                     <Select onValueChange={(value) => setNewStudentInstrument(value as 'Guitar' | 'Piano' | 'Violin' | 'Drums')} defaultValue={newStudentInstrument}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select instrument" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Piano">Piano</SelectItem>
                          <SelectItem value="Guitar">Guitar</SelectItem>
                          <SelectItem value="Violin">Violin</SelectItem>
                          <SelectItem value="Drums">Drums</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRegisterStudent}>Save student</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allStudents.map((student) => (
              <div
                onClick={() => handleCardClick(student.id)}
                key={student.id}
                className="flex cursor-pointer"
              >
                <StudentCard
                  student={student}
                  onDelete={deleteStudent}
                  teachers={teachers}
                  onAssignTeacher={assignTeacher}
                />
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

const TeacherDashboard = ({ allStudents, addStudent, deleteStudent, currentUserEmail }: { allStudents: Student[]; addStudent: (data: any) => void; deleteStudent: (studentId: string) => void; currentUserEmail: string | null; }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentInstrument, setNewStudentInstrument] = useState<'Guitar' | 'Piano' | 'Violin' | 'Drums'>('Piano');
  const router = useRouter();

  // The student list is already filtered by the context provider
  const students = allStudents;

  const handleRegisterStudent = () => {
    if (!newStudentName || !newStudentInstrument || !currentUserEmail) return;
    
    addStudent({
      name: newStudentName,
      instrument: newStudentInstrument,
      progress: 0,
      avatarUrl: 'https://placehold.co/100x100.png',
      aiHint: 'person student',
      teacherId: currentUserEmail,
    });

    setNewStudentName('');
    setNewStudentInstrument('Piano');
    setIsDialogOpen(false);
  };
  
  const handleCardClick = (studentId: string) => {
    router.push(`/student/${studentId}`);
  };
  
  const instruments = students.reduce((acc, student) => {
    if (!acc.includes(student.instrument)) {
      acc.push(student.instrument);
    }
    return acc;
  }, [] as Array<'Guitar' | 'Piano' | 'Violin' | 'Drums'>);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="My Students" value={students.length.toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Upcoming Lessons" value="0" icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Instruments" value={instruments.length.toString()} icon={<Music className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-headline">My Student Progress</h2>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Add a new student to your roster. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="col-span-3" placeholder="Ella Vance" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="instrument" className="text-right">
                      Instrument
                    </Label>
                     <Select onValueChange={(value) => setNewStudentInstrument(value as 'Guitar' | 'Piano' | 'Violin' | 'Drums')} defaultValue={newStudentInstrument}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select instrument" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Piano">Piano</SelectItem>
                          <SelectItem value="Guitar">Guitar</SelectItem>
                          <SelectItem value="Violin">Violin</SelectItem>
                          <SelectItem value="Drums">Drums</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRegisterStudent}>Save student</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        {students.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {students.map((student) => (
              <div
                onClick={() => handleCardClick(student.id)}
                key={student.id}
                className="flex cursor-pointer"
              >
                <StudentCard student={student} onDelete={deleteStudent} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-10 text-center">
            <CardHeader>
                <CardTitle>No students yet!</CardTitle>
                <CardDescription>Click "Add Student" to add your first student, or wait for an Admin to assign one to you.</CardDescription>
            </CardHeader>
            <CardContent>
                <PlusCircle className="h-12 w-12 text-muted-foreground" />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};


export default function DashboardPage() {
  const { students, addStudent, assignTeacher, deleteStudent, currentUser } = useStudents();
  
  const getDashboardTitle = () => {
    if (currentUser?.role === 'admin') return 'Admin Dashboard';
    if (currentUser?.role === 'teacher') return 'Student/Teacher Dashboard';
    return 'Dashboard';
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">{getDashboardTitle()}</h1>
      {currentUser?.role === 'admin' ? 
        <AdminDashboard allStudents={students} addStudent={addStudent} assignTeacher={assignTeacher} deleteStudent={deleteStudent} /> : 
        <TeacherDashboard allStudents={students} addStudent={addStudent} deleteStudent={deleteStudent} currentUserEmail={currentUser?.email || null} />}
    </div>
  );
}
