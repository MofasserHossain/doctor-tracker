import { getDashboardSummary } from "@/api/dashboard/dashboard.service";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, Response } from "express";

export const getSummary = async (_req: Request, res: Response) => {
  const summary = await getDashboardSummary();
  const serviceResponse = ServiceResponse.success("Dashboard summary fetched successfully", summary);
  return handleServiceResponse(serviceResponse, res);
};
