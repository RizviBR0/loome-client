"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <footer className="loome-footer mt-24">
      <div className="loome-section relative z-10 py-14">
        <div className="flex flex-col gap-12 border-b border-slate-200/80 pb-12 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="text-xl font-semibold tracking-tight text-slate-950">Loome</Link>
            <p className="mt-5 text-sm leading-7 text-slate-500">
              Share work. Discover ideas. Grow together. A thoughtful home for design process and possibility.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="mb-5 text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-400">Platform</p>
              <div className="flex flex-col gap-3.5 text-sm font-semibold text-slate-600">
                <Link href="/explore" className="hover:text-slate-950">Explore</Link>
                <Link href="/upload" className="hover:text-slate-950">Share a design</Link>
                <Link href="/studio" className="hover:text-slate-950">Studio</Link>
              </div>
            </div>
            <div>
              <p className="mb-5 text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-400">Company</p>
              <div className="flex flex-col gap-3.5 text-sm font-semibold text-slate-600">
                <Link href="/about" className="hover:text-slate-950">About Loome</Link>
                <Link href="/about#guidelines" className="hover:text-slate-950">Guidelines</Link>
                <Link href="/about#contact" className="hover:text-slate-950">Contact</Link>
              </div>
            </div>
            <div>
              <p className="mb-5 text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-400">Follow</p>
              <div className="flex flex-col gap-3.5 text-sm font-semibold text-slate-600">
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-slate-950">Instagram <ArrowUpRight size={13} className="ml-0.5 inline" /></a>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-slate-950">LinkedIn <ArrowUpRight size={13} className="ml-0.5 inline" /></a>
                <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="hover:text-slate-950">Dribbble <ArrowUpRight size={13} className="ml-0.5 inline" /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-8 text-xs font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Loome. Made for the curious.</span>
          <div className="flex gap-6">
            <Link href="/about#guidelines" className="hover:text-slate-950">Community guidelines</Link>
            <Link href="/about#contact" className="hover:text-slate-950">Get in touch</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
