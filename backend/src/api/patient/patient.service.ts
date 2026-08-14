import { DoctorModel } from "@/api/doctor/doctor.model";
import { PatientModel, type Patient } from "@/api/patient/patient.model";
import ApiError from "@/common/utils/ApiError";
import {
  createCursorPage,
  createPartialMatchRegex,
  getCursorPagination,
  getDateRangeFilter,
} from "@/common/utils/query";
import httpStatus from "http-status";
import mongoose, { type QueryFilter } from "mongoose";

import type {
  CreatePatientSchemaBodyType,
  QueryPatientsSchemaType,
  UpdatePatientSchemaBodyType,
} from "./patient.validation";

const { Types } = mongoose;

const buildPatientFilter = (query: Partial<QueryPatientsSchemaType>): QueryFilter<Patient> => {
  const filter: QueryFilter<Patient> = {};

  if (query.search) {
    const search = createPartialMatchRegex(query.search);

    filter.$or = [
      { name: search },
      { phone: search },
      { email: search },
      { condition: search },
      { status: search },
      { notes: search },
    ];
  }

  if (query.doctorId) {
    filter.doctorId = new Types.ObjectId(query.doctorId);
  }

  if (query.condition) {
    filter.condition = query.condition;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const visitDateRange = getDateRangeFilter(query.from, query.to);

  if (visitDateRange) {
    filter.visitDate = visitDateRange;
  }

  return filter;
};

export const createPatient = async (patientData: CreatePatientSchemaBodyType & { doctorId: string }) => {
  const doctorExists = await DoctorModel.exists({ _id: patientData.doctorId });

  if (!doctorExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  return await PatientModel.create({
    ...patientData,
    doctorId: new Types.ObjectId(patientData.doctorId),
    email: patientData.email || undefined,
  });
};

export const queryPatients = async (query: Partial<QueryPatientsSchemaType>) => {
  const { cursor, limit } = getCursorPagination(query);
  const baseFilter = buildPatientFilter(query);
  const cursorFilter: QueryFilter<Patient> | undefined = cursor
    ? { _id: { $lt: new Types.ObjectId(cursor) } }
    : undefined;
  const filter: QueryFilter<Patient> = cursorFilter ? { $and: [baseFilter, cursorFilter] } : baseFilter;
  const patients = await PatientModel.find(filter)
    .populate("doctorId", "name specialization hospital")
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  return createCursorPage(patients, limit);
};

export const getPatientById = async (id: string) => {
  return await PatientModel.findById(id).populate("doctorId", "name specialization hospital").lean();
};

export const updatePatientById = async (id: string, updateBody: UpdatePatientSchemaBodyType) => {
  const patient = await PatientModel.findByIdAndUpdate(
    id,
    {
      ...updateBody,
      email: updateBody.email || undefined,
    },
    { new: true, runValidators: true }
  )
    .populate("doctorId", "name specialization hospital")
    .lean();

  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  return patient;
};

export const deletePatientById = async (id: string) => {
  const patient = await PatientModel.findByIdAndDelete(id).lean();

  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  return patient;
};

export const deletePatientFromDoctor = async (doctorId: string, patientId: string) => {
  const patient = await PatientModel.findOneAndDelete({
    _id: patientId,
    doctorId: new Types.ObjectId(doctorId),
  }).lean();

  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found for this doctor");
  }

  return patient;
};
