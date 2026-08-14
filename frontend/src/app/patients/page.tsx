import { AppShell } from '@/components/layout/app-shell';
import { PatientManagement } from '@/components/patients/patient-management';
import { TablePageFallback } from '@/components/shared/table-page-fallback';
import { Suspense } from 'react';

export default function PatientsPage() {
  return (
    <AppShell>
      <Suspense fallback={<TablePageFallback />}>
        <PatientManagement />
      </Suspense>
    </AppShell>
  );
}
