import { TypedAxiosInstance } from "@/types/TypedAxiosInstance";
import axios from "axios";

/**
 * A custom axios instance for making authentication related API requests to the backend.
 * This instance is configured to only return `SuccessBody` typed objects, so only the `data`
 * field of the body needs to be specificed in the generics.
 * @example
 * ```ts
 * const { data: body } = await authClient.post<User>("/auth/login", { email, password });
 * body = {
 *  status: "success",
 *  data: User,
 *  message: "User logged in successfully",
 * }
 * 
 */
const authClient = axios.create({
  withCredentials: true,
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL!}/api`,
  headers: {
    "Content-Type": "application/json",
  },
}) as TypedAxiosInstance;

export { authClient };
