'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MarkdownTableProps {
  content: string;
}

export function MarkdownTable({ content }: MarkdownTableProps) {
  const rows = content
    .trim()
    .split('\n')
    .map((row) =>
      row
        .split('|')
        .filter((cell) => cell.trim() !== '')
        .map((cell) => cell.trim())
    );

  if (rows.length < 2 || rows[0].length === 0) {
    return <p>{content}</p>;
  }

  const header = rows[0];
  // The second row is a separator, like |---|---|...
  const body = rows.slice(2);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {header.map((head, i) => (
              <TableHead key={i} className="font-bold">{head}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {body.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
