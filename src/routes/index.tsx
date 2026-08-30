import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, SectionTitle, VerifyChip } from "@/components/kaam";
import { TRADES } from "@/lib/match";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaamID — verified work identity for blue-collar India" },
      {
        name: "description",
        content:
          "KaamID gives electricians, plumbers, operators, technicians and drivers a verified digital work identity, and gives employers a transparent way to discover, verify and hire them.",
      },
      { property: "og:title", content: "KaamID — verified work identity for blue-collar India" },
      {
        property: "og:description",
        content:
          "A trusted hiring registry: verified worker identities, transparent job matching, and a hiring pipeline that replaces WhatsApp groups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  {
    k: "01",
    t: "Build the identity",
    d: "Trade, experience, skills, languages, certificates and past employers — one card that travels with the worker.",
  },
  {
    k: "02",
    t: "Verify the evidence",
    d: "ID check, skill assessment and employer references each stamp the card separately, so trust is visible not assumed.",
  },
  {
    k: "03",
    t: "Match transparently",
    d: "Every job shows a match score built from skill overlap, trade fit, city, experience and verification strength.",
  },
  {
    k: "04",
    t: "Move the pipeline",
    d: "Applications flow through applied, shortlisted, interview, hired — visible to both sides at every step.",
  },
];

function Index() {
  return (
    <Page>
      <section className="border-b-2 border-brand-ink bg-brand-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div>
            <p className="label-mono text-paper/55">A hiring registry, not a job board</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper md:text-6xl">
              Verified work identity for India's blue-collar workforce.
            </h1>
            <p className="mt-5 max-w-xl text-paper/75">
              Referrals and WhatsApp groups lose the proof of a career. KaamID turns skills,
              certificates and employer references into a portable, verifiable identity — and
              gives employers one place to discover, verify and hire.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-md bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground"
              >
                Build my KaamID
              </Link>
              <Link
                to="/employer"
                className="rounded-md border-2 border-paper/30 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-paper"
              >
                Hire verified workers
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-paper/15 pt-6">
              {[
                ["3-step", "verification"],
                ["5-factor", "match score"],
                ["1 pipeline", "both sides see"],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="font-display text-xl font-semibold text-paper">{a}</dt>
                  <dd className="label-mono text-paper/55">{b}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="self-center">
            <div className="hatch rounded-xl p-3">
              <div className="rounded-lg border-2 border-brand-ink bg-paper p-5 text-foreground shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="label-mono text-foreground/50">KaamID · worker card</p>
                  <span className="stamp">Verified</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">
                  Ramesh Kumar
                </h2>
                <p className="label-mono text-foreground/55">
                  Electrician · Pune · 8 yr exp
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <VerifyChip label="ID" on />
                  <VerifyChip label="Skill" on />
                  <VerifyChip label="Reference" on={false} />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Wiring", "Panel work", "Motor repair", "Safety"].map((s) => (
                    <span
                      key={s}
                      className="rounded bg-brand-ink/6 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-foreground/65"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-brand-ink/10 pt-3">
                  <span className="label-mono text-foreground/55">Expects ₹850/day</span>
                  <span className="rounded bg-verify/12 px-2 py-1 font-mono text-xs text-verify">
                    92% match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <SectionTitle title="Two doors, one registry" meta="pick your side" />
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border-2 border-brand-ink/15 bg-paper p-6">
            <p className="label-mono text-foreground/50">For workers</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">
              Carry your proof, not a phone number
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/75">
              <li>· A shareable ID card with trade, skills, certificates and work history</li>
              <li>· Verification stamps that employers can trust at a glance</li>
              <li>· A job feed ranked by how well each role actually fits you</li>
              <li>· Application status you can follow without chasing anyone</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/worker"
                className="rounded-md bg-brand-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-paper"
              >
                My identity
              </Link>
              <Link
                to="/jobs"
                className="rounded-md border-2 border-brand-ink/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em]"
              >
                Browse jobs
              </Link>
            </div>
          </article>

          <article className="rounded-lg border-2 border-brand-ink/15 bg-paper p-6">
            <p className="label-mono text-foreground/50">For employers</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">
              Hire on evidence, at scale
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/75">
              <li>· Post roles with trade, wage, shift and required skills in a minute</li>
              <li>· Search a verified talent pool by trade, city and skill</li>
              <li>· Ranked applicants with an explainable match score</li>
              <li>· A kanban pipeline from applied through hired</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/employer"
                className="rounded-md bg-brand-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-paper"
              >
                Post &amp; hire
              </Link>
              <Link
                to="/workers"
                className="rounded-md border-2 border-brand-ink/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em]"
              >
                Worker directory
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y-2 border-brand-ink bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <SectionTitle title="How trust is built" meta="four steps" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.k} className="rounded-lg border-2 border-brand-ink/15 p-5">
                <span className="label-mono text-accent-foreground/70">{s.k}</span>
                <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{s.t}</h3>
                <p className="mt-2 text-sm text-foreground/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <SectionTitle title="Trades on the registry" meta="and growing" />
        <div className="flex flex-wrap gap-2">
          {TRADES.map((t) => (
            <Link
              key={t}
              to="/jobs"
              className="rounded-md border-2 border-brand-ink/15 px-3 py-2 text-sm transition-colors hover:border-brand-ink"
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="mt-10 rounded-lg border-2 border-brand-ink bg-brand-ink px-6 py-8 text-paper">
          <h2 className="font-display text-2xl font-semibold">
            Hiring should take a day, not a month.
          </h2>
          <p className="mt-2 max-w-2xl text-paper/75">
            Create an account as a worker or an employer and the registry does the rest —
            verification, matching and pipeline in one place.
          </p>
          <Link
            to="/auth"
            className="mt-5 inline-block rounded-md bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground"
          >
            Get started
          </Link>
        </div>
      </section>
    </Page>
  );
}
