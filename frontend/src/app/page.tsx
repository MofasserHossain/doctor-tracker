import { DashboardSummary } from '@/components/dashboard/dashboard-summary';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Monitor doctors, patient volume, and date-based care activity.
            </p>
          </div>
          <Badge className="w-fit" variant="outline">
            Today
          </Badge>
        </div>

        <DashboardSummary />
      </div>
    </AppShell>
  );
}
