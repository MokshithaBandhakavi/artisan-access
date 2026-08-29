import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { MatchPill, Page, SectionTitle, VerifyChip, money } from "@/components/kaam";
import { matchScore, TRADES } from "@/lib/match";

export const Route = createFileRoute("/employer")({
  head: () => ({
    meta: [
      { title: "Hire verified workers — KaamID for employers" },
      {
        name: "description",
        content:
          "Post a job in under a minute, see ranked verified candidates by trade and skill, and move them through your hiring pipeline.",
      },
      { property: "og:title", content: "Hire verified workers — KaamID for employers" },
      {
        property: "og:description",
        content: "Post jobs and discover ranked, verified blue-collar candidates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmployerPage,
});

type Company = { id: string; name: string; city: string | null; verified: boolean };
type Job = {
  id: string;
  title: string;
  trade: string;
  city: string;
  wage: number | null;
  wage_period: string;
  skills: string[];
  status: string;
  openings: number;
};
type Candidate = {
  user_id: string;
  trade: string;
  skills: string[];
  experience_years: number;
  expected_wage: number | null;
  wage_period: string;
  id_verified: boolean;
  skill_verified: boolean;
  reference_verified: boolean;
  available: boolean;
  profiles: { full_name: string | null; city: string | null } | null;
};

function EmployerPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeJob, setActiveJob] = useState<string>("");

  const [form, setForm] = useState({
    title: "",
    trade: "",
    city: "",
    wage: "",
    wage_period: "day",
    employment_type: "full-time",
    openings: "1",
    skills: "",
    description: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data: c } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      setCompany((c as Company) ?? null);
      if (c) {
        const { data: j } = await supabase
          .from("jobs")
          .select("*")
          .eq("company_id", c.id)
          .order("created_at", { ascending: false });
        setJobs((j ?? []) as Job[]);
        if (j?.length) setActiveJob(j[0].id);
      }
      const { data: w } = await supabase
        .from("worker_profiles")
        .select("*, profiles(full_name, city)")
        .eq("available", true)
        .limit(50);
      setCandidates((w ?? []) as Candidate[]);
    })();
  }, [user]);

  async function createCompany() {
    if (!user || !companyName.trim()) return;
    const { data, error } = await supabase
      .from("companies")
      .insert({ owner_id: user.id, name: companyName.trim() })
      .select("*")
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    setCompany(data as Company);
    toast.success("Company registered");
  }

  async function postJob() {
    if (!company || !user) return;
    if (!form.title || !form.trade) {
      toast.error("Add a job title and trade");
      return;
    }
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        company_id: company.id,
        posted_by: user.id,
        title: form.title,
        trade: form.trade,
        city: form.city,
        wage: form.wage ? Number(form.wage) : null,
        wage_period: form.wage_period,
        employment_type: form.employment_type,
        openings: Number(form.openings) || 1,
        description: form.description,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .select("*")
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    setJobs((j) => [data as Job, ...j]);
    setActiveJob((data as Job).id);
    setForm({ ...form, title: "", description: "", skills: "" });
    toast.success("Job posted — candidates are being ranked");
  }

  async function invite(workerId: string, score: number) {
    if (!activeJob) {
      toast.error("Post or select a job first");
      return;
    }
    const { error } = await supabase.from("applications").insert({
      job_id: activeJob,
      worker_id: workerId,
      match_score: score,
      source: "employer_invite",
      pipeline_stage: "shortlisted",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Worker shortlisted and invited");
  }

  const job = jobs.find((j) => j.id === activeJob) ?? null;

  const ranked = useMemo(() => {
    return candidates
      .map((c) => ({
        c,
        score: matchScore({
          workerSkills: c.skills,
          workerTrade: c.trade,
          workerCity: c.profiles?.city ?? null,
          workerExperience: c.experience_years,
          verifiedCount: [c.id_verified, c.skill_verified, c.reference_verified].filter(Boolean)
            .length,
          jobSkills: job?.skills ?? [],
          jobTrade: job?.trade ?? "",
          jobCity: job?.city ?? "",
        }),
      }))
      .sort((a, b) => b.score - a.score);
  }, [candidates, job]);

  if (!user) return <Page />;

  if (!company) {
    return (
      <Page>
        <div className="mx-auto max-w-xl px-5 py-16">
          <SectionTitle title="Register your company" meta="Step 01" />
          <div className="rounded-xl bg-panel p-6 ring-1 ring-black/5">
            <p className="mb-4 text-sm text-foreground/70">
              One-time setup. Your company name appears on every job you post.
            </p>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Sharma Electricals"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
            <button
              onClick={createCompany}
              className="mt-3 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-paper"
            >
              Register and continue
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <SectionTitle title="Post a job" meta={company.name} />
          <div className="grid gap-3 rounded-xl bg-panel p-5 ring-1 ring-black/5 sm:grid-cols-2">
            <Field
              label="Job title"
              className="sm:col-span-2"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="Site electrician"
            />
            <label className="block">
              <span className="label-mono text-foreground/60">Trade</span>
              <select
                value={form.trade}
                onChange={(e) => setForm({ ...form, trade: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {TRADES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <Field
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="Pune"
            />
            <Field
              label="Pay (₹)"
              value={form.wage}
              onChange={(v) => setForm({ ...form, wage: v })}
              placeholder="900"
            />
            <label className="block">
              <span className="label-mono text-foreground/60">Pay period</span>
              <select
                value={form.wage_period}
                onChange={(e) => setForm({ ...form, wage_period: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="day">Per day</option>
                <option value="week">Per week</option>
                <option value="month">Per month</option>
              </select>
            </label>
            <label className="block">
              <span className="label-mono text-foreground/60">Type</span>
              <select
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="full-time">Full time</option>
                <option value="contract">Contract</option>
                <option value="daily-wage">Daily wage</option>
                <option value="part-time">Part time</option>
              </select>
            </label>
            <Field
              label="Openings"
              value={form.openings}
              onChange={(v) => setForm({ ...form, openings: v })}
            />
            <Field
              label="Required skills (comma separated)"
              className="sm:col-span-2"
              value={form.skills}
              onChange={(v) => setForm({ ...form, skills: v })}
              placeholder="Wiring, Panel work, Safety"
            />
            <label className="block sm:col-span-2">
              <span className="label-mono text-foreground/60">Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <button
              onClick={postJob}
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-paper sm:col-span-2"
            >
              Publish job
            </button>
          </div>

          <div className="mt-6">
            <SectionTitle title="Your postings" meta={`${jobs.length} total`} />
            <div className="space-y-2">
              {jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setActiveJob(j.id)}
                  className={`block w-full rounded-xl p-4 text-left ring-1 transition-colors ${
                    j.id === activeJob
                      ? "bg-brand text-paper ring-brand"
                      : "bg-panel ring-black/5 hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{j.title}</span>
                    <span className="font-mono text-[10px] uppercase opacity-70">{j.status}</span>
                  </div>
                  <p className="mt-0.5 text-xs opacity-70">
                    {j.trade} · {j.city || "Anywhere"} · {money(j.wage, j.wage_period)}
                  </p>
                </button>
              ))}
              {!jobs.length ? (
                <p className="rounded-xl bg-panel p-4 text-sm text-foreground/60 ring-1 ring-black/5">
                  No jobs posted yet.
                </p>
              ) : null}
            </div>
            <Link
              to="/dashboard"
              className="mt-3 block rounded-xl bg-brand-ink px-4 py-3 text-center text-sm font-semibold text-paper"
            >
              Open recruitment dashboard
            </Link>
          </div>
        </section>

        <section className="lg:col-span-7">
          <SectionTitle
            title="Candidate discovery"
            meta={job ? `Ranked for ${job.title}` : "Available workers"}
          />
          <div className="space-y-3">
            {ranked.map(({ c, score }) => (
              <article key={c.user_id} className="rounded-xl bg-panel p-5 ring-1 ring-black/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-lg bg-brand font-display text-lg font-semibold text-paper">
                      {(c.profiles?.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{c.profiles?.full_name || "Unnamed worker"}</p>
                      <p className="text-xs text-foreground/60">
                        {c.trade || "Trade not set"} · {c.experience_years} yrs ·{" "}
                        {c.profiles?.city || "City not set"}
                      </p>
                    </div>
                  </div>
                  <MatchPill score={score} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <VerifyChip label="ID" on={c.id_verified} />
                  <VerifyChip label="Skills" on={c.skill_verified} />
                  <VerifyChip label="Refs" on={c.reference_verified} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="rounded bg-foreground/6 px-2 py-1 font-mono text-[10px] uppercase"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="font-mono text-xs text-foreground/70">
                    Expects {money(c.expected_wage, c.wage_period)}
                  </span>
                  <button
                    onClick={() => invite(c.user_id, score)}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
                  >
                    Shortlist & invite
                  </button>
                </div>
              </article>
            ))}
            {!ranked.length ? (
              <p className="rounded-xl bg-panel p-6 text-sm text-foreground/60 ring-1 ring-black/5">
                No available workers yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </Page>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-mono text-foreground/60">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
