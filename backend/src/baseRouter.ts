import authMiddleware from "@/api/auth/auth.middleware";
import authRouter from "@/api/auth/auth.router";
import dashboardRouter from "@/api/dashboard/dashboard.router";
import doctorRouter from "@/api/doctor/doctor.router";
import healthCheckRouter from "@/api/healthCheck/healthCheckRouter";
import patientRouter from "@/api/patient/patient.router";
import seedRouter from "@/api/seed/seed.router";
import { databaseConnectionMiddleware } from "@/common/db/db";
import { apiRateLimit } from "@/common/middleware/security";
import ApiError from "@/common/utils/ApiError";
import { Router } from "express";
import httpStatus from "http-status";

const apiRouter = Router();

apiRouter.use("/health-check", healthCheckRouter);

apiRouter.use("/auth", databaseConnectionMiddleware, authRouter);
apiRouter.use("/seed", databaseConnectionMiddleware, seedRouter);

apiRouter.use("/dashboard", databaseConnectionMiddleware, authMiddleware, apiRateLimit, dashboardRouter);
apiRouter.use("/doctors", databaseConnectionMiddleware, authMiddleware, apiRateLimit, doctorRouter);
apiRouter.use("/patients", databaseConnectionMiddleware, authMiddleware, apiRateLimit, patientRouter);

apiRouter.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

export default apiRouter;
