import { add } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Lesson } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const today = new Date();
const lessons: Lesson[] = [
  {
    id: '1',
    studentName: 'Ella Vance',
    instrument: 'Piano',
    date: today,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'girl smiling'
  },
  {
    id: '2',
    studentName: 'Liam Foster',
    instrument: 'Guitar',
    date: add(today, { days: 1 }),
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy playing guitar'
  },
  {
    id: '3',
    studentName: 'Noah Hayes',
    instrument: 'Piano',
    date: add(today, { days: 3 }),
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy glasses'
  },
];

export default function SchedulePage() {
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
              <Calendar
                mode="single"
                selected={today}
                className="rounded-md border w-full"
                modifiers={{ booked: lessons.map(l => l.date) }}
                modifiersStyles={{
                    booked: { 
                        border: '2px solid hsl(var(--primary))',
                        borderRadius: 'var(--radius)'
                    }
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={lesson.avatarUrl} alt={lesson.studentName} data-ai-hint={lesson.aiHint} />
                      <AvatarFallback>
                        {lesson.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold">{lesson.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.instrument}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-medium">{lesson.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                       <p className="text-xs text-muted-foreground">3:00 PM</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
