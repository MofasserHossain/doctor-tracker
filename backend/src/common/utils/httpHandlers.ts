import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Response } from "express";

export const handleServiceResponse = <T>(serviceResponse: ServiceResponse<T>, response: Response): void => {
  response.status(serviceResponse.statusCode).json(serviceResponse);
};
