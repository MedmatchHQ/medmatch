import axios from "axios";
import { getSession } from "next-auth/react";
import { TypedAxiosInstance } from "@/types/TypedAxiosInstance";

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

export default apiClient;
