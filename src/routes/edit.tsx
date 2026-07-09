import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard } from "@/components/ui-primitives";
import { useAuth, useSubscription, isPro } from "@/hooks/use-auth";
import {
  Camera,
  Download,
  ImagePlus,
  Lock,
  RotateCcw,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";

export const Route = createFileRoute("/edit")({
  component: EditPage,
  head: () => ({
    meta: [
      { title: "Photo Studio — BeautyAI" },
      {
        name: "description",
        content:
          "Retouch, glow, and glam your photos with beauty filters and AI-powered tools.",
      },
      { property: "og:title", content: "Photo Studio — BeautyAI" },
      {
        property: "og:description",
        content:
          "Retouch, glow, and glam your photos with beauty filters and AI-powered tools.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Adjust = {
  brightness: number;
  contrast: number;
  saturate: number;
  warmth: number;
  smooth: number;
  vignette: number;
};

const DEFAULT_ADJUST: Adjust = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  warmth: 0,
  smooth: 0,
  vignette: 0,
};

type Preset = {
  id: string;
  name: string;
  emoji: string;
  adjust: Adjust;
};

const PRESETS: Preset[] = [
  { id: "original", name: "Original", emoji: "✨", adjust: DEFAULT_ADJUST },
  {
    id: "glow",
    name: "Glow",
    emoji: "🌟",
    adjust: { brightness: 108, contrast: 102, saturate: 110, warmth: 8, smooth: 1.2, vignette: 15 },
  },
  {
    id: "smooth",
    name: "Smooth",
    emoji: "🪷",
    adjust: { brightness: 104, contrast: 96, saturate: 98, warmth: 4, smooth: 2.5, vignette: 10 },
  },
  {
    id: "warm",
    name: "Sunkissed",
    emoji: "🌅",
    adjust: { brightness: 106, contrast: 104, saturate: 118, warmth: 18, smooth: 0.8, vignette: 20 },
  },
  {
    id: "cool",
    name: "Porcelain",
    emoji: "❄️",
    adjust: { brightness: 108, contrast: 100, saturate: 90, warmth: -12, smooth: 1.8, vignette: 8 },
  },
  {
    id: "glam",
    name: "Glam",
    emoji: "💋",
    adjust: { brightness: 102, contrast: 118, saturate: 120, warmth: 6, smooth: 1.2, vignette: 30 },
  },
  {
    id: "fresh",
    name: "Fresh",
    emoji: "🍑",
    adjust: { brightness: 110, contrast: 98, saturate: 108, warmth: 2, smooth: 1.4, vignette: 6 },
  },
  {
    id: "mono",
    name: "Editorial",
    emoji: "🖤",
    adjust: { brightness: 102, contrast: 118, saturate: 0, warmth: 0, smooth: 0.6, vignette: 25 },
  },
];

function buildFilter(a: Adjust) {
  return [
    `brightness(${a.brightness}%)`,
    `contrast(${a.contrast}%)`,
    `saturate(${a.saturate}%)`,
    a.warmth !== 0 ? `sepia(${Math.min(Math.abs(a.warmth), 40)}%)` : "",
    a.warmth < 0 ? `hue-rotate(180deg)` : "",
    a.smooth > 0 ? `blur(${(a.smooth * 0.35).toFixed(2)}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function EditPage() {
  const { user } = useAuth();
  const { data: sub } = useSubscription(user);
  const pro = isPro(sub);
  const [image, setImage] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<string>("original");
  const [adjust, setAdjust] = useState<Adjust>(DEFAULT_ADJUST);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const filter = useMemo(() => buildFilter(adjust), [adjust]);

  const applyPreset = (p: Preset) => {
    setPresetId(p.id);
    setAdjust(p.adjust);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Please choose an image under 12MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setPresetId("original");
      setAdjust(DEFAULT_ADJUST);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setPresetId("original");
    setAdjust(DEFAULT_ADJUST);
  };

  const removeImage = () => {
    setImage(null);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportImage = async () => {
    if (!image || !imgRef.current) return;
    setIsExporting(true);
    try {
      const src = imgRef.current;
      const canvas = document.createElement("canvas");
      const w = src.naturalWidth;
      const h = src.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = filter || "none";
      ctx.drawImage(src, 0, 0, w, h);

      if (adjust.vignette > 0) {
        ctx.filter = "none";
        const g = ctx.createRadialGradient(
          w / 2,
          h / 2,
          Math.min(w, h) * 0.35,
          w / 2,
          h / 2,
          Math.max(w, h) * 0.75,
        );
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, `rgba(0,0,0,${Math.min(adjust.vignette / 100, 0.6)})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.94);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `beautyai-edit-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    return () => {
      // no-op cleanup; using data URLs, no object URLs to revoke
    };
  }, []);

  return (
    <MobileShell>
      <ScreenHeader
        title="Photo studio"
        subtitle="Retouch, glow, and glam your photos."
        right={
          image ? (
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove photo"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <section className="px-6">
        <GlassCard className="p-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-blush">
            <div className="aspect-[4/5] w-full">
              {image ? (
                <div className="relative h-full w-full">
                  <img
                    ref={imgRef}
                    src={image}
                    alt="Photo being edited"
                    crossOrigin="anonymous"
                    style={{ filter }}
                    className="h-full w-full object-cover transition-[filter] duration-200"
                  />
                  {adjust.vignette > 0 ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${Math.min(
                          adjust.vignette / 100,
                          0.6,
                        )}) 100%)`,
                      }}
                    />
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-3 text-rose-gold"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
                    <ImagePlus className="h-6 w-6" />
                  </span>
                  <span className="font-display text-lg font-semibold text-foreground">
                    Upload a photo
                  </span>
                  <span className="max-w-[240px] text-center text-xs text-muted-foreground">
                    Tap to choose a selfie or portrait. Everything stays on your device.
                  </span>
                </button>
              )}
            </div>
          </div>

          {image ? (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-medium"
              >
                <Camera className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-medium"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
              <button
                type="button"
                onClick={exportImage}
                disabled={isExporting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-rose px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md disabled:opacity-70"
              >
                <Download className="h-3.5 w-3.5" /> {isExporting ? "Saving…" : "Save"}
              </button>
            </div>
          ) : null}
        </GlassCard>
      </section>

      <section className="mt-6 px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Filters</h2>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {PRESETS.length} looks
          </span>
        </div>
        <div className="-mx-6 mt-3 overflow-x-auto pl-6">
          <div className="flex gap-2.5 pr-6">
            {PRESETS.map((p) => {
              const active = presetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`flex w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-2 transition ${
                    active
                      ? "border-rose-gold bg-gradient-rose text-primary-foreground shadow-md"
                      : "border-border/60 bg-card text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
                      active ? "bg-white/25" : "bg-blush/50"
                    }`}
                  >
                    {p.emoji}
                  </span>
                  <span className="text-[11px] font-medium leading-tight">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 px-6">
        <h2 className="font-display text-lg font-semibold">Adjust</h2>
        <GlassCard className="mt-3 space-y-4">
          <Slider
            label="Brightness"
            value={adjust.brightness}
            min={60}
            max={140}
            onChange={(v) => setAdjust((a) => ({ ...a, brightness: v }))}
          />
          <Slider
            label="Contrast"
            value={adjust.contrast}
            min={60}
            max={150}
            onChange={(v) => setAdjust((a) => ({ ...a, contrast: v }))}
          />
          <Slider
            label="Saturation"
            value={adjust.saturate}
            min={0}
            max={180}
            onChange={(v) => setAdjust((a) => ({ ...a, saturate: v }))}
          />
          <Slider
            label="Warmth"
            value={adjust.warmth}
            min={-30}
            max={30}
            onChange={(v) => setAdjust((a) => ({ ...a, warmth: v }))}
          />
          <Slider
            label="Skin smooth"
            value={adjust.smooth}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => setAdjust((a) => ({ ...a, smooth: v }))}
          />
          <Slider
            label="Vignette"
            value={adjust.vignette}
            min={0}
            max={60}
            onChange={(v) => setAdjust((a) => ({ ...a, vignette: v }))}
          />
        </GlassCard>
      </section>

      <section className="mt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">AI Retouch</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${pro ? "bg-gradient-rose text-primary-foreground" : "bg-lavender/70 text-foreground/70"}`}>
              {pro ? "Premium" : "Pro"}
            </span>
          </div>
          {!pro ? (
            <Link to="/pricing" className="text-[11px] font-semibold text-rose-gold">
              Unlock →
            </Link>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Enhanced editing powered by AI. Tap a tool to apply it to your photo.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { id: "blemish", label: "Blemish fix", emoji: "✨" },
            { id: "teeth", label: "Whiten teeth", emoji: "🦷" },
            { id: "eyes", label: "Brighten eyes", emoji: "👁️" },
            { id: "glow", label: "Glow up", emoji: "🌟" },
            { id: "reshape", label: "Face reshape", emoji: "💠" },
            { id: "bg", label: "Background", emoji: "🖼️" },
          ].map((tool) => (
            <AiTool
              key={tool.id}
              label={tool.label}
              emoji={tool.emoji}
              locked={!pro}
              disabled={!image}
              onRun={() => {
                if (!image) {
                  alert("Upload a photo first.");
                  return;
                }
                alert(`Running ${tool.label}… (AI processing will run on-device / server once wired.)`);
              }}
            />
          ))}
        </div>

        {!pro ? (
          <Link
            to="/pricing"
            className="mt-3 flex items-center justify-between rounded-3xl bg-gradient-rose p-4 text-primary-foreground shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-[15px] font-semibold">Unlock AI Retouch</p>
                <p className="text-[11px] text-primary-foreground/85">$1.99/month · cancel anytime</p>
              </div>
            </div>
            <span className="text-sm font-semibold">Upgrade</span>
          </Link>
        ) : null}
      </section>
    </MobileShell>
  );
}

function AiTool({
  label,
  emoji,
  locked,
  disabled,
  onRun,
}: {
  label: string;
  emoji: string;
  locked: boolean;
  disabled: boolean;
  onRun: () => void;
}) {
  if (locked) {
    return (
      <Link
        to="/pricing"
        className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush/60 text-lg">
          {emoji}
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-medium">{label}</p>
          <p className="text-[10px] text-muted-foreground">Premium</p>
        </div>
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={disabled}
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 text-left disabled:opacity-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush/60 text-lg">
        {emoji}
      </span>
      <div className="flex-1">
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">Tap to apply</p>
      </div>
      <Wand2 className="h-3.5 w-3.5 text-rose-gold" />
    </button>
  );
}
    </MobileShell>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground/80">{label}</span>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {typeof value === "number" ? value.toFixed(step < 1 ? 1 : 0) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-rose-gold"
      />
    </div>
  );
}
