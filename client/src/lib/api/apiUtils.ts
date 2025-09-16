import {
  UnexpectedError,
  ValidationErrors,
} from "@/types/exception/serviceExceptions";
import {
  ApiAxiosError,
  hasValidationErrors,
  HttpError,
  isApiAxiosError,
  ValidationError,
} from "@/types/responses";

export function assertApiError(error: unknown): asserts error is ApiAxiosError {
  if (!isApiAxiosError(error)) {
    throw new UnexpectedError(error);
  }
}

export function handleValidationErrors(
  errors: HttpError[] | ValidationError[]
): asserts errors is HttpError[] {
  if (hasValidationErrors(errors)) {
    throw new ValidationErrors(errors, "Validation errors occurred");
  }
}
