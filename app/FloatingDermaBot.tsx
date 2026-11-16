
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function FloatingDermaBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm DermaBot. Ask me about skin lesions, Grad-CAM, AI, or anything you'd like to learn!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading, open]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || busyRef.current) return;

    busyRef.current = true;
    const history = messages
      .filter(
        (message) =>
          !message.content.startsWith("Sorry, I couldn't") &&
          !message.content.startsWith("Hi! 👋 I'm DermaBot")
      )
      .slice(-8);

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
    ]);
    setInput("");
    setLoading(true);

    const started = Date.now();

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "The AI service could not complete your request.";
        throw new Error(detail);
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("DermaBot returned an empty response.");
      }

      // Keep the typing animation visible for at least 2.5 seconds.
      const elapsed = Date.now() - started;
      if (elapsed < 2500) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2500 - elapsed)
        );
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply.trim() },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach my local AI right now. " +
            (error instanceof Error ? error.message : "Please try again."),
        },
      ]);
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }

  function resetChat() {
    if (loading) return;
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! 👋 I'm DermaBot. What would you like to explore?",
      },
    ]);
    setInput("");
  }

  // Avoid showing a second chatbot on the full chatbot page.
  if (pathname === "/chatbot") return null;

  return (
    <>
      {open && (
        <section
          aria-label="DermaBot chat window"
          className="fixed bottom-24 right-4 z-[9999] flex h-[min(580px,calc(100dvh-115px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-cyan-400/25 bg-[#0b1429] text-white shadow-2xl shadow-black/50 sm:right-7"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                🤖
              </div>
              <div>
                <h2 className="text-sm font-bold">DermaBot AI</h2>
                <p className="text-xs text-white/85">
                  Powered by local AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                disabled={loading}
                title="New chat"
                className="rounded-lg p-2 text-sm hover:bg-white/20 disabled:opacity-50"
              >
                ↻
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close DermaBot"
                className="rounded-lg px-2 py-1 text-2xl hover:bg-white/20"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-[#0b1429] to-[#101a36] p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : "rounded-bl-md border border-white/10 bg-white/[0.07] text-slate-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                      style={{
                        animationDelay: `${dot * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
            className="border-t border-white/10 bg-[#0c152b] p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask DermaBot anything..."
                disabled={loading}
                maxLength={500}
                aria-label="Your message"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ➤
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Research and education only. Not a medical diagnosis.
            </p>
          </form>
        </section>
      )}

      {/* Floating robot button */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={open ? "Close DermaBot" : "Open DermaBot"}
        aria-expanded={open}
        className="fixed bottom-5 right-4 z-[9999] flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/40 bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-3xl shadow-xl shadow-cyan-500/30 transition hover:scale-110 sm:right-7"
      >
        {open ? "×" : "🤖"}
      </button>
    </>
  );
}
