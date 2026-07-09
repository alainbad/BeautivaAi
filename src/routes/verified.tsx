import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export const Route = createFileRoute("/verified")({
  component: Verified,
  head: () => ({
    meta: [
      { title: "Email verified — BeautyAI" },
      { name: "description", content: "Your BeautyAI email address is verified." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Verified() {
  const [status, setStatus] = useState<"checking" | "verified" | "failed">("checking");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // supabase-js auto-detects the confirmation tokens in the URL and
    // establishes a session on load; we sign back out immediately so the
    // user deliberately logs in, matching the "verified, please log in"
    // flow rather than silently signing them in from an email click.
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error || !data.session) {
        setStatus("failed");
        return;
      }
      await supabase.auth.signOut();
      setStatus("verified");
    });
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4">
        <Link
          to="/login"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-1.5 text-rose-gold">
          <Sparkles className="h-4 w-4" />
          <span className="font-display text-sm font-semibold">BeautyAI</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        {status === "checking" && (
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        )}

        {status === "verified" && (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush/60 text-rose-gold">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-semibold">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your BeautyAI account is ready. Log in to start your skincare journey.
            </p>
            <Link
              to="/login"
              className="mt-8 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30"
            >
              Log in
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 className="font-display text-2xl font-semibold">Verification link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link is no longer valid. Try logging in — if your email still isn't verified,
              sign up again to get a new link.
            </p>
            <Link
              to="/login"
              className="mt-8 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30"
            >
              Back to log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
