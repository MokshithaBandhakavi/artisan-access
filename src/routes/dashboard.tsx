import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/lib/session";
import { MatchPill, Page, SectionTitle, money } from "@/components/kaam";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Recruitment dashboard — KaamID" },
      {
        name: "description",
        content:
          "Track applications across applied, shortlisted, interview and hired stages with live pipeline metrics and time-to-hire insight.",
      },
      { property: "og:title", content: "Recruitment dashboard — KaamID" },
      {
        property: "og:description",
        content: "Live hiring pipeline, applications and recruitment insights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const STAGES = ["applied", "shortlisted", "interview", "hired", "rejected"] as const;
type Stage = (typeof STAGES)[number];

type App = {
  id: string;
  job_id: string;
  worker_id: string;
  stage: Stage;
  match_score: number;
  created_at: string;
  jobs: { title: string; trade: string; city: string; wage: number | null; wage_period: string } | null;
  workerName?: string;
};

function DashboardPage() {
  const { user, loading } = useSession();
  const { profile } = useProfile(user);
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const isEmployer = profile?.role === "employer";

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !profile) return;
    void (async () => {
      let query = supabase
        .from("applications")
        .select("*, jobs(title, trade, city, wage, wage_period)")
        .order("created_at", { ascending: false });

      if (profile.role === "employer") {
        const { data: c } = await supabase
          .from("companies")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (!c) {
          setApps([]);
          return;
        }
        const { data: js } = await supabase.from("jobs").select("id").eq("company_id", c.id);
        const ids = (js ?? []).map((j) => j.id);
        if (!ids.length) {
          setApps([]);
          return;
        }
        query = query.in("job_id", ids);
      } else {
        query = query.eq("worker_id", user.id);
      }

      const { data } = await query;
      const rows = (data ?? []) as App[];
      if (profile.role === "employer" && rows.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", rows.map((r) => r.worker_id));
        const byId = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
        setApps(rows.map((r) => ({ ...r, workerName: byId.get(r.worker_id) ?? "Worker" })));
      } else {
        setApps(rows);
      }
    })();
  }, [user, profile]);

  async function move(id: string, stage: Stage) {
    const { error } = await supabase.from("applications").update({ stage }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setApps((a) => a.map((x) => (x.id === id ? { ...x, stage } : x)));
    toast.success(`Moved to ${stage}`);
  }

  const stats = useMemo(() => {
    const by = (s: Stage) => apps.filter((a) => a.stage === s).length;
    const hired = by("hired");
    const avgMatch = apps.length
      ? Math.round(apps.reduce((s, a) => s + a.match_score, 0) / apps.length)
      : 0;
    return {
      total: apps.length,
      shortlisted: by("shortlisted"),
      interview: by("interview"),
      hired,
      conversion: apps.length ? Math.round((hired / apps.length) * 100) : 0,
      avgMatch,
    };
  }, [apps]);

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <SectionTitle
          title="Recruitment dashboard"
          meta={isEmployer ? "Employer view" : "Worker view"}
        />

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Applications" value={stats.total} />
          <Stat label="Shortlisted" value={stats.shortlisted} />
          <Stat label="Interviewing" value={stats.interview} />
          <Stat label="Hired" value={stats.hired} accent />
          <Stat label="Avg match" value={`${stats.avgMatch}%`} />
        </div>

        <div className="mb-8 rounded-xl bg-panel p-5 ring-1 ring-black/5">
          <p className="label-mono mb-3 text-foreground/50">Pipeline funnel</p>
          <div className="space-y-2">
            {STAGES.filter((s) => s !== "rejected").map((s) => {
              const n = apps.filter((a) => a.stage === s).length;
              const pct = stats.total ? Math.round((n / stats.total) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-24 font-mono text-[11px] uppercase text-foreground/60">{s}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-foreground/8">
                    <div
                      className={`h-full ${s === "hired" ? "bg-verify" : "bg-brand"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-xs">{n}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-foreground/60">
            Offer conversion {stats.conversion}% of all applications.
          </p>
        </div>

        {!apps.length ? (
          <p className="rounded-xl bg-panel p-6 text-sm text-foreground/60 ring-1 ring-black/5">
            Nothing in the pipeline yet.{" "}
            <Link to={isEmployer ? "/employer" : "/jobs"} className="underline">
              {isEmployer ? "Post a job" : "Browse jobs"}
            </Link>
          </p>
        ) : null}

        {isEmployer ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {STAGES.filter((s) => s !== "rejected").map((stage) => (
              <div key={stage} className="rounded-xl bg-panel p-4 ring-1 ring-black/5">
                <p className="label-mono mb-3 text-foreground/50">
                  {stage} · {apps.filter((a) => a.stage === stage).length}
                </p>
                <div className="space-y-2">
                  {apps
                    .filter((a) => a.stage === stage)
                    .map((a) => (
                      <div key={a.id} className="rounded-lg border border-border bg-background p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{a.workerName}</p>
                            <p className="truncate text-xs text-foreground/60">
                              {a.jobs?.title ?? "Job"}
                            </p>
                          </div>
                          <MatchPill score={a.match_score} />
                        </div>
                        <select
                          value={a.stage}
                          onChange={(e) => move(a.id, e.target.value as Stage)}
                          className="mt-2 w-full rounded border border-border bg-panel px-2 py-1 font-mono text-[11px] uppercase"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 ring-1 ring-black/5"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{a.jobs?.title ?? "Job"}</p>
                  <p className="text-xs text-foreground/60">
                    {a.jobs?.city || "Anywhere"} · {money(a.jobs?.wage ?? null, a.jobs?.wage_period ?? "day")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MatchPill score={a.match_score} />
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase ${
                      a.stage === "hired"
                        ? "bg-verify text-paper"
                        : a.stage === "rejected"
                          ? "bg-foreground/10 text-foreground/60"
                          : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {a.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ring-black/5 ${accent ? "bg-brand-ink text-paper" : "bg-panel"}`}
    >
      <p className={`label-mono ${accent ? "text-paper/50" : "text-foreground/50"}`}>{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
