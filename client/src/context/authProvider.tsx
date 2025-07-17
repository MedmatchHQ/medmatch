"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Provides NextAuth session context to the application.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
