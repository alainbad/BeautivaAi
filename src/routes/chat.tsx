import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Send, Sparkles, MessageCircleHeart } from "lucide-react";
import { chatSuggestions, mockChat } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui-primitives";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "AI Beauty Chat — BeautyAI" },
      { name: "description", content: "Ask BeautyAI anything about skincare — routines, ingredients, and personalized guidance in seconds." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Msg = { role: "assistant" | "user"; text: string };

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(mockChat);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Great question! For balanced results, layer Vitamin C in the morning and retinol at night — never at the same time. Always follow with SPF during the day.",
        },
      ]);
      setTyping(false);
    }, 1200);
  };

  const isEmpty = messages.length <= 1;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background safe-x">
      <header className="safe-top sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/80 px-6 pb-3 pt-4 backdrop-blur">
        <Link
          to="/home"
          aria-label="Back to home"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground" aria-hidden="true">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-[15px] font-semibold">Beauty AI</p>
            <p className="text-[10px] text-muted-foreground">Cosmetic guidance · always online</p>
          </div>
        </div>
      </header>


      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite" aria-atomic="false">
        {isEmpty ? (
          <EmptyState
            icon={<MessageCircleHeart className="h-6 w-6" aria-hidden="true" />}
            title="Say hi to your Beauty AI"
            description="Ask about ingredients, routines, or product pairings. Try one of the prompts below to get started."
          />
        ) : null}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-md bg-gradient-rose text-primary-foreground"
                  : "rounded-bl-md border border-border/60 bg-card text-foreground/90"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start" aria-label="Beauty AI is typing">
            <div className="rounded-3xl rounded-bl-md border border-border/60 bg-card px-4 py-3 text-sm">
              <span className="inline-flex gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-gold" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-gold [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-gold [animation-delay:0.3s]" />
              </span>
            </div>
          </div>
        )}
      </main>

      {isEmpty && (
        <div className="px-4 pb-2">
          <p className="mb-2 px-1 text-[11px] uppercase tracking-widest text-muted-foreground">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {chatSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="safe-bottom sticky bottom-0 flex items-center gap-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur"
      >
        <label htmlFor="chat-input" className="sr-only">Message Beauty AI</label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your skin…"
          className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-rose-gold"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-rose text-primary-foreground shadow"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
