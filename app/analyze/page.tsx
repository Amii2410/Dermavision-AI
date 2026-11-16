"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";

import {

  Activity, ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, CircleAlert,

  CloudUpload, Eye, FileImage, ImagePlus, LoaderCircle, LockKeyhole,

  RotateCcw, ScanLine, ShieldAlert, Sparkles, X,

} from "lucide-react";

type ModelType = "multimodal" | "image";

type Prediction = { label: string; probability: number };

type ApiPrediction = { class: string; probability: number };

type ApiResult = { predicted_class: string; predictions: ApiPrediction[]; gradcam_image?: string | null; model?: string; disclaimer?: string; metadata_used?: { age: number; sex: string; localization: string } };

type AnalysisResult = {

  predicted_class: string;

  predictions: Prediction[];

  gradcam_image?: string | null;

  model?: string;
  metadata_used?: { age: number; sex: string; localization: string };

};

const locations = [

  "abdomen", "acral", "back", "chest", "ear", "face", "foot", "genital",

  "hand", "lower extremity", "neck", "scalp", "trunk", "upper extremity",

];

const classNames: Record<string, string> = {

  akiec: "Actinic keratoses / intraepithelial carcinoma",

  bcc: "Basal cell carcinoma",

  bkl: "Benign keratosis-like lesions",

  df: "Dermatofibroma",

  mel: "Melanoma",

  nv: "Melanocytic nevi",

  vasc: "Vascular lesions",

};

