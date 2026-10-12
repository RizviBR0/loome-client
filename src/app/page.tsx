import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  MessageCircle,
  PenLine,
  Sparkles,
} from "lucide-react";
import { DesignCard } from "@/components/design-card";
import { FAQList } from "@/components/faq-list";
import { categories, resources } from "@/lib/types";
import { loomeDb } from "@/lib/mongo";
import type { Design } from "@/lib/types";

export const dynamic = "force-dynamic";

function LandingHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-[620px] text-center">
      <p className="loome-kicker">
        <span className="loome-kicker-dot" /> {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#12111a] sm:text-[42px] sm:leading-[1.04]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
  );
}

const communityPrinciples = [
  { title: "Be specific", copy: "Point to the choice that works and explain why it works." },
  { title: "Stay constructive", copy: "Offer a useful next step without rewriting someone else’s voice." },
  { title: "Credit the work", copy: "Celebrate the creator and keep references connected to their source." },
];

const sharingSteps = [
  {
    number: "01",
    title: "Share the work",
    copy: "Give the final piece, the WIP, or a small experiment a place to live.",
    icon: <PenLine size={18} />,
  },
  {
    number: "02",
    title: "Find your people",
    copy: "Follow visual directions and people whose thinking makes your own sharper.",
    icon: <Eye size={18} />,
  },
  {
    number: "03",
    title: "Keep growing",
    copy: "Save references, trade feedback, and return with more to show.",
    icon: <MessageCircle size={18} />,
  },
];

