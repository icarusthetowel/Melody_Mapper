'use server';

/**
 * @fileOverview A conversational AI chatbot for Melody Mapper.
 *
 * - chat - A function that handles chatbot conversations.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })),
  message: z.string().describe('The latest message from the user.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;


const ChatOutputSchema = z.object({
  message: z.string().describe('The chatbot\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, message }) => {
    const chat = ai.getChat({
        model: 'googleai/gemini-2.0-flash',
        history,
        system: `You are a friendly and helpful AI assistant for an application called Melody Mapper.
        
        Melody Mapper is a web app that helps music teachers and students manage lessons, track progress, and schedule events.
        
        The available roles are:
        - Admin: Can manage all students and teachers.
        - Teacher: Can manage their own students, log progress, schedule lessons, and generate AI practice plans.
        - Student: Can view their own progress, documents, and upcoming lessons.
        
        Keep your answers concise and helpful. Guide users on how to use the app. Do not make up features that don't exist.`
    });

    const response = await chat.send(message);

    return {
      message: response.text,
    };
  }
);
