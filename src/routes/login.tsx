import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  requestPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Log in — BeautyAI" },
      {
        name: "description",
        content: "Sign in to your BeautyAI account to continue your skincare journey.",
      },
      { property: "og:title", content: "Log in — BeautyAI" },
      {
        property: "og:description",
        content: "Sign in to your BeautyAI account to continue your skincare journey.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Login() {
  return <AuthShell mode="login" />;
}

export function AuthShell({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const title =
    mode === "login"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset password";
  const sub =
    mode === "login"
      ? "Sign in to continue your beauty journey."
      : mode === "signup"
        ? "Start with a free analysis in under two minutes."
        : "We'll send you a reset link.";

  const submitLabel = submitting
    ? "Please wait…"
    : mode === "login"
      ? "Log in"
      : mode === "signup"
        ? "Create account"
        : "Send reset link";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithPassword({ email, password });
        nav({ to: "/home" });
      } else if (mode === "signup") {
        await signUpWithPassword({ email, password, fullName });
        nav({ to: "/onboarding" });
      } else {
        await requestPasswordReset(email);
        setNotice("Check your email for a reset link.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4">
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border"
        >
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

        <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <Field
              label="Full name"
              type="text"
              placeholder="Sofia Laurent"
              value={fullName}
              onChange={setFullName}
              required
            />
          )}
          <Field
            label="Email"
            type="email"
            placeholder="you@beautyai.app"
            value={email}
            onChange={setEmail}
            required
          />
          {mode !== "forgot" && (
            <Field
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
              minLength={8}
            />
          )}
          {mode === "signup" && (
            <Field
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              minLength={8}
            />
          )}

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          {notice && <p className="text-xs font-medium text-rose-gold">{notice}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleSubmitting}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[15px] font-medium disabled:opacity-60"
            >
              {googleSubmitting ? "Opening Google…" : "Continue with Google"}
            </button>
          </>
        )}

        {mode === "login" && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot" className="text-muted-foreground">
              Forgot password?
            </Link>
            <Link to="/signup" className="font-medium text-rose-gold">
              Create account
            </Link>
          </div>
        )}
        {mode === "signup" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-rose-gold">
              Log in
            </Link>
          </p>
        )}
        {mode === "forgot" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered?{" "}
            <Link to="/login" className="font-medium text-rose-gold">
              Back to login
            </Link>
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
  minLength,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground/70">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] outline-none placeholder:text-muted-foreground/60 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
      />
    </label>
  );
}
