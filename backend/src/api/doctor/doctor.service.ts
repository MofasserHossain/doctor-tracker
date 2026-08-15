import { DoctorModel, type Doctor } from "@/api/doctor/doctor.model";
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
  CreateDoctorSchemaBodyType,
  QueryDoctorPatientsSchemaType,
  QueryDoctorsSchemaType,
  UpdateDoctorSchemaBodyType,
} from "./doctor.validation";

const { Types } = mongoose;

const buildDoctorFilter = (query: Partial<QueryDoctorsSchemaType>): QueryFilter<Doctor> => {
  const filter: QueryFilter<Doctor> = {};

  if (query.search) {
    const search = createPartialMatchRegex(query.search);

    filter.$or = [
      { name: search },
      { specialization: search },
      { hospital: search },
      { email: search },
      { phone: search },
    ];
  }

  if (query.specialization) {
    filter.specialization = createPartialMatchRegex(query.specialization);
  }

  if (query.hospital) {
    filter.hospital = createPartialMatchRegex(query.hospital);
  }

  const createdAtRange = getDateRangeFilter(query.from, query.to);

  if (createdAtRange) {
    filter.createdAt = createdAtRange;
  }

  return filter;
};

export const createDoctor = async (doctorData: CreateDoctorSchemaBodyType) => {
  return await DoctorModel.create(doctorData);
};

export const queryDoctors = async (query: Partial<QueryDoctorsSchemaType>) => {
  const { cursor, limit } = getCursorPagination(query);
  const baseFilter = buildDoctorFilter(query);
  const cursorFilter: QueryFilter<Doctor> | undefined = cursor
    ? { _id: { $lt: new Types.ObjectId(cursor) } }
    : undefined;
  const filter: QueryFilter<Doctor> = cursorFilter ? { $and: [baseFilter, cursorFilter] } : baseFilter;
  const doctors = await DoctorModel.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  return createCursorPage(doctors, limit);
};

export const getDoctorById = async (id: string) => {
  return await DoctorModel.findById(id).lean();
};

export const updateDoctorById = async (id: string, updateBody: UpdateDoctorSchemaBodyType) => {
  const doctor = await DoctorModel.findByIdAndUpdate(id, updateBody, {
    returnDocument: "after",
    runValidators: true,
  }).lean();

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  return doctor;
};

export const deleteDoctorById = async (id: string) => {
  const doctor = await DoctorModel.findById(id).lean();

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  const patientCount = await PatientModel.countDocuments({ doctorId: new Types.ObjectId(id) });

  if (patientCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Delete or reassign this doctor's patients before deleting the doctor");
  }

  await DoctorModel.deleteOne({ _id: id });
  return doctor;
};

export const getDoctorPatients = async (doctorId: string, query: Partial<QueryDoctorPatientsSchemaType> = {}) => {
  const doctorExists = await DoctorModel.exists({ _id: doctorId });

  if (!doctorExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  const { cursor, limit } = getCursorPagination(query);
  const baseFilter: QueryFilter<Patient> = { doctorId: new Types.ObjectId(doctorId) };
  const cursorFilter: QueryFilter<Patient> | undefined = cursor
    ? { _id: { $lt: new Types.ObjectId(cursor) } }
    : undefined;
  const filter: QueryFilter<Patient> = cursorFilter ? { $and: [baseFilter, cursorFilter] } : baseFilter;
  const patients = await PatientModel.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  return createCursorPage(patients, limit);
};
