import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page, SectionTitle, VerifyChip, money } from "@/components/kaam";
import { TRADES } from "@/lib/match";

export const Route = createFileRoute("/workers")({
  head: () => ({
    meta: [
      { title: "Verified worker directory — KaamID" },
      {
        name: "description",
        content:
          "Search verified electricians, plumbers, machine operators, technicians and drivers by trade, city and skill. Every profile shows its verification trail.",
      },
      { property: "og:title", content: "Verified worker directory — KaamID" },
      {
        property: "og:description",
        content: "Search verified blue-collar talent by trade, city and skill.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkersPage,
});

type WorkerRow = {
  user_id: string;
  trade: string;
  experience_years: number;
  expected_wage: number | null;
  wage_period: string;
  bio: string | null;
  skills: string[];
  languages: string[];
  available: boolean;
  id_verified: boolean;
  skill_verified: boolean;
  reference_verified: boolean;
  rating: number | null;
  profiles: { full_name: string; city: string | null } | null;
};

function verifiedCount(w: WorkerRow) {
  return [w.id_verified, w.skill_verified, w.reference_verified].filter(Boolean).length;
}

function WorkersPage() {
  const [rows, setRows] = useState<WorkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [trade, setTrade] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("worker_profiles")
        .select(
          "user_id, trade, experience_years, expected_wage, wage_period, bio, skills, languages, available, id_verified, skill_verified, reference_verified, rating, profiles(full_name, city)",
        )
        .order("experience_years", { ascending: false })
        .limit(120);
      setRows((data as unknown as WorkerRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((w) => (trade ? w.trade === trade : true))
      .filter((w) => (onlyVerified ? verifiedCount(w) > 0 : true))
      .filter((w) =>
        needle
          ? [
              w.profiles?.full_name ?? "",
              w.profiles?.city ?? "",
              w.trade,
              ...(w.skills ?? []),
            ]
              .join(" ")
              .toLowerCase()
              .includes(needle)
          : true,
      )
      .sort((a, b) => verifiedCount(b) - verifiedCount(a));
  }, [rows, q, trade, onlyVerified]);

  return (
    <Page>
      <div className="border-b-2 border-brand-ink bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <p className="label-mono text-foreground/50">Registry / talent</p>
          <h1 className="mt-1 text-3xl">Verified worker directory</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/70">
            Every profile carries a verification trail — ID, skill assessment and employer
            references — so hiring decisions rest on evidence, not on a referral chain.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, city or skill"
            className="min-w-56 flex-1 rounded-md border-2 border-brand-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-brand-ink"
          />
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className="rounded-md border-2 border-brand-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-brand-ink"
          >
            <option value="">All trades</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOnlyVerified((v) => !v)}
            className={`rounded-md border-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] ${
              onlyVerified
                ? "border-verify bg-verify/12 text-verify"
                : "border-brand-ink/15 text-foreground/60"
            }`}
          >
            Verified only
          </button>
        </div>

        <SectionTitle
          title="Talent pool"
          meta={loading ? "loading…" : `${list.length} worker${list.length === 1 ? "" : "s"}`}
        />

        {!loading && list.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-brand-ink/20 p-8 text-center">
            <p className="text-sm text-foreground/70">
              No worker profiles match this filter yet.
            </p>
            <Link
              to="/auth"
              className="label-mono mt-3 inline-block rounded-md bg-accent px-3 py-2 text-accent-foreground"
            >
              Create a worker identity
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((w) => (
              <article
                key={w.user_id}
                className="rounded-lg border-2 border-brand-ink/15 bg-paper p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight">
                      {w.profiles?.full_name ?? "KaamID worker"}
                    </h3>
                    <p className="label-mono text-foreground/55">
                      {w.trade} · {w.profiles?.city ?? "City not set"} · {w.experience_years} yr
                      exp
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
                      w.available
                        ? "bg-verify/12 text-verify"
                        : "bg-foreground/8 text-foreground/50"
                    }`}
                  >
                    {w.available ? "Available" : "Engaged"}
                  </span>
                </div>

                {w.bio ? (
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{w.bio}</p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <VerifyChip label="ID" on={w.id_verified} />
                  <VerifyChip label="Skill" on={w.skill_verified} />
                  <VerifyChip label="Reference" on={w.reference_verified} />
                </div>

                {w.skills?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {w.skills.slice(0, 6).map((s) => (
                      <span
                        key={s}
                        className="rounded bg-brand-ink/6 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-foreground/65"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 flex items-center justify-between border-t border-brand-ink/10 pt-3">
                  <span className="label-mono text-foreground/55">
                    Expects {money(w.expected_wage, w.wage_period)}
                  </span>
                  <span className="label-mono text-foreground/45">
                    {w.languages?.length ? w.languages.slice(0, 3).join(" · ") : "—"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
