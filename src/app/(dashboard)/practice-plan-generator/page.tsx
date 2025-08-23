
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generatePracticePlan } from '@/ai/flows/generate-practice-plan';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Sparkles, Copy } from 'lucide-react';

const formSchema = z.object({
  instrument: z.string().min(1, { message: 'Please select an instrument.' }),
  skillLevel: z.string().min(1, { message: 'Please select a skill level.' }),
  studentGoals: z.string().min(10, { message: 'Goals must be at least 10 characters.' }),
  pastLessons: z.string().min(10, { message: 'Past lessons summary must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PracticePlanGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [practicePlan, setPracticePlan] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instrument: '',
      skillLevel: '',
      studentGoals: '',
      pastLessons: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setPracticePlan(null);
    try {
      const result = await generatePracticePlan(values);
      setPracticePlan(result.practicePlan);
    } catch (error) {
      console.error('Error generating practice plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate practice plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (practicePlan) {
      navigator.clipboard.writeText(practicePlan);
      toast({
        title: 'Copied!',
        description: 'The practice plan has been copied to your clipboard.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Bot className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">AI Practice Plan Generator</h1>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>Fill in the details to generate a personalized plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="instrument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrument</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an instrument" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Guitar">Guitar</SelectItem>
                          <SelectItem value="Piano">Piano</SelectItem>
                          <SelectItem value="Violin">Violin</SelectItem>
                          <SelectItem value="Drums">Drums</SelectItem>
                          <SelectItem value="Bass">Bass</SelectItem>
                          <SelectItem value="Ukulele">Ukulele</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student's Goals</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Prepare for a recital, learn a specific song..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pastLessons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Lessons Summary</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Covered major scales, worked on timing..." {...field} />
                      </FormControl>
                      <FormDescription>
                        What have you been working on recently?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                     <Sparkles className="mr-2 h-4 w-4" />
                      Generate Plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generated Practice Plan</CardTitle>
            <CardDescription>Your AI-powered plan will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center relative">
            {isLoading ? (
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2 mx-auto" />
                <p>Generating your personalized plan...</p>
              </div>
            ) : practicePlan ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap w-full">
                  {practicePlan}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Fill out the form to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
