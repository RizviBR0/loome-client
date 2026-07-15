"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { faqs } from "@/lib/types";

export function FAQList() {
  const [active, setActive] = useState(0);
  return <div className="space-y-3">{faqs.map((faq, index) => <div key={faq.question} className="loome-faq-item"><button onClick={() => setActive(active === index ? -1 : index)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left text-sm font-extrabold text-slate-800"><span>{faq.question}</span><ChevronDown size={17} className={`shrink-0 transition ${active === index ? "rotate-180 text-violet-500" : "text-slate-400"}`} /></button>{active === index && <p className="px-5 pb-5 text-sm leading-6 text-slate-500">{faq.answer}</p>}</div>)}</div>;
}
