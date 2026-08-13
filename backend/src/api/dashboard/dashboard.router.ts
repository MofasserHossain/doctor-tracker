import { roleMiddleware } from "@/api/auth/auth.middleware";
import { getSummary } from "@/api/dashboard/dashboard.controller";
import express, { type Router } from "express";

const dashboardRouter: Router = express.Router();

dashboardRouter.get("/summary", roleMiddleware("ADMIN"), getSummary);

export default dashboardRouter;
