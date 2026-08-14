'use client';

import { patientConditions, patientStatuses } from '@/types/domain';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';

const tableQueryOptions = {
  history: 'replace' as const,
  scroll: false,
  shallow: true,
};

const doctorTableParsers = {
  search: parseAsString.withDefault(''),
  specialization: parseAsString.withDefault(''),
  hospital: parseAsString.withDefault(''),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  limit: parseAsInteger.withDefault(10),
  cursor: parseAsString.withDefault(''),
};

const patientTableParsers = {
  search: parseAsString.withDefault(''),
  doctorId: parseAsString.withDefault('all'),
  condition: parseAsStringLiteral(['all', ...patientConditions] as const).withDefault('all'),
  status: parseAsStringLiteral(['all', ...patientStatuses] as const).withDefault('all'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  limit: parseAsInteger.withDefault(10),
  cursor: parseAsString.withDefault(''),
};

export const useDoctorTableQueryState = () => {
  return useQueryStates(doctorTableParsers, tableQueryOptions);
};

export const usePatientTableQueryState = () => {
  return useQueryStates(patientTableParsers, tableQueryOptions);
};
