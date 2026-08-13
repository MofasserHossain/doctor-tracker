import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { routes } from '@/constants/routes';
import { Activity, LayoutDashboard, Stethoscope, UsersRound } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: routes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: routes.doctors, label: 'Doctors', icon: Stethoscope },
  { href: routes.patients, label: 'Patients', icon: UsersRound },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <aside className="bg-card fixed inset-y-0 left-0 hidden w-64 border-r lg:block">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Activity className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">Doctor Tracker</p>
            <p className="text-muted-foreground text-xs">Admin portal</p>
          </div>
        </div>
        <Separator />
        <nav className="grid gap-1 p-3">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="justify-start gap-3">
              <Link href={item.href}>
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-background/95 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur md:px-6">
          <div>
            <p className="text-sm font-semibold">Care Guide BD</p>
            <p className="text-muted-foreground text-xs">Doctor and patient operations</p>
          </div>
          <Badge variant="secondary">Admin</Badge>
        </header>

        <nav className="bg-background sticky top-16 z-20 grid grid-cols-3 border-b lg:hidden">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="h-12 gap-2 rounded-none">
              <Link href={item.href}>
                <item.icon className="size-4" aria-hidden="true" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
