
'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ToothNote = {
  tooth: string;
  note: string;
};

interface ToothChartProps {
  value: ToothNote[];
  onChange: (value: ToothNote[]) => void;
}

const adultUpperRight = ['8', '7', '6', '5', '4', '3', '2', '1'];
const adultUpperLeft = ['1', '2', '3', '4', '5', '6', '7', '8'];
const adultLowerRight = ['8', '7', '6', '5', '4', '3', '2', '1'];
const adultLowerLeft = ['1', '2', '3', '4', '5', '6', '7', '8'];

const primaryUpperRight = ['V', 'IV', 'III', 'II', 'I'];
const primaryUpperLeft = ['I', 'II', 'III', 'IV', 'V'];
const primaryLowerRight = ['V', 'IV', 'III', 'II', 'I'];
const primaryLowerLeft = ['I', 'II', 'III', 'IV', 'V'];

const toothConditions = [
  "Decayed",
  "Grossly Decayed",
  "Restored",
  "mobile",
  "root stumps",
  "RCT treated",
  "missing",
  "fractured",
  "impacted",
];

const getQuadrantPrefix = (teethArray: string[]) => {
  if (teethArray === adultUpperRight) return 'UR';
  if (teethArray === adultUpperLeft) return 'UL';
  if (teethArray === adultLowerRight) return 'LR';
  if (teethArray === adultLowerLeft) return 'LL';
  if (teethArray === primaryUpperRight) return 'PUR';
  if (teethArray === primaryUpperLeft) return 'PUL';
  if (teethArray === primaryLowerRight) return 'PLR';
  if (teethArray === primaryLowerLeft) return 'PLL';
  return '';
};


const Tooth: React.FC<{
  number: string;
  note: string;
  onNoteChange: (note: string) => void;
  isPrimary?: boolean;
}> = ({ number, note, onNoteChange, isPrimary }) => (
  <div className="flex flex-col items-center gap-1 text-center">
    <div className={cn("h-6 flex items-center justify-center font-semibold text-sm", isPrimary ? 'text-muted-foreground' : 'text-foreground')}>
      {number}
    </div>
    <Select value={note} onValueChange={(value) => onNoteChange(value === "none" ? "" : value)}>
      <SelectTrigger
        className={cn(
            "h-8 w-10 text-xs p-1",
            note && "bg-accent text-accent-foreground"
        )}
        aria-label={`Note for tooth ${number}`}
      >
        <SelectValue placeholder="-" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none"> - </SelectItem>
        {toothConditions.map(condition => (
          <SelectItem key={condition} value={condition}>{condition}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const Quadrant: React.FC<{
  teeth: string[];
  notes: ToothNote[];
  onNoteChange: (tooth: string, note: string) => void;
  isPrimary?: boolean;
  reverse?: boolean;
}> = ({ teeth, notes, onNoteChange, isPrimary, reverse = false }) => {
  const orderedTeeth = reverse ? [...teeth].reverse() : teeth;
  const quadrantPrefix = getQuadrantPrefix(teeth);

  return (
    <div className="flex gap-1">
      {orderedTeeth.map((toothNumber) => {
        const fullToothId = `${quadrantPrefix}${toothNumber}`;
        return (
            <Tooth
            key={fullToothId}
            number={toothNumber}
            note={notes.find((n) => n.tooth === fullToothId)?.note || ''}
            onNoteChange={(note) => onNoteChange(fullToothId, note)}
            isPrimary={isPrimary}
            />
        )
      })}
    </div>
  );
};


export const ToothChart: React.FC<ToothChartProps> = ({ value, onChange }) => {
    const handleNoteChange = (tooth: string, noteText: string) => {
        const existingNoteIndex = value.findIndex((n) => n.tooth === tooth);
        let newNotes = [...value];

        if (noteText === '') {
            // If the note is cleared, remove it from the array
            if (existingNoteIndex > -1) {
                newNotes.splice(existingNoteIndex, 1);
            }
        } else {
            if (existingNoteIndex > -1) {
                // If note exists, update it
                newNotes[existingNoteIndex] = { ...newNotes[existingNoteIndex], note: noteText };
            } else {
                // If note doesn't exist, add it
                newNotes.push({ tooth, note: noteText });
            }
        }
        onChange(newNotes);
    };

    return (
        <div className="p-2 border rounded-lg bg-muted/20 overflow-x-auto">
            <div className="space-y-4 inline-block min-w-full">
                {/* Adult Teeth */}
                <h3 className="text-sm font-medium text-center">Permanent Dentition</h3>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex justify-center gap-1 md:gap-2">
                        <Quadrant teeth={adultUpperRight} notes={value} onNoteChange={handleNoteChange} reverse />
                        <div className="border-l-2 border-gray-400 mx-1"></div>
                        <Quadrant teeth={adultUpperLeft} notes={value} onNoteChange={handleNoteChange} />
                    </div>
                    <div className="border-b-2 border-gray-400 my-2 w-full max-w-lg mx-auto"></div>
                    <div className="flex justify-center gap-1 md:gap-2">
                        <Quadrant teeth={adultLowerRight} notes={value} onNoteChange={handleNoteChange} reverse />
                        <div className="border-l-2 border-gray-400 mx-1"></div>
                        <Quadrant teeth={adultLowerLeft} notes={value} onNoteChange={handleNoteChange} />
                    </div>
                </div>

                <hr className="my-4 border-dashed" />

                {/* Primary Teeth */}
                <h3 className="text-sm font-medium text-center">Primary Dentition</h3>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex justify-center gap-1 md:gap-2">
                        <Quadrant teeth={primaryUpperRight} notes={value} onNoteChange={handleNoteChange} isPrimary reverse/>
                        <div className="border-l-2 border-gray-400 mx-1"></div>
                        <Quadrant teeth={primaryUpperLeft} notes={value} onNoteChange={handleNoteChange} isPrimary />
                    </div>
                     <div className="border-b-2 border-gray-400 my-2 w-full max-w-sm mx-auto"></div>
                    <div className="flex justify-center gap-1 md:gap-2">
                        <Quadrant teeth={primaryLowerRight} notes={value} onNoteChange={handleNoteChange} isPrimary reverse/>
                        <div className="border-l-2 border-gray-400 mx-1"></div>
                        <Quadrant teeth={primaryLowerLeft} notes={value} onNoteChange={handleNoteChange} isPrimary />
                    </div>
                </div>
            </div>
        </div>
    );
};
