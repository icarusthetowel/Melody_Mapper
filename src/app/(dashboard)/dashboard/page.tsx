'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Music, PlusCircle, UserPlus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const allStudents: Student[] = [
  {
    id: '1',
    name: 'Ella Vance',
    instrument: 'Piano',
    progress: 75,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'girl smiling',
  },
  {
    id: '2',
    name: 'Liam Foster',
    instrument: 'Guitar',
    progress: 40,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy playing guitar'
  },
  {
    id: '3',
    name: 'Noah Hayes',
    instrument: 'Piano',
    progress: 90,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy glasses'
  },
  {
    id: '4',
    name: 'Olivia Chen',
    instrument: 'Guitar',
    progress: 60,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'girl asian'
  },
];

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

const StudentCard = ({ student }: { student: Student }) => (
  <Card className="flex flex-col">
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
  </Card>
);

const AdminDashboard = () => (
  <>
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard title="Total Students" value="4" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
      <StatCard title="Upcoming Lessons" value="3" icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
      <StatCard title="Instruments" value="2" icon={<Music className="h-4 w-4 text-muted-foreground" />} />
    </div>

    <div>
      <h2 className="text-2xl font-bold font-headline mb-4">All Student Progress</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {allStudents.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </div>

     <Card>
      <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>Here's a quick guide to get you started.</CardDescription>
      </CardHeader>
      <CardContent>
          <Image src="https://placehold.co/1200x400.png" alt="Music lesson" data-ai-hint="music lesson" width={1200} height={400} className="rounded-lg mb-4" />
          <p className="text-muted-foreground">
              You can view all student data, schedules, and generate practice plans from the navigation menu.
          </p>
      </CardContent>
     </Card>
  </>
);

const TeacherDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentInstrument, setNewStudentInstrument] = useState<'Guitar' | 'Piano' | 'Violin' | 'Drums'>('Piano');

  const handleRegisterStudent = () => {
    if (!newStudentName || !newStudentInstrument) return;

    const newStudent: Student = {
      id: new Date().toISOString(),
      name: newStudentName,
      instrument: newStudentInstrument,
      progress: Math.floor(Math.random() * 20), // Start with some initial progress
      avatarUrl: 'https://placehold.co/100x100.png',
      aiHint: 'person student',
    };

    setStudents(prev => [...prev, newStudent]);
    setNewStudentName('');
    setNewStudentInstrument('Piano');
    setIsDialogOpen(false);
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
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Register New Student</DialogTitle>
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
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-10 text-center">
            <CardHeader>
                <CardTitle>No students yet!</CardTitle>
                <CardDescription>Click "Register Student" to add your first student and start tracking their progress.</CardDescription>
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
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);
  }, []);

  if (!role) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">{role === 'admin' ? 'Admin Dashboard' : 'Teacher Dashboard'}</h1>
      {role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />}
    </div>
  );
}
