import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "../components/SmoothScrollProvider";
import { ToastContainer } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "TRAVELOOP | Luxury Journey Planner",
  description: "Experience the art of luxury journey planning.",
};

import { GoogleWrapper } from "@/components/GoogleWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-obsidian text-white antialiased`}>
        <GoogleWrapper>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </GoogleWrapper>
        <ToastContainer />
      </body>
    </html>
  );
}
