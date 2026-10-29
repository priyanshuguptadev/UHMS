import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Web3Provider } from "@/components/Web3Provider";
import { Header } from "@/components/Header";
import "@radix-ui/themes/styles.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UHMS - University Hostel Management System",
  description: "University Hostel Management System using Blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f8f8] text-[#0a0a0a] font-sans antialiased">
        <Web3Provider>
          <Header />
          <main className="flex-1">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
