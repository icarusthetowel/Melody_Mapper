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
import { Users, Calendar, Music } from 'lucide-react';
import Image from 'next/image';

const students: Student[] = [
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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Students" value="4" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Upcoming Lessons" value="3" icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Instruments" value="2" icon={<Music className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Student Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Welcome to Melody Mapper!</CardTitle>
            <CardDescription>Here's a quick guide to get you started.</CardDescription>
        </CardHeader>
        <CardContent>
            <Image src="https://placehold.co/1200x400.png" alt="Music lesson" data-ai-hint="music lesson" width={1200} height={400} className="rounded-lg mb-4" />
            <p className="text-muted-foreground">
                Use the navigation on the left to view your student dashboard, check your schedule, and generate AI-powered practice plans to help your students excel.
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
