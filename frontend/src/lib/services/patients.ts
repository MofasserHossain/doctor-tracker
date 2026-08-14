'use client';

import { getApiErrorMessage } from '@/lib/api/error';
import {
  createPatient,
  deletePatient,
  getPatients,
  updatePatient,
  type PatientQuery,
} from '@/lib/api/patients';
import { queryKeys } from '@/lib/services/query-keys';
import type { Patient, PatientPayload } from '@/types/domain';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UpdatePatientVariables = {
  id: string;
  payload: Partial<Omit<PatientPayload, 'doctorId'>>;
};

type PatientMutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
};

export const usePatientsQuery = (query: PatientQuery) => {
  return useQuery({
    queryKey: queryKeys.patients(query),
    queryFn: () => getPatients(query),
  });
};

export const useCreatePatientMutation = (
  options: PatientMutationOptions<Patient, PatientPayload> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Patient created');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.patients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorPatients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not create patient'));
    },
  });
};

export const useUpdatePatientMutation = (
  options: PatientMutationOptions<Patient, UpdatePatientVariables> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePatientVariables) => updatePatient(id, payload),
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Patient updated');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.patients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorPatients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not update patient'));
    },
  });
};

export const useDeletePatientMutation = (options: PatientMutationOptions<Patient, string> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePatient,
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Patient deleted');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.patients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorPatients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not delete patient'));
    },
  });
};
