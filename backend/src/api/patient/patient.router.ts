import { roleMiddleware } from "@/api/auth/auth.middleware";
import {
  createPatients,
  deletePatientDataId,
  getPatientByIds,
  getPatients,
  updatePatient,
} from "@/api/patient/patient.controller";
import {
  createPatientSchemaBody,
  getPatientSchema,
  queryPatientsSchema,
  updatePatientSchemaBody,
} from "@/api/patient/patient.validation";
import { validateRequest } from "@/common/middleware/validateRequest";
import express, { type Router } from "express";

const patientRouter: Router = express.Router();

patientRouter
  .route("/")
  .post(roleMiddleware("ADMIN"), validateRequest({ body: createPatientSchemaBody }), createPatients)
  .get(roleMiddleware("ADMIN"), validateRequest({ query: queryPatientsSchema }), getPatients);

patientRouter
  .route("/:id")
  .get(roleMiddleware("ADMIN"), validateRequest({ params: getPatientSchema }), getPatientByIds)
  .patch(
    roleMiddleware("ADMIN"),
    validateRequest({ params: getPatientSchema, body: updatePatientSchemaBody }),
    updatePatient
  )
  .delete(roleMiddleware("ADMIN"), validateRequest({ params: getPatientSchema }), deletePatientDataId);

export default patientRouter;
