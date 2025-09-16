import { IApiError } from "@/types/errors";

type ResponseBody<T = unknown> = SuccessResponseBody<T> | ErrorResponseBody;

interface SuccessResponseBody<T = unknown> {
  status: "success";
  data: T;
  message: string;
}

interface ErrorResponseBody {
  status: "error";
  errors: IApiError[];
}

export { ErrorResponseBody, ResponseBody, SuccessResponseBody };
