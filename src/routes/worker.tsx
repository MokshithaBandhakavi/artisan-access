import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/lib/session";
import { Page, SectionTitle, VerifyChip } from "@/components/kaam";
import { TRADES } from "@/lib/match";

export const Route = createFileRoute("/worker")({
  head: () => ({
    meta: [
      { title: "My worker identity — KaamID" },
      {
        name: "description",
        content:
          "Build a verified KaamID: your trade, skills, certifications and work history in one trusted worker ID card.",
      },
      { property: "og:title", content: "My worker identity — KaamID" },
      {
        property: "og:description",
        content: "Your trade, skills, certifications and work history in one verified ID.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkerPage,
});

type WP = {
  user_id: string;
  trade: string;
  experience_years: number;
  expected_wage: number | null;
  wage_period: string;
  bio: string | null;
  languages: string[];
  skills: string[];
  available: boolean;
  id_verified: boolean;
  skill_verified: boolean;
  reference_verified: boolean;
};

type Cert = { id: string; name: string; issuer: string | null; year: number | null; verified: boolean };
type Work = {
  id: string;
  employer_name: string;
  role: string;
  from_year: number | null;
  to_year: number | null;
};

function WorkerPage() {
  const { user, loading } = useSession();
  const { profile } = useProfile(user);
  const navigate = useNavigate();
  const [wp, setWp] = useState<WP | null>(null);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [work, setWork] = useState<Work[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [w, c, h] = await Promise.all([
        supabase.from("worker_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("certifications").select("*").eq("worker_id", user.id).order("created_at"),
        supabase.from("work_history").select("*").eq("worker_id", user.id).order("created_at"),
      ]);
      if (!w.data) {
        const created = await supabase
          .from("worker_profiles")
          .insert({ user_id: user.id })
          .select("*")
          .maybeSingle();
        setWp(created.data as WP | null);
      } else {
        setWp(w.data as WP);
      }
      setCerts((c.data ?? []) as Cert[]);
      setWork((h.data ?? []) as Work[]);
    })();
  }, [user]);

  async function save() {
    if (!wp || !user) return;
    setSaving(true);
    const { error } = await supabase
      .from("worker_profiles")
      .update({
        trade: wp.trade,
        experience_years: wp.experience_years,
        expected_wage: wp.expected_wage,
        wage_period: wp.wage_period,
        bio: wp.bio,
        skills: wp.skills,
        languages: wp.languages,
        available: wp.available,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Identity updated");
  }

  async function addCert(name: string, issuer: string, year: string) {
    if (!user || !name) return;
    const { data, error } = await supabase
      .from("certifications")
      .insert({ worker_id: user.id, name, issuer, year: year ? Number(year) : null })
      .select("*")
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) setCerts((c) => [...c, data as Cert]);
  }

  async function addWork(employer: string, role: string, from: string, to: string) {
    if (!user || !employer) return;
    const { data, error } = await supabase
      .from("work_history")
      .insert({
        worker_id: user.id,
        employer_name: employer,
        role,
        from_year: from ? Number(from) : null,
        to_year: to ? Number(to) : null,
      })
      .select("*")
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) setWork((w) => [...w, data as Work]);
  }

  async function runVerification() {
    if (!user || !wp) return;
    const hasSkills = wp.skills.length >= 3 && wp.trade.length > 0;
    const hasCert = certs.length > 0;
    const hasRefs = work.length > 0;
    const { error } = await supabase
      .from("worker_profiles")
      .update({
        id_verified: true,
        skill_verified: hasSkills,
        reference_verified: hasRefs,
      })
      .eq("user_id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (hasCert) await supabase.from("certifications").update({ verified: true }).eq("worker_id", user.id);
    setWp({ ...wp, id_verified: true, skill_verified: hasSkills, reference_verified: hasRefs });
    setCerts((c) => c.map((x) => ({ ...x, verified: hasCert ? true : x.verified })));
    toast.success(
      hasSkills && hasRefs
        ? "Fully verified — your ID card is now trusted"
        : "Partially verified. Add 3+ skills and past work to complete it.",
    );
  }

  if (!wp) {
    return (
      <Page>
        <div className="mx-auto max-w-6xl px-5 py-16 text-foreground/60">Loading your identity…</div>
      </Page>
    );
  }

  const verifiedCount = [wp.id_verified, wp.skill_verified, wp.reference_verified].filter(Boolean)
    .length;
  const completeness = Math.round(
    ((wp.trade ? 1 : 0) +
      (wp.skills.length ? 1 : 0) +
      (wp.bio ? 1 : 0) +
      (certs.length ? 1 : 0) +
      (work.length ? 1 : 0) +
      verifiedCount) /
      8 *
      100,
  );

  return (
    <Page>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-12">
        {/* ID card */}
        <section className="lg:col-span-5">
          <SectionTitle title="Worker identity" meta="Card 01" />
          <div className="relative overflow-hidden rounded-2xl bg-brand-ink p-6 text-paper ring-1 ring-black/5">
            <div className="hatch absolute inset-y-0 right-0 w-10 bg-accent/90" aria-hidden />
            <div className="mb-4 flex items-center justify-between">
              <span className="label-mono text-paper/60">Worker ID card</span>
              <span className="font-mono text-[10px] text-accent">
                KAAM-{wp.user_id.slice(0, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="grid size-20 place-items-center rounded-xl bg-brand font-display text-2xl font-semibold">
                  {(profile?.full_name || "?").charAt(0).toUpperCase()}
                </div>
                {wp.id_verified ? (
                  <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-verify text-[10px] ring-2 ring-brand-ink">
                    ✓
                  </span>
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="font-display text-2xl leading-tight font-semibold">
                  {profile?.full_name || "Add your name"}
                </p>
                <p className="text-sm text-paper/70">
                  {wp.trade || "Set your trade"} · {wp.experience_years} yrs
                </p>
                <p className="mt-1 font-mono text-[11px] text-paper/50">
                  {profile?.city || "Add city"}
                  {wp.languages.length ? ` · ${wp.languages.join(", ")}` : ""}
                </p>
              </div>
            </div>

            {verifiedCount === 3 ? (
              <div className="relative mt-4">
                <span className="stamp absolute top-0 right-0 rounded border-2 border-verify px-2 py-1 font-display text-xs font-semibold uppercase tracking-[0.1em] text-verify">
                  Verified
                </span>
                <p className="pr-24 text-xs text-paper/60">
                  Identity, skills and past work confirmed through the registry.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-paper/60">
                {3 - verifiedCount} verification step(s) left to earn the trusted stamp.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-brand p-3 ring-1 ring-black/5">
                <p className="label-mono text-paper/50">Skills</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {wp.skills.length ? (
                    wp.skills.map((s) => (
                      <span key={s} className="rounded bg-paper/10 px-2 py-0.5 text-[11px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-paper/40">None yet</span>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-brand p-3 ring-1 ring-black/5">
                <p className="label-mono text-paper/50">Work history</p>
                <div className="mt-1 space-y-1 text-[12px] text-paper/80">
                  {work.length ? (
                    work.slice(0, 3).map((w) => (
                      <div key={w.id} className="flex justify-between gap-2">
                        <span className="truncate">{w.employer_name}</span>
                        <span className="font-mono text-paper/50">{w.from_year ?? "—"}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-paper/40">None yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-mono text-paper/50">Profile strength</span>
                <span className="font-mono text-[11px] text-accent">{completeness}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-paper/15">
                <div className="h-full bg-accent" style={{ width: `${completeness}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-panel p-4 ring-1 ring-black/5">
            <p className="label-mono text-foreground/50">Verification</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <VerifyChip label="Identity" on={wp.id_verified} />
              <VerifyChip label="Skills" on={wp.skill_verified} />
              <VerifyChip label="Past work" on={wp.reference_verified} />
              <VerifyChip label="Certified" on={certs.some((c) => c.verified)} />
            </div>
            <button
              onClick={runVerification}
              className="mt-3 w-full rounded-lg bg-verify px-4 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
            >
              Run verification check
            </button>
          </div>

          <Link
            to="/jobs"
            className="mt-3 block rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-paper"
          >
            See jobs matched to this profile
          </Link>
        </section>

        {/* Editor */}
        <section className="space-y-6 lg:col-span-7">
          <div>
            <SectionTitle title="Build your profile" meta="Editable" />
            <div className="grid gap-3 rounded-xl bg-panel p-5 ring-1 ring-black/5 sm:grid-cols-2">
              <label className="block">
                <span className="label-mono text-foreground/60">Trade</span>
                <select
                  value={wp.trade}
                  onChange={(e) => setWp({ ...wp, trade: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {TRADES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <NumField
                label="Years of experience"
                value={wp.experience_years}
                onChange={(v) => setWp({ ...wp, experience_years: v })}
              />
              <NumField
                label="Expected pay (₹)"
                value={wp.expected_wage ?? 0}
                onChange={(v) => setWp({ ...wp, expected_wage: v })}
              />
              <label className="block">
                <span className="label-mono text-foreground/60">Pay period</span>
                <select
                  value={wp.wage_period}
                  onChange={(e) => setWp({ ...wp, wage_period: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="day">Per day</option>
                  <option value="week">Per week</option>
                  <option value="month">Per month</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="label-mono text-foreground/60">Skills (comma separated)</span>
                <input
                  value={wp.skills.join(", ")}
                  onChange={(e) =>
                    setWp({
                      ...wp,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Wiring, Inverters, Safety"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="label-mono text-foreground/60">Languages (comma separated)</span>
                <input
                  value={wp.languages.join(", ")}
                  onChange={(e) =>
                    setWp({
                      ...wp,
                      languages: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Hindi, Kannada, English"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="label-mono text-foreground/60">About your work</span>
                <textarea
                  value={wp.bio ?? ""}
                  rows={3}
                  onChange={(e) => setWp({ ...wp, bio: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={wp.available}
                  onChange={(e) => setWp({ ...wp, available: e.target.checked })}
                />
                <span className="text-sm">Available for work right now</span>
              </label>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-paper sm:col-span-2"
              >
                {saving ? "Saving…" : "Save identity"}
              </button>
            </div>
          </div>

          <div>
            <SectionTitle title="Certifications" meta={`${certs.length} on file`} />
            <div className="rounded-xl bg-panel p-5 ring-1 ring-black/5">
              <div className="space-y-2">
                {certs.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {c.name}
                      {c.issuer ? <span className="text-foreground/50"> · {c.issuer}</span> : null}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase ${c.verified ? "text-verify" : "text-accent-foreground/60"}`}
                    >
                      {c.verified ? "● verified" : "◐ pending"}
                    </span>
                  </div>
                ))}
                {!certs.length ? (
                  <p className="text-sm text-foreground/50">No certifications added yet.</p>
                ) : null}
              </div>
              <TripleAdd
                placeholders={["Certificate name", "Issuer", "Year"]}
                cta="Add certification"
                onAdd={(a, b, c) => addCert(a, b, c)}
              />
            </div>
          </div>

          <div>
            <SectionTitle title="Work history" meta={`${work.length} entries`} />
            <div className="rounded-xl bg-panel p-5 ring-1 ring-black/5">
              <div className="space-y-2">
                {work.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {w.role} <span className="text-foreground/50">at {w.employer_name}</span>
                    </span>
                    <span className="font-mono text-[11px] text-foreground/50">
                      {w.from_year ?? "—"}–{w.to_year ?? "now"}
                    </span>
                  </div>
                ))}
                {!work.length ? (
                  <p className="text-sm text-foreground/50">No past work added yet.</p>
                ) : null}
              </div>
              <QuadAdd onAdd={addWork} />
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="label-mono text-foreground/60">{label}</span>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function TripleAdd({
  placeholders,
  cta,
  onAdd,
}: {
  placeholders: [string, string, string] | string[];
  cta: string;
  onAdd: (a: string, b: string, c: string) => void;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-[2fr_1.5fr_0.8fr_auto]">
      <input
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder={placeholders[0]}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        value={b}
        onChange={(e) => setB(e.target.value)}
        placeholder={placeholders[1]}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        value={c}
        onChange={(e) => setC(e.target.value)}
        placeholder={placeholders[2]}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={() => {
          onAdd(a, b, c);
          setA("");
          setB("");
          setC("");
        }}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-paper"
      >
        {cta}
      </button>
    </div>
  );
}

function QuadAdd({ onAdd }: { onAdd: (a: string, b: string, c: string, d: string) => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
      <input
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="Employer"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        value={b}
        onChange={(e) => setB(e.target.value)}
        placeholder="Role"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        value={c}
        onChange={(e) => setC(e.target.value)}
        placeholder="From"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        value={d}
        onChange={(e) => setD(e.target.value)}
        placeholder="To"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={() => {
          onAdd(a, b, c, d);
          setA("");
          setB("");
          setC("");
          setD("");
        }}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-paper"
      >
        Add
      </button>
    </div>
  );
}
