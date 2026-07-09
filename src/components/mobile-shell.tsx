import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, ListChecks, ShoppingBag, User, Wand2 } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/analyze", label: "Scan", icon: Sparkles },
  { to: "/edit", label: "Studio", icon: Wand2 },
  { to: "/routine", label: "Routine", icon: ListChecks },
  { to: "/products", label: "Shop", icon: ShoppingBag },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background safe-x">
      <main className="flex-1 pb-28">{children}</main>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] safe-bottom"
      >
        <div className="mx-3 mb-2 rounded-3xl border border-border/60 bg-card/90 shadow-[0_8px_30px_-12px_rgba(120,60,50,0.25)] backdrop-blur-xl">
          <ul className="flex items-center justify-around px-2 py-2">
            {tabs.map((t) => {
              const active = pathname === t.to || (t.to !== "/home" && pathname.startsWith(t.to));
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    aria-label={t.label}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-w-16 flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition ${
                      active ? "text-primary" : "text-warm-gray"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                        active ? "bg-gradient-rose text-primary-foreground shadow-md" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                    </span>
                    <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="safe-top px-6 pt-4 pb-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
    </header>
  );
}
