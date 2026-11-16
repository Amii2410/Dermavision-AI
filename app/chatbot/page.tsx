"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeft, ArrowRight, Check, CircleHelp,
  MessageCircle, RotateCcw, Send, ShieldAlert, Sparkles,
  UserRound, WandSparkles,
} from "lucide-react";

type Message = { id: number; role: "user" | "assistant"; content: string };

const WELCOME: Message = {
  id: 1,
  role: "assistant",
  content:
    "Hey there! 👋 I'm DermaBot 🤖, your Skin Health Learning Companion, powered by DermaVision AI.\n\nAsk me about skin-lesion categories, the science behind our AI models, or how Grad-CAM works. I'm here to help you learn—not to diagnose. What are you curious about?",
};

const SUGGESTIONS = [
  { icon: "🔬", label: "What is melanoma?" },
  { icon: "🧬", label: "Explain the seven lesion categories" },
  { icon: "✨", label: "What is Grad-CAM?" },
  { icon: "🧠", label: "How does multimodal AI work?" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const MIN_TYPING_MS = 2500; // Show the three animated dots for at least 2.5 seconds.

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error("Cancelled")); return; }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, ms);
    function cancel() {
      window.clearTimeout(timer);
      reject(new Error("Cancelled"));
    }
    signal.addEventListener("abort", cancel, { once: true });
  });
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [copied, setCopied] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => () => { requestRef.current?.abort(); }, []);

  async function sendMessage(text?: string) {
    const question = (text ?? input).trim();
    if (!question || typing) return;

    const history = messages
      .filter(message => message.id !== WELCOME.id)
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    const controller = new AbortController();
    const startedAt = performance.now();
    requestRef.current = controller;
    setMessages(prev => [...prev, { id: nextId.current++, role: "user", content: question }]);
    setInput("");
    setShowSuggestions(false);
    setTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history }),
        signal: controller.signal,
      });
      const data: { reply?: string; detail?: string } = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to reach DermaBot.");
      if (!data.reply) throw new Error("DermaBot returned an empty response.");
      const remaining = MIN_TYPING_MS - (performance.now() - startedAt);
      if (remaining > 0) await wait(remaining, controller.signal);
      if (controller.signal.aborted) return;
      setMessages(prev => [...prev, { id: nextId.current++, role: "assistant", content: data.reply! }]);
    } catch (error) {
      if (controller.signal.aborted) return;
      const remaining = MIN_TYPING_MS - (performance.now() - startedAt);
      if (remaining > 0) {
        try { await wait(remaining, controller.signal); } catch { return; }
      }
      if (controller.signal.aborted) return;
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessages(prev => [...prev, {
        id: nextId.current++, role: "assistant",
        content: `I couldn't reach my local AI model right now. Please check that Ollama and FastAPI are running.\n\n${detail}`,
      }]);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setTyping(false);
      }
    }
  }

  function resetChat() {
    requestRef.current?.abort();
    requestRef.current = null;
    setMessages([WELCOME]);
    setInput("");
    setTyping(false);
    setShowSuggestions(true);
    setCopied(null);
    nextId.current = 2;
  }

  async function copyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(message.id);
      setTimeout(() => setCopied(current => current === message.id ? null : current), 1600);
    } catch { /* Clipboard access may be unavailable. */ }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060b1b] text-white">
      <style jsx global>{`
        @keyframes db-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes db-message { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes db-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes db-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,211,238,.16), 0 0 25px rgba(34,211,238,.13); } 50% { box-shadow: 0 0 0 9px rgba(34,211,238,0), 0 0 36px rgba(34,211,238,.23); } }
        @keyframes db-dot { 0%,60%,100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-6px); opacity: 1; } }
        @keyframes db-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(32px,-24px); } }
        @keyframes db-shimmer { from { background-position: 200% center; } to { background-position: -200% center; } }
        .db-rise { animation: db-rise .75s cubic-bezier(.2,.7,.2,1) both; }
        .db-message { animation: db-message .4s cubic-bezier(.2,.7,.2,1) both; }
        .db-float { animation: db-float 4s ease-in-out infinite; }
        .db-pulse { animation: db-pulse 3s ease-in-out infinite; }
        .db-drift { animation: db-drift 12s ease-in-out infinite; }
        .db-shimmer { background-size: 200% auto; animation: db-shimmer 5s linear infinite; }
        .db-dot { animation: db-dot 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .db-rise,.db-message,.db-float,.db-pulse,.db-drift,.db-shimmer,.db-dot { animation: none !important; }
          *,*::before,*::after { scroll-behavior: auto !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-12 h-[480px] w-[480px] rounded-full bg-cyan-500/[0.09] blur-[105px] db-drift" />
        <div className="absolute -right-36 top-72 h-[550px] w-[550px] rounded-full bg-violet-600/[0.10] blur-[120px] db-drift" style={{ animationDelay: "-5s" }} />
        <div className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.14) 1px,transparent 1px)", backgroundSize: "52px 52px", maskImage: "linear-gradient(to bottom, black, transparent 85%)" }} />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#080e20]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3 text-lg font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:rotate-6"><Activity size={22} /></span>
            <span>DermaVision<span className="text-cyan-400">.AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 sm:inline-flex">Research prototype</span>
            <Link href="/" className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white"><ArrowLeft size={15} /> Home</Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="db-rise mb-9 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-300"><WandSparkles size={15} /> Your skin health learning companion</div>
          <div className="mb-5 flex justify-center"><div className="db-float db-pulse flex h-20 w-20 items-center justify-center rounded-[26px] border border-cyan-300/30 bg-gradient-to-br from-cyan-400/25 via-blue-500/15 to-violet-500/20 text-5xl shadow-2xl" role="img" aria-label="Robot">🤖</div></div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Meet <span className="db-shimmer bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">DermaBot 🤖</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">A smarter way to explore skin-lesion science, understand AI predictions, and learn about explainable machine learning.</p>
        </div>

        <div className="db-rise mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-[#101a33]/95 shadow-[0_24px_100px_rgba(0,0,0,.35)] backdrop-blur-xl" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#121e39]/80 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="db-pulse relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-2xl" aria-hidden="true">🤖<span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121e39] bg-emerald-400" /></div>
              <div><p className="flex items-center gap-2 font-bold text-white">DermaBot 🤖 <Sparkles size={15} className="text-cyan-300" /></p><p className="mt-0.5 text-xs text-slate-400">Educational assistant · Local AI-powered</p></div>
            </div>
            <button type="button" onClick={resetChat} className="group flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/5 hover:text-cyan-200" title="Start a new conversation"><RotateCcw size={16} className="transition-transform duration-500 group-hover:-rotate-90" /><span className="hidden sm:inline">New chat</span></button>
          </div>

          <div ref={scrollRef} className="h-[390px] space-y-5 overflow-y-auto overscroll-contain px-4 py-6 sm:h-[450px] sm:px-7" aria-live="polite" aria-label="Chat conversation">
            {messages.map(message => (
              <div key={message.id} className={`db-message group flex items-end gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${message.role === "assistant" ? "border border-cyan-400/20 bg-cyan-400/10 text-xl" : "bg-violet-400/10 text-violet-300"}`} aria-hidden="true">{message.role === "assistant" ? "🤖" : <UserRound size={18} />}</div>
                <div className={`relative max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-7 sm:max-w-[78%] ${message.role === "assistant" ? "rounded-bl-sm border border-white/10 bg-[#0a142a] text-slate-200" : "rounded-br-sm bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/10"}`}>
                  {message.role === "assistant" && <div className="mb-1 text-[11px] font-bold tracking-wide text-cyan-300">DermaBot 🤖</div>}
                  <p className="whitespace-pre-line">{message.content}</p>
                  {message.role === "assistant" && <button type="button" onClick={() => void copyMessage(message)} className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-cyan-300" aria-label="Copy DermaBot reply">{copied === message.id ? <Check size={12} /> : <CircleHelp size={12} />}{copied === message.id ? "Copied" : "Copy reply"}</button>}
                </div>
              </div>
            ))}
            {typing && <div className="db-message flex items-end gap-3" role="status" aria-label="DermaBot is typing"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-xl" aria-hidden="true">🤖</div><div className="rounded-2xl rounded-bl-sm border border-white/10 bg-[#0a142a] px-5 py-4"><div className="mb-2 text-[11px] font-semibold text-cyan-300">DermaBot is typing...</div><div className="flex items-center gap-1.5">{[0,1,2].map(i => <span key={i} className="db-dot h-2 w-2 rounded-full bg-cyan-300" style={{ animationDelay: `${i * 160}ms` }} />)}</div></div></div>}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 bg-[#0d172d]/90 px-4 pb-4 pt-4 sm:px-6 sm:pb-5">
            {showSuggestions && <div className="mb-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-400"><Sparkles size={13} className="text-cyan-300" /> Try a question</div><div className="flex flex-wrap gap-2">{SUGGESTIONS.map((s, i) => <button key={s.label} type="button" onClick={() => sendMessage(s.label)} disabled={typing} className="db-rise rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3.5 py-2 text-xs text-cyan-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-400/15 hover:shadow-lg hover:shadow-cyan-500/10 disabled:opacity-50" style={{ animationDelay: `${240 + i * 70}ms` }}>{s.icon} {s.label}</button>)}</div></div>}
            <form onSubmit={event => { event.preventDefault(); sendMessage(); }} className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#080f22] p-2 transition-colors focus-within:border-cyan-400/60 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,.07)]">
              <input value={input} onChange={event => setInput(event.target.value)} maxLength={500} disabled={typing} placeholder="Ask DermaBot 🤖 anything educational..." aria-label="Message DermaBot" className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60" />
              <button type="submit" disabled={!input.trim() || typing} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-[#071225] shadow-md shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/35 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send size={18} /></button>
            </form>
            <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">Powered by local Qwen2.5 AI · Responses may be inaccurate · Not medical advice.</p>
          </div>
        </div>

        <div className="db-rise mx-auto mt-5 flex max-w-4xl flex-col items-start justify-between gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4 sm:flex-row sm:items-center sm:p-5" style={{ animationDelay: "220ms" }}>
          <div className="flex items-start gap-3"><ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-300" /><p className="text-xs leading-6 text-amber-100/80"><strong className="text-amber-200">Research and education only.</strong> DermaBot is not a medical professional and cannot diagnose, rule out, or treat skin conditions. Seek clinical assessment for concerning lesions.</p></div>
        </div>
        <div className="mt-7 flex justify-center"><Link href="/analyze" className="group inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"><MessageCircle size={17} /> Explore lesion analysis <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link></div>
      </div>
    </main>
  );
}
