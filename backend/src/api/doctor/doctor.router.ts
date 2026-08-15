import { roleMiddleware } from "@/api/auth/auth.middleware";
import {
  createDoctors,
  deleteDoctorDataId,
  getDoctorByIds,
  getDoctors,
  getPatientsByDoctor,
  updateDoctor,
} from "@/api/doctor/doctor.controller";
import {
  createDoctorSchemaBody,
  getDoctorSchema,
  queryDoctorPatientsSchema,
  queryDoctorsSchema,
  updateDoctorSchemaBody,
} from "@/api/doctor/doctor.validation";
import { createPatientForDoctor, deleteDoctorPatient } from "@/api/patient/patient.controller";
import { createPatientSchemaBody, doctorPatientParamsSchema } from "@/api/patient/patient.validation";
import { validateRequest } from "@/common/middleware/validateRequest";
import express, { type Router } from "express";

const doctorRouter: Router = express.Router();

doctorRouter
  .route("/")
  .post(roleMiddleware("ADMIN"), validateRequest({ body: createDoctorSchemaBody }), createDoctors)
  .get(roleMiddleware("ADMIN"), validateRequest({ query: queryDoctorsSchema }), getDoctors);

doctorRouter
  .route("/:id")
  .get(roleMiddleware("ADMIN"), validateRequest({ params: getDoctorSchema }), getDoctorByIds)
  .patch(
    roleMiddleware("ADMIN"),
    validateRequest({ params: getDoctorSchema, body: updateDoctorSchemaBody }),
    updateDoctor
  )
  .delete(roleMiddleware("ADMIN"), validateRequest({ params: getDoctorSchema }), deleteDoctorDataId);

doctorRouter
  .route("/:id/patients")
  .get(
    roleMiddleware("ADMIN"),
    validateRequest({ params: getDoctorSchema, query: queryDoctorPatientsSchema }),
    getPatientsByDoctor
  )
  .post(
    roleMiddleware("ADMIN"),
    validateRequest({ params: getDoctorSchema, body: createPatientSchemaBody }),
    createPatientForDoctor
  );

doctorRouter.delete(
  "/:doctorId/patients/:patientId",
  roleMiddleware("ADMIN"),
  validateRequest({ params: doctorPatientParamsSchema }),
  deleteDoctorPatient
);

export default doctorRouter;
