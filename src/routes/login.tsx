import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : undefined }),
  head: () => ({
    meta: [
      { title: "Log in — BeautyAI" },
      { name: "description", content: "Sign in to your BeautyAI account to continue your skincare journey." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Login() {
  return <AuthShell mode="login" />;
}

export function AuthShell({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password";
  const sub =
    mode === "login"
      ? "Sign in to continue your beauty journey."
      : mode === "signup"
      ? "Start with a free analysis in under two minutes."
      : "We'll send you a reset link.";

  const goAfterAuth = () => {
    const to = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/home";
    navigate({ to });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        goAfterAuth();
      } else if (mode === "signup") {
        if (password !== confirm) throw new Error("Passwords don't match");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome!");
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent — check your inbox.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setOauthLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? `Couldn't sign in with ${provider}`);
        setOauthLoading(null);
        return;
      }
      if (result.redirected) return; // browser navigating away
      goAfterAuth();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OAuth failed");
      setOauthLoading(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4">
        <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-1.5 text-rose-gold">
          <Sparkles className="h-4 w-4" />
          <span className="font-display text-sm font-semibold">BeautyAI</span>
        </div>
      </header>

      <div className="flex-1 px-6 pt-8">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{sub}</p>

        {mode !== "forgot" && (
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={() => handleOAuth("apple")}
              disabled={!!oauthLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-background text-[15px] font-medium disabled:opacity-60"
            >
              {oauthLoading === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <AppleGlyph /> Continue with Apple
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[15px] font-medium disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <GoogleGlyph /> Continue with Google
                </>
              )}
            </button>
            <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <Field label="Full name" type="text" placeholder="Sofia Laurent" value={fullName} onChange={setFullName} />
          )}
          <Field label="Email" type="email" placeholder="you@beautyai.app" value={email} onChange={setEmail} required />
          {mode !== "forgot" && (
            <Field label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
          )}
          {mode === "signup" && (
            <Field label="Confirm password" type="password" placeholder="••••••••" value={confirm} onChange={setConfirm} required />
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>
        </form>

        {mode === "login" && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot" className="text-muted-foreground">Forgot password?</Link>
            <Link to="/signup" className="font-medium text-rose-gold">Create account</Link>
          </div>
        )}
        {mode === "signup" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-rose-gold">Log in</Link>
          </p>
        )}
        {mode === "forgot" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered? <Link to="/login" className="font-medium text-rose-gold">Back to login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground/70">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] outline-none placeholder:text-muted-foreground/60 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
      />
    </label>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M16.365 12.53c-.02-2.03 1.66-3.01 1.74-3.06-.95-1.39-2.43-1.58-2.96-1.6-1.26-.13-2.46.74-3.1.74-.64 0-1.62-.72-2.67-.7-1.37.02-2.64.8-3.35 2.03-1.43 2.48-.36 6.15 1.03 8.17.68.99 1.49 2.1 2.55 2.06 1.03-.04 1.42-.66 2.66-.66 1.24 0 1.59.66 2.68.64 1.11-.02 1.81-1.01 2.49-2 .78-1.15 1.1-2.27 1.11-2.33-.02-.01-2.13-.82-2.16-3.24zM14.36 5.9c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.56-.85 2.48.9.07 1.82-.46 2.38-1.14z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.49-1.12 2.75-2.38 3.6v3h3.85c2.26-2.09 3.58-5.17 3.58-8.84z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-3c-1.08.72-2.45 1.15-4.08 1.15-3.14 0-5.79-2.12-6.74-4.97H1.29v3.12C3.26 21.3 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.26 14.27a7.14 7.14 0 0 1 0-4.55V6.6H1.29a12 12 0 0 0 0 10.79l3.97-3.12z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.97 3.12C6.21 6.87 8.86 4.75 12 4.75z"/>
    </svg>
  );
}
