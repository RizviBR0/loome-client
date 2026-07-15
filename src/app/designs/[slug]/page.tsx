"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Flag,
  Heart,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { DesignCard } from "@/components/design-card";
import { SectionHeading } from "@/components/section-heading";
import {
  createComment,
  fetchComments,
  fetchDesign,
  fetchDesigns,
  likeDesign,
  reportDesign,
} from "@/lib/api";
import type { Design } from "@/lib/types";
import { useLoomeSession } from "@/lib/use-loome-session";

type Comment = {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
};

export default function DesignDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: session } = useLoomeSession();
  const [design, setDesign] = useState<Design | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [related, setRelated] = useState<Design[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetchDesign(slug).catch(() => null),
      fetchComments(slug).catch(() => []),
      fetchDesigns().catch(() => []),
    ])
      .then(([item, notes, all]) => {
        setDesign(item);
        setComments(notes);
        setRelated(
          item
            ? all
                .filter(
                  (entry) =>
                    entry.slug !== item.slug &&
                    entry.category === item.category,
                )
                .slice(0, 3)
            : [],
        );
      })
      .finally(() => setLoading(false));
  }, [slug]);
  if (loading)
    return (
      <main className="loome-page-shell">
        <div className="loome-section pt-40 pb-24">
          <div className="h-[520px] animate-pulse rounded-[28px] bg-white/70" />
        </div>
      </main>
    );
  if (!design)
    return (
      <main className="loome-page-shell">
        <div className="mx-auto max-w-xl px-5 pt-40 pb-24 text-center">
          <p className="loome-kicker">Project not found</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            That room is empty.
          </h1>
          <Link
            href="/explore"
            className="loome-button loome-button-primary mt-7"
          >
            Back to explore
          </Link>
        </div>
      </main>
    );
  const appreciate = async () => {
    if (liked) return;
    try {
      const result = await likeDesign(design.slug);
      setDesign({ ...design, likes: result.likes });
      setLiked(true);
      toast.success("Appreciation added");
    } catch {
      toast.error("Could not add appreciation");
    }
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: design.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Project link copied");
      }
    } catch {
      /* cancelled share */
    }
  };
  const addComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      const result = await createComment(design.slug, comment);
      setComments((items) => [result, ...items]);
      setComment("");
      toast.success("Note added");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Sign in to comment",
      );
    }
  };
  const report = async () => {
    const reason = window.prompt(
      "What should the Loome team review?",
      "Something feels unsafe or misrepresented",
    );
    if (!reason) return;
    try {
      await reportDesign(design.slug, reason);
      toast.success("Thanks — the team will review this project");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send report",
      );
    }
  };

  const allImages = design ? [design.coverImage, ...(design.gallery || [])] : [];
  const currentImage = activeImage || (design ? design.coverImage : "");

  return (
    <main className="loome-page-shell">
      <div className="loome-section pt-32 pb-24 lg:pt-40">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft size={15} /> Back to explore
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div>
            <div className="loome-card overflow-hidden p-3">
              <Image
                src={currentImage}
                alt={design.title}
                width={1400}
                height={1000}
                className="aspect-[1.18] w-full rounded-[18px] object-cover transition-opacity duration-300"
              />
            </div>
            {allImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {allImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(image)}
                    className={`loome-card overflow-hidden p-1.5 transition-all outline-none ${
                      currentImage === image
                        ? "ring-2 ring-violet-500 ring-offset-1 opacity-100"
                        : "hover:opacity-100 opacity-50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${design.title} detail ${index + 1}`}
                      width={400}
                      height={280}
                      className="aspect-[1.3] w-full rounded-[10px] object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-24">
            <span className="inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.14em] text-violet-700">
              {design.category}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-tight text-slate-950 sm:text-5xl">
              {design.title}
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-500">
              {design.shortDescription}
            </p>
            <div className="mt-7 flex items-center justify-between border-y border-slate-200/80 py-5">
              <Link href="/explore" className="flex items-center gap-3">
                {(!design.avatar || design.avatar.includes("pravatar.cc")) ? (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
                    {design.creator ? design.creator.charAt(0).toUpperCase() : "?"}
                  </div>
                ) : (
                  <Image
                    src={design.avatar}
                    alt={design.creator}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {design.creator}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    @{design.handle}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <Heart size={15} /> {design.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={15} /> {design.views}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={appreciate}
                className={`loome-button loome-button-primary flex-1 ${liked ? "bg-violet-700" : ""}`}
              >
                <Heart size={15} className={liked ? "fill-current" : ""} />{" "}
                {liked ? "Appreciated" : "Appreciate"}
              </button>
              <button
                onClick={share}
                className="loome-button loome-button-secondary px-4"
                aria-label="Share design"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={report}
                className="loome-button loome-button-secondary px-4"
                aria-label="Report design"
              >
                <Flag size={16} />
              </button>
            </div>
            <div className="mt-9">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[.16em] text-violet-600">
                About the project
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {design.description}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="loome-card p-4">
                <p className="text-[11px] font-bold text-slate-400">
                  Tools used
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {design.tool}
                </p>
              </div>
              <div className="loome-card p-4">
                <p className="text-[11px] font-bold text-slate-400">Posted</p>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {new Date(design.postedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {design.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white/60 px-3 py-1.5 text-[11px] font-bold text-slate-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <section className="mx-auto mt-14 max-w-4xl">
          <div className="loome-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-violet-600">
                  Join the conversation
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Thoughts on this project?
                </h2>
              </div>
              <MessageCircle className="text-violet-500" />
            </div>
            {session ? (
              <form onSubmit={addComment} className="mt-5">
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Leave a thoughtful note for the creator..."
                  className="field resize-none"
                />
                <div className="mt-3 flex justify-end">
                  <button className="loome-button loome-button-primary">
                    <Send size={14} /> Add note
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#faf9fc] p-4">
                <p className="text-sm text-slate-500">
                  Sign in to join the conversation.
                </p>
                <Link
                  href="/login"
                  className="loome-button loome-button-primary loome-button-sm"
                >
                  Sign in to comment
                </Link>
              </div>
            )}
            {comments.length > 0 && (
              <div className="mt-7 space-y-3 border-t border-slate-100 pt-6">
                {comments.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-2xl bg-[#faf9fc] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-extrabold text-slate-900">
                        {note.userName}
                      </p>
                      <time className="text-[10px] font-semibold text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {note.text}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="mt-16">
          <SectionHeading
            eyebrow="Keep exploring"
            title="More work in this direction."
            action={{ label: "See all projects", href: "/explore" }}
          />
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <DesignCard key={item.slug} design={item} compact />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
