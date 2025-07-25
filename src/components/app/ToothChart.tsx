
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

const adultUpperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
const adultUpperLeft = ['21', '22', '23', '24', '25', '26', '27', '28'];
const adultLowerLeft = ['38', '37', '36', '35', '34', '33', '32', '31'];
const adultLowerRight = ['41', '42', '43', '44', '45', '46', '47', '48'];

const primaryUpperRight = ['55', '54', '53', '52', '51'];
const primaryUpperLeft = ['61', '62', '63', '64', '65'];
const primaryLowerLeft = ['75', '74', '73', '72', '71'];
const primaryLowerRight = ['81', '82', '83', '84', '85'];


const toothConditions = [
  "Decayed",
  "Grossly Decayed",
  "Restored",
  "Mobile",
  "Root Stumps",
  "RCT Treated",
  "Missing",
  "Fractured",
  "Impacted",
];


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
}> = ({ teeth, notes, onNoteChange, isPrimary }) => {
  return (
    <div className="flex gap-1">
      {teeth.map((toothNumber) => {
        return (
            <Tooth
            key={toothNumber}
            number={toothNumber}
            note={notes.find((n) => n.tooth === toothNumber)?.note || ''}
            onNoteChange={(note) => onNoteChange(toothNumber, note)}
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
            if (existingNoteIndex > -1) {
                newNotes.splice(existingNoteIndex, 1);
            }
        } else {
            if (existingNoteIndex > -1) {
                newNotes[existingNoteIndex] = { ...newNotes[existingNoteIndex], note: noteText };
            } else {
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
                        <Quadrant teeth={adultUpperRight.slice().reverse()} notes={value} onNoteChange={handleNoteChange} />
                        <div className="border-l-2 border-gray-400 mx-1"></div>
                        <Quadrant teeth={adultUpperLeft} notes={value} onNoteChange={handleNoteChange} />
                    </div>
                    <div className="border-b-2 border-gray-400 my-2 w-full max-w-lg mx-auto"></div>
                    <div className="flex justify-center gap-1 md:gap-2">
                        <Quadrant teeth={adultLowerRight} notes={value} onNoteChange={handleNoteChange} />
                        <div className="border-l-2 border-gray-400 mx-1"></div>
                        <Quadrant teeth={adultLowerLeft.slice().reverse()} notes={value} onNoteChange={handleNoteChange} />
                    </div>
                </div>

                <hr className="my-4 border-dashed" />

                {/* Primary Teeth */}
                <h3 className="text-sm font-medium text-center">Primary Dentition</h3>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex justify-center gap-1 md:gap-2">
                       <Quadrant teeth={primaryUpperRight.slice().reverse()} notes={value} onNoteChange={handleNoteChange} isPrimary />
                       <div className="border-l-2 border-gray-400 mx-1"></div>
                       <Quadrant teeth={primaryUpperLeft} notes={value} onNoteChange={handleNoteChange} isPrimary />
                    </div>
                     <div className="border-b-2 border-gray-400 my-2 w-full max-w-sm mx-auto"></div>
                     <div className="flex justify-center gap-1 md:gap-2">
                       <Quadrant teeth={primaryLowerRight} notes={value} onNoteChange={handleNoteChange} isPrimary />
                       <div className="border-l-2 border-gray-400 mx-1"></div>
                       <Quadrant teeth={primaryLowerLeft.slice().reverse()} notes={value} onNoteChange={handleNoteChange} isPrimary />
                    </div>
                </div>
            </div>
        </div>
    );
};
