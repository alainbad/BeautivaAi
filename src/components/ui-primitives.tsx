import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-border/60 bg-card/90 p-5 shadow-[0_10px_40px_-20px_rgba(150,80,70,0.35)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "good" | "warn" | "accent" }) {
  const map: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    good: "bg-[oklch(0.94_0.06_150)] text-[oklch(0.35_0.08_150)]",
    warn: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export function DisclaimerBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-lavender/40 p-4 text-xs leading-relaxed text-foreground/80">
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
      {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush/50 text-rose-gold">{icon}</div> : null}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-muted via-blush/40 to-muted bg-[length:200%_100%] ${className}`}
      style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
      aria-hidden="true"
    />
  );
}

export function ScoreRing({ score, size = 128 }: { score: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.92 0.02 40)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.09 30)" />
            <stop offset="100%" stopColor="oklch(0.8 0.06 300)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold text-foreground">{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Skin score</span>
      </div>
    </div>
  );
}
