import { ErrorCode } from "@/types/errorCodes";
import { AxiosError, isAxiosError } from "axios";

/**
 * Structure for an error that occurs during the logic of an HTTP request.
 * One of the unioned types for the {@link ApiAxiosError} interface.
 */
interface HttpError {
  type: "http";
  code: ErrorCode;
  details: string;
}

/**
 * Structure for an error that occurs during the input validation of an HTTP request.
 * One of the unioned types for the {@link ApiAxiosError} interface.
 */
interface ValidationError {
  type: "validation";
  loc: "body" | "cookies" | "headers" | "params" | "query" | "other";
  field: string;
  details: string;
}

type ApiErrors = HttpError[] | ValidationError[];

/**
 * Structure for the body of a successful HTTP response from the backend.
 * The generic type `T` is used to specify the type of the data returned in the response.
 * One of the unioned types for the {@link ResponseBody} interface.
 */
interface SuccessBody<T = unknown> {
  status: "success";
  data: T;
  message: string;
}

/**
 * Structure for the body of an error HTTP response from the backend.
 * One of the unioned types for the {@link ResponseBody} interface.
 */
interface ErrorBody {
  status: "error";
  errors: HttpError[] | ValidationError[];
}

/**
 * A discriminiated type union that represents the body of an HTTP response from the backend.
 *
 * The `status` field is used to determine the type of the response,
 * either "success" for {@link SuccessBody} or "error" for {@link ErrorBody}.
 *
 * For proper type inference, use the {@link isSuccess} and {@link isError} type predicates to check the response type.
 *
 * The generic type `T` is used to specify the type of the data returned in the response, given that it is a success.
 */
type ResponseBody<T = unknown> = SuccessBody<T> | ErrorBody;

/**
 * Type predicate that checks if the response body is a success response.
 */
function isSuccess<T>(body: ResponseBody<T>): body is SuccessBody<T> {
  return body.status === "success";
}

/**
 * Type predicate that checks if the response body is a error response.
 */
function isError<T>(body: ResponseBody<T>): body is ErrorBody {
  return body.status === "error";
}

type ApiAxiosError = AxiosError<ErrorBody> & { errorBody: ErrorBody };

function isApiAxiosError(error: any): error is ApiAxiosError {
  return error.errorBody && isAxiosError(error);
}

function hasHttpErrors(
  errors: HttpError[] | ValidationError[]
): errors is HttpError[] {
  return errors[0].type === "http";
}

function hasValidationErrors(
  errors: HttpError[] | ValidationError[]
): errors is ValidationError[] {
  return errors.some((e) => e.type === "validation");
}

export type {
  ApiAxiosError,
  ApiErrors,
  ErrorBody,
  HttpError,
  ResponseBody,
  SuccessBody,
  ValidationError,
};

export {
  hasHttpErrors,
  hasValidationErrors,
  isApiAxiosError,
  isError,
  isSuccess,
};
