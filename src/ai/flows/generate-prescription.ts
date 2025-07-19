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
  drugName: z.string().describe('The name of the drug.'),
  dosage: z.string().describe('The dosage of the drug (e.g., 500mg).'),
  frequency: z.string().describe('How often to take the drug (e.g., Twice a day).'),
  duration: z.string().describe('How long to take the drug for (e.g., 5 days).'),
  instructions: z.string().optional().describe('Additional instructions (e.g., After food).'),
});

export type GeneratePrescriptionInput = z.infer<typeof GeneratePrescriptionInputSchema>;

const GeneratePrescriptionOutputSchema = z.object({
  prescriptionTable: z
    .string()
    .describe(
      'A structured table (using markdown) representing the prescription, with columns for Medicine, Dosage, Frequency, Duration, and Instructions.'
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

  The doctor will provide you with structured data for a prescription.
  Your task is to convert this into a single-row structured prescription table, using Markdown format.

  The table should have the following columns:
  - Medicine: The name of the medicine.
  - Dosage: The dosage of the medicine.
  - Frequency: When the medicine should be taken (e.g., twice a day).
  - Duration: How many days the medicine should be taken for.
  - Instructions: Additional notes for the patient.

  Here's the doctor's input:
  Drug Name: {{drugName}}
  Dosage: {{dosage}}
  Frequency: {{frequency}}
  Duration: {{duration}}
  Instructions: {{instructions}}

  Please generate the prescription table in Markdown format with a header and one data row:
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
