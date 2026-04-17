// VoucherUmroh/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Playfair_Display, Tajawal, DM_Mono } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
