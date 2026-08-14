import { DoctorManagement } from '@/components/doctors/doctor-management';
import { AppShell } from '@/components/layout/app-shell';
import { TablePageFallback } from '@/components/shared/table-page-fallback';
import { Suspense } from 'react';

export default function DoctorsPage() {
  return (
    <AppShell>
      <Suspense fallback={<TablePageFallback />}>
        <DoctorManagement />
      </Suspense>
    </AppShell>
  );
}
