import httpStatus from "http-status";

export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T;
  readonly statusCode: number;

  private constructor(success: boolean, message: string, data: T, statusCode: number) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success<T>(message: string, data: T, statusCode: number = httpStatus.OK) {
    return new ServiceResponse(true, message, data, statusCode);
  }

  static failure<T>(message: string, data: T, statusCode: number = httpStatus.BAD_REQUEST) {
    return new ServiceResponse(false, message, data, statusCode);
  }
}
