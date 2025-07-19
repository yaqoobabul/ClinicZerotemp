import type { SVGProps } from 'react';

export function ToothIconSimple(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 4 C24 4, 16 12, 16 26 C16 40, 22 60, 28 60 C30 60, 30 48, 32 48 C34 48, 34 60, 36 60 C42 60, 48 40, 48 26 C48 12, 40 4, 32 4 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
