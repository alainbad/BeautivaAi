import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import onboardingArt from "@/assets/onboarding-illustration.png";
import { upsertProfile } from "@/functions/profile";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({
    meta: [
      { title: "Get started — BeautyAI" },
      {
        name: "description",
        content:
          "Answer a few questions so BeautyAI can tailor your skincare routine and product recommendations.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Step = {
  key: string;
  question: string;
  helper: string;
  options: string[];
  multi?: boolean;
};

const steps: Step[] = [
  {
    key: "age",
    question: "Your age range?",
    helper: "Helps us tailor ingredient guidance.",
    options: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"],
  },
  {
    key: "skinType",
    question: "Your skin type?",
    helper: "It's okay to not know — we'll refine after analysis.",
    options: ["Oily", "Dry", "Combination", "Sensitive", "Normal", "Not sure"],
  },
  {
    key: "concerns",
    question: "Main skin concerns?",
    helper: "Pick up to 4.",
    multi: true,
    options: [
      "Acne",
      "Redness",
      "Dark spots",
      "Fine lines",
      "Large pores",
      "Dryness",
      "Oiliness",
      "Dullness",
      "Uneven tone",
    ],
  },
  {
    key: "allergies",
    question: "Allergies or sensitivities?",
    helper: "Optional — you can skip.",
    multi: true,
    options: ["Fragrance", "Essential oils", "Nuts", "Nickel", "None"],
  },
  {
    key: "budget",
    question: "Preferred budget?",
    helper: "We'll match products in your range.",
    options: ["Budget-friendly", "Mid-range", "Premium", "Luxury"],
  },
  {
    key: "goals",
    question: "Beauty goals?",
    helper: "Pick a few — we'll design your routine around these.",
    multi: true,
    options: [
      "Brighter tone",
      "Clearer skin",
      "Anti-aging",
      "Hydration",
      "Even texture",
      "Fewer breakouts",
    ],
  },
];

function Onboarding() {
  const nav = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const step = steps[idx];
  const selected = answers[step.key] ?? [];

  const toggle = (opt: string) => {
    setAnswers((prev) => {
      const cur = prev[step.key] ?? [];
      if (step.multi) {
        return {
          ...prev,
          [step.key]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
        };
      }
      return { ...prev, [step.key]: [opt] };
    });
  };

  const finish = async (finalAnswers: Record<string, string[]>) => {
    setSaving(true);
    setError(null);
    try {
      await upsertProfile({
        data: {
          ageRange: finalAnswers.age?.[0],
          skinType: finalAnswers.skinType?.[0],
          skinConcerns: finalAnswers.concerns,
          allergies: finalAnswers.allergies?.filter((a) => a !== "None"),
          preferredBudget: finalAnswers.budget?.[0],
        },
      });
      nav({ to: "/home" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't save your answers. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (idx < steps.length - 1) setIdx(idx + 1);
    else void finish(answers);
  };
  const back = () => (idx > 0 ? setIdx(idx - 1) : nav({ to: "/signup" }));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4">
        <button
          onClick={back}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={idx + 1}
            aria-label={`Step ${idx + 1} of ${steps.length}`}
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-gradient-rose transition-all"
              style={{ width: `${((idx + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <Link to="/home" className="text-xs text-muted-foreground">
          Skip
        </Link>
      </header>

      <div className="flex-1 px-6 pt-6">
        {idx === 0 ? (
          <div className="flex justify-center">
            <img
              src={onboardingArt}
              alt=""
              width={1024}
              height={1024}
              className="h-32 w-32 opacity-90"
            />
          </div>
        ) : null}
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-gold">
          Step {idx + 1} of {steps.length}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{step.question}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{step.helper}</p>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {step.options.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm transition ${
                  on
                    ? "border-rose-gold bg-blush/40 text-foreground"
                    : "border-border bg-card text-foreground/85"
                }`}
              >
                <span>{opt}</span>
                {on && <Check className="h-4 w-4 text-rose-gold" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="safe-bottom px-6 py-4">
        {error && <p className="mb-2 text-center text-xs font-medium text-destructive">{error}</p>}
        <button
          onClick={next}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-md shadow-rose-gold/30 disabled:opacity-50"
          disabled={selected.length === 0 || saving}
        >
          {saving ? "Saving…" : idx === steps.length - 1 ? "Finish" : "Continue"}
          {!saving && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </main>
  );
}
