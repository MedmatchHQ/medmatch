import { ErrorCode } from "@/types/errorCodes";
import { Location } from "express-validator";

enum MongooseCode {
  DuplicateKey = 11000,
}

enum GeneralCode {
  NotFound = "NOT_FOUND",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  BadRequest = "BAD_REQUEST",
  InternalServerError = "INTERNAL_SERVER_ERROR",
  Conflict = "CONFLICT",
}

// Discriminated type union to enable efficient type assertion
interface IApiError {
  type: "http" | "validation";
  details: string;
}

interface IHttpError extends IApiError {
  type: "http";
  code: ErrorCode;
}

interface IValidationError extends IApiError {
  type: "validation";
  loc: Location | "other";
  field: string;
  details: string;
}

class HttpError extends Error implements IHttpError {
  type: "http" = "http";

  constructor(
    public details: string,
    public code: ErrorCode,
    public status: number
  ) {
    super(details);
  }
}

class NotFoundError extends HttpError {
  constructor(
    public details: string,
    public code: ErrorCode = GeneralCode.NotFound,
    public status: number = 404
  ) {
    super(details, code, status);
  }
}

class ConflictError extends HttpError {
  constructor(
    public details: string,
    public code: ErrorCode = GeneralCode.Conflict,
    public status: number = 409
  ) {
    super(details, code, status);
  }
}

class UnauthorizedError extends HttpError {
  constructor(
    public details: string,
    public code: ErrorCode = GeneralCode.Unauthorized,
    public status: number = 401
  ) {
    super(details, code, status);
  }
}

export {
  HttpError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  IApiError,
  IHttpError,
  IValidationError,
  GeneralCode,
  MongooseCode,
};
