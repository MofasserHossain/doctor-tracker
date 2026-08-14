import type { DoctorSummary, Patient } from '@/types/domain';
import { format } from 'date-fns';

export const toTitleCase = (value: string) => {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const formatDate = (value: string) => {
  return format(new Date(value), 'MMM d, yyyy');
};

export const toDateInputValue = (value?: string) => {
  if (!value) {
    return '';
  }
  return format(new Date(value), 'yyyy-MM-dd');
};

export const getPatientDoctor = (patient: Patient): DoctorSummary | undefined => {
  if (typeof patient.doctorId === 'string') {
    return undefined;
  }
  return patient.doctorId;
};
