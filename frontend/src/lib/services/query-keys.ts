import type { DoctorPatientsQuery, DoctorQuery } from '@/lib/api/doctors';
import type { PatientQuery } from '@/lib/api/patients';

export const queryKeys = {
  currentUser: ['current-user'] as const,
  dashboardSummary: ['dashboard-summary'] as const,
  doctors: (query?: DoctorQuery) =>
    query ? (['doctors', query] as const) : (['doctors'] as const),
  doctorCombobox: (search: string) => ['doctor-combobox', search] as const,
  doctorPatients: (doctorId?: string, query?: DoctorPatientsQuery) =>
    doctorId
      ? query
        ? (['doctor-patients', doctorId, query] as const)
        : (['doctor-patients', doctorId] as const)
      : (['doctor-patients'] as const),
  patients: (query?: PatientQuery) =>
    query ? (['patients', query] as const) : (['patients'] as const),
};
