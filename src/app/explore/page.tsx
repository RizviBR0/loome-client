"use client";

import {
  ArrowUpDown,
  ArrowUp,
  CalendarDays,
  Filter,
  Palette,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DesignCard } from "@/components/design-card";
import toast from "react-hot-toast";
import { fetchDesigns } from "@/lib/api";
import { categories, tools, type Design } from "@/lib/types";

const pageSize = 6;
const searchPrompts = [
  "Search UI/UX projects",
  "Find designers using Figma",
  "Explore bold branding ideas",
  "Try ‘motion design’",
];
const palette = [
  { label: "Any color", value: "" },
  { label: "Rose", value: "#ffd8e8" },
  { label: "Mint", value: "#dff3e9" },
  { label: "Lavender", value: "#ded8ff" },
  { label: "Warm", value: "#ffe7c8" },
];

export default function ExplorePage() {
  const initialParams = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [items, setItems] = useState<Design[]>([]);
  const [search, setSearch] = useState(initialParams?.get("search") || "");
  const [category, setCategory] = useState(initialParams?.get("category") || "");
  const [tool, setTool] = useState("");
  const [color, setColor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState(initialParams?.get("sort") || "newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    fetchDesigns()
      .then(setItems)
      .catch(() => { setItems([]); toast.error("Could not load designs from the database"); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % searchPrompts.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(
    () =>
      [...items]
        .filter((design) => {
          const query = search.toLowerCase().trim();
          const searchable = [
            design.title,
            design.creator,
            design.category,
            design.tool,
            ...design.tags,
          ]
            .join(" ")
            .toLowerCase();

          return (
            (!query || searchable.includes(query)) &&
            (!category || design.category === category) &&
            (!tool || design.tool === tool) &&
            (!color || design.color === color) &&
            (!from || design.postedAt >= from) &&
            (!to || design.postedAt <= to)
          );
        })
        .sort((a, b) =>
          sort === "liked"
            ? b.likes - a.likes
            : sort === "viewed"
              ? b.views - a.views
              : b.postedAt.localeCompare(a.postedAt),
        ),
    [items, search, category, tool, color, from, to, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount = [category, tool, color, from, to].filter(Boolean).length;
  const hasFilters = Boolean(search || activeFilterCount || sort !== "newest");

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setTool("");
    setColor("");
    setFrom("");
    setTo("");
    setSort("newest");
  };

  return (
    <main className="loome-page-shell overflow-hidden">
      <section className="explore-hero loome-section relative pb-10 pt-32 lg:pb-12 lg:pt-40">
        <div className="explore-orb explore-orb-left" aria-hidden="true" />
        <div className="explore-orb explore-orb-right" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-7 border-b border-slate-200/70 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="loome-kicker justify-start">
              <span className="loome-kicker-dot" /> The Loome archive
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Find your next <span className="explore-title-accent">spark.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Search original work by direction, designer, tool, or tag—and save a little inspiration for what comes next.
            </p>
          </div>

          <div className="explore-count-card">
            <span className="explore-count-icon"><Sparkles size={17} /></span>
            <span><strong>{filtered.length}</strong> projects to discover</span>
          </div>
        </div>
      </section>

      <section className="loome-section relative z-20 pb-12">
        <div className="explore-command w-full">
          <div className="explore-toolbar grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_142px_112px] lg:items-center">
            <div className="explore-search-shell">
              <input
                id="explore-search"
                aria-label="Search the archive"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder={searchPrompts[promptIndex]}
                className="explore-search-input"
                autoComplete="off"
              />
              {search && (
                <button onClick={() => { setSearch(""); setPage(1); }} className="explore-clear-search" aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
              <button onClick={() => setPage(1)} className="explore-search-submit" aria-label="Search designs">
                <ArrowUp size={16} />
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 lg:contents">
              <button
                onClick={() => setMobileFilters((open) => !open)}
                className={`explore-action-button lg:hidden ${mobileFilters ? "is-active" : ""}`}
                aria-expanded={mobileFilters}
                aria-controls="explore-filters"
              >
                <SlidersHorizontal size={17} />
                Filters
                {activeFilterCount > 0 && <span className="explore-filter-count">{activeFilterCount}</span>}
              </button>

              <label className="explore-sort-control">
                <ArrowUpDown size={16} />
                <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort designs">
                  <option value="newest">Newest</option>
                  <option value="liked">Most liked</option>
                  <option value="viewed">Most viewed</option>
                </select>
              </label>

              <button
                onClick={() => setMobileFilters((open) => !open)}
                className={`explore-action-button hidden lg:flex ${mobileFilters ? "is-active" : ""}`}
                aria-expanded={mobileFilters}
                aria-controls="explore-filters"
              >
                <SlidersHorizontal size={17} />
                Refine
                {activeFilterCount > 0 && <span className="explore-filter-count">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          <div id="explore-filters" className={`${mobileFilters ? "block" : "hidden"} explore-filter-tray`}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                <Filter size={14} className="text-violet-600" /> Refine your results
              </div>
              {hasFilters && <button onClick={clearFilters} className="explore-clear-all">Clear all</button>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <label className="explore-filter-field">
                <span>Category</span>
                <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
                  <option value="">All categories</option>
                  {categories.map((item) => <option key={item.name}>{item.name}</option>)}
                </select>
              </label>

              <label className="explore-filter-field">
                <span>Design tool</span>
                <select value={tool} onChange={(event) => { setTool(event.target.value); setPage(1); }}>
                  <option value="">All tools</option>
                  {tools.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>

              <label className="explore-filter-field">
                <span><Palette size={12} /> Color</span>
                <select value={color} onChange={(event) => { setColor(event.target.value); setPage(1); }}>
                  {palette.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>

              <label className="explore-filter-field">
                <span><CalendarDays size={12} /> From</span>
                <input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} />
              </label>

              <label className="explore-filter-field">
                <span><CalendarDays size={12} /> To</span>
                <input type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} />
              </label>
            </div>
          </div>

          <div className="explore-category-strip" aria-label="Filter designs by category">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 sm:flex-wrap sm:overflow-visible">
              <button onClick={() => { setCategory(""); setPage(1); }} className={`explore-category-pill ${!category ? "is-active" : ""}`}>All work</button>
              {categories.slice(0, 7).map((item) => (
                <button key={item.name} onClick={() => { setCategory(item.name); setPage(1); }} className={`explore-category-pill ${category === item.name ? "is-active" : ""}`}>
                  {item.name}
                </button>
              ))}
            </div>
            {hasFilters && <button onClick={clearFilters} className="explore-category-reset hidden sm:inline-flex"><X size={12} /> Reset</button>}
          </div>
        </div>
      </section>

      <section className="loome-section pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet-600">Curated work</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {search ? `Results for “${search}”` : category || "Fresh discoveries"}
            </h2>
          </div>
          <p className="shrink-0 text-xs font-bold text-slate-400">{filtered.length} {filtered.length === 1 ? "project" : "projects"}</p>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-[370px] animate-pulse rounded-[22px] bg-white/70 shadow-sm" />)}
          </div>
        ) : visible.length ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((design) => <DesignCard key={design.slug} design={design} />)}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold transition ${currentPage === number ? "bg-slate-950 text-white" : "border border-slate-200 bg-white/70 text-slate-500 hover:border-violet-300 hover:text-violet-700"}`}
                  aria-label={`Go to page ${number}`}
                >
                  {number}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="loome-card px-6 py-16 text-center">
            <p className="text-lg font-bold text-slate-900">No designs matched that search.</p>
            <p className="mt-2 text-sm text-slate-500">Try another direction or clear the filters.</p>
            <button onClick={clearFilters} className="loome-button loome-button-primary mt-6">Reset archive</button>
          </div>
        )}
      </section>
    </main>
  );
}
