import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard } from "@/components/ui-primitives";
import { unwrap } from "@/lib/query-helpers";
import { signOut } from "@/lib/auth-client";
import { getProfile, upsertProfile } from "@/functions/profile";
import { getSubscription } from "@/functions/subscriptions";
import type { Profile } from "@/lib/supabase/types";
import {
  ChevronRight,
  LogOut,
  CreditCard,
  Bell,
  LineChart,
  MessageCircleHeart,
  Shield,
  Settings as SettingsIcon,
  Check,
  Pencil,
} from "lucide-react";

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];
const SKIN_TYPES = ["Oily", "Dry", "Combination", "Sensitive", "Normal", "Not sure"];
const CONCERNS = [
  "Acne",
  "Redness",
  "Dark spots",
  "Fine lines",
  "Large pores",
  "Dryness",
  "Oiliness",
  "Dullness",
  "Uneven tone",
];
const ALLERGIES = ["Fragrance", "Essential oils", "Nuts", "Nickel", "None"];
const BUDGETS = ["Budget-friendly", "Mid-range", "Premium", "Luxury"];

type BeautyProfileForm = {
  dateOfBirth: string;
  ageRange: string;
  skinType: string;
  skinConcerns: string[];
  allergies: string[];
  preferredBudget: string;
  country: string;
};

function formFromProfile(profile: Profile | null | undefined): BeautyProfileForm {
  return {
    dateOfBirth: profile?.date_of_birth ?? "",
    ageRange: profile?.age_range ?? "",
    skinType: profile?.skin_type ?? "",
    skinConcerns: profile?.skin_concerns ?? [],
    allergies: profile?.allergies ?? [],
    preferredBudget: profile?.preferred_budget ?? "",
    country: profile?.country ?? "",
  };
}

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — BeautyAI" },
      {
        name: "description",
        content: "Your BeautyAI profile: skin type, concerns, goals, and preferences.",
      },
      { property: "og:title", content: "Profile — BeautyAI" },
      {
        property: "og:description",
        content: "Your BeautyAI profile: skin type, concerns, goals, and preferences.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProfilePage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => unwrap(getProfile()) });
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: () => unwrap(getSubscription()),
  });

  const profile = profileQuery.data;
  const initial = profile?.full_name?.trim()?.[0]?.toUpperCase() ?? "?";
  const isPremium = subscriptionQuery.data?.plan === "premium";

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BeautyProfileForm>(() => formFromProfile(profile));

  const startEditing = () => {
    setForm(formFromProfile(profile));
    setEditing(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      unwrap(
        upsertProfile({
          data: {
            dateOfBirth: form.dateOfBirth || undefined,
            ageRange: form.ageRange || undefined,
            skinType: form.skinType || undefined,
            skinConcerns: form.skinConcerns,
            allergies: form.allergies,
            preferredBudget: form.preferredBudget || undefined,
            country: form.country || undefined,
          },
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
    },
  });

  const toggleInForm = (key: "skinConcerns" | "allergies", value: string) => {
    setForm((prev) => {
      const cur = prev[key];
      return {
        ...prev,
        [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      };
    });
  };

  const handleLogout = async () => {
    await signOut();
    nav({ to: "/" });
  };

  return (
    <MobileShell>
      <ScreenHeader title="Profile" subtitle="Manage your beauty preferences." />

      <section className="px-6">
        <GlassCard className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-blush font-display text-2xl font-semibold text-rose-gold">
            {initial}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-semibold">
              {profile?.full_name ?? "Add your name"}
            </p>
            <p className="text-xs text-muted-foreground">{profile?.email ?? ""}</p>
            {isPremium && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-rose px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Premium
              </span>
            )}
          </div>
        </GlassCard>
      </section>

      <section className="mt-5 px-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Beauty profile
          </h2>
          {!editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1 text-xs font-medium text-rose-gold"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <GlassCard className="space-y-4">
            <FormField label="Date of birth">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-rose-gold"
              />
            </FormField>

            <FormField label="Age range">
              <select
                value={form.ageRange}
                onChange={(e) => setForm((prev) => ({ ...prev, ageRange: e.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-rose-gold"
              >
                <option value="">—</option>
                {AGE_RANGES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Skin type">
              <select
                value={form.skinType}
                onChange={(e) => setForm((prev) => ({ ...prev, skinType: e.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-rose-gold"
              >
                <option value="">—</option>
                {SKIN_TYPES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Concerns">
              <ChipGrid
                options={CONCERNS}
                selected={form.skinConcerns}
                onToggle={(v) => toggleInForm("skinConcerns", v)}
              />
            </FormField>

            <FormField label="Allergies">
              <ChipGrid
                options={ALLERGIES}
                selected={form.allergies}
                onToggle={(v) => toggleInForm("allergies", v)}
              />
            </FormField>

            <FormField label="Budget">
              <select
                value={form.preferredBudget}
                onChange={(e) => setForm((prev) => ({ ...prev, preferredBudget: e.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-rose-gold"
              >
                <option value="">—</option>
                {BUDGETS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Country">
              <input
                type="text"
                value={form.country}
                placeholder="Country"
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-rose-gold"
              />
            </FormField>

            {saveMutation.error && (
              <p className="text-xs font-medium text-destructive">
                {saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : "Couldn't save. Please try again."}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setEditing(false)}
                disabled={saveMutation.isPending}
                className="flex h-11 items-center justify-center rounded-2xl border border-border bg-card text-sm font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex h-11 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {saveMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-0">
            <ProfileRow
              label="Date of birth"
              value={
                profile?.date_of_birth
                  ? new Date(profile.date_of_birth).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <ProfileRow label="Age range" value={profile?.age_range || "—"} />
            <ProfileRow label="Skin type" value={profile?.skin_type || "—"} />
            <ProfileRow label="Concerns" value={profile?.skin_concerns?.join(", ") || "—"} />
            <ProfileRow label="Allergies" value={profile?.allergies?.join(", ") || "None"} />
            <ProfileRow label="Budget" value={profile?.preferred_budget || "—"} />
            <ProfileRow label="Country" value={profile?.country || "—"} last />
          </GlassCard>
        )}
      </section>

      <section className="mt-5 px-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Shortcuts
        </h2>
        <GlassCard className="p-0">
          <NavRow
            to="/progress"
            icon={<LineChart className="h-4 w-4" />}
            label="Progress tracker"
          />
          <NavRow
            to="/chat"
            icon={<MessageCircleHeart className="h-4 w-4" />}
            label="AI beauty chat"
          />
          <NavRow
            to="/pricing"
            icon={<CreditCard className="h-4 w-4" />}
            label="Manage subscription"
          />
          <NavRow
            to="/settings"
            icon={<SettingsIcon className="h-4 w-4" />}
            label="Settings & notifications"
          />
          {profile?.is_admin && (
            <NavRow to="/admin" icon={<Shield className="h-4 w-4" />} label="Admin" last />
          )}
        </GlassCard>
      </section>

      <section className="mt-6 px-6">
        <button
          onClick={handleLogout}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-medium text-foreground/80"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </section>
    </MobileShell>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground/70">{label}</span>
      {children}
    </label>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${
              on
                ? "border-rose-gold bg-blush/40 text-foreground"
                : "border-border bg-card text-foreground/85"
            }`}
          >
            <span>{opt}</span>
            {on && <Check className="h-3.5 w-3.5 text-rose-gold" />}
          </button>
        );
      })}
    </div>
  );
}

function ProfileRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function NavRow({
  to,
  icon,
  label,
  last,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  last?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blush/50 text-rose-gold">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
