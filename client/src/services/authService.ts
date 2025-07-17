import { authClient } from "@/lib/authClient";
import { signIn, signOut } from "next-auth/react";
import { InputUser } from "@/types/user";
import { User } from "next-auth";

/**
 * Authenticates a user based on email and password, adding the user to the session.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @param callbackUrl - The URL to redirect to after successful login (default `null`). If null, no redirection will occur.
 * @throws An `AxiosError` if there is a login conflict. Generic error if the NextAuth request fails.
 */
async function login(
  email: string,
  password: string,
  callbackUrl: string | null = null
): Promise<void> {
  // Add the refresh token to the client
  await authClient.post<User>("/auth/login", {
    email,
    password,
  });

  const redirect = callbackUrl !== null;
  const res = await signIn("credentials", {
    email,
    password,
    callbackUrl: callbackUrl ?? undefined,
    redirect,
  });

  if (redirect) {
    return; // If redirect is true, res will be undefined
  } else if (!res || res.error || !res.ok) {
    throw new Error(res?.error ?? "Login failed");
  }
}

/**
 * Signs up a new user with the provided user data, adding the user to the session.
 * @param userData - The data of the user to sign up.
 * @param callbackUrl - The URL to redirect to after successful signup. If null, no redirection will occur. Defaults to "/".
 * @throws An `AxiosError` if there is a login conflict. Generic error if the NextAuth request fails.
 */
async function signup(
  userData: InputUser,
  callbackUrl: string | null = "/"
): Promise<void> {
  await authClient.post<User>("/api/auth/signup", userData);
  
  const redirect = callbackUrl !== null;
  const res = await signIn("credentials", {
    email: userData.email,
    password: userData.password,
    callbackUrl: callbackUrl ?? undefined,
    redirect,
  });

  if (redirect) {
    return; // If redirect is true, res will be undefined
  } else if (!res || res.error || !res.ok) {
    throw new Error(res?.error ?? "Login failed");
  }
}

/**
 * Logs out the current user, removing the user from the session, and redirects to the specified URL.
 * @param callbackUrl - The URL to redirect to after logout. If null, no redirection will occur. Defaults to "/".
 */
async function logout(callbackUrl: string | null = "/"): Promise<void> {
  await authClient.post("/auth/logout");
  await signOut({
    callbackUrl: callbackUrl ?? undefined,
    redirect: callbackUrl !== null,
  });
}

export { login, signup, logout };
