"use client";

import { ArrowLeft, Eye, EyeOff, Heart, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.48l3.34-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.52l3.34 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/studio",
      });
      if (!result.error) {
        toast.success("Your Loome account is ready");
        router.push("/studio");
      } else {
        toast.error(result.error.message || "Could not create account");
      }
    } catch {
      toast.error("Could not create account. Check the details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/studio",
        newUserCallbackURL: "/studio",
      });
      if (result?.error)
        toast.error(
          result.error.message || "Google registration is not configured.",
        );
    } catch {
      toast.error(
        "Google registration is unavailable. Check the provider configuration.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-frame login-frame-register">
        <div className="login-form-panel login-register-panel">
          <div className="login-form-wrap">
            <Link href="/" className="login-back-link">
              <ArrowLeft size={14} /> Back to Loome
            </Link>

            <div className="login-heading">
              <h1>Join Loome.</h1>
              <p>
                Create your designer profile and start sharing the thinking
                behind your work.
              </p>
            </div>

            <form onSubmit={submit} className="login-form">
              <label>
                <span>Your name</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="How should we introduce you?"
                  autoComplete="name"
                />
              </label>
              <label>
                <span>Email address</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label>
                <span>Password</span>
                <div className="login-password-field">
                  <input
                    required
                    minLength={8}
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((value) => !value)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
              <button
                disabled={loading || googleLoading}
                className="loome-hero-primary-action w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="login-divider">
              <span>or continue with</span>
            </div>
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={loading || googleLoading}
              className="login-google-button"
            >
              <GoogleMark />{" "}
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>

            <p className="login-register-copy">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="login-visual-panel login-register-visual">
          <span className="login-orb login-orb-pink" aria-hidden="true" />
          <span className="login-orb login-orb-blue" aria-hidden="true" />
          <span className="login-orb login-orb-violet" aria-hidden="true" />

          <div className="login-visual-copy">
            <p>
              <Heart size={12} /> Your work belongs here
            </p>
            <h2>
              Bring your vision.
              <br />
              <span>Find your people.</span>
            </h2>
            <div>
              Build a thoughtful portfolio, share your process, and grow
              alongside a creative community.
            </div>
          </div>

          <div className="login-showcase-wrap" aria-hidden="true">
            <div className="login-showcase-card">
              <div className="login-showcase-topbar">
                <div>
                  <strong>Your next project</strong>
                  <small>Ready for the community</small>
                </div>
                <span className="login-mini-status">New</span>
              </div>
              <div className="login-showcase-image">
                <span className="login-image-chip">
                  <ImageIcon size={14} /> Your creative space
                </span>
                <div className="login-shape login-shape-one" />
                <div className="login-shape login-shape-two" />
                <div className="login-shape login-shape-three" />
              </div>
              <div className="login-showcase-meta">
                <div>
                  <strong>Make your first impression</strong>
                  <span>Portfolio · Community</span>
                </div>
                <span>
                  <Heart size={14} fill="currentColor" /> Loome
                </span>
              </div>
            </div>
            <div className="login-floating-note login-note-left">
              <span>One profile</span> for all your work
            </div>
            <div className="login-floating-note login-note-right">
              <Heart size={13} fill="currentColor" /> Made to be discovered
            </div>
          </div>

          <p className="login-visual-footnote">
            Share work. Discover ideas. Grow together.
          </p>
        </div>
      </section>
    </main>
  );
}
