import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/lib/session";
import { matchTone } from "@/lib/match";
import type { ReactNode } from "react";

export function Mark({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`grid place-items-center rounded-md bg-accent font-display font-semibold text-accent-foreground ${
        size === "md" ? "size-9 text-lg" : "size-7 text-sm"
      }`}
    >
      K
    </span>
  );
}

export function SiteHeader() {
  const { user } = useSession();
  const { profile } = useProfile(user);
  const navigate = useNavigate();

  const links: Array<{ to: string; label: string }> = [
    { to: "/jobs", label: "Jobs" },
    { to: "/workers", label: "Workers" },
  ];
  if (profile?.account_type === "employer") {
    links.push({ to: "/employer", label: "Post & hire" });
    links.push({ to: "/dashboard", label: "Dashboard" });
  } else if (user) {
    links.push({ to: "/worker", label: "My identity" });
    links.push({ to: "/dashboard", label: "Dashboard" });
  }

  return (
    <header className="bg-brand-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <Mark />
          <span className="leading-none">
            <span className="block font-display text-base font-semibold tracking-tight">KaamID</span>
            <span className="label-mono block text-paper/60">Verified work identity</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper"
              activeProps={{ className: "bg-paper/10 text-paper" }}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="ml-2 rounded-md border border-paper/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-paper/80 transition-colors hover:bg-paper/10"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="ml-2 rounded-md bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-brand-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Mark />
          <span className="font-display font-semibold">KaamID</span>
        </div>
        <p className="label-mono text-foreground/50">
          A trusted hiring registry for India's blue-collar workforce
        </p>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SectionTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-2xl">{title}</h2>
      {meta ? <span className="label-mono text-foreground/50">{meta}</span> : null}
    </div>
  );
}

export function VerifyChip({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
        on ? "bg-verify/12 text-verify" : "bg-foreground/8 text-foreground/45"
      }`}
    >
      <span
        className={`grid size-3.5 place-items-center rounded-full text-[8px] ${
          on ? "bg-verify text-paper" : "bg-foreground/25 text-paper"
        }`}
      >
        {on ? "✓" : "–"}
      </span>
      {label}
    </span>
  );
}

export function MatchPill({ score }: { score: number }) {
  const tone = matchTone(score);
  const cls =
    tone === "verify"
      ? "bg-verify/12 text-verify"
      : tone === "accent"
        ? "bg-accent/25 text-foreground"
        : "bg-hazard/10 text-hazard";
  return (
    <span className={`shrink-0 rounded px-2 py-1 font-mono text-xs ${cls}`}>{score}%</span>
  );
}

export function money(wage: number | null, period: string) {
  if (!wage) return "Pay on discussion";
  return `₹${wage.toLocaleString("en-IN")}/${period === "day" ? "day" : period === "week" ? "week" : "mo"}`;
}
