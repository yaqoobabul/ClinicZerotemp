import type { SVGProps } from 'react';

export function ToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M7 21c-1.23-1.05-1.9-2.6-1.9-4.2 0-2.33 1.67-4.28 3.9-4.8" />
        <path d="M17 21c1.23-1.05 1.9-2.6 1.9-4.2 0-2.33-1.67-4.28-3.9-4.8" />
        <path d="M5.1 12a5.4 5.4 0 0 1 5.4-5.4c1.5 0 2.8.63 3.75 1.65" />
        <path d="M12 12h.01" />
        <path d="M18.9 12a5.4 5.4 0 0 0-5.4-5.4c-1.5 0-2.8.63-3.75 1.65" />
        <path d="M7 9a2 2 0 0 0-2-2" />
        <path d="M17 9a2 2 0 0 1 2-2" />
        <path d="M12 3a2 2 0 0 1 2 2" />
    </svg>
  );
}
