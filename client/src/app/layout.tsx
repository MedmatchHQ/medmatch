import type { Metadata } from "next";
import { Nunito_Sans, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/context/authProvider";

const nunito_sans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-nunito-sans",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Medmatch",
  description: "Career oriented platform for medical students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito_sans.variable} antialiased`}>
      <AuthProvider>
        <Navbar />
        <div className="mx-4 md:mx-8 lg:mx-16 xl:mx-24">{children}</div>
      </AuthProvider>
      </body>
    </html>
  );
}
