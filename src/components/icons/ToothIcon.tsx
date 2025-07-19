import type { SVGProps } from 'react';

export function ToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.34 2.45 11 6.3l.05.15a1.86 1.86 0 0 0 1.9 1.5h.02a1.86 1.86 0 0 0 1.9-1.5l.05-.15L14.66 2.45" />
      <path d="M20 8.79a5.12 5.12 0 0 0-5.12-5.12h-5.76A5.12 5.12 0 0 0 4 8.79v5.42A5.12 5.12 0 0 0 9.12 19.3h.01a5.12 5.12 0 0 0 5.11-4.89 1.16 1.16 0 0 1 2.22-.44h.01a5.12 5.12 0 0 0 3.53-4.18V8.79Z" />
      <path d="M11 12.5a3.5 3.5 0 0 0 0 7" />
      <path d="M13 12.5a3.5 3.5 0 0 1 0 7" />
    </svg>
  );
}
