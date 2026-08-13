import { DoctorModel, type Doctor } from "@/api/doctor/doctor.model";
import { PatientModel } from "@/api/patient/patient.model";
import ApiError from "@/common/utils/ApiError";
import { createPaginationMeta, getDateRangeFilter, getPagination } from "@/common/utils/query";
import httpStatus from "http-status";
import mongoose, { type QueryFilter, type SortOrder } from "mongoose";

import type {
  CreateDoctorSchemaBodyType,
  QueryDoctorsSchemaType,
  UpdateDoctorSchemaBodyType,
} from "./doctor.validation";

const { Types } = mongoose;

const buildDoctorFilter = (query: Partial<QueryDoctorsSchemaType>): QueryFilter<Doctor> => {
  const filter: QueryFilter<Doctor> = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.specialization) {
    filter.specialization = query.specialization;
  }

  if (query.hospital) {
    filter.hospital = query.hospital;
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
  const { page, limit, skip } = getPagination(query);
  const filter = buildDoctorFilter(query);
  const sort: Record<string, SortOrder | { $meta: "textScore" }> = query.search
    ? { score: { $meta: "textScore" as const }, createdAt: -1 as const }
    : { createdAt: -1 as const };
  const projection = query.search ? { score: { $meta: "textScore" } } : undefined;

  const [records, total] = await Promise.all([
    DoctorModel.find(filter, projection).sort(sort).skip(skip).limit(limit).lean(),
    DoctorModel.countDocuments(filter),
  ]);

  return {
    records,
    meta: createPaginationMeta({ page, limit, total }),
  };
};

export const getDoctorById = async (id: string) => {
  return await DoctorModel.findById(id).lean();
};

export const updateDoctorById = async (id: string, updateBody: UpdateDoctorSchemaBodyType) => {
  const doctor = await DoctorModel.findByIdAndUpdate(id, updateBody, { new: true, runValidators: true }).lean();

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

export const getDoctorPatients = async (doctorId: string) => {
  const doctorExists = await DoctorModel.exists({ _id: doctorId });

  if (!doctorExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  return await PatientModel.find({ doctorId }).sort({ visitDate: -1, createdAt: -1 }).lean();
};
