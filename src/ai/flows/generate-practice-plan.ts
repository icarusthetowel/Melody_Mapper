'use server';

/**
 * @fileOverview AI agent that generates personalized practice plans for students.
 *
 * - generatePracticePlan - A function that generates practice plans.
 * - GeneratePracticePlanInput - The input type for the generatePracticePlan function.
 * - GeneratePracticePlanOutput - The return type for the generatePracticePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePracticePlanInputSchema = z.object({
  studentGoals: z
    .string()
    .describe('The goals of the student, e.g., prepare for a recital.'),
  skillLevel: z
    .string()
    .describe(
      'The skill level of the student (beginner, intermediate, advanced)'
    ),
  pastLessons: z
    .string()
    .describe('Summary of past lessons and topics covered.'),
  instrument: z
    .string()
    .describe('The musical instrument the student is learning.'),
});
export type GeneratePracticePlanInput = z.infer<
  typeof GeneratePracticePlanInputSchema
>;

const GeneratePracticePlanOutputSchema = z.object({
  practicePlan: z.string().describe('The generated practice plan for the student.'),
});
export type GeneratePracticePlanOutput = z.infer<
  typeof GeneratePracticePlanOutputSchema
>;

export async function generatePracticePlan(
  input: GeneratePracticePlanInput
): Promise<GeneratePracticePlanOutput> {
  return generatePracticePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticePlanPrompt',
  input: {schema: GeneratePracticePlanInputSchema},
  output: {schema: GeneratePracticePlanOutputSchema},
  prompt: `You are an experienced music teacher generating a practice plan for your student.

  Consider the student's goals, skill level, past lessons, and instrument to create a personalized practice plan. Be concise and directive.

  Student Goals: {{{studentGoals}}}
  Skill Level: {{{skillLevel}}}
  Past Lessons: {{{pastLessons}}}
  Instrument: {{{instrument}}}

  Practice Plan:
  `,
});

const generatePracticePlanFlow = ai.defineFlow(
  {
    name: 'generatePracticePlanFlow',
    inputSchema: GeneratePracticePlanInputSchema,
    outputSchema: GeneratePracticePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
