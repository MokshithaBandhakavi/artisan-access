import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/session";
import { Mark } from "@/components/kaam";
import { TRADES } from "@/lib/match";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or join KaamID" },
      {
        name: "description",
        content:
          "Create your verified worker identity or your employer account on KaamID and start hiring blue-collar talent.",
      },
      { property: "og:title", content: "Sign in or join KaamID" },
      {
        property: "og:description",
        content: "Verified worker identities and faster blue-collar hiring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [accountType, setAccountType] = useState<"worker" | "employer">("worker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [trade, setTrade] = useState<string>(TRADES[0] ?? "Electrician");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: accountType === "employer" ? "/employer" : "/worker" });
  }, [user, navigate, accountType]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, city, account_type: accountType },
          },
        });
        if (error) throw error;
        if (data.user && accountType === "worker") {
          await supabase.from("worker_profiles").update({ trade }).eq("user_id", data.user.id);
        }
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
  }

  return (
    <div className="min-h-screen bg-brand text-paper">
      <div className="mx-auto max-w-md px-5 py-12">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <Mark size="md" />
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold">KaamID</span>
            <span className="label-mono block text-paper/60">Verified work identity</span>
          </span>
        </Link>

        <div className="rounded-xl bg-panel p-6 text-foreground ring-1 ring-black/5">
          <div className="mb-5 flex gap-1 rounded-lg bg-foreground/6 p-1">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  mode === m ? "bg-brand text-paper" : "text-foreground/60"
                }`}
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          {mode === "signup" ? (
            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setAccountType("worker")}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  accountType === "worker" ? "border-verify bg-verify/10" : "border-border"
                }`}
              >
                <span className="label-mono block text-verify">Door 01</span>
                <span className="font-display text-base font-semibold">I'm a Worker</span>
              </button>
              <button
                onClick={() => setAccountType("employer")}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  accountType === "employer" ? "border-hazard bg-hazard/10" : "border-border"
                }`}
              >
                <span className="label-mono block text-hazard">Door 02</span>
                <span className="font-display text-base font-semibold">I'm an Employer</span>
              </button>
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" ? (
              <>
                <Field label="Full name" value={fullName} onChange={setFullName} required />
                <Field label="City" value={city} onChange={setCity} placeholder="Bengaluru" />
                {accountType === "worker" ? (
                  <label className="block">
                    <span className="label-mono text-foreground/60">Trade</span>
                    <select
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      {TRADES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </>
            ) : null}
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />
            <button
              disabled={busy}
              className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-paper transition-colors hover:bg-brand-ink disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "signup" ? "Create my account" : "Sign in"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="label-mono text-foreground/40">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            onClick={google}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold transition-colors hover:bg-foreground/5"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label-mono text-foreground/60">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
