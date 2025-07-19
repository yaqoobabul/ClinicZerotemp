// 'use server';

/**
 * @fileOverview Prescription generation flow.
 *
 * - generatePrescription - A function that generates a structured prescription from free text.
 * - GeneratePrescriptionInput - The input type for the generatePrescription function.
 * - GeneratePrescriptionOutput - The return type for the generatePrescription function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePrescriptionInputSchema = z.object({
  speechInput: z
    .string()
    .describe("The doctor's spoken words, transcribed to text, describing the prescription."),
});

export type GeneratePrescriptionInput = z.infer<typeof GeneratePrescriptionInputSchema>;

const GeneratePrescriptionOutputSchema = z.object({
  prescriptionTable: z
    .string()
    .describe(
      'A structured table (using markdown) representing the prescription, with columns for Medicine, Dosage, Timing, and Duration (Days).'
    ),
});

export type GeneratePrescriptionOutput = z.infer<typeof GeneratePrescriptionOutputSchema>;

export async function generatePrescription(input: GeneratePrescriptionInput): Promise<GeneratePrescriptionOutput> {
  return generatePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrescriptionPrompt',
  input: {schema: GeneratePrescriptionInputSchema},
  output: {schema: GeneratePrescriptionOutputSchema},
  prompt: `You are an AI assistant helping doctors generate prescriptions quickly.

  The doctor will provide you with a free-text description of the prescription they want to create.
  Your task is to convert this into a structured prescription table, using Markdown format.

  The table should have the following columns:
  - Medicine: The name of the medicine.
  - Dosage: The dosage of the medicine.
  - Timing: When the medicine should be taken (e.g., morning, evening, before meals).
  - Duration (Days): How many days the medicine should be taken for.

  Here's the doctor's description:
  {{speechInput}}

  Please generate the prescription table in Markdown format:
  `,
});

const generatePrescriptionFlow = ai.defineFlow(
  {
    name: 'generatePrescriptionFlow',
    inputSchema: GeneratePrescriptionInputSchema,
    outputSchema: GeneratePrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
