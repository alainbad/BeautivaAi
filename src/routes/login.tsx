import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Log in — BeautyAI" },
      { name: "description", content: "Sign in to your BeautyAI account to continue your skincare journey." },
      { property: "og:title", content: "Log in — BeautyAI" },
      { property: "og:description", content: "Sign in to your BeautyAI account to continue your skincare journey." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Login() {
  return <AuthShell mode="login" />;
}

export function AuthShell({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password";
  const sub =
    mode === "login"
      ? "Sign in to continue your beauty journey."
      : mode === "signup"
      ? "Start with a free analysis in under two minutes."
      : "We'll send you a reset link.";
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4">
        <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-1.5 text-rose-gold">
          <Sparkles className="h-4 w-4" />
          <span className="font-display text-sm font-semibold">BeautyAI</span>
        </div>
      </header>

      <div className="flex-1 px-6 pt-8">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{sub}</p>

        <form className="mt-8 space-y-3" onSubmit={(e) => e.preventDefault()}>
          {mode === "signup" && <Field label="Full name" type="text" placeholder="Sofia Laurent" />}
          <Field label="Email" type="email" placeholder="you@beautyai.app" />
          {mode !== "forgot" && <Field label="Password" type="password" placeholder="••••••••" />}
          {mode === "signup" && <Field label="Confirm password" type="password" placeholder="••••••••" />}

          <Link
            to={mode === "signup" ? "/onboarding" : "/home"}
            className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30"
          >
            {mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
          </Link>
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

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground/70">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] outline-none placeholder:text-muted-foreground/60 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
      />
    </label>
  );
}
