import { http } from '@/lib/api/http';
import type { PaginatedResult, ServiceResponse } from '@/types/api';
import type { Patient, PatientCondition, PatientPayload, PatientStatus } from '@/types/domain';

export type PatientQuery = {
  cursor?: string;
  limit?: number;
  search?: string;
  doctorId?: string;
  condition?: PatientCondition;
  status?: PatientStatus;
  from?: string;
  to?: string;
};

const cleanParams = (params: PatientQuery) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  );
};

export const getPatients = async (query: PatientQuery) => {
  const response = await http.get<ServiceResponse<PaginatedResult<Patient>>>('/patients', {
    params: cleanParams(query),
  });
  return response.data.data;
};

export const createPatient = async (payload: PatientPayload) => {
  const response = await http.post<ServiceResponse<Patient>>('/patients', payload);
  return response.data.data;
};

export const updatePatient = async (
  id: string,
  payload: Partial<Omit<PatientPayload, 'doctorId'>>,
) => {
  const response = await http.patch<ServiceResponse<Patient>>(`/patients/${id}`, payload);
  return response.data.data;
};

export const deletePatient = async (id: string) => {
  const response = await http.delete<ServiceResponse<Patient>>(`/patients/${id}`);
  return response.data.data;
};