export default async function HomePage() {
  let designs: Design[] = [];
  let categoryCounts: Record<string, number> = {};
  let totalDesigners = 0;
  let totalProjects = 0;
  let totalReactions = 0;
  try {
    const [featured, grouped, designerCount, projectMetrics] = await Promise.all([
      loomeDb
        .collection<Design>("designs")
        .find()
        .sort({ likes: -1 })
        .limit(3)
        .toArray(),
      loomeDb
        .collection<Design>("designs")
        .aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ])
        .toArray(),
      loomeDb.collection("user").countDocuments({ suspended: { $ne: true } }),
      loomeDb.collection<Design>("designs").aggregate<{ projects: number; reactions: number }>([{ $group: { _id: null, projects: { $sum: 1 }, reactions: { $sum: "$likes" } } }]).next(),
    ]);
    designs = featured;
    categoryCounts = Object.fromEntries(
      grouped.map((item) => [item._id, item.count]),
    );
    totalDesigners = designerCount;
    totalProjects = projectMetrics?.projects || 0;
    totalReactions = projectMetrics?.reactions || 0;
  } catch {
    // Keep the marketing page available while the database is temporarily unreachable.
  }
  const platformStats = [
    { value: totalDesigners.toLocaleString(), label: "registered designers", icon: "✦" },
    { value: totalProjects.toLocaleString(), label: "published projects", icon: "◌" },
    { value: totalReactions.toLocaleString(), label: "project appreciations", icon: "↗" },
  ];
  const featuredDesigners = [...new Map(designs.map((design) => [design.handle, design])).values()].slice(0, 3);
  return (
    <main>
      {/* ── Hero Section ── */}
      <section className="loome-hero relative isolate overflow-hidden">
        <div className="loome-hero-artwork" aria-hidden="true">
          <div className="loome-hero-gradient">
            <Image
              src="/images/loome-hero-gradient.png"
              alt=""
              fill
              priority
              sizes="170vw"
              className="object-cover"
            />
          </div>
        </div>
        <div
          className="loome-hero-veil loome-hero-veil--top"
          aria-hidden="true"
        />
        <div
          className="loome-hero-veil loome-hero-veil--bottom"
          aria-hidden="true"
        />

        <div className="loome-hero-content">
          <div className="loome-hero-copy">
            <div className="loome-hero-pill">
              <span aria-hidden="true" />
              Made for the curious designer
            </div>

            <h1>
              Show the work
              <br />
              behind the work.
            </h1>

            <p>
              Loome is a considered place to share design, discover fresh visual
              thinking, and keep moving with people who get it.
            </p>

            <div className="loome-hero-actions">
              <Link href="/explore" className="loome-hero-secondary-action">
                Explore Design
              </Link>
              <Link href="/upload" className="loome-hero-primary-action">
                Start Sharing
              </Link>
            </div>
          </div>
        </div>

        <div className="loome-hero-showcase">
          <Image
            src="/images/loome-hero.webp"
            alt="Three designers sharing ideas and creating together"
            width={2169}
            height={1236}
            priority
            sizes="(max-width: 767px) 110vw, 72.74vw"
          />
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="loome-orb loome-orb--violet absolute -left-[10%] top-[20%] h-[300px] w-[300px]" />
        <div className="loome-orb loome-orb--pink absolute -right-[8%] top-[40%] h-[260px] w-[260px]" />
        <div className="loome-section relative z-10">
          <LandingHeading
            eyebrow="A shared creative signal"
            title="One good project can change where you go next."
            description="A growing room for thoughtful work, useful context, and the people paying attention."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {platformStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative flex flex-col items-center justify-center h-[362px] w-full max-w-[380px] mx-auto rounded-[24px] bg-gradient-to-t from-white to-[rgba(255,255,255,0)] border-[2.4px] border-white text-center shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1 hover:shadow-[0px_20px_40px_0px_rgba(0,0,0,0.15)] p-6"
              >
                <div className="relative shrink-0 flex items-center justify-center h-[140px] w-[140px] rounded-[32px] bg-white/40 backdrop-blur-2xl border-[3px] border-white/60 shadow-[inset_0_4px_16px_rgba(255,255,255,0.7),0_12px_32px_rgba(0,0,0,0.12)] transition-transform group-hover:scale-105">
                  <span className="text-[76px] font-medium bg-clip-text text-transparent bg-gradient-to-br from-fuchsia-400 to-violet-600 drop-shadow-[0_4px_8px_rgba(217,70,239,0.3)]">
                    {stat.icon}
                  </span>
                </div>
                <div className="mt-[60px]">
                  <p className="text-[54px] font-bold leading-none text-black">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[14px] uppercase tracking-[-0.14px] font-medium text-black">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Designs ── */}
      <section className="relative isolate overflow-hidden py-24 sm:py-28">
        <div className="loome-orb loome-orb--blue absolute left-[15%] top-[10%] h-[320px] w-[320px]" />
        <div className="loome-orb loome-orb--pink absolute right-[10%] bottom-[5%] h-[280px] w-[280px]" />
        <div className="loome-section relative z-10">
          <LandingHeading
            eyebrow="Featured designs"
            title="Fresh work, held in a good light."
            description="A considered edit of recent projects from creators building things worth coming back to."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {designs.slice(0, 3).map((design) => (
              <DesignCard key={design.slug} design={design} />
            ))}
          </div>
          {!designs.length && (
            <p className="rounded-[24px] border border-white/80 bg-white/70 px-6 py-12 text-center text-sm font-semibold text-slate-500">
              No community projects have been published yet. Be the first to
              share one.
            </p>
          )}
          <div className="mt-9 text-center">
            <Link href="/explore" className="loome-text-link">
              See all designs <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="loome-wash py-24 sm:py-28">
        <div className="loome-section">
          <LandingHeading
            eyebrow="Explore by feeling"
            title="Start with a direction that pulls you in."
            description="Browse the categories designers keep returning to, from interfaces and identities to type and motion."
          />
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                href={`/explore?category=${encodeURIComponent(category.name)}`}
                key={category.name}
                className="loome-topic-chip"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-50 to-fuchsia-50 text-[11px] font-bold text-violet-600">
                  {category.icon}
                </span>
                <span>{category.name}</span>
                <span className="text-slate-400">
                  {categoryCounts[category.name] || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sharing Steps ── */}
      <section className="relative isolate overflow-hidden py-24 sm:py-28">
        <div className="loome-orb loome-orb--violet absolute left-[5%] bottom-[10%] h-[340px] w-[340px]" />
        <div className="loome-orb loome-orb--blue absolute right-[8%] top-[15%] h-[260px] w-[260px]" />
        <div className="loome-section relative z-10">
          <LandingHeading
            eyebrow="A better sharing loop"
            title="The good part of putting work out there."
            description="Loome is built around the small moments that make a creative practice feel less solitary."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {sharingSteps.map((step) => (
              <div key={step.title} className="loome-card p-7 sm:p-8">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#12111a] to-[#2d1b4e] text-white shadow-[0_8px_20px_rgba(18,17,26,.2)]">
                  {step.icon}
                </span>
                <p className="mt-8 text-[11px] font-extrabold tracking-[.16em] text-violet-600">
                  {step.number}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-[#12111a]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[270px] text-sm leading-6 text-slate-500">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Designers ── */}
      <section className="loome-wash py-24 sm:py-28">
        <div className="loome-section">
          <LandingHeading
            eyebrow="Featured designers"
            title="Meet the people adding shape to the room."
            description="Follow the designers sharing the process as generously as the polished final piece."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {featuredDesigners.map((designer) => (
              <article key={designer.handle} className="loome-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <Image
                    src={designer.avatar}
                    alt={designer.creator}
                    width={68}
                    height={68}
                    className="h-[68px] w-[68px] rounded-2xl object-cover"
                  />
                  <Link
                    href={`/explore?search=${encodeURIComponent(designer.creator)}`}
                    className="rounded-full border border-white/70 bg-white/50 px-3.5 py-2 text-[11px] font-extrabold text-slate-600 backdrop-blur-sm transition hover:border-violet-300 hover:text-violet-700 hover:shadow-[0_6px_18px_rgba(124,92,252,.12)]"
                  >
                    View work
                  </Link>
                </div>
                <h3 className="mt-6 text-lg font-bold tracking-tight text-[#12111a]">
                  {designer.creator}
                </h3>
                <p className="mt-1 text-xs font-bold text-violet-600">
                  {designer.category} creator
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Shared “{designer.title}” using {designer.tool}.
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100/60 pt-4 text-[11px] font-bold text-slate-400">
                  <span>@{designer.handle}</span>
                  <span>{designer.likes} appreciations</span>
                </div>
              </article>
            ))}
          </div>
          {!featuredDesigners.length && <p className="text-center text-sm font-semibold text-slate-500">Creator profiles will appear here after the first projects are published.</p>}
        </div>
      </section>

      {/* ── Process / How sharing works ── */}
      <section className="relative isolate overflow-hidden py-24 sm:py-28">
        <div className="loome-orb loome-orb--pink absolute left-[20%] top-[5%] h-[300px] w-[300px]" />
        <div className="loome-section relative z-10">
          <div className="loome-process relative overflow-hidden rounded-[30px] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <div className="loome-process-orb absolute -right-24 -top-28 h-80 w-80 rounded-full" />
            <div className="relative grid gap-10 lg:grid-cols-[.76fr_1.24fr] lg:items-center">
              <div>
                <p className="loome-kicker justify-start">
                  <Sparkles size={13} /> How sharing works
                </p>
                <h2 className="mt-5 max-w-sm text-4xl font-bold leading-[1.02] tracking-tight text-[#12111a]">
                  Make room for the next good thing.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
                  The project does not have to be finished to be useful. Start
                  where it is, and let the room do the rest.
                </p>
                <Link
                  href="/upload"
                  className="loome-button loome-button-primary mt-7"
                >
                  Share a design <ArrowRight size={15} />
                </Link>
              </div>
              <div className="loome-editor-card relative mx-auto w-full max-w-[600px] p-3 sm:p-4">
                <div className="rounded-[18px] border border-white/60 bg-white/80 p-5 backdrop-blur-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff8d9b]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ffd47d]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#86d7a1]" />
                    </div>
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-violet-600">
                      Draft
                    </span>
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
                    <div className="overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={
                          designs[2]?.coverImage ||
                          "/images/loome-hero-showcase.png"
                        }
                        alt="Design preview"
                        width={760}
                        height={530}
                        className="aspect-[1.2] w-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-[#f9f8fc] to-[#f4f0ff] p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-violet-600">
                        Project note
                      </p>
                      <p className="mt-3 text-sm font-bold leading-5 tracking-tight text-slate-900">
                        A tiny detail can carry the whole idea.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500 backdrop-blur-sm">
                          UI / UX
                        </span>
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500 backdrop-blur-sm">
                          Figma
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feedback principles ── */}
      <section className="loome-wash py-24 sm:py-28">
        <div className="loome-section grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <div>
            <p className="loome-kicker justify-start">
              <Sparkles size={13} /> Community standard
            </p>
            <h2 className="mt-5 max-w-sm text-4xl font-bold leading-[1.03] tracking-tight text-[#12111a]">
              Useful feedback has a long half-life.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              Every comment should help a creator understand what landed and
              what they might explore next.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {communityPrinciples.map((principle, index) => (
              <article key={principle.title} className="loome-card p-5">
                <span className="text-[11px] font-extrabold text-violet-600">0{index + 1}</span>
                <h3 className="mt-5 text-base font-bold text-slate-900">{principle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{principle.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resources ── */}
      <section className="relative isolate overflow-hidden py-24 sm:py-28">
        <div className="loome-orb loome-orb--blue absolute -left-[5%] top-[30%] h-[280px] w-[280px]" />
        <div className="loome-orb loome-orb--violet absolute right-[5%] bottom-[10%] h-[240px] w-[240px]" />
        <div className="loome-section relative z-10">
          <LandingHeading
            eyebrow="From the resource shelf"
            title="A few things worth keeping close."
            description="Read notes, save prompts, and return when the work needs another point of view."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {resources.map((resource) => (
              <Link
                href={resource.href}
                key={resource.title}
                className="loome-card group overflow-hidden"
              >
                <Image
                  src={resource.image}
                  alt={resource.title}
                  width={900}
                  height={500}
                  className="aspect-[1.65] w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                />
                <div className="p-5">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[.14em] text-violet-600">
                    <span>{resource.type}</span>
                    <span className="text-slate-400">{resource.readTime}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold leading-6 tracking-tight text-slate-900">
                    {resource.title}
                  </h3>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition group-hover:text-violet-600">
                    Open page <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="loome-section grid gap-10 py-24 sm:py-28 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
        <div>
          <p className="loome-kicker justify-start">
            <Sparkles size={13} /> Frequently asked
          </p>
          <h2 className="mt-5 max-w-sm text-4xl font-bold leading-[1.03] tracking-tight text-[#12111a]">
            The things people ask before they join in.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
            Still wondering? We&apos;re happy to point you toward a useful
            starting place.
          </p>
        </div>
        <FAQList />
      </section>

      {/* ── CTA ── */}
      <section className="relative isolate overflow-hidden px-5 pb-24 sm:px-8 sm:pb-28">
        <div className="loome-orb loome-orb--pink absolute left-[10%] top-[20%] h-[200px] w-[200px]" />
        <div className="loome-orb loome-orb--violet absolute right-[15%] bottom-[15%] h-[180px] w-[180px]" />
        <div className="loome-section loome-cta relative overflow-hidden rounded-[30px] px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="loome-cta-orb absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="relative mx-auto max-w-[650px]">
            <p className="loome-kicker">
              <span className="loome-kicker-dot" /> For people making things
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-[1.02] tracking-tight text-[#12111a] sm:text-5xl">
              Give your next idea somewhere to go.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-slate-600">
              Bring a project, a sketch, a detail, or the messy middle. The room
              is ready when you are.
            </p>
            <Link
              href="/upload"
              className="loome-button loome-button-primary mt-8"
            >
              Share your work <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
