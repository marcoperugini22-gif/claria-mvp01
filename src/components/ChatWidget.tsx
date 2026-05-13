"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_SUGGESTIONS = [
  "Come creo un budget?",
  "Come iniziare a risparmiare?",
  "Cos'è un ETF?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Non riesco a rispondere ora. Riprova tra poco.");
        return;
      }
      const reply: string = data.reply ?? "Non ho ricevuto una risposta. Riprova.";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setError("Errore di rete. Controlla la connessione e riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button — bottom-[82px] su mobile (sopra bottom nav), bottom-6 su desktop */}
      <div className="fixed bottom-[82px] md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md md:pl-[72px] px-5 z-50 flex justify-end pointer-events-none">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto h-12 w-12 rounded-full flex items-center justify-center text-claria-cream text-xl shadow-lg active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg,#1E15C2,#3B30E8)",
            boxShadow: "0 8px 24px rgba(30,21,194,0.35)",
          }}
          aria-label={open ? "Chiudi chat" : "Apri chat Claria"}
        >
          {open ? "✕" : "✨"}
        </button>
      </div>

      {/* Chat drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-md rounded-t-[28px] flex flex-col"
            style={{
              background: "#FFF7CE",
              boxShadow: "0 -16px 48px rgba(30,21,194,0.15)",
              maxHeight: "80dvh",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-claria-ink/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-claria-ink/[0.08]">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-sm text-claria-cream"
                  style={{ background: "linear-gradient(135deg,#1E15C2,#3B30E8)" }}
                >
                  ✨
                </div>
                <div>
                  <p className="text-[13px] font-medium text-claria-ink">Claria AI</p>
                  <p className="text-[10px] text-claria-ink/50">Assistente finanziario</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg bg-claria-ink/[0.07] flex items-center justify-center text-claria-ink/60 text-sm active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-[13px] text-claria-ink/65 text-center leading-relaxed">
                    Ciao! Sono Claria. Chiedimi qualsiasi cosa su budget, risparmio o finanza personale.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {STARTER_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendMessage(s)}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-claria-ink/15 bg-white text-claria-ink active:scale-95 transition-transform"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "bg-claria-ink text-claria-cream rounded-br-sm"
                        : "bg-white text-claria-ink rounded-bl-sm"
                    }`}
                    style={
                      m.role === "assistant"
                        ? { boxShadow: "0 1px 6px rgba(30,21,194,0.06)" }
                        : {}
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1"
                    style={{ boxShadow: "0 1px 6px rgba(30,21,194,0.06)" }}
                  >
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-claria-ink/40 animate-soft-pulse"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-[11px] text-red-600 text-center">{error}</p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Disclaimer */}
            <p className="px-5 py-1.5 text-[9.5px] text-claria-ink/40 text-center border-t border-claria-ink/[0.06]">
              Solo informazioni generali, non consulenza finanziaria professionale.
            </p>

            {/* Input */}
            <div className="px-4 pb-5 pt-2 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Scrivi un messaggio…"
                className="flex-1 bg-white rounded-2xl px-4 py-3 text-[13px] text-claria-ink placeholder-claria-ink/35 focus:outline-none border border-claria-ink/10 focus:border-claria-ink/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-claria-cream disabled:opacity-40 active:scale-95 transition-transform shrink-0"
                style={{ background: "linear-gradient(135deg,#1E15C2,#3B30E8)" }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
