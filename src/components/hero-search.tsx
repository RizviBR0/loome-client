"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("");
  const router = useRouter();
  const submit = (event: React.FormEvent) => { event.preventDefault(); router.push(`/explore${value.trim() ? `?search=${encodeURIComponent(value.trim())}` : ""}`); };
  if (compact) {
    return <form onSubmit={submit} className="loome-hero-search"><Search size={14} aria-hidden="true" /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search designs" aria-label="Search designs, designers, or tags" /><button aria-label="Submit design search"><ArrowRight size={14} /></button></form>;
  }
  return <form onSubmit={submit} className="loome-search mt-7 flex max-w-[560px] items-center gap-2 p-1.5"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600"><Search size={18} /></div><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search designs, designers, or tags" className="min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" /><button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-violet-700" aria-label="Search"><ArrowRight size={18} /></button></form>;
}
