"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logout } from "@/services/authService";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    try {
      await logout("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <h1 className="text-4xl font-semibold mb-4">Hello {session?.user?.email}</h1>
      <div className="mb-4">
        <p><strong>Email:</strong> {session?.user?.email}</p>
        <p><strong>Access Token Available:</strong> {session?.accessToken ? "Yes" : "No"}</p>
        {session?.accessToken && (
          <p><strong>Access Token (first 50 chars):</strong> {session.accessToken.substring(0, 50)}...</p>
        )}
      </div>
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[...Array(5).keys()].map((i) => (
          <div
            key={i}
            className="border border-[#a8a8a8] flex p-4 h-40 flex-col rounded-2xl"
          >
            <div className="flex flex-col flex-wrap pb-2">
              <b>First Last</b>
              <small>Location</small>
            </div>
            <div>
              <span>
                bio bio bio bio bio bio bio bio bio bio bio bio bio bio bio bio
                bio bio bio bio bio bio
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
