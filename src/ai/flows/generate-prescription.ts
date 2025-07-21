
'use server';

/**
 * @fileOverview OPD summary generation flow.
 *
 * - generatePrescription - A function that generates a structured OPD summary.
 * - GeneratePrescriptionInput - The input type for the generatePrescription function.
 * - GeneratePrescriptionOutput - The return type for the generatePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GeneratePrescriptionInputSchema = z.object({
  patientName: z.string().describe("The patient's full name."),
  patientAge: z.string().describe("The patient's age."),
  patientSex: z.string().describe("The patient's sex."),
  provisionalDiagnosis: z.string().describe('The provisional diagnosis for the patient.'),
  toothChartNotes: z.string().optional().describe('Notes related to specific teeth, e.g., "#16-Caries, #24-RCT".'),
  medicines: z.array(z.object({
      name: z.string().describe('The name of the drug.'),
      dosage: z.string().describe('The dosage of the drug (e.g., 500mg).'),
      frequency: z.string().describe('How often to take the drug (e.g., 2 time(s) daily).'),
      duration: z.string().describe('How long to take the drug for (e.g., 5 days).'),
      instructions: z.string().optional().describe('Additional instructions (e.g., After food).'),
  })).optional(),
  radiographsAdvised: z.array(z.object({
    type: z.string().describe('The type of radiograph advised.'),
    toothNumber: z.string().optional().describe('The tooth number for the radiograph.'),
  })).optional().describe('Radiographic tests advised.'),
  testsAdvised: z.array(z.string()).optional().describe('Any diagnostic lab tests that are advised.'),
  additionalNotes: z.string().optional().describe('Any additional notes for the patient.'),
  followUpDate: z.string().optional().describe('The recommended follow-up date.'),
});

export type GeneratePrescriptionInput = z.infer<typeof GeneratePrescriptionInputSchema>;

const GeneratePrescriptionOutputSchema = z.object({
  opdSummary: z.object({
    patientDetails: z.object({
      name: z.string(),
      age: z.string(),
      sex: z.string(),
    }),
    provisionalDiagnosis: z.string(),
    toothChartNotes: z.string().optional(),
    prescriptionTable: z
      .string()
      .optional()
      .describe(
        'A structured markdown table representing the prescription, with columns for Medicine, Dosage, Frequency, Duration, and Instructions. This should only be generated if medicines are provided.'
      ),
    testsAdvised: z.string().optional().describe('A comma-separated string of all tests advised.'),
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

{{#if medicines}}
The prescription table should be in Markdown format with a header and one row for each medicine.
{{/if}}

User Input:
Patient Name: {{patientName}}
Patient Age: {{patientAge}}
Patient Sex: {{patientSex}}
Provisional Diagnosis: {{provisionalDiagnosis}}
{{#if toothChartNotes}}Tooth Chart Notes: {{toothChartNotes}}{{/if}}
{{#if radiographsAdvised}}
Radiographs Advised:
{{#each radiographsAdvised}}
- Type: {{type}}{{#if toothNumber}}, Tooth: {{toothNumber}}{{/if}}
{{/each}}
{{/if}}
Tests Advised: {{#if testsAdvised}} {{#each testsAdvised}} {{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
Additional Notes: {{additionalNotes}}
Follow-up Date: {{followUpDate}}

{{#if medicines}}
Medicines:
{{#each medicines}}
- Medicine: {{name}}, Dosage: {{dosage}}, Frequency: {{frequency}}, Duration: {{duration}}, Instructions: {{instructions}}
{{/each}}
{{/if}}

Generate the final OPD summary object.
Combine both radiographs and other tests into the 'testsAdvised' field as a single comma-separated string.
For radiographs, format them as "Type (Tooth: #number)" or just "Type" if no tooth number is given.
If tooth chart notes are provided, include them.
If no medicines are provided, do not generate the prescriptionTable field.
`,
});


const generatePrescriptionFlow = ai.defineFlow(
  {
    name: 'generatePrescriptionFlow',
    inputSchema: GeneratePrescriptionInputSchema,
    outputSchema: GeneratePrescriptionOutputSchema,
  },
  async (input) => {
    // If there are no medicines, and all the fields inside each medicine are empty strings, remove it.
    // This is to prevent the AI from generating a table for an empty row.
    if (input.medicines && input.medicines.length > 0) {
      const allEmpty = input.medicines.every(m => !m.name && !m.dosage && !m.frequency && !m.duration && !m.instructions);
      if (allEmpty) {
        input.medicines = [];
      }
    }

    // Pre-process tests to combine them for the prompt
    let combinedTests: string[] = [];
    if (input.radiographsAdvised) {
      const radiographStrings = input.radiographsAdvised.map(r => {
        return r.toothNumber ? `${r.type} (w.r.t #${r.toothNumber})` : r.type;
      });
      combinedTests.push(...radiographStrings);
    }
    if (input.testsAdvised) {
      combinedTests.push(...input.testsAdvised);
    }

    const modifiedInput = { ...input, testsAdvised: combinedTests };


    const {output} = await prompt(modifiedInput);
    if (!output) {
      throw new Error('Failed to generate OPD summary');
    }
    return output;
  }
);
