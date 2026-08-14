import { commonValidations } from "@/common/utils/commonValidation";
import { z } from "zod";

import { PATIENT_CONDITIONS, PATIENT_GENDERS, PATIENT_STATUSES } from "./patient.model";

const patientDate = z.coerce.date();

export const createPatientSchemaBody = z.object({
  doctorId: commonValidations.objectId.optional(),
  name: commonValidations.name,
  phone: commonValidations.phone,
  email: commonValidations.email.optional().or(z.literal("")),
  age: z.coerce.number().int().min(0).max(130).optional(),
  gender: z.enum(PATIENT_GENDERS),
  condition: z.enum(PATIENT_CONDITIONS),
  status: z.enum(PATIENT_STATUSES).default("scheduled"),
  visitDate: patientDate,
  notes: z.string().trim().max(1000).optional(),
});

export const updatePatientSchemaBody = createPatientSchemaBody
  .omit({ doctorId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const getPatientSchema = z.object({
  id: commonValidations.objectId,
});

export const doctorPatientParamsSchema = z.object({
  doctorId: commonValidations.objectId,
  patientId: commonValidations.objectId,
});

export const queryPatientsSchema = z.object({
  limit: commonValidations.limit,
  cursor: commonValidations.cursor,
  search: commonValidations.search,
  doctorId: commonValidations.objectId.optional(),
  condition: z.enum(PATIENT_CONDITIONS).optional(),
  status: z.enum(PATIENT_STATUSES).optional(),
  from: commonValidations.dateOnly.optional(),
  to: commonValidations.dateOnly.optional(),
});

export type CreatePatientSchemaBodyType = z.infer<typeof createPatientSchemaBody>;
export type UpdatePatientSchemaBodyType = z.infer<typeof updatePatientSchemaBody>;
export type GetPatientType = z.infer<typeof getPatientSchema>;
export type DoctorPatientParamsType = z.infer<typeof doctorPatientParamsSchema>;
export type QueryPatientsSchemaType = z.infer<typeof queryPatientsSchema>;
