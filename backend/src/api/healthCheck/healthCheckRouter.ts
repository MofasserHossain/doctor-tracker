import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import express, { type Router } from "express";
import mongoose from "mongoose";

const healthCheckRouter: Router = express.Router();

healthCheckRouter.get("/", (_req, res) => {
  const serviceResponse = ServiceResponse.success("Health check passed", {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });

  return handleServiceResponse(serviceResponse, res);
});

export default healthCheckRouter;
