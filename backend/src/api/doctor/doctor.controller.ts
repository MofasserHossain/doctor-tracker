import {
  createDoctor,
  deleteDoctorById,
  getDoctorById,
  getDoctorPatients,
  queryDoctors,
  updateDoctorById,
} from "@/api/doctor/doctor.service";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, Response } from "express";
import httpStatus from "http-status";

import type {
  CreateDoctorSchemaBodyType,
  GetDoctorType,
  QueryDoctorPatientsSchemaType,
  QueryDoctorsSchemaType,
  UpdateDoctorSchemaBodyType,
} from "./doctor.validation";

export const createDoctors = async (req: Request<unknown, unknown, CreateDoctorSchemaBodyType>, res: Response) => {
  const doctor = await createDoctor(req.body);
  const serviceResponse = ServiceResponse.success("Doctor created successfully", doctor, httpStatus.CREATED);
  return handleServiceResponse(serviceResponse, res);
};

export const getDoctors = async (
  req: Request<unknown, unknown, unknown, Partial<QueryDoctorsSchemaType>>,
  res: Response
) => {
  const result = await queryDoctors(req.query);
  const serviceResponse = ServiceResponse.success("Doctors fetched successfully", result);
  return handleServiceResponse(serviceResponse, res);
};

export const getDoctorByIds = async (req: Request<GetDoctorType>, res: Response) => {
  const doctor = await getDoctorById(req.params.id);

  if (!doctor) {
    const serviceResponse = ServiceResponse.failure("Doctor not found", null, httpStatus.NOT_FOUND);
    return handleServiceResponse(serviceResponse, res);
  }

  const serviceResponse = ServiceResponse.success("Doctor fetched successfully", doctor);
  return handleServiceResponse(serviceResponse, res);
};

export const getPatientsByDoctor = async (
  req: Request<GetDoctorType, unknown, unknown, Partial<QueryDoctorPatientsSchemaType>>,
  res: Response
) => {
  const result = await getDoctorPatients(req.params.id, req.query);
  const serviceResponse = ServiceResponse.success("Doctor patients fetched successfully", result);
  return handleServiceResponse(serviceResponse, res);
};

export const updateDoctor = async (req: Request<GetDoctorType, unknown, UpdateDoctorSchemaBodyType>, res: Response) => {
  const doctor = await updateDoctorById(req.params.id, req.body);
  const serviceResponse = ServiceResponse.success("Doctor updated successfully", doctor);
  return handleServiceResponse(serviceResponse, res);
};

export const deleteDoctorDataId = async (req: Request<GetDoctorType>, res: Response) => {
  const doctor = await deleteDoctorById(req.params.id);
  const serviceResponse = ServiceResponse.success("Doctor deleted successfully", doctor);
  return handleServiceResponse(serviceResponse, res);
};
