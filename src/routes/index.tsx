import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Camera, ListChecks, ShoppingBag, LineChart, Bell, MessageCircleHeart, ChevronRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";

export const Route = createFileRoute("/")({
  component: Welcome,
  head: () => ({
    meta: [
      { title: "BeautyAI — AI Skin Analysis & Personalized Skincare Routines" },
      { name: "description", content: "Get a personalized skincare routine from a single selfie. AI-powered skin analysis, product matches, and progress tracking — built for glow." },
      { property: "og:title", content: "BeautyAI — AI Skin Analysis & Personalized Skincare" },
      { property: "og:description", content: "Analyze your skin, build your routine, track your progress, and discover products made for you." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const features = [
  { icon: Sparkles, title: "AI Skin Analysis", desc: "A cosmetic report from a single selfie." },
  { icon: ListChecks, title: "Personalized Routine", desc: "Morning and evening steps tailored to you." },
  { icon: ShoppingBag, title: "Product Matches", desc: "Recommendations by skin type and concern." },
  { icon: LineChart, title: "Progress Tracking", desc: "See your glow-up over the weeks." },
  { icon: Bell, title: "Beauty Reminders", desc: "Never skip a step in your routine." },
  { icon: MessageCircleHeart, title: "AI Beauty Chat", desc: "Ask anything about skincare, anytime." },
];

const steps = [
  { n: "01", title: "Upload your selfie", desc: "Natural light, no filters." },
  { n: "02", title: "Get your analysis", desc: "Score + cosmetic breakdown." },
  { n: "03", title: "Follow your routine", desc: "AM & PM steps, curated for you." },
  { n: "04", title: "Track your progress", desc: "See real changes month over month." },
];

const testimonials = [
  { name: "Ines M.", text: "My skin has never felt this calm. The routine finally makes sense.", stars: 5 },
  { name: "Layla R.", text: "Loved the product matches — no more guessing at Sephora.", stars: 5 },
  { name: "Sofia P.", text: "The progress tracker is addictive in the best way.", stars: 5 },
];

const faqs = [
  { q: "Is this medical advice?", a: "No — BeautyAI provides cosmetic guidance only. For medical concerns see a dermatologist." },
  { q: "Do I need special equipment?", a: "Just your phone camera in good natural light." },
  { q: "Can I cancel anytime?", a: "Yes, subscriptions can be cancelled from your profile at any time." },
];

function Welcome() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background safe-x">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-blush opacity-90" />
        <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-rose-gold/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-lavender/50 blur-3xl" />
        <div className="relative safe-top px-6 pt-8 pb-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/60 backdrop-blur">
                <Sparkles className="h-4 w-4 text-rose-gold" />
              </span>
              <span className="font-display text-lg font-semibold">BeautyAI</span>
            </div>
            <Link to="/login" className="text-sm font-medium text-foreground/80">
              Log in
            </Link>
          </div>

          <div className="mt-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-foreground/70 backdrop-blur">
              <Sparkles className="h-3 w-3" /> Powered by AI Vision
            </span>
            <h1 className="mt-4 font-display text-[40px] leading-[1.05] font-semibold text-foreground">
              Your personal <span className="text-gradient-rose italic">AI beauty</span> assistant.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
              Analyze your skin, build your routine, track your progress, and discover products made for you.
            </p>
            <div className="mt-7 flex flex-col gap-2.5">
              <Link
                to="/signup"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium shadow-lg shadow-rose-gold/30 active:scale-[0.99]"
              >
                Start skin analysis
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-foreground/10 bg-white/60 text-[15px] font-medium text-foreground backdrop-blur"
              >
                Explore features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="px-6 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-gold">Features</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">Everything your skin needs</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blush/50 text-rose-gold">
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 font-display text-[15px] font-semibold leading-tight">{f.title}</h3>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-gold">How it works</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">Four calm steps</h2>
        <ol className="mt-5 space-y-3">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-3xl border border-border/60 bg-card p-4">
              <span className="font-display text-2xl text-rose-gold">{s.n}</span>
              <div>
                <h3 className="font-display text-[15px] font-semibold">{s.title}</h3>
                <p className="text-[12px] text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing preview */}
      <section className="px-6 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-gold">Pricing</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">Start free, glow further with Premium</h2>
        <div className="mt-5 grid gap-3">
          <div className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-lg font-semibold">Free</h3>
              <span className="font-display text-xl">$0</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>· Basic profile & onboarding</li>
              <li>· 1 skin analysis / month</li>
              <li>· Basic routine</li>
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-blush p-5 shadow-lg">
            <div className="mb-2 flex justify-end">
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-rose-gold">
                Popular
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-semibold">Premium</h3>
              <span className="font-display text-xl whitespace-nowrap">$4.99<span className="text-sm font-normal">/mo</span></span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              <li>· Unlimited analyses</li>
              <li>· Progress tracking</li>
              <li>· AI Beauty Chat</li>
              <li>· Premium product matching</li>
              <li>· Beauty reminders</li>
            </ul>
            <Link to="/pricing" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
              See pricing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-gold">Loved by beauty lovers</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">A calmer relationship with your skin</h2>
        <div className="mt-5 space-y-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-3xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-1 text-rose-gold">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm text-foreground/85">"{t.text}"</p>
              <p className="mt-2 text-xs text-muted-foreground">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-gold">FAQ</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">Good to know</h2>
        <div className="mt-5 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-3xl border border-border/60 bg-card p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-display text-[15px] font-medium">{f.q}</span>
                <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-12 safe-bottom">
        <div className="rounded-3xl bg-gradient-rose p-6 text-primary-foreground shadow-xl">
          <h3 className="font-display text-2xl font-semibold">Ready to meet your skin?</h3>
          <p className="mt-1 text-sm opacity-90">Two minutes to your first analysis.</p>
          <Link
            to="/signup"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-rose-gold"
          >
            Start free
          </Link>
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">© 2026 BeautyAI · Cosmetic guidance only</p>
      </section>
    </div>
  );
}
