'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { StethoscopeIcon } from '@/components/icons/StethoscopeIcon';
import { Home, Calendar, Users, FileText, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/patients', icon: Users, label: 'Patients' },
  { href: '/prescriptions', icon: FileText, label: 'Prescriptions' },
];

const settingsNav = { href: '/settings', icon: Settings, label: 'Settings' };

export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: { href: string; icon: React.ElementType; label: string }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <TooltipProvider key={item.href}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                isActive && 'bg-accent text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex no-print">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <StethoscopeIcon className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">ClinicEase</span>
        </Link>
        {navItems.map(renderNavItem)}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        {renderNavItem(settingsNav)}
      </nav>
    </aside>
  );
}
