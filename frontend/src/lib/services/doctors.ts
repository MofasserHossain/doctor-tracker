'use client';

import {
  createDoctor,
  createDoctorPatient,
  deleteDoctor,
  deleteDoctorPatient,
  getDoctorPatients,
  getDoctors,
  updateDoctor,
  type DoctorQuery,
} from '@/lib/api/doctors';
import { getApiErrorMessage } from '@/lib/api/error';
import { queryKeys } from '@/lib/services/query-keys';
import type { Doctor, DoctorPayload, Patient, PatientPayload } from '@/types/domain';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UpdateDoctorVariables = {
  id: string;
  payload: DoctorPayload;
};

type DoctorMutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
};

export const useDoctorsQuery = (query: DoctorQuery) => {
  return useQuery({
    queryKey: queryKeys.doctors(query),
    queryFn: () => getDoctors(query),
  });
};

export const useDoctorComboboxQuery = (search: string, enabled: boolean) => {
  return useQuery({
    queryKey: queryKeys.doctorCombobox(search),
    queryFn: () => getDoctors({ limit: 20, search: search || undefined }),
    enabled,
    staleTime: 30_000,
  });
};

export const useDoctorPatientsQuery = (doctorId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: queryKeys.doctorPatients(doctorId),
    queryFn: () => getDoctorPatients(doctorId ?? ''),
    enabled: enabled && Boolean(doctorId),
  });
};

export const useCreateDoctorMutation = (
  options: DoctorMutationOptions<Doctor, DoctorPayload> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDoctor,
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Doctor created');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.doctors() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not create doctor'));
    },
  });
};

export const useUpdateDoctorMutation = (
  options: DoctorMutationOptions<Doctor, UpdateDoctorVariables> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateDoctorVariables) => updateDoctor(id, payload),
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Doctor updated');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.doctors() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorPatients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not update doctor'));
    },
  });
};

export const useDeleteDoctorMutation = (options: DoctorMutationOptions<Doctor, string> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Doctor deleted');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.doctors() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not delete doctor'));
    },
  });
};

export const useCreateDoctorPatientMutation = (
  doctorId: string | undefined,
  options: DoctorMutationOptions<Patient, PatientPayload> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientPayload) => createDoctorPatient(doctorId ?? '', payload),
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Patient added');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorPatients(doctorId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.patients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not add patient'));
    },
  });
};

export const useDeleteDoctorPatientMutation = (
  doctorId: string | undefined,
  options: DoctorMutationOptions<Patient, string> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => deleteDoctorPatient(doctorId ?? '', patientId),
    onSuccess: async (data, variables) => {
      await options.onSuccess?.(data, variables);
      toast.success('Patient removed');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorPatients(doctorId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.patients() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not remove patient'));
    },
  });
};
