import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { MatchPill, Page, SectionTitle, money } from "@/components/kaam";
import { matchScore, TRADES } from "@/lib/match";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Blue-collar jobs near you — KaamID" },
      {
        name: "description",
        content:
          "Browse verified electrician, plumber, operator, technician and driver jobs with transparent pay and a match score for your profile.",
      },
      { property: "og:title", content: "Blue-collar jobs near you — KaamID" },
      {
        property: "og:description",
        content: "Verified jobs with transparent pay and match scores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

type Job = {
  id: string;
  title: string;
  trade: string;
  city: string;
  wage: number | null;
  wage_period: string;
  employment_type: string;
  description: string | null;
  skills: string[];
  openings: number;
  companies: { name: string; verified: boolean } | null;
};

function JobsPage() {
  const { user } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [me, setMe] = useState<{
    skills: string[];
    trade: string;
    experience_years: number;
    verified: number;
    city: string | null;
  } | null>(null);
  const [q, setQ] = useState("");
  const [trade, setTrade] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*, companies(name, verified)")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      setJobs((data ?? []) as Job[]);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [wp, prof, apps] = await Promise.all([
        supabase.from("worker_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("city").eq("id", user.id).maybeSingle(),
        supabase.from("applications").select("job_id").eq("worker_id", user.id),
      ]);
      if (wp.data) {
        setMe({
          skills: wp.data.skills,
          trade: wp.data.trade,
          experience_years: wp.data.experience_years,
          verified: [wp.data.id_verified, wp.data.skill_verified, wp.data.reference_verified].filter(
            Boolean,
          ).length,
          city: prof.data?.city ?? null,
        });
      }
      setApplied(new Set((apps.data ?? []).map((a) => a.job_id)));
    })();
  }, [user]);

  const scored = useMemo(() => {
    return jobs
      .filter(
        (j) =>
          (!trade || j.trade === trade) &&
          (!q ||
            `${j.title} ${j.city} ${j.trade} ${j.skills.join(" ")}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      )
      .map((j) => ({
        job: j,
        score: me
          ? matchScore({
              workerSkills: me.skills,
              workerTrade: me.trade,
              workerCity: me.city,
              workerExperience: me.experience_years,
              verifiedCount: me.verified,
              jobSkills: j.skills,
              jobTrade: j.trade,
              jobCity: j.city,
            })
          : null,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [jobs, me, q, trade]);

  async function apply(jobId: string, score: number | null) {
    if (!user) {
      toast.error("Sign in as a worker to apply");
      return;
    }
    const { error } = await supabase
      .from("applications")
      .insert({ job_id: jobId, worker_id: user.id, match_score: score ?? 0 });
    if (error) {
      toast.error(error.message);
      return;
    }
    setApplied((s) => new Set([...s, jobId]));
    toast.success("Application sent");
  }

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <SectionTitle
          title="Job feed"
          meta={me ? "Ranked by your match" : "Sign in for match scores"}
        />

        <div className="mb-5 grid gap-2 sm:grid-cols-[2fr_1fr]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by role, city or skill"
            className="rounded-lg border border-border bg-panel px-3 py-2.5 text-sm"
          />
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className="rounded-lg border border-border bg-panel px-3 py-2.5 text-sm"
          >
            <option value="">All trades</option>
            {TRADES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {!scored.length ? (
          <p className="rounded-xl bg-panel p-6 text-sm text-foreground/60 ring-1 ring-black/5">
            No open jobs match this search yet.{" "}
            <Link to="/employer" className="underline">
              Employers can post one here.
            </Link>
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {scored.map(({ job, score }) => (
            <article key={job.id} className="lift rounded-xl bg-panel p-5 ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {job.companies?.name ?? "Independent employer"} · {job.city || "Anywhere"}
                    {job.companies?.verified ? (
                      <span className="ml-1 font-mono text-[10px] text-verify">● verified</span>
                    ) : null}
                  </p>
                </div>
                {score !== null ? <MatchPill score={score} /> : null}
              </div>

              {job.description ? (
                <p className="mt-3 line-clamp-2 text-sm text-foreground/70">{job.description}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="rounded bg-foreground/6 px-2 py-1 font-mono text-[10px] uppercase tracking-wide"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-foreground/70">
                <span className="font-mono">{money(job.wage, job.wage_period)}</span>
                <span>
                  {job.employment_type} · {job.openings} opening
                  {job.openings > 1 ? "s" : ""}
                </span>
              </div>

              <button
                onClick={() => apply(job.id, score)}
                disabled={applied.has(job.id)}
                className="mt-3 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-paper disabled:bg-verify"
              >
                {applied.has(job.id) ? "Applied ✓" : "Apply now"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </Page>
  );
}
