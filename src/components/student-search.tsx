'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudents } from '@/contexts/StudentsContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from './ui/sidebar';

export function StudentSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { students: allStudents, currentUser } = useStudents();
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();

  // The useStudents context already correctly scopes the students for the current user role
  const canSearch = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const filteredStudents = searchQuery
    ? allStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allStudents;

  const handleSelectStudent = (studentId: string) => {
    router.push(`/student/${studentId}`);
    setIsOpen(false);
    if(isMobile) {
        setOpenMobile(false);
    }
  };
  
  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!canSearch) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-sm text-muted-foreground">
                <Search className="mr-2 h-4 w-4" />
                <span>Search students...</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="p-0 gap-0 max-w-lg">
            <DialogHeader className="sr-only">
              <DialogTitle>Search Students</DialogTitle>
              <DialogDescription>
                Start typing a student's name to search and navigate to their profile.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center px-4 py-2 border-b">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 border-none shadow-none focus-visible:ring-0 text-base"
                    autoFocus
                />
            </div>
            <ScrollArea className="h-[50vh] max-h-[400px]">
                <div className="p-2">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                        <div
                            key={student.id}
                            onClick={() => handleSelectStudent(student.id)}
                            className="flex items-center gap-3 p-2 rounded-md w-full text-left hover:bg-accent transition-colors cursor-pointer"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint={student.aiHint} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.instrument}</p>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            <p>No students found.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
  );
}
