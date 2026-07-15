import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "Loome — Share work. Discover ideas.",
  description: "A thoughtful home for design process and possibility.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans min-h-screen bg-[#fffefe] text-slate-950 antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: "16px", fontSize: "13px", fontWeight: 700 } }} />
      </body>
    </html>
  );
}
