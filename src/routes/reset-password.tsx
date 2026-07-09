import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset password — BeautyAI" },
      { name: "description", content: "Choose a new password for your BeautyAI account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase places the recovery session in the URL hash; the client picks it up on load.
    const isRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery");
    if (isRecovery) setReady(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      navigate({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4">
        <Link to="/login" className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-1.5 text-rose-gold">
          <Sparkles className="h-4 w-4" />
          <span className="font-display text-sm font-semibold">BeautyAI</span>
        </div>
      </header>

      <div className="flex-1 px-6 pt-8">
        <h1 className="font-display text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ready ? "Enter and confirm your new password below." : "Waiting for reset link… If nothing happens, request a new link."}
        </p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-foreground/70">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-foreground/70">Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !ready}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
