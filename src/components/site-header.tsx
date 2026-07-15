"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLoomeSession } from "@/lib/use-loome-session";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useLoomeSession();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/about", label: "About" },
  ];
  const loggedInLinks = [
    { href: "/studio", label: "Studio" },
    ...(session?.user.role === "admin"
      ? [{ href: "/admin", label: "Admin" }]
      : []),
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${isAuthPage ? "loome-auth-header border-transparent" : isScrolled ? "bg-white/60 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_rgba(100,60,150,.05)]" : "bg-transparent border-transparent"}`}
    >
      <nav className="mx-auto flex h-[79px] max-w-[1300px] items-center justify-between px-5 lg:px-8">
        <div className="flex flex-1 items-center justify-start">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="text-[22px] font-semibold tracking-tight text-slate-950">
              Loome
            </span>
          </Link>
        </div>
        <div className="hidden flex-none items-center gap-10 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[15px] font-medium transition ${isActive(link.href) ? "text-slate-950" : "text-slate-600 hover:text-slate-950"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/explore?sort=liked"
            className="text-[15px] font-medium text-slate-600 transition hover:text-slate-950"
          >
            Trending
          </Link>
          {session &&
            loggedInLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-medium transition ${isActive(link.href) ? "text-slate-950" : "text-slate-600 hover:text-slate-950"}`}
              >
                {link.label}
              </Link>
            ))}
        </div>
        <div className="hidden flex-1 items-center justify-end gap-4 lg:flex">
          <Link
            href="/explore"
            aria-label="Search designs"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-white/40 hover:text-slate-950"
          >
            <Search size={18} />
          </Link>
          {session ? (
            <Link
              href="/studio"
              className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700"
            >
              {session.user?.name?.slice(0, 1).toUpperCase() || "L"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-[14px] font-medium text-slate-700 transition hover:text-slate-950"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/upload"
            className="loome-button loome-button-primary loome-button-sm"
          >
            Share a design
          </Link>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-full lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? (
            <X size={20} className="text-slate-900" />
          ) : (
            <Menu size={20} className="text-slate-900" />
          )}
        </button>
      </nav>
      {open && (
        <div className="border-t border-white/40 bg-white/80 backdrop-blur-2xl px-5 py-5 lg:hidden shadow-lg">
          <div className="flex flex-col gap-4">
            {[
              ...links,
              { href: "/explore?sort=liked", label: "Trending" },
              ...(session ? loggedInLinks : []),
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-800"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/upload"
              onClick={() => setOpen(false)}
              className="loome-button loome-button-primary loome-button-sm w-fit"
            >
              Share a design
            </Link>
            {!session && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-800"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
