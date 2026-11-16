"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, BrainCircuit, CheckCircle2,
  ChevronRight, CircleDot, Dna, Eye, Layers3,
  LockKeyhole, Menu, MessageCircle, Microscope, ScanSearch,
  ShieldCheck, Sparkles, UploadCloud, X, HeartPulse, ScanLine, Image as ImageIcon,
} from "lucide-react";

const features = [
  { icon: ScanSearch, number: "01", title: "Intelligent lesion analysis", desc: "Upload a dermoscopic image and add clinical context to explore predictions across seven lesion categories.", tag: "IMAGE + METADATA", gradient: "from-cyan-400/20 to-blue-500/5" },
  { icon: Eye, number: "02", title: "See what the model sees", desc: "Explore Grad-CAM visualizations to understand which image regions influenced the image model's output.", tag: "EXPLAINABLE AI", gradient: "from-violet-400/20 to-fuchsia-500/5" },
  { icon: MessageCircle, number: "03", title: "Learn with an AI assistant", desc: "Ask educational questions about skin health, lesion categories, and how machine-learning predictions work.", tag: "GEMINI ASSISTANT", gradient: "from-sky-400/20 to-teal-500/5" },
];

const steps = [
  { number: "01", icon: UploadCloud, title: "Upload", desc: "Choose a dermoscopic image." },
  { number: "02", icon: Layers3, title: "Add context", desc: "Enter age, sex, and lesion location." },
  { number: "03", icon: BrainCircuit, title: "Analyze", desc: "Run the trained multimodal classifier." },
  { number: "04", icon: Eye, title: "Understand", desc: "Review class scores and visual explanations." },
];

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(node); }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return <div ref={setNode} className={`${className} transition-all duration-700 ease-out motion-reduce:transition-none ${visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function SkinIllustration({ heatmap = false }: { heatmap?: boolean }) {
  return (
    <div className="relative h-full min-h-[210px] w-full overflow-hidden rounded-2xl bg-[#0c1730]" aria-label={heatmap ? "Illustrative attention overlay, not actual Grad-CAM output" : "Stylized medical illustration of skin layers and a pigmented lesion"}>
      <svg viewBox="0 0 420 270" role="img" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={heatmap ? "skinB" : "skinA"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2b6a1"/><stop offset="48%" stopColor="#df907e"/><stop offset="50%" stopColor="#9c6076"/><stop offset="100%" stopColor="#473b70"/>
          </linearGradient>
          <radialGradient id={heatmap ? "heatB" : "heatA"}><stop offset="0%" stopColor="#ffdd50" stopOpacity=".95"/><stop offset="35%" stopColor="#fa554c" stopOpacity=".75"/><stop offset="75%" stopColor="#6e3cf0" stopOpacity=".3"/><stop offset="100%" stopColor="#6e3cf0" stopOpacity="0"/></radialGradient>
        </defs>
        <rect x="0" y="0" width="420" height="270" fill="#0b1630"/>
        <path d="M0 72 Q38 59 76 72 T152 72 T228 72 T304 72 T420 72 L420 270 L0 270Z" fill={`url(#${heatmap ? "skinB" : "skinA"})`} />
        <path d="M0 118 Q52 104 104 118 T208 118 T312 118 T420 118" fill="none" stroke="#ffd7c2" strokeOpacity=".5" strokeWidth="4"/>
        <path d="M0 181 Q55 166 110 181 T220 181 T330 181 T420 181" fill="none" stroke="#f3b3b7" strokeOpacity=".4" strokeWidth="4"/>
        <path d="M156 71 Q168 43 187 50 Q205 32 222 48 Q247 44 262 71 Q240 91 215 86 Q185 95 156 71Z" fill="#5d3346" stroke="#b67e86" strokeWidth="3"/>
        <path d="M181 70 Q197 52 218 65 Q237 60 245 74" fill="none" stroke="#a15d68" strokeWidth="4" strokeLinecap="round"/>
        {[54,93,130,289,330,371].map((x)=><path key={x} d={`M${x} 75 q-10 -23 2 -42`} fill="none" stroke="#f3c9bc" strokeOpacity=".7" strokeWidth="2"/>)}
        {heatmap && <ellipse cx="211" cy="75" rx="115" ry="90" fill="url(#heatB)" />}
        <path d="M20 30 H60 M20 30 V53 M400 30 H360 M400 30 V53 M20 240 H60 M20 240 V217 M400 240 H360 M400 240 V217" stroke="#67e8f9" strokeOpacity=".55" strokeWidth="2" fill="none"/>
      </svg>
      <div className="dv-scanline pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-200/70 shadow-[0_0_18px_3px_rgba(34,211,238,.35)]" />
      <span className="absolute bottom-3 left-3 rounded-md border border-white/20 bg-slate-950/70 px-2 py-1 text-[10px] font-semibold tracking-widest text-cyan-100 backdrop-blur-md">{heatmap ? "ATTENTION CONCEPT" : "SKIN CROSS-SECTION"}</span>
    </div>
  );
}

function OrbitalVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[510px] select-none" aria-label="Abstract visualization of AI image analysis">
      <div className="absolute inset-[3%] rounded-full border border-cyan-200/10" />
      <div className="absolute inset-[13%] rounded-full border border-cyan-200/15" />
      <div className="absolute inset-[23%] rounded-full border border-violet-200/15" />
      <div className="orbital-spin absolute inset-[3%] rounded-full border border-transparent border-t-cyan-300/60 border-r-blue-400/20" />
      <div className="orbital-spin-reverse absolute inset-[13%] rounded-full border border-transparent border-b-violet-300/60 border-l-cyan-300/20" />
      <div className="absolute inset-[21%] rounded-full bg-cyan-400/10 blur-[70px]" />
      <div className="orbital-float absolute inset-[23%] overflow-hidden rounded-[28%] border border-cyan-300/35 bg-[#112044] p-2 shadow-[0_0_100px_rgba(34,211,238,.2)] backdrop-blur-xl">
        <div className="h-full overflow-hidden rounded-[25%]"><SkinIllustration /></div>
      </div>
      <div className="orbital-float absolute left-0 top-[18%] rounded-2xl border border-white/15 bg-[#122044]/85 px-4 py-3 shadow-2xl backdrop-blur-xl" style={{ animationDelay: "-2s" }}>
        <div className="flex items-center gap-2 text-xs text-cyan-200"><span className="h-2 w-2 rounded-full bg-cyan-400" /> IMAGE FEATURES</div>
        <div className="mt-2 flex items-end gap-1">{[22,36,27,45,32,52,40,28,43,30,49,35].map((h,i) => <span key={i} className="w-1 rounded-full bg-gradient-to-t from-blue-500 to-cyan-300" style={{height:h}} />)}</div>
      </div>
      <div className="orbital-float absolute bottom-[14%] right-0 rounded-2xl border border-white/15 bg-[#122044]/85 px-4 py-3 shadow-2xl backdrop-blur-xl" style={{ animationDelay: "-3.5s" }}>
        <div className="flex items-center gap-2 text-xs text-violet-200"><Sparkles size={13} /> EXPLAINABLE AI</div>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white"><CheckCircle2 size={16} className="text-emerald-400" /> Grad-CAM concept</div>
      </div>
      <div className="absolute left-[18%] top-[6%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_#67e8f9]" />
      <div className="absolute bottom-[12%] left-[24%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_20px_#c4b5fd]" />
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="min-h-screen overflow-hidden bg-[#060b1b] text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[780px] w-[1050px] -translate-x-1/2 rounded-full bg-blue-700/10 blur-[140px]" />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060b1b]/80 backdrop-blur-2xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="DermaVision AI home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_25px_rgba(34,211,238,.25)]"><Activity size={22} strokeWidth={2.5} /></span>
            <span className="text-xl font-extrabold tracking-tight">DermaVision<span className="text-cyan-400">.AI</span></span>
          </Link>
          <div className="hidden items-center gap-9 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-cyan-300">Capabilities</a>
            <a href="#workflow" className="transition hover:text-cyan-300">How it works</a>
            <a href="#explainability" className="transition hover:text-cyan-300">Visualizations</a><a href="#research" className="transition hover:text-cyan-300">Research</a>
          </div>
          <Link href="/analyze" className="hidden items-center gap-2 rounded-xl border border-cyan-300/20 bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:border-cyan-300/60 hover:bg-white/15 md:inline-flex">Launch workspace <ArrowUpRight size={16}/></Link>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-white/20 p-2 md:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
        </nav>
        {menuOpen && <div className="flex flex-col gap-4 border-t border-white/10 bg-[#0a1128] px-6 py-5 text-sm md:hidden"><a href="#features" onClick={()=>setMenuOpen(false)}>Capabilities</a><a href="#workflow" onClick={()=>setMenuOpen(false)}>How it works</a><a href="#explainability" onClick={()=>setMenuOpen(false)}>Visualizations</a><a href="#research" onClick={()=>setMenuOpen(false)}>Research</a><Link href="/analyze" onClick={()=>setMenuOpen(false)} className="text-cyan-300">Launch workspace →</Link></div>}
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pb-32 lg:pt-28">
        <div className="relative z-10">
          <Reveal><div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-semibold tracking-[.15em] text-cyan-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"/> RESEARCH-POWERED INTELLIGENCE <ChevronRight size={14}/></div></Reveal>
          <Reveal delay={100}><h1 className="mt-8 max-w-[730px] text-[clamp(3.3rem,6vw,6rem)] font-extrabold leading-[1.07] tracking-[-.055em]">A new lens on <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">skin intelligence.</span></h1></Reveal>
          <Reveal delay={180}><p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">An explainable multimodal AI research platform for skin-lesion classification. Combine dermoscopic imagery, clinical context, and visual interpretation in one seamless experience.</p></Reveal>
          <Reveal delay={260}><div className="mt-10 flex flex-wrap gap-4"><Link href="/analyze" className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 text-sm font-bold text-slate-950 shadow-[0_10px_45px_rgba(34,211,238,.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_55px_rgba(34,211,238,.3)]">Explore AI analysis <ArrowRight size={18} className="transition group-hover:translate-x-1"/></Link><a href="#research" className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-semibold transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">View the research <ArrowUpRight size={17}/></a></div></Reveal>
          <Reveal delay={320}><div className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-cyan-300"/> Research prototype</span><span className="flex items-center gap-2"><Dna size={16} className="text-violet-300"/> Multimodal architecture</span><span className="flex items-center gap-2"><Eye size={16} className="text-blue-300"/> Explainable AI</span></div></Reveal>
        </div>
        <Reveal className="relative -my-6 lg:my-0" delay={180}><OrbitalVisual/></Reveal>
      </section>

      <section className="relative border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-9 sm:px-8 lg:grid-cols-4">
          {[{n:"10,015",l:"DERMOSCOPIC IMAGES"},{n:"7",l:"LESION CATEGORIES"},{n:"78.46%",l:"MULTIMODAL TEST ACCURACY"},{n:"2,024",l:"HELD-OUT TEST IMAGES"}].map((item,i)=><Reveal key={item.l} delay={i*80}><div className="border-l border-cyan-300/25 pl-5"><div className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{item.n}</div><div className="mt-2 text-[10px] font-semibold tracking-[.14em] text-slate-400 sm:text-xs">{item.l}</div></div></Reveal>)}
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-8">
        <Reveal><div className="text-center"><div className="text-xs font-bold tracking-[.25em] text-cyan-300">BUILT FOR UNDERSTANDING</div><h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">More than a prediction.<br/><span className="text-slate-400">A deeper perspective.</span></h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">A research-driven workflow designed to make computer vision more transparent, contextual, and accessible.</p></div></Reveal>
        <div className="mt-16 grid gap-6 md:grid-cols-3">{features.map((f,i)=><Reveal key={f.title} delay={i*100}><article className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${f.gradient} p-7 transition duration-500 hover:-translate-y-2 hover:border-cyan-300/35 hover:shadow-[0_20px_70px_rgba(0,0,0,.25)] sm:p-9`}><div className="flex items-start justify-between"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-200 transition duration-500 group-hover:scale-110 group-hover:bg-cyan-300/15"><f.icon size={27}/></span><span className="text-sm font-semibold text-white/30">{f.number}</span></div><div className="mt-14 text-[10px] font-bold tracking-[.2em] text-cyan-300">{f.tag}</div><h3 className="mt-4 text-2xl font-bold tracking-tight">{f.title}</h3><p className="mt-4 leading-7 text-slate-400">{f.desc}</p><div className="mt-9 flex items-center gap-2 text-sm font-semibold text-cyan-200">Designed for transparency <ArrowUpRight size={16} className="transition group-hover:translate-x-1 group-hover:-translate-y-1"/></div></article></Reveal>)}</div>
      </section>

      <section id="workflow" className="relative scroll-mt-24 border-y border-white/10 bg-[#0a1229] py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><div className="flex flex-wrap items-end justify-between gap-6"><div><div className="text-xs font-bold tracking-[.25em] text-cyan-300">SIMPLE BY DESIGN</div><h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">From image to insight.</h2></div><p className="max-w-md leading-7 text-slate-400">Four clear steps bring image analysis, clinical context, and explainability together.</p></div></Reveal><div className="mt-16 grid gap-5 md:grid-cols-4">{steps.map((s,i)=><Reveal key={s.number} delay={i*100}><div className="group relative h-full rounded-2xl border border-white/10 bg-white/[.035] p-6 transition hover:border-cyan-300/35 hover:bg-white/[.06]"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-cyan-300">{s.number}</span><s.icon size={22} className="text-slate-400 transition group-hover:text-cyan-300"/></div><h3 className="mt-12 text-xl font-semibold">{s.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{s.desc}</p>{i<3 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden text-cyan-300/50 md:block" size={19}/>}</div></Reveal>)}</div></div>
      </section>

      <section id="explainability" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-8">
        <Reveal><div className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><div className="flex items-center gap-2 text-xs font-bold tracking-[.2em] text-cyan-300"><ScanLine size={16}/> MEDICAL VISUALIZATION</div><h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">From pixels to <span className="text-cyan-300">perspective.</span></h2></div><p className="max-w-md leading-7 text-slate-400">A visual introduction to dermoscopic analysis and model attention. Actual Grad-CAM output will appear in the analysis workspace after model integration.</p></div></Reveal>
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal><div className="dv-card-lift rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7"><div className="mb-4 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-semibold"><ImageIcon size={17} className="text-cyan-300"/> Medical illustration</span><span className="text-xs text-slate-500">Illustrative</span></div><div className="h-[260px] overflow-hidden rounded-2xl"><SkinIllustration/></div><h3 className="mt-5 text-xl font-bold">Skin and lesion structure</h3><p className="mt-2 text-sm leading-7 text-slate-400">Stylized cross-section used to introduce the dermatology context; not a clinical image.</p></div></Reveal>
          <Reveal delay={130}><div className="dv-card-lift rounded-3xl border border-violet-300/15 bg-violet-400/[.045] p-5 sm:p-7"><div className="mb-4 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-semibold"><Eye size={17} className="text-violet-300"/> Explainability concept</span><span className="text-xs text-violet-200/60">Not model output</span></div><div className="h-[260px] overflow-hidden rounded-2xl"><SkinIllustration heatmap/></div><h3 className="mt-5 text-xl font-bold">Understanding visual attention</h3><p className="mt-2 text-sm leading-7 text-slate-400">Conceptual heat overlay only. Real Grad-CAM maps will be computed from the trained image model, not simulated.</p></div></Reveal>
        </div>
        <Reveal delay={180}><p className="mt-6 flex items-start gap-2 text-xs leading-6 text-slate-500"><HeartPulse size={17} className="mt-0.5 shrink-0 text-cyan-300"/> Research demonstration only. Visual explanations are not proof of clinical correctness and cannot establish whether a lesion is benign or malignant.</p></Reveal>
      </section>

      <section id="research" className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-16 px-5 py-28 sm:px-8 lg:grid-cols-2">
        <Reveal><div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#132449] to-[#0a1228] p-8 shadow-2xl sm:p-10"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-semibold tracking-[.15em] text-cyan-200"><CircleDot size={15}/> MODEL EVALUATION</div><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">HAM10000</span></div><div className="mt-10 text-sm text-slate-400">Held-out test accuracy</div><div className="mt-2 flex items-end gap-3"><span className="text-6xl font-bold tracking-tight sm:text-7xl">78.46<span className="text-cyan-300">%</span></span><span className="pb-2 text-sm text-slate-400">multimodal model</span></div><div className="mt-9 space-y-6">{[{label:"Multimodal ResNet50 + metadata",value:78.46,accent:"bg-gradient-to-r from-cyan-400 to-blue-500"},{label:"Image-only ResNet50",value:74.85,accent:"bg-gradient-to-r from-violet-400 to-indigo-500"}].map((m)=><div key={m.label}><div className="mb-2 flex justify-between gap-3 text-xs text-slate-300"><span>{m.label}</span><span className="font-semibold">{m.value}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${m.accent}`} style={{width:`${m.value}%`}}/></div></div>)}</div><div className="mt-9 flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-slate-400"><LockKeyhole size={14} className="text-cyan-300"/> Evaluated on 2,024 held-out images; not a clinical validation.</div></div></Reveal>
        <Reveal delay={120}><div className="text-xs font-bold tracking-[.25em] text-cyan-300">THE SCIENCE BEHIND IT</div><h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Built on research.<br/><span className="text-slate-400">Grounded in evidence.</span></h2><p className="mt-7 leading-8 text-slate-400">DermaVision AI explores how a fine-tuned ResNet50 can combine visual features with patient metadata to classify seven dermoscopic lesion categories. The research compares image-only and multimodal approaches on a lesion-separated test set.</p><div className="mt-8 space-y-4"><div className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 size={18} className="shrink-0 text-cyan-300"/> Lesion-aware train/validation/test split</div><div className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 size={18} className="shrink-0 text-cyan-300"/> Seven-class classification on HAM10000</div><div className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 size={18} className="shrink-0 text-cyan-300"/> Visual interpretability using Grad-CAM</div></div><div className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"><Microscope size={18}/> Research implementation in progress</div></Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><Reveal><div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-r from-blue-700/40 via-indigo-600/25 to-violet-600/25 px-7 py-14 text-center sm:px-12 sm:py-20"><div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-300/15 blur-[80px]"/><div className="pointer-events-none absolute -bottom-36 -left-20 h-72 w-72 rounded-full bg-violet-400/15 blur-[80px]"/><div className="relative"><Sparkles size={30} className="mx-auto text-cyan-200"/><h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">Explore the next layer of AI.</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-slate-300">A hands-on research environment for exploring multimodal skin-lesion classification and visual explanations.</p><Link href="/analyze" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-cyan-100">Open analysis workspace <ArrowRight size={17}/></Link></div></div></Reveal></section>

      <footer className="border-t border-white/10 bg-[#050916]"><div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2 text-lg font-bold"><Activity size={21} className="text-cyan-300"/> DermaVision<span className="-ml-2 text-cyan-300">.AI</span></div><p className="mt-2 max-w-xl text-xs leading-6 text-slate-500">Academic research prototype only. Not a medical device or diagnostic tool. Do not use outputs to rule out skin cancer. Seek professional evaluation for concerning lesions.</p></div><div className="flex items-center gap-5 text-xs text-slate-400"><a href="#features" className="hover:text-cyan-300">Capabilities</a><a href="#research" className="hover:text-cyan-300">Research</a><span>© 2026 DermaVision AI</span></div></div></footer>
    </main>
  );
}
