import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateRequest = (schema: { body?: z.ZodSchema; query?: z.ZodSchema; params?: z.ZodSchema }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: z.ZodIssue[] = [];

    if (schema.body) {
      const bodyResult = schema.body.safeParse(req.body);

      if (!bodyResult.success) {
        errors.push(...bodyResult.error.issues);
      } else {
        req.body = bodyResult.data;
      }
    }

    if (schema.query) {
      const queryResult = schema.query.safeParse(req.query);

      if (!queryResult.success) {
        errors.push(...queryResult.error.issues);
      }
    }

    if (schema.params) {
      const paramsResult = schema.params.safeParse(req.params);

      if (!paramsResult.success) {
        errors.push(...paramsResult.error.issues);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
};
