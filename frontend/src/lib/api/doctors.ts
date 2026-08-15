import { http } from '@/lib/api/http';
import type { PaginatedResult, ServiceResponse } from '@/types/api';
import type { Doctor, DoctorPayload, Patient, PatientPayload } from '@/types/domain';

export type DoctorQuery = {
  cursor?: string;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
};

export type DoctorPatientsQuery = {
  cursor?: string;
  limit?: number;
};

const cleanParams = (params: DoctorQuery | DoctorPatientsQuery) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  );
};

export const getDoctors = async (query: DoctorQuery) => {
  const response = await http.get<ServiceResponse<PaginatedResult<Doctor>>>('/doctors', {
    params: cleanParams(query),
  });
  return response.data.data;
};

export const createDoctor = async (payload: DoctorPayload) => {
  const response = await http.post<ServiceResponse<Doctor>>('/doctors', payload);
  return response.data.data;
};

export const updateDoctor = async (id: string, payload: Partial<DoctorPayload>) => {
  const response = await http.patch<ServiceResponse<Doctor>>(`/doctors/${id}`, payload);
  return response.data.data;
};

export const deleteDoctor = async (id: string) => {
  const response = await http.delete<ServiceResponse<Doctor>>(`/doctors/${id}`);
  return response.data.data;
};

export const getDoctorPatients = async (doctorId: string, query: DoctorPatientsQuery = {}) => {
  const response = await http.get<ServiceResponse<PaginatedResult<Patient>>>(
    `/doctors/${doctorId}/patients`,
    {
      params: cleanParams(query),
    },
  );
  return response.data.data;
};

export const createDoctorPatient = async (doctorId: string, payload: PatientPayload) => {
  const response = await http.post<ServiceResponse<Patient>>(
    `/doctors/${doctorId}/patients`,
    payload,
  );
  return response.data.data;
};

export const deleteDoctorPatient = async (doctorId: string, patientId: string) => {
  const response = await http.delete<ServiceResponse<Patient>>(
    `/doctors/${doctorId}/patients/${patientId}`,
  );
  return response.data.data;
};
