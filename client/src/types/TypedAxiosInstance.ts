import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { SuccessBody } from "@/types/responses";

type HttpMethod = <T = unknown, R = SuccessBody<T>>(
  url: string,
  config?: AxiosRequestConfig
) => Promise<AxiosResponse<R>>;

type DataHttpMethod = <T = unknown, R = SuccessBody<T>>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) => Promise<AxiosResponse<R>>;

/**
 * Strongly typed axios instance that always returns {@link SuccessBody} as the response body on success.
 * You only have to specify the type of the `data` field in the responese body using a type parameter.
 * */
export type TypedAxiosInstance = {
  get: HttpMethod;
  post: DataHttpMethod;
  put: DataHttpMethod;
  patch: DataHttpMethod;
  delete: HttpMethod;
} & AxiosInstance;
