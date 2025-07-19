import type { SVGProps } from 'react';

export function ToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M42.1,19.2c0-7.9-3.7-11-9.4-11c-4.7,0-7.8,2.7-9.7,5.4c-1.9-2.7-5-5.4-9.7-5.4c-5.7,0-9.4,3.1-9.4,11c0,7.7,6.3,12.5,10.3,17.6c3.1,4,5.4,6.7,5.4,6.7c0.8,0.9,2.4,0.9,3.2,0c0,0,2.3-2.7,5.4-6.7C35.8,31.7,42.1,26.9,42.1,19.2z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
