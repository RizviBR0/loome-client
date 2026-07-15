import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye, Heart } from "lucide-react";
import type { Design } from "@/lib/types";

export function DesignCard({ design, compact = false }: { design: Design; compact?: boolean }) {
  return (
    <article className="loome-card group relative flex h-full flex-col justify-between overflow-hidden p-3">
      <div>
        <Link href={`/designs/${design.slug}`} className="relative block overflow-hidden rounded-[16px] bg-slate-100">
          <Image src={design.coverImage} alt={design.title} width={900} height={620} className={`${compact ? "aspect-[1.22]" : "aspect-[1.35]"} w-full object-cover transition duration-500 group-hover:scale-[1.04]`} />
          <span className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-white text-slate-900 opacity-0 shadow-lg transition group-hover:opacity-100"><ArrowUpRight size={16} /></span>
        </Link>
        <div className="mt-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Heart size={14} className="text-violet-500 fill-violet-500/20" />{design.likes}</span>
              <span className="flex items-center gap-1.5"><Eye size={14} className="text-sky-500" />{design.views > 999 ? `${(design.views / 1000).toFixed(1)}k` : design.views}</span>
            </div>
            <span className="text-[15px] font-black text-slate-800">{design.tool}</span>
          </div>
          <Link href={`/designs/${design.slug}`} className="block mt-3">
            <h3 className="truncate text-[19px] font-bold tracking-tight text-slate-950">{design.title}</h3>
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{design.shortDescription}</p>
          </Link>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between px-2 pb-1">
        <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">{design.category}</span>
        <Link href={`/designs/${design.slug}`} className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-violet-600">
          <Image src={design.avatar} alt={design.creator} width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
          {design.creator}
        </Link>
      </div>
      <Link href={`/designs/${design.slug}`} className="loome-button loome-button-secondary loome-button-sm mt-4 w-full">View details <ArrowUpRight size={14} /></Link>
    </article>
  );
}
