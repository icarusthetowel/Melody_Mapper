'use client';

import { add } from 'date-fns';
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
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const lessonTemplates = [
  {
    id: '1',
    studentName: 'Ella Vance',
    instrument: 'Piano' as const,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'girl smiling',
    dateOffset: 0,
  },
  {
    id: '2',
    studentName: 'Liam Foster',
    instrument: 'Guitar' as const,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy playing guitar',
    dateOffset: 1,
  },
  {
    id: '3',
    studentName: 'Noah Hayes',
    instrument: 'Piano' as const,
    avatarUrl: 'https://placehold.co/100x100.png',
    aiHint: 'boy glasses',
    dateOffset: 3,
  },
];

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    const generatedLessons = lessonTemplates.map((t) => ({
      ...t,
      date: add(now, { days: t.dateOffset }),
    }));
    setLessons(generatedLessons);
    setSelectedDate(now);
  }, []);

  if (!isClient) {
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
                <Skeleton className="w-full h-[338px] rounded-md" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Lessons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
                modifiers={{ booked: lessons.map((l) => l.date) }}
                modifiersStyles={{
                  booked: {
                    border: '2px solid hsl(var(--primary))',
                    borderRadius: 'var(--radius)',
                  },
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
                      <AvatarImage
                        src={lesson.avatarUrl}
                        alt={lesson.studentName}
                        data-ai-hint={lesson.aiHint}
                      />
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
                      <p className="text-sm font-medium">
                        {lesson.date.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
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