const MAX_BYTES = 10 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export default function AnalyzePage() {

  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [age, setAge] = useState("");

  const [sex, setSex] = useState("");

  const [localization, setLocalization] = useState("");

  const [model, setModel] = useState<ModelType>("image");

  const [dragging, setDragging] = useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {

    if (!file) { setPreview(null); return; }

    const url = URL.createObjectURL(file);

    setPreview(url);

    return () => URL.revokeObjectURL(url);

  }, [file]);

  const acceptFile = useCallback((next: File | undefined) => {

    if (!next) return;

    setError("");

    setResult(null);

    if (!allowedTypes.includes(next.type)) {

      setError("Choose a JPG, PNG, or WebP image.");

      return;

    }

    if (next.size > MAX_BYTES) {

      setError("The image must be smaller than 10 MB.");

      return;

    }

    setFile(next);

  }, []);

  function reset() {

    setFile(null);

    setAge("");

    setSex("");

    setLocalization("");

    setModel("image");

    setError("");

    setResult(null);

    if (fileRef.current) fileRef.current.value = "";

  }

  async function analyze() {

    setError("");

    setResult(null);

    if (!file) {

      setError("Please upload a dermoscopic image first.");

      return;

    }

    if (model === "multimodal") {
      const numericAge = Number(age);
      if (age.trim() === "" || !Number.isFinite(numericAge) || numericAge < 0 || numericAge > 120) {
        setError("Enter a valid age between 0 and 120 for multimodal analysis.");
        return;
      }
      if (!sex || !localization) {
        setError("Select sex and lesion location for multimodal analysis.");
        return;
      }
    }

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

    const form = new FormData();

    form.append("file", file);
    if (model === "multimodal") {
      form.append("age", age);
      form.append("sex", sex);
      form.append("localization", localization);
    }

    setBusy(true);

    try {

      const response = await fetch(`${apiUrl}${model === "multimodal" ? "/predict/multimodal" : "/predict/image"}`, {

        method: "POST",

        body: form,

      });

      if (!response.ok) {

        let message = `Inference request failed (${response.status}).`;

        try {

          const body: { detail?: string } = await response.json();

          if (typeof body.detail === "string") message = body.detail;

        } catch { /* Server may return a non-JSON error. */ }

        throw new Error(message);

      }

      const data: ApiResult = await response.json();

      if (!data || typeof data.predicted_class !== "string" ||

          !Array.isArray(data.predictions) ||

          !data.predictions.every(p => typeof p.class === "string" &&

            typeof p.probability === "number" && Number.isFinite(p.probability))) {

        throw new Error("The server returned an unexpected response format.");

      }

      setResult({

        predicted_class: data.predicted_class,

        predictions: data.predictions.map(p => ({ label: p.class, probability: p.probability })),

        gradcam_image: typeof data.gradcam_image === "string" && data.gradcam_image.startsWith("data:image/png;base64,") ? data.gradcam_image : null,

        model: data.model,
        metadata_used: data.metadata_used,

      });

    } catch (e) {

      setError(e instanceof TypeError

        ? "Cannot reach the inference server. Check that FastAPI is running on port 8000."

        : e instanceof Error ? e.message : "Something went wrong. Please retry.");

    } finally {

      setBusy(false);

    }

  }

  return (

    <main className="min-h-screen bg-[#060b1b] text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">

        <div className="absolute -top-64 left-1/3 h-[650px] w-[650px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />

        <div className="absolute right-[-200px] top-1/3 h-[550px] w-[550px] rounded-full bg-violet-600/[0.08] blur-[130px]" />

      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#080e20]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">

          <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20"><Activity size={23} /></span>

            <span>DermaVision<span className="text-cyan-400">.AI</span></span>

          </Link>

          <div className="flex items-center gap-3">

            <span className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 sm:inline-flex">Research prototype</span>

            <Link href="/" className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white"><ArrowLeft size={15} /> Home</Link>

          </div>

        </div>

      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8">

        <div className="mb-10 max-w-3xl animate-[dv-fade-up_.7s_ease-out_both]">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-cyan-300"><ScanLine size={15} /> AI Analysis Workspace</div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Explore skin lesions with <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">multimodal AI.</span></h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">Upload a dermoscopic image, add clinical context, and explore how a research model classifies seven lesion categories.</p>

        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.12fr_.88fr]">

          <section className="space-y-6">

            <div className="rounded-3xl border border-white/10 bg-[#101a33]/85 p-5 shadow-2xl shadow-black/10 sm:p-7">

              <div className="mb-6 flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-400"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/10">01</span> Dermoscopic Image</div><h2 className="text-xl font-bold">Upload an image</h2><p className="mt-1 text-sm text-slate-400">JPG, PNG or WebP · Maximum 10 MB</p></div><FileImage className="text-slate-500" size={25} /></div>

              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => acceptFile(e.target.files?.[0])} aria-label="Choose a dermoscopic image" />

              <div role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }} onClick={() => fileRef.current?.click()} onDragEnter={e => { e.preventDefault(); setDragging(true); }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { e.preventDefault(); setDragging(false); }} onDrop={e => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files[0]); }} className={`group relative flex min-h-[290px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400 ${dragging ? "border-cyan-300 bg-cyan-400/10" : "border-cyan-400/25 bg-[#0a142a] hover:border-cyan-400/70 hover:bg-cyan-400/[0.04]"}`}>

                {preview ? <><img src={preview} alt="Uploaded dermoscopic image preview" className="absolute inset-0 h-full w-full object-contain p-3" /><div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-[#081124]/90 px-4 py-3 text-left text-sm backdrop-blur-md"><span className="block truncate font-semibold">{file?.name}</span><span className="text-xs text-slate-400">Click or drop to replace</span></div></> : <><span className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition-transform duration-300 group-hover:-translate-y-2"><CloudUpload size={36} /></span><span className="text-lg font-semibold">Drag & drop your image here</span><span className="mt-2 text-sm text-slate-400">or click to browse your files</span><span className="mt-5 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-cyan-400 group-hover:text-slate-950"><ImagePlus size={15} className="mr-2 inline" /> Choose image</span></>}

              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole size={13} /> Your image is sent to the inference server only when you select Analyze.</div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-[#101a33]/85 p-5 sm:p-7">

              <div className="mb-6"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-400"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/10">02</span> Clinical Context</div><h2 className="text-xl font-bold">Add lesion metadata</h2><p className="mt-1 text-sm text-slate-400">Required for multimodal analysis; not sent during image-only analysis.</p></div>

              <div className="grid gap-5 sm:grid-cols-2">

                <label className="block text-sm font-medium text-slate-200">Age (years)<input type="number" min="0" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 45" className="mt-2 w-full rounded-xl border border-white/15 bg-[#0a142a] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400" /></label>

                <label className="block text-sm font-medium text-slate-200">Sex<select value={sex} onChange={e => setSex(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#0a142a] px-4 py-3 text-white outline-none transition focus:border-cyan-400"><option value="">Select sex</option><option value="male">Male</option><option value="female">Female</option></select></label>

                <label className="block text-sm font-medium text-slate-200 sm:col-span-2">Lesion location<select value={localization} onChange={e => setLocalization(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#0a142a] px-4 py-3 text-white outline-none transition focus:border-cyan-400"><option value="">Select anatomical location</option>{locations.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}</select></label>

              </div>

            </div>

          </section>

          <aside className="space-y-6 lg:sticky lg:top-6">

            <div className="rounded-3xl border border-white/10 bg-[#101a33]/85 p-5 sm:p-7">

              <div className="mb-6"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-400"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/10">03</span> Model Configuration</div><h2 className="text-xl font-bold">Choose an AI model</h2></div>

              <div className="space-y-3">

                <button type="button" onClick={() => { setModel("multimodal"); setResult(null); setError(""); }} className={`w-full rounded-2xl border p-4 text-left transition duration-300 ${model === "multimodal" ? "border-cyan-400/70 bg-cyan-400/10 shadow-lg shadow-cyan-500/5" : "border-white/10 bg-[#0a142a] hover:border-white/30"}`}><div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300"><BrainCircuit size={22} /></span><span className="flex-1"><span className="block font-semibold">Multimodal ResNet50</span><span className="block text-xs text-slate-400">Image + age + sex + lesion location</span></span>{model === "multimodal" && <CheckCircle2 className="text-cyan-300" size={20} />}</div><div className="mt-3 text-xs text-slate-400">Held-out test accuracy: <span className="font-bold text-cyan-300">78.46%</span></div></button>

                <button type="button" onClick={() => { setModel("image"); setResult(null); setError(""); }} className={`w-full rounded-2xl border p-4 text-left transition duration-300 ${model === "image" ? "border-violet-400/70 bg-violet-400/10" : "border-white/10 bg-[#0a142a] hover:border-white/30"}`}><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300"><Eye size={22} /></span><span className="flex-1"><span className="block font-semibold">Image-only ResNet50</span><span className="block text-xs text-slate-400">Dermoscopic image only</span></span>{model === "image" && <CheckCircle2 className="text-violet-300" size={20} />}</div><div className="mt-3 text-xs text-slate-400">Held-out test accuracy: <span className="font-bold text-violet-300">74.85%</span></div></button>

              </div>

              <button type="button" onClick={analyze} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 font-bold text-[#071225] shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <><LoaderCircle className="animate-spin" size={19} /> Analyzing...</> : <><Sparkles size={19} /> Analyze lesion <ArrowRight size={18} /></>}</button>

              <button type="button" onClick={reset} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"><RotateCcw size={15} /> Reset workspace</button>

              {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200"><CircleAlert className="mt-0.5 shrink-0" size={18} /><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error" className="ml-auto"><X size={16} /></button></div>}

            </div>

            <div className="rounded-3xl border border-white/10 bg-[#101a33]/85 p-5 sm:p-7">

              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-400"><Activity size={16} /> Analysis Results</div>

              {result ? <><div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4"><p className="text-xs text-slate-400">Highest-scoring class (research model)</p><p className="mt-1 text-xs text-cyan-300">{result.model ?? (model === "multimodal" ? "Multimodal ResNet50" : "ResNet50 Image-Only")}</p><h3 className="mt-1 text-xl font-bold text-cyan-200">{classNames[result.predicted_class] ?? result.predicted_class}</h3></div><div className="mt-5 space-y-3">{[...result.predictions].sort((a,b) => b.probability - a.probability).map(p => <div key={p.label}><div className="mb-1 flex justify-between gap-2 text-xs"><span className="text-slate-300">{classNames[p.label] ?? p.label}</span><span className="font-semibold text-white">{(p.probability * 100).toFixed(1)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{width:`${Math.min(100,Math.max(0,p.probability*100))}%`}} /></div></div>)}</div>{result.metadata_used && <p className="mt-4 text-xs text-slate-400">Metadata used: age {result.metadata_used.age}, {result.metadata_used.sex}, {result.metadata_used.localization}</p>}{result.gradcam_image && <div className="mt-6"><p className="mb-3 text-sm font-semibold">Grad-CAM visualization</p><img src={result.gradcam_image} alt="Grad-CAM model attention visualization" className="w-full rounded-xl border border-white/10" /></div>}<p className="mt-5 text-xs leading-5 text-slate-400">{model === "multimodal" ? "Grad-CAM is not available for the combined multimodal prediction. " : "Grad-CAM highlights image-model attribution, not medically validated evidence. "}Model scores are not clinical probabilities. Do not use this result to rule out melanoma or any other condition.</p></> : <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0a142a]/70 px-5 text-center"><ScanLine className="mb-3 text-slate-500" size={30} /><p className="font-semibold text-slate-300">Awaiting analysis</p><p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Upload an image and select Analyze to view real ResNet50 predictions.</p></div>}

            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5"><ShieldAlert className="mt-0.5 shrink-0 text-amber-300" size={21} /><p className="text-xs leading-6 text-amber-100/80"><strong className="text-amber-200">Research use only.</strong> This tool is not a medical device and cannot diagnose or rule out skin cancer. If a lesion is changing, bleeding, or concerning, seek assessment from a qualified clinician regardless of the model output.</p></div>

          </aside>

        </div>

      </div>

    </main>

  );

}
