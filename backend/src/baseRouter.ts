import authMiddleware from "@/api/auth/auth.middleware";
import authRouter from "@/api/auth/auth.router";
import dashboardRouter from "@/api/dashboard/dashboard.router";
import doctorRouter from "@/api/doctor/doctor.router";
import healthCheckRouter from "@/api/healthCheck/healthCheckRouter";
import patientRouter from "@/api/patient/patient.router";
import seedRouter from "@/api/seed/seed.router";
import { apiRateLimit } from "@/common/middleware/security";
import { Router } from "express";

const apiRouter = Router();

apiRouter.use("/health-check", healthCheckRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/seed", seedRouter);

apiRouter.use(authMiddleware);
apiRouter.use(apiRateLimit);

apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/doctors", doctorRouter);
apiRouter.use("/patients", patientRouter);

export default apiRouter;
