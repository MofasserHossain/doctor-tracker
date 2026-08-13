import {
  createPatient,
  deletePatientById,
  deletePatientFromDoctor,
  getPatientById,
  queryPatients,
  updatePatientById,
} from "@/api/patient/patient.service";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, Response } from "express";
import httpStatus from "http-status";

import type {
  CreatePatientSchemaBodyType,
  DoctorPatientParamsType,
  GetPatientType,
  QueryPatientsSchemaType,
  UpdatePatientSchemaBodyType,
} from "./patient.validation";

export const createPatients = async (req: Request<unknown, unknown, CreatePatientSchemaBodyType>, res: Response) => {
  if (!req.body.doctorId) {
    const serviceResponse = ServiceResponse.failure("doctorId is required", null, httpStatus.BAD_REQUEST);
    return handleServiceResponse(serviceResponse, res);
  }

  const patient = await createPatient({ ...req.body, doctorId: req.body.doctorId });
  const serviceResponse = ServiceResponse.success("Patient created successfully", patient, httpStatus.CREATED);
  return handleServiceResponse(serviceResponse, res);
};

export const createPatientForDoctor = async (
  req: Request<{ id: string }, unknown, CreatePatientSchemaBodyType>,
  res: Response
) => {
  const patient = await createPatient({ ...req.body, doctorId: req.params.id });
  const serviceResponse = ServiceResponse.success("Patient created successfully", patient, httpStatus.CREATED);
  return handleServiceResponse(serviceResponse, res);
};

export const getPatients = async (
  req: Request<unknown, unknown, unknown, Partial<QueryPatientsSchemaType>>,
  res: Response
) => {
  const result = await queryPatients(req.query);
  const serviceResponse = ServiceResponse.success("Patients fetched successfully", result);
  return handleServiceResponse(serviceResponse, res);
};

export const getPatientByIds = async (req: Request<GetPatientType>, res: Response) => {
  const patient = await getPatientById(req.params.id);

  if (!patient) {
    const serviceResponse = ServiceResponse.failure("Patient not found", null, httpStatus.NOT_FOUND);
    return handleServiceResponse(serviceResponse, res);
  }

  const serviceResponse = ServiceResponse.success("Patient fetched successfully", patient);
  return handleServiceResponse(serviceResponse, res);
};

export const updatePatient = async (
  req: Request<GetPatientType, unknown, UpdatePatientSchemaBodyType>,
  res: Response
) => {
  const patient = await updatePatientById(req.params.id, req.body);
  const serviceResponse = ServiceResponse.success("Patient updated successfully", patient);
  return handleServiceResponse(serviceResponse, res);
};

export const deletePatientDataId = async (req: Request<GetPatientType>, res: Response) => {
  const patient = await deletePatientById(req.params.id);
  const serviceResponse = ServiceResponse.success("Patient deleted successfully", patient);
  return handleServiceResponse(serviceResponse, res);
};

export const deleteDoctorPatient = async (req: Request<DoctorPatientParamsType>, res: Response) => {
  const patient = await deletePatientFromDoctor(req.params.doctorId, req.params.patientId);
  const serviceResponse = ServiceResponse.success("Patient removed from doctor successfully", patient);
  return handleServiceResponse(serviceResponse, res);
};
