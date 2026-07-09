import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard } from "@/components/ui-primitives";
import { Camera, ChevronRight, LogOut, CreditCard, LineChart, MessageCircleHeart, Shield, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { useAuth, useProfile, useSubscription, isPro, useSignOut } from "@/hooks/use-auth";


const AVATAR_STORAGE_KEY = "beautyai:profile-avatar";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — BeautyAI" },
      { name: "description", content: "Your BeautyAI profile: skin type, concerns, goals, and preferences." },
      { property: "og:title", content: "Profile — BeautyAI" },
      { property: "og:description", content: "Your BeautyAI profile: skin type, concerns, goals, and preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { data: profile } = useProfile(user);
  const { data: sub } = useSubscription(user);
  const signOut = useSignOut();
  const pro = isPro(sub);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) setAvatar(saved);
    } catch {}
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setAvatar(dataUrl);
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar(null);
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const shownAvatar = avatar ?? profile?.avatar_url ?? null;
  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Guest";
  const initial = (displayName?.[0] ?? "G").toUpperCase();

  // Not signed in — show CTA
  if (!loading && !isAuthenticated) {
    return (
      <MobileShell>
        <ScreenHeader title="Profile" subtitle="Sign in to sync across devices." />
        <section className="px-6">
          <GlassCard className="text-center">
            <p className="font-display text-lg font-semibold">You're not signed in</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a free account to save your routine, track progress, and unlock Pro features.
            </p>
            <Link
              to="/login"
              className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30"
            >
              Sign in or create account
            </Link>
          </GlassCard>
        </section>
      </MobileShell>
    );
  }


  return (
    <MobileShell>
      <ScreenHeader title="Profile" subtitle="Manage your beauty preferences." />

      <section className="px-6">
        <GlassCard className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload profile photo"
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-blush focus:outline-none focus:ring-2 focus:ring-rose-gold"
          >
            {shownAvatar ? (
              <img src={shownAvatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-rose-gold">
                {initial}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/45 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
              <Camera className="h-3 w-3" /> Edit
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="flex-1">
            <p className="font-display text-lg font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
            <div className="mt-1 flex items-center gap-2">
              {pro ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-rose px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Pro
                </span>
              ) : (
                <Link to="/pricing" className="inline-flex items-center gap-1 rounded-full border border-rose-gold/40 px-2 py-0.5 text-[10px] font-semibold text-rose-gold">
                  Upgrade to Pro
                </Link>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-gold"
              >
                <Camera className="h-3 w-3" /> {avatar ? "Change photo" : "Upload photo"}
              </button>
              {avatar ? (
                <button
                  type="button"
                  onClick={removeAvatar}
                  aria-label="Remove profile photo"
                  className="inline-flex items-center text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="mt-5 px-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Beauty profile
        </h2>
        <GlassCard className="p-0">
          <ProfileRow label="Age range" value="25–34" />
          <ProfileRow label="Skin type" value="Combination" />
          <ProfileRow label="Concerns" value="Redness, Dark spots, Pores" />
          <ProfileRow label="Allergies" value="Fragrance" />
          <ProfileRow label="Budget" value="Mid-range" />
          <ProfileRow label="Country" value="France" last />
        </GlassCard>
      </section>

      <section className="mt-5 px-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Shortcuts
        </h2>
        <GlassCard className="p-0">
          <NavRow to="/progress" icon={<LineChart className="h-4 w-4" />} label="Progress tracker" />
          <NavRow to="/chat" icon={<MessageCircleHeart className="h-4 w-4" />} label="AI beauty chat" />
          <NavRow to="/pricing" icon={<CreditCard className="h-4 w-4" />} label="Manage subscription" />
          <NavRow to="/settings" icon={<SettingsIcon className="h-4 w-4" />} label="Settings & notifications" />
          <NavRow to="/admin" icon={<Shield className="h-4 w-4" />} label="Admin (preview)" last />
        </GlassCard>
      </section>

      <section className="mt-6 px-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-medium text-foreground/80"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </section>

    </MobileShell>
  );
}

function ProfileRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function NavRow({ to, icon, label, last }: { to: string; icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blush/50 text-rose-gold">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
