"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLoomeSession } from "@/lib/use-loome-session";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useLoomeSession();
  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/about", label: "About" },
    { href: "/explore?sort=liked", label: "Trending" },
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
      className={`loome-site-header fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${isScrolled ? "bg-white/60 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_rgba(100,60,150,.05)]" : "bg-transparent border-transparent"}`}
    >
      <nav className="loome-site-nav" aria-label="Main navigation">
        <div className="flex flex-1 items-center justify-start">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="loome-site-brand">
              Loome
            </span>
          </Link>
        </div>
        <div className="loome-site-nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="loome-site-nav-link"
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="loome-site-nav-actions">
          <Link
            href="/explore"
            aria-label="Search designs"
            className="loome-site-search"
          >
            <span className="loome-site-search-icon" aria-hidden="true" />
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
              className="loome-site-sign-in"
            >
              Sign in
            </Link>
          )}
        </div>
        <button
          className="loome-site-menu grid h-10 w-10 place-items-center rounded-full"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="site-mobile-navigation"
        >
          {open ? (
            <X size={20} className="text-slate-900" />
          ) : (
            <Menu size={20} className="text-slate-900" />
          )}
        </button>
      </nav>
      {open && (
        <div id="site-mobile-navigation" className="loome-site-mobile-navigation border-t border-white/40 bg-white/80 backdrop-blur-2xl px-5 py-5 shadow-lg">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-800"
                aria-current={isActive(link.href) ? "page" : undefined}
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
