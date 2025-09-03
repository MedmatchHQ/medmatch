import axios from "axios";
import { getSession } from "next-auth/react";
import { TypedAxiosInstance } from "@/types/TypedAxiosInstance";
import { ErrorBody } from "@/types/responses";

/**
 * An axios instance for making general API requests to the backend that
 * automatically attaches the authorization token to all requests.
 * When specifying endpoint paths, include everything after `/api/`.
 * For example, to access `/api/users`, use `apiClient.get("/users")`.
 */
const apiClient = axios.create({
  withCredentials: true,
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL!}/api`,
  headers: {
    "Content-Type": "application/json",
  },
}) as TypedAxiosInstance;

// Attach authorization token to all requests
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  const accessToken = session?.accessToken;

  if (accessToken && config.headers) {
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
        },
      ],
    };
    error.errorBody = fallback;
    return Promise.reject(error);
  }
);

export default apiClient;
