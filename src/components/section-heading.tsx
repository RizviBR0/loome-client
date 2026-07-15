import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SectionHeading({ eyebrow, title, description, action, centered = false }: { eyebrow: string; title: string; description?: string; action?: { label: string; href: string }; centered?: boolean }) {
  return (
    <div className={`mb-8 flex flex-col gap-4 ${centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className={centered ? "flex flex-col items-center" : ""}>
        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-600">{eyebrow}</p>
        <h2 className="max-w-xl text-3xl font-bold tracking-[-0.055em] text-slate-950 sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action && <Link href={action.href} className="group flex shrink-0 items-center gap-2 text-sm font-extrabold text-slate-700 hover:text-violet-600">{action.label}<ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>}
    </div>
  );
}
