export type MatchInput = {
  workerSkills: string[];
  workerTrade: string;
  workerCity: string | null;
  workerExperience: number;
  verifiedCount: number;
  jobSkills: string[];
  jobTrade: string;
  jobCity: string;
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Transparent match engine: skill overlap (50), trade fit (20),
 * location fit (15), experience (10), verification strength (5).
 */
export function matchScore(input: MatchInput): number {
  const ws = new Set(input.workerSkills.map(norm).filter(Boolean));
  const js = input.jobSkills.map(norm).filter(Boolean);

  const overlap = js.length ? js.filter((s) => ws.has(s)).length / js.length : 0.6;
  let score = overlap * 50;

  if (input.jobTrade && norm(input.jobTrade) === norm(input.workerTrade)) score += 20;
  else if (input.workerTrade && js.some((s) => norm(input.workerTrade).includes(s))) score += 10;

  if (input.jobCity && input.workerCity && norm(input.jobCity) === norm(input.workerCity)) score += 15;
  else if (input.workerCity) score += 5;

  score += Math.min(input.workerExperience, 10) / 10 * 10;
  score += (Math.min(input.verifiedCount, 3) / 3) * 5;

  return Math.max(12, Math.min(99, Math.round(score)));
}

export function matchTone(score: number) {
  if (score >= 85) return "verify" as const;
  if (score >= 65) return "accent" as const;
  return "hazard" as const;
}

export const TRADES = [
  "Electrician",
  "Plumber",
  "Machine Operator",
  "Delivery Executive",
  "Technician",
  "Construction Worker",
  "Welder",
  "Carpenter",
  "Painter",
  "Driver",
  "Housekeeping",
  "Security Guard",
];
