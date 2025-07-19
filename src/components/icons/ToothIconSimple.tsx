
import type { SVGProps } from 'react';

export function ToothIconSimple(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M6 20h12c1.1 0 2-2.239 2-5V9c0-2.761-2.9-5-2-5-1.563 0-2.03.737-2.5 1.5C14.737 4.737 14.1 4 12 4s-2.737.737-3.5 1.5C8.03 4.737 7.563 4 6 4c.9-0 2 2.239 2 5v6c0 2.761-.9 5-2 5z" fill="currentColor" />
    </svg>
  );
}
