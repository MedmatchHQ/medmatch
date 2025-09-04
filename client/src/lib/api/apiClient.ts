import { TypedAxiosInstance } from "@/types/TypedAxiosInstance";
import { GeneralCode } from "@/types/errorCodes";
import { ErrorBody } from "@/types/responses";
import axios, { AxiosError, isAxiosError } from "axios";
import { getSession } from "next-auth/react";

/**
 * An axios instance for making general API requests to the backend that
 * automatically attaches the authorization token to all requests.
 * When specifying endpoint paths, include everything after `/api/`.
 * For example, to access `/api/users`, use `apiClient.get("/users")`.
 */
const apiClient = axios.create({
  withCredentials: true,
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
}) as TypedAxiosInstance;

// Attach authorization token to all requests
apiClient.interceptors.request.use(async (config) => {
  console.log("interceptor");
  const session = await getSession();
  const accessToken = session?.accessToken;

  if (accessToken && config.headers) {
    console.log("Setting Authorization header");
    console.log(accessToken);
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

function isErrorBody(obj: any): obj is ErrorBody {
  return obj && obj.status === "error" && Array.isArray(obj.errors);
}

// Intercept responses to handle errors in a type-safe way
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    if (isErrorBody(data)) {
      error.errorBody = data;
      return Promise.reject(error);
    }
    const fallback: ErrorBody = {
      status: "error",
      errors: [
        {
          type: "http",
          details: "An unexpected error occurred.",
          code: GeneralCode.InternalServerError,
        },
      ],
    };
    error.errorBody = fallback;
    return Promise.reject(error);
  }
);

export default apiClient;
