'use server';

/**
 * @fileOverview AI agent that transcribes and summarizes a music lesson.
 *
 * - summarizeLesson - A function that handles transcription and summarization.
 * - SummarizeLessonInput - The input type for the summarizeLesson function.
 * - SummarizeLessonOutput - The return type for the summarizeLesson function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const SummarizeLessonInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording of a music lesson, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  studentName: z.string().describe('The name of the student.'),
  instrument: z.string().describe('The instrument the student is playing.'),
});
export type SummarizeLessonInput = z.infer<typeof SummarizeLessonInputSchema>;

const SummarizeLessonOutputSchema = z.object({
  summary: z.string().describe('A structured summary of the lesson, including topics covered, areas for improvement, and practice recommendations. Formatted as Markdown.'),
});
export type SummarizeLessonOutput = z.infer<
  typeof SummarizeLessonOutputSchema
>;

export async function summarizeLesson(
  input: SummarizeLessonInput
): Promise<SummarizeLessonOutput> {
  return summarizeLessonFlow(input);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 48000, // Common browser recording sample rate
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


const summarizeLessonFlow = ai.defineFlow(
  {
    name: 'summarizeLessonFlow',
    inputSchema: SummarizeLessonInputSchema,
    outputSchema: SummarizeLessonOutputSchema,
  },
  async ({ audioDataUri, studentName, instrument }) => {
    
    // 1. Transcribe the audio
    const { text: transcript } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { media: { url: audioDataUri } },
        { text: 'Transcribe this audio of a music lesson.' },
      ],
      config: {
        // Higher temperature for more creative transcription if needed, but 0.2 is good for accuracy
        temperature: 0.2, 
      },
    });

    if (!transcript) {
      throw new Error('Transcription failed. No text was returned from the model.');
    }

    // 2. Summarize the transcript
    const { output: summaryOutput } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are an expert music teacher's assistant. Based on the following lesson transcript for a ${instrument} student named ${studentName}, create a concise, structured lesson summary in Markdown format.

      The summary should include:
      - **Key Topics Covered:** (e.g., specific scales, techniques, or song sections)
      - **Areas for Improvement:** (e.g., timing issues, incorrect fingerings)
      - **Actionable Practice Recommendations:** (e.g., "Practice the C major scale with a metronome at 80 BPM")
      
      Keep the summary professional and easy to read.

      Transcript:
      ---
      ${transcript}
      ---
      `,
      output: {
        schema: z.object({
           summary: z.string().describe('The structured lesson summary in Markdown format.')
        }),
      }
    });

    return summaryOutput!;
  }
);
