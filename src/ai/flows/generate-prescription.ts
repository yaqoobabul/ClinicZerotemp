'use server';

/**
 * @fileOverview OPD summary generation flow.
 *
 * - generatePrescription - A function that generates a structured OPD summary.
 * - GeneratePrescriptionInput - The input type for the generatePrescription function.
 * - GeneratePrescriptionOutput - The return type for the generatePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePrescriptionInputSchema = z.object({
  patientName: z.string().describe("The patient's full name."),
  patientAge: z.string().describe("The patient's age."),
  patientGender: z.string().describe("The patient's gender."),
  provisionalDiagnosis: z.string().describe('The provisional diagnosis for the patient.'),
  medicines: z.array(z.object({
      name: z.string().describe('The name of the drug.'),
      dosage: z.string().describe('The dosage of the drug (e.g., 500mg).'),
      frequency: z.string().describe('How often to take the drug (e.g., Twice a day).'),
      duration: z.string().describe('How long to take the drug for (e.g., 5 days).'),
      instructions: z.string().optional().describe('Additional instructions (e.g., After food).'),
  })),
  testsAdvised: z.string().optional().describe('Any diagnostic tests that are advised.'),
  additionalNotes: z.string().optional().describe('Any additional notes for the patient.'),
  followUpDate: z.string().optional().describe('The recommended follow-up date.'),
});

export type GeneratePrescriptionInput = z.infer<typeof GeneratePrescriptionInputSchema>;

const GeneratePrescriptionOutputSchema = z.object({
  opdSummary: z.object({
    patientDetails: z.object({
      name: z.string(),
      age: z.string(),
      gender: z.string(),
    }),
    provisionalDiagnosis: z.string(),
    prescriptionTable: z
      .string()
      .describe(
        'A structured table (using markdown) representing the prescription, with columns for Medicine, Dosage, Frequency, Duration, and Instructions.'
      ),
    testsAdvised: z.string().optional(),
    additionalNotes: z.string().optional(),
    followUpDate: z.string().optional(),
  })
});

export type GeneratePrescriptionOutput = z.infer<typeof GeneratePrescriptionOutputSchema>;

export async function generatePrescription(input: GeneratePrescriptionInput): Promise<GeneratePrescriptionOutput> {
  return generatePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOpdSummaryPrompt',
  input: {schema: GeneratePrescriptionInputSchema},
  output: {schema: GeneratePrescriptionOutputSchema},
  prompt: `You are an AI assistant helping doctors in India generate OPD summaries.
The user will provide patient details, diagnosis, prescription information, and other notes.
Your task is to structure this information into a clean OPD summary.

The prescription table should be in Markdown format with a header and one row for each medicine.

User Input:
Patient Name: {{patientName}}
Patient Age: {{patientAge}}
Patient Gender: {{patientGender}}
Provisional Diagnosis: {{provisionalDiagnosis}}
Tests Advised: {{testsAdvised}}
Additional Notes: {{additionalNotes}}
Follow-up Date: {{followUpDate}}

Medicines:
{{#each medicines}}
- Medicine: {{name}}, Dosage: {{dosage}}, Frequency: {{frequency}}, Duration: {{duration}}, Instructions: {{instructions}}
{{/each}}

Generate the final OPD summary object.
`,
});


const generatePrescriptionFlow = ai.defineFlow(
  {
    name: 'generatePrescriptionFlow',
    inputSchema: GeneratePrescriptionInputSchema,
    outputSchema: GeneratePrescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate OPD summary');
    }
    return output;
  }
);
