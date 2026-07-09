import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui-primitives";
import { unwrap } from "@/lib/query-helpers";
import {
  requestNotificationPermission,
  syncReminderNotifications,
} from "@/lib/capacitor/notifications";
import { getProfile } from "@/functions/profile";
import { getSubscription, createBillingPortalSession } from "@/functions/subscriptions";
import { createReminder, listReminders, setReminderActive } from "@/functions/reminders";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings — BeautyAI" },
      {
        name: "description",
        content: "Manage notifications, appearance, and account preferences.",
      },
      { property: "og:title", content: "Settings — BeautyAI" },
      {
        property: "og:description",
        content: "Manage notifications, appearance, and account preferences.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const NOTIFICATION_TOGGLES = [
  { title: "Morning routine reminder", time: "08:00" },
  { title: "Evening routine reminder", time: "20:00" },
  { title: "Weekly progress check-in", time: "09:00" },
  { title: "Product tips & new features", time: "10:00" },
];

function Settings() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => unwrap(getProfile()) });
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: () => unwrap(getSubscription()),
  });
  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => unwrap(listReminders()),
  });

  useEffect(() => {
    if (!remindersQuery.data) return;
    requestNotificationPermission().then((granted) => {
      if (granted) syncReminderNotifications(remindersQuery.data);
    });
  }, [remindersQuery.data]);

  const portalMutation = useMutation({
    mutationFn: () => unwrap(createBillingPortalSession()),
  });

  const toggleReminderMutation = useMutation({
    mutationFn: async (title: string) => {
      const existing = remindersQuery.data?.find((r) => r.title === title);
      if (existing) {
        await unwrap(
          setReminderActive({ data: { id: existing.id, isActive: !existing.is_active } }),
        );
      } else {
        const preset = NOTIFICATION_TOGGLES.find((t) => t.title === title);
        await unwrap(
          createReminder({
            data: { title, reminderTime: preset?.time ?? "09:00", daysOfWeek: [] },
          }),
        );
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const profile = profileQuery.data;
  const subscription = subscriptionQuery.data;

  const handleManageBilling = async () => {
    const res = await portalMutation.mutateAsync();
    window.location.assign(res.portalUrl);
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4 pb-3">
        <Link
          to="/profile"
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
      </header>

      <section className="px-6 space-y-5">
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Account
          </h2>
          <GlassCard className="p-0">
            <Row label="Full name" value={profile?.full_name || "—"} />
            <Row label="Email" value={profile?.email || "—"} />
            <Row label="Country" value={profile?.country || "—"} last />
          </GlassCard>
        </div>

        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Notifications
          </h2>
          <GlassCard className="p-0">
            {NOTIFICATION_TOGGLES.map((t, i) => {
              const reminder = remindersQuery.data?.find((r) => r.title === t.title);
              return (
                <Toggle
                  key={t.title}
                  label={t.title}
                  checked={reminder?.is_active ?? false}
                  onChange={() => toggleReminderMutation.mutate(t.title)}
                  last={i === NOTIFICATION_TOGGLES.length - 1}
                />
              );
            })}
          </GlassCard>
        </div>

        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Subscription
          </h2>
          <GlassCard>
            <p className="text-sm capitalize">{subscription?.plan ?? "Free"} plan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {subscription?.current_period_end
                ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : "No active billing period."}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Link
                to="/pricing"
                className="flex h-11 items-center justify-center rounded-2xl border border-border bg-card text-sm font-medium"
              >
                Manage plan
              </Link>
              <button
                onClick={handleManageBilling}
                disabled={portalMutation.isPending}
                className="flex h-11 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {portalMutation.isPending ? "Opening…" : "Billing portal"}
              </button>
            </div>
          </GlassCard>
        </div>

        <p className="pb-10 text-center text-[11px] text-muted-foreground">BeautyAI v1.0.0 · iOS</p>
      </section>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  last,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <label
      className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}
    >
      <span className="text-sm">{label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <span className="block h-6 w-10 rounded-full bg-muted transition peer-checked:bg-gradient-rose" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
