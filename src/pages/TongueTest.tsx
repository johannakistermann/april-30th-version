import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, RotateCcw, ArrowLeft, Loader2, AlertTriangle, Info, CheckCircle2, Eye, Activity, Stethoscope, Lightbulb, ShieldAlert, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const TONGUE_ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tongue-analyze`;

// ─── Types ───────────────────────────────────────

interface TongueZone {
  name: string;
  observation: string;
  status: "normal" | "mild" | "notable";
  tcm_indication: string;
}

interface SublingualDetail {
  sublingual_quality: string;
  quality_feedback: string;
  color_baseline: { mouth_floor_color: string; vein_hue: string; contrast_level: string };
  vein_distension: { score: number; description: string };
  vein_branching: { score: number; branch_count_estimate: string; description: string };
  vein_color: { score: number; classification: string; description: string };
  symmetry: { status: string; description: string };
  composite_score: number;
  composite_classification: string;
  stagnation_pattern: string;
  practitioner_alert: boolean;
  alert_message: string | null;
  pillar_contributions: Record<string, { metric: string; value: string; confidence: string }>;
}

interface TongueAnalysis {
  image_quality: "good" | "poor" | "unusable";
  quality_feedback: string;
  body_color: { classification: string; confidence: number; tcm_indication: string };
  shape: { features: string[]; confidence: number; tcm_indication: string };
  coating: { thickness: string; color: string; texture: string; confidence: number; tcm_indication: string };
  perfusion: { score: number; classification: string; description: string };
  zones: TongueZone[];
  sublingual_veins: { visible: boolean; observation: string; status: "normal" | "mild" | "notable" };
  sublingual_detail?: SublingualDetail;
  validated_conditions: {
    anaemia_flag: boolean; diabetes_flag: boolean; inflammation_flag: boolean;
    practitioner_alert: boolean; alert_message: string | null;
  };
  overall_pattern: { primary: string; secondary: string | null; confidence: number; summary: string };
  pillar_contributions: Record<string, { metric: string; value: string; confidence: string }>;
  recommendations: string[];
}

type CaptureStep = "top" | "sublingual";

// ─── Style Maps ──────────────────────────────────

const STATUS_STYLES = {
  normal: { bg: "bg-success/10", text: "text-success", label: "Normal", border: "border-success/30" },
  mild: { bg: "bg-warning/10", text: "text-warning", label: "Mild", border: "border-warning/30" },
  notable: { bg: "bg-destructive/10", text: "text-destructive", label: "Notable", border: "border-destructive/30" },
};

const PERFUSION_STYLES: Record<string, { bg: string; text: string; glow: string }> = {
  good: { bg: "bg-success/10", text: "text-success", glow: "glow-success" },
  mild_deviation: { bg: "bg-warning/10", text: "text-warning", glow: "glow-warning" },
  moderate_deficit: { bg: "bg-destructive/10", text: "text-destructive", glow: "glow-destructive" },
  poor: { bg: "bg-destructive/20", text: "text-destructive", glow: "glow-destructive" },
};

const QUALITY_STYLES: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  good: { bg: "bg-success/15", text: "text-success", icon: CheckCircle2 },
  poor: { bg: "bg-warning/15", text: "text-warning", icon: AlertTriangle },
  unusable: { bg: "bg-destructive/15", text: "text-destructive", icon: AlertTriangle },
};

const CONFIDENCE_LABELS: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-success/10", text: "text-success" },
  moderate: { bg: "bg-warning/10", text: "text-warning" },
  low: { bg: "bg-destructive/10", text: "text-destructive" },
};

const ANALYSIS_STEPS = [
  "Validating image quality...",
  "Mapping TCM zones...",
  "Analysing body colour & shape...",
  "Evaluating coating patterns...",
  "Scoring microcirculation...",
  "Analysing sublingual veins...",
  "Checking validated conditions...",
  "Generating recommendations...",
];

// ─── Analysis Progress ───────────────────────────

const AnalysisProgress = ({ hasSublingual }: { hasSublingual: boolean }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const steps = hasSublingual ? ANALYSIS_STEPS : ANALYSIS_STEPS.filter(s => !s.includes("sublingual"));

  useEffect(() => {
    const stepInterval = setInterval(() => setStep((s) => (s < steps.length - 1 ? s + 1 : s)), 2200);
    const progressInterval = setInterval(() => setProgress((p) => Math.min(p + 1, 95)), hasSublingual ? 200 : 150);
    return () => { clearInterval(stepInterval); clearInterval(progressInterval); };
  }, [steps.length, hasSublingual]);

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
        </div>
        <div>
          <h3 className="text-sm font-display font-semibold">
            {hasSublingual ? "Full Tongue Diagnostic" : "Analysing Tongue"}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {hasSublingual ? "Top-side + sublingual vein analysis" : "TCM v3.0 Protocol"}
          </p>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
      <div className="space-y-2">
        {steps.map((label, i) => (
          <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${i <= step ? "opacity-100" : "opacity-30"}`}>
            {i < step ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
            ) : i === step ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
            )}
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── TCM Zone Diagram ────────────────────────────

const TongueZoneDiagram = ({ zones, activeZone, onZoneClick }: {
  zones: TongueZone[]; activeZone: string | null; onZoneClick: (name: string) => void;
}) => {
  const getZoneOpacity = (zoneName: string) => {
    const zone = zones.find((z) => z.name === zoneName);
    if (!zone) return 0.3;
    if (activeZone === zoneName) return 0.9;
    return zone.status === "notable" ? 0.7 : zone.status === "mild" ? 0.5 : 0.35;
  };
  const getZoneColor = (zoneName: string) => {
    const zone = zones.find((z) => z.name === zoneName);
    if (!zone) return "#888";
    return zone.status === "notable" ? "#ef4444" : zone.status === "mild" ? "#eab308" : "#22c55e";
  };

  return (
    <div className="relative w-full max-w-[220px] mx-auto">
      <svg viewBox="0 0 200 260" className="w-full">
        <path d="M100,10 C140,10 170,40 175,80 C180,120 178,160 170,195 C160,225 140,250 100,250 C60,250 40,225 30,195 C22,160 20,120 25,80 C30,40 60,10 100,10Z" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.3" />
        <path d="M100,15 C135,15 160,38 168,70 L32,70 C40,38 65,15 100,15Z" fill={getZoneColor("Tip (Heart/Lung)")} opacity={getZoneOpacity("Tip (Heart/Lung)")} className="cursor-pointer transition-opacity duration-200" onClick={() => onZoneClick("Tip (Heart/Lung)")} />
        <text x="100" y="48" textAnchor="middle" className="fill-foreground text-[10px] font-display pointer-events-none" opacity="0.8">Tip</text>
        <text x="100" y="60" textAnchor="middle" className="fill-muted-foreground text-[7px] pointer-events-none" opacity="0.6">Heart/Lung</text>
        <path d="M25,80 C22,110 22,145 25,175 L60,175 L60,80Z" fill={getZoneColor("Sides (Liver/Gallbladder)")} opacity={getZoneOpacity("Sides (Liver/Gallbladder)")} className="cursor-pointer transition-opacity duration-200" onClick={() => onZoneClick("Sides (Liver/Gallbladder)")} />
        <path d="M175,80 C178,110 178,145 175,175 L140,175 L140,80Z" fill={getZoneColor("Sides (Liver/Gallbladder)")} opacity={getZoneOpacity("Sides (Liver/Gallbladder)")} className="cursor-pointer transition-opacity duration-200" onClick={() => onZoneClick("Sides (Liver/Gallbladder)")} />
        <text x="42" y="132" textAnchor="middle" className="fill-foreground text-[8px] font-display pointer-events-none" opacity="0.8" transform="rotate(-90 42 132)">Sides</text>
        <text x="158" y="132" textAnchor="middle" className="fill-foreground text-[8px] font-display pointer-events-none" opacity="0.8" transform="rotate(90 158 132)">Sides</text>
        <rect x="60" y="80" width="80" height="95" fill={getZoneColor("Center (Spleen/Stomach)")} opacity={getZoneOpacity("Center (Spleen/Stomach)")} className="cursor-pointer transition-opacity duration-200" onClick={() => onZoneClick("Center (Spleen/Stomach)")} />
        <text x="100" y="125" textAnchor="middle" className="fill-foreground text-[10px] font-display pointer-events-none" opacity="0.8">Centre</text>
        <text x="100" y="137" textAnchor="middle" className="fill-muted-foreground text-[7px] pointer-events-none" opacity="0.6">Spleen/Stomach</text>
        <path d="M30,185 C25,175 60,175 60,175 L140,175 C140,175 175,175 170,185 C160,220 140,245 100,245 C60,245 40,220 30,185Z" fill={getZoneColor("Root (Kidney/Bladder)")} opacity={getZoneOpacity("Root (Kidney/Bladder)")} className="cursor-pointer transition-opacity duration-200" onClick={() => onZoneClick("Root (Kidney/Bladder)")} />
        <text x="100" y="210" textAnchor="middle" className="fill-foreground text-[10px] font-display pointer-events-none" opacity="0.8">Root</text>
        <text x="100" y="222" textAnchor="middle" className="fill-muted-foreground text-[7px] pointer-events-none" opacity="0.6">Kidney/Bladder</text>
      </svg>
      <div className="flex justify-center gap-3 mt-2">
        {[{ color: "bg-success", label: "Normal" }, { color: "bg-warning", label: "Mild" }, { color: "bg-destructive", label: "Notable" }].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[9px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Perfusion Ring ──────────────────────────────

const PerfusionRing = ({ score, classification }: { score: number; classification: string }) => {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={score >= 70 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold">{score}</span>
        <span className="text-[9px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

// ─── Small Score Ring ────────────────────────────

const ScoreRing = ({ score, size = 64, label }: { score: number; size?: number; label: string }) => {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-display font-bold">{score}</span>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground text-center">{label}</span>
    </div>
  );
};

// ─── Confidence Bar ──────────────────────────────

const ConfidenceBar = ({ value, label }: { value: number; label?: string }) => (
  <div className="flex items-center gap-2">
    <Progress value={value} className={`h-1.5 flex-1 ${value > 70 ? "[&>div]:bg-success" : value > 40 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}`} />
    <span className="text-[10px] text-muted-foreground w-8 text-right">{value}%</span>
    {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
  </div>
);

// ─── Main Page Component ─────────────────────────

const TongueTest = () => {
  const navigate = useNavigate();
  const [captureStep, setCaptureStep] = useState<CaptureStep>("top");
  const [topImage, setTopImage] = useState<string | null>(null);
  const [sublingualImage, setSublingualImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TongueAnalysis | null>(null);
  const [sublingualResult, setSublingualResult] = useState<SublingualDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentImage = captureStep === "top" ? topImage : sublingualImage;
  const setCurrentImage = captureStep === "top" ? setTopImage : setSublingualImage;

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setVideoReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setError("Camera access denied. Please allow camera access or upload an image instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setVideoReady(false);
  }, []);

  const handleVideoRef = useCallback((el: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.onloadedmetadata = () => { el.play().then(() => setVideoReady(true)).catch(() => {}); };
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !videoReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    setCurrentImage(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  }, [stopCamera, videoReady, setCurrentImage]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCurrentImage(reader.result as string);
    reader.readAsDataURL(file);
  }, [setCurrentImage]);

  const proceedToSublingual = () => {
    setCaptureStep("sublingual");
  };

  const skipSublingual = () => {
    analyzeImages(null);
  };

  const analyzeImages = async (subImg: string | null) => {
    if (!topImage) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSublingualResult(null);

    try {
      const topBase64 = topImage.split(",")[1];
      const body: Record<string, string> = { image_base64: topBase64 };
      if (subImg) {
        body.sublingual_image_base64 = subImg.split(",")[1];
      }

      const resp = await fetch(TONGUE_ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${resp.status})`);
      }

      const data = await resp.json();
      setResult(data.analysis);
      if (data.sublingual_analysis) {
        setSublingualResult(data.sublingual_analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setTopImage(null);
    setSublingualImage(null);
    setCaptureStep("top");
    setResult(null);
    setSublingualResult(null);
    setError(null);
  };

  const isCapturing = !result && !isAnalyzing;
  const showCaptureUI = isCapturing && !currentImage;
  const showPreview = isCapturing && !!currentImage;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-card/60">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">Tongue Diagnostics</h1>
            <p className="text-xs text-muted-foreground">TCM zone mapping + validated AI analysis</p>
          </div>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">v3.0</Badge>
        </div>

        {/* Step indicator */}
        {isCapturing && (
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${captureStep === "top" ? "bg-primary text-primary-foreground" : "bg-success/20 text-success"}`}>
                {topImage && captureStep === "sublingual" ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <div className="flex-1 h-0.5 bg-muted rounded-full">
                <div className={`h-full rounded-full transition-all duration-500 ${captureStep === "sublingual" ? "bg-primary w-full" : "bg-primary/30 w-0"}`} />
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${captureStep === "sublingual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              <span className="text-[9px] text-muted-foreground">Top of tongue</span>
              <span className="text-[9px] text-muted-foreground">Underside</span>
            </div>
          </div>
        )}

        {/* Capture Tips */}
        {showCaptureUI && (
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-display font-semibold">
                {captureStep === "top" ? "Step 1: Top of Tongue" : "Step 2: Underside of Tongue"}
              </span>
            </div>
            {captureStep === "top" ? (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "💡", tip: "Use flash or bright white light (~5500K)" },
                  { icon: "👅", tip: "Stick tongue out fully — snap within 10s" },
                  { icon: "🚫", tip: "No food or drink 30 minutes before" },
                  { icon: "📷", tip: "Face camera directly, mouth wide open" },
                ].map((item, i) => (
                  <div key={i} className="bg-card/40 rounded-xl p-2.5 flex gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{item.tip}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Lift your tongue to the roof of your mouth to reveal the underside. The camera needs to see the <strong>two main veins</strong> running along the bottom.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "👆", tip: "Curl tongue tip up to the roof of your mouth" },
                    { icon: "💡", tip: "Keep the flash on — vein colour accuracy matters" },
                    { icon: "🔍", tip: "Get close — veins should be clearly visible" },
                    { icon: "⏱️", tip: "Hold steady for 3 seconds before capture" },
                  ].map((item, i) => (
                    <div key={i} className="bg-card/40 rounded-xl p-2.5 flex gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">{item.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera / Upload */}
        {showCaptureUI && (
          <div className="glass-card p-6 flex flex-col items-center gap-4">
            {cameraActive ? (
              <>
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black">
                  <video ref={handleVideoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {captureStep === "top" ? (
                      <div className="w-36 h-48 border-2 border-dashed border-primary/40 rounded-[40%] flex items-center justify-center">
                        <span className="text-[10px] text-primary/60 font-display">Align tongue here</span>
                      </div>
                    ) : (
                      <div className="w-44 h-32 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center">
                        <span className="text-[10px] text-primary/60 font-display text-center px-2">Show underside with veins visible</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={capturePhoto} disabled={!videoReady} className="w-full h-12 rounded-xl font-display font-semibold">
                  {videoReady ? <><Camera className="w-5 h-5 mr-2" /> Capture {captureStep === "top" ? "Tongue" : "Underside"}</> : <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Starting camera...</>}
                </Button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative">
                  <Camera className="w-10 h-10 text-primary" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                </div>
                <Button onClick={startCamera} className="w-full h-12 rounded-xl font-display font-semibold">
                  Open Camera
                </Button>
                <div className="relative w-full">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-display" asChild>
                    <label>
                      <Upload className="w-5 h-5 mr-2" /> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Preview + Next/Analyze */}
        {showPreview && (
          <div className="glass-card p-4 space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img src={currentImage} alt={captureStep === "top" ? "Tongue top" : "Tongue underside"} className="w-full rounded-xl" />
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-background/80 text-foreground text-[10px] backdrop-blur-sm">
                  {captureStep === "top" ? "Top — ready" : "Underside — ready"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentImage(null)} className="flex-1 h-12 rounded-xl font-display">
                <RotateCcw className="w-4 h-4 mr-2" /> Retake
              </Button>
              {captureStep === "top" ? (
                <Button onClick={proceedToSublingual} className="flex-1 h-12 rounded-xl font-display font-semibold">
                  Next: Underside <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => analyzeImages(sublingualImage)} className="flex-1 h-12 rounded-xl font-display font-semibold">
                  Analyse Both
                </Button>
              )}
            </div>
            {captureStep === "sublingual" && (
              <Button variant="ghost" onClick={() => { setSublingualImage(null); skipSublingual(); }} className="w-full text-xs text-muted-foreground">
                <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip — analyse top only
              </Button>
            )}
            {captureStep === "top" && (
              <Button variant="ghost" onClick={skipSublingual} className="w-full text-xs text-muted-foreground">
                <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip underside — analyse top only
              </Button>
            )}
          </div>
        )}

        {/* Sublingual capture prompt (after top, before sublingual captured) */}
        {captureStep === "sublingual" && !sublingualImage && !isAnalyzing && !result && !showPreview && !cameraActive && (
          <div className="glass-card p-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-3xl">👆</span>
            </div>
            <p className="text-sm font-display font-semibold">Now capture the underside</p>
            <p className="text-[11px] text-muted-foreground">Curl your tongue up to show the two main veins underneath for vascular health analysis.</p>
            <Button variant="ghost" onClick={skipSublingual} className="text-xs text-muted-foreground mt-2">
              <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip underside — analyse top only
            </Button>
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <>
            <div className="glass-card p-3 flex gap-2">
              {topImage && <img src={topImage} alt="Top" className="w-1/2 rounded-lg max-h-24 object-cover opacity-60" />}
              {sublingualImage && <img src={sublingualImage} alt="Underside" className="w-1/2 rounded-lg max-h-24 object-cover opacity-60" />}
            </div>
            <AnalysisProgress hasSublingual={!!sublingualImage} />
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Error */}
        {error && (
          <div className="glass-card p-4 border border-destructive/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-display font-medium text-destructive">Analysis Error</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={reset} className="mt-3 text-xs">Try Again</Button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <TongueResults analysis={result} sublingualDetail={sublingualResult} onReset={reset} />
        )}
      </div>
    </div>
  );
};

// ─── Sublingual Detail Card ──────────────────────

const SublingualDetailCard = ({ detail }: { detail: SublingualDetail }) => {
  const stagnationStyles: Record<string, { bg: string; text: string }> = {
    healthy: { bg: "bg-success/10", text: "text-success" },
    mild_stagnation: { bg: "bg-warning/10", text: "text-warning" },
    moderate_stagnation: { bg: "bg-destructive/10", text: "text-destructive" },
    severe_stagnation: { bg: "bg-destructive/20", text: "text-destructive" },
  };
  const style = stagnationStyles[detail.composite_classification] || stagnationStyles.healthy;

  return (
    <div className="space-y-3">
      {/* Composite Score */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-display font-semibold">Sublingual Vein Analysis</span>
        </div>

        <PerfusionRing score={detail.composite_score} classification={detail.composite_classification} />
        <div className="text-center">
          <Badge className={`${style.bg} ${style.text} border-0 text-[10px]`}>
            {detail.composite_classification.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">{detail.stagnation_pattern}</p>
      </div>

      {/* Individual Scores */}
      <div className="glass-card p-4 space-y-3">
        <span className="text-xs font-display font-semibold">Vein Metrics</span>
        <div className="flex justify-around">
          <ScoreRing score={detail.vein_distension.score} label="Distension" />
          <ScoreRing score={detail.vein_branching.score} label="Branching" />
          <ScoreRing score={detail.vein_color.score} label="Colour" />
        </div>
        <div className="space-y-2 mt-2">
          <div className="p-2.5 bg-card/30 rounded-xl">
            <span className="text-[10px] font-display font-medium">Distension</span>
            <p className="text-[10px] text-muted-foreground">{detail.vein_distension.description}</p>
          </div>
          <div className="p-2.5 bg-card/30 rounded-xl">
            <span className="text-[10px] font-display font-medium">Branching ({detail.vein_branching.branch_count_estimate})</span>
            <p className="text-[10px] text-muted-foreground">{detail.vein_branching.description}</p>
          </div>
          <div className="p-2.5 bg-card/30 rounded-xl">
            <span className="text-[10px] font-display font-medium">Vein Colour ({detail.vein_color.classification?.replace(/_/g, " ")})</span>
            <p className="text-[10px] text-muted-foreground">{detail.vein_color.description}</p>
          </div>
        </div>
      </div>

      {/* Color Baseline */}
      {detail.color_baseline && (
        <div className="glass-card p-4 space-y-2">
          <span className="text-xs font-display font-semibold">Colour Calibration</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card/30 rounded-xl p-2 text-center">
              <span className="text-[9px] text-muted-foreground block">Floor Colour</span>
              <span className="text-[10px] font-display font-medium capitalize">{detail.color_baseline.mouth_floor_color}</span>
            </div>
            <div className="bg-card/30 rounded-xl p-2 text-center">
              <span className="text-[9px] text-muted-foreground block">Vein Hue</span>
              <span className="text-[10px] font-display font-medium capitalize">{detail.color_baseline.vein_hue}</span>
            </div>
            <div className="bg-card/30 rounded-xl p-2 text-center">
              <span className="text-[9px] text-muted-foreground block">Contrast</span>
              <span className="text-[10px] font-display font-medium capitalize">{detail.color_baseline.contrast_level}</span>
            </div>
          </div>
        </div>
      )}

      {/* Symmetry */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-semibold">Vein Symmetry</span>
          <Badge className={`${detail.symmetry.status === "symmetric" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"} border-0 text-[10px]`}>
            {detail.symmetry.status?.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">{detail.symmetry.description}</p>
      </div>

      {/* Practitioner Alert */}
      {detail.practitioner_alert && (
        <div className="glass-card p-4 border border-destructive/50 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <span className="text-sm font-display font-semibold text-destructive">Vein Alert</span>
          </div>
          <p className="text-xs text-destructive/80">{detail.alert_message}</p>
        </div>
      )}
    </div>
  );
};

// ─── Results Component ───────────────────────────

const TongueResults = ({
  analysis, sublingualDetail, onReset,
}: {
  analysis: TongueAnalysis; sublingualDetail: SublingualDetail | null; onReset: () => void;
}) => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const selectedZone = analysis.zones?.find((z) => z.name === activeZone);
  const qualityStyle = QUALITY_STYLES[analysis.image_quality] || QUALITY_STYLES.good;
  const QualityIcon = qualityStyle.icon;
  const hasSublingual = !!sublingualDetail;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Practitioner Alert */}
      {analysis.validated_conditions?.practitioner_alert && (
        <div className="glass-card p-4 border border-destructive/50 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <span className="text-sm font-display font-semibold text-destructive">Practitioner Alert</span>
          </div>
          <p className="text-xs text-destructive/80">{analysis.validated_conditions.alert_message}</p>
        </div>
      )}

      {/* Scan type badge */}
      {hasSublingual && (
        <div className="flex justify-center">
          <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
            Full Diagnostic — Top + Sublingual
          </Badge>
        </div>
      )}

      {/* Image Quality */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QualityIcon className={`w-4 h-4 ${qualityStyle.text}`} />
            <span className="text-sm font-display font-medium">Image Quality</span>
          </div>
          <Badge className={`${qualityStyle.bg} ${qualityStyle.text} border-0 text-[10px] capitalize`}>{analysis.image_quality}</Badge>
        </div>
        {analysis.quality_feedback && <p className="text-[11px] text-muted-foreground">{analysis.quality_feedback}</p>}
      </div>

      {/* Overall Pattern */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-display font-semibold">Overall Pattern</span>
        </div>
        <p className="text-lg font-display font-bold text-primary">{analysis.overall_pattern?.primary}</p>
        {analysis.overall_pattern?.secondary && <p className="text-xs text-muted-foreground">Secondary: {analysis.overall_pattern.secondary}</p>}
        <p className="text-[11px] text-muted-foreground leading-relaxed">{analysis.overall_pattern?.summary}</p>
        <ConfidenceBar value={analysis.overall_pattern?.confidence || 0} />
      </div>

      {/* Tabbed Results */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`w-full grid ${hasSublingual ? "grid-cols-5" : "grid-cols-4"} bg-card/60 rounded-xl h-9`}>
          <TabsTrigger value="overview" className="text-[10px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Overview</TabsTrigger>
          <TabsTrigger value="zones" className="text-[10px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">TCM</TabsTrigger>
          {hasSublingual && (
            <TabsTrigger value="veins" className="text-[10px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Veins</TabsTrigger>
          )}
          <TabsTrigger value="conditions" className="text-[10px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Flags</TabsTrigger>
          <TabsTrigger value="pillars" className="text-[10px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Pillars</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3 mt-3">
          {analysis.perfusion && (
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-display font-semibold">Microcirculation Perfusion</span>
              </div>
              <PerfusionRing score={analysis.perfusion.score} classification={analysis.perfusion.classification} />
              <div className="text-center">
                <Badge className={`${(PERFUSION_STYLES[analysis.perfusion.classification] || PERFUSION_STYLES.good).bg} ${(PERFUSION_STYLES[analysis.perfusion.classification] || PERFUSION_STYLES.good).text} border-0 text-[10px]`}>
                  {analysis.perfusion.classification.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">{analysis.perfusion.description}</p>
            </div>
          )}
          {analysis.body_color && <FeatureCard title="Body Colour" icon={<div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-red-500" />} value={analysis.body_color.classification} confidence={analysis.body_color.confidence} description={analysis.body_color.tcm_indication} />}
          {analysis.shape && <FeatureCard title="Shape & Texture" icon={<Stethoscope className="w-4 h-4 text-info" />} value={analysis.shape.features.join(", ")} confidence={analysis.shape.confidence} description={analysis.shape.tcm_indication} />}
          {analysis.coating && <FeatureCard title="Coating" icon={<div className="w-4 h-4 rounded bg-gradient-to-b from-white/60 to-yellow-200/60" />} value={`${analysis.coating.thickness} ${analysis.coating.color} — ${analysis.coating.texture}`} confidence={analysis.coating.confidence} description={analysis.coating.tcm_indication} />}

          {/* Basic sublingual summary when no detail */}
          {analysis.sublingual_veins && !hasSublingual && (
            <div className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-info" />
                  <span className="text-sm font-display font-medium">Sublingual Veins</span>
                </div>
                <Badge className={`${STATUS_STYLES[analysis.sublingual_veins.status]?.bg || ""} ${STATUS_STYLES[analysis.sublingual_veins.status]?.text || ""} border-0 text-[10px]`}>
                  {STATUS_STYLES[analysis.sublingual_veins.status]?.label || "Unknown"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{analysis.sublingual_veins.observation}</p>
              <p className="text-[10px] text-muted-foreground/60">{analysis.sublingual_veins.visible ? "Veins visible under tongue" : "Veins not clearly visible — add underside photo for accuracy"}</p>
            </div>
          )}
        </TabsContent>

        {/* TCM Zones Tab */}
        <TabsContent value="zones" className="space-y-3 mt-3">
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-2"><span className="text-sm font-display font-semibold">Interactive Zone Map</span></div>
            <p className="text-[10px] text-muted-foreground">Tap a zone to see details</p>
            <TongueZoneDiagram zones={analysis.zones || []} activeZone={activeZone} onZoneClick={(name) => setActiveZone(activeZone === name ? null : name)} />
          </div>
          {selectedZone && (
            <div className={`glass-card p-4 space-y-2 border ${STATUS_STYLES[selectedZone.status]?.border || ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-semibold">{selectedZone.name}</span>
                <Badge className={`${STATUS_STYLES[selectedZone.status]?.bg || ""} ${STATUS_STYLES[selectedZone.status]?.text || ""} border-0 text-[10px]`}>{STATUS_STYLES[selectedZone.status]?.label}</Badge>
              </div>
              <p className="text-[11px] text-foreground/80">{selectedZone.observation}</p>
              <p className="text-[10px] text-muted-foreground italic">{selectedZone.tcm_indication}</p>
            </div>
          )}
          <div className="glass-card p-4 space-y-3">
            <span className="text-sm font-display font-semibold">All Zones</span>
            {analysis.zones?.map((zone) => {
              const style = STATUS_STYLES[zone.status] || STATUS_STYLES.normal;
              return (
                <div key={zone.name} className={`p-3 rounded-xl border transition-all cursor-pointer ${activeZone === zone.name ? `${style.border} ${style.bg}` : "border-transparent bg-card/30 hover:bg-card/50"}`} onClick={() => setActiveZone(activeZone === zone.name ? null : zone.name)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-display font-medium">{zone.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{zone.observation}</p>
                  <p className="text-[10px] text-muted-foreground/70 italic mt-1">{zone.tcm_indication}</p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Veins Tab (only with sublingual) */}
        {hasSublingual && (
          <TabsContent value="veins" className="space-y-3 mt-3">
            <SublingualDetailCard detail={sublingualDetail!} />
          </TabsContent>
        )}

        {/* Conditions / Flags Tab */}
        <TabsContent value="conditions" className="space-y-3 mt-3">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-warning" />
              <span className="text-sm font-display font-semibold">Validated Condition Flags</span>
            </div>
            <FlagItem label="Anaemia Indicator" active={analysis.validated_conditions?.anaemia_flag || false} message="Tongue colour may indicate low iron. A simple blood test can confirm." />
            <FlagItem label="Glycaemic Indicator" active={analysis.validated_conditions?.diabetes_flag || false} message="Coating pattern associated with blood sugar imbalances. Consider lab testing." />
            <FlagItem label="Inflammatory Signal" active={analysis.validated_conditions?.inflammation_flag || false} message="Tongue colour suggests elevated systemic inflammation." />
            <FlagItem label="Practitioner Alert" active={analysis.validated_conditions?.practitioner_alert || false} message={analysis.validated_conditions?.alert_message || "Patterns detected that warrant professional review."} critical />
          </div>
          {analysis.recommendations?.length > 0 && (
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-display font-semibold">Recommendations</span>
              </div>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-2.5 p-2.5 bg-card/30 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-display font-bold text-primary">{i + 1}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Pillars Tab */}
        <TabsContent value="pillars" className="space-y-3 mt-3">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-display font-semibold">Pillar Contributions</span>
            </div>
            <p className="text-[10px] text-muted-foreground">How this tongue scan feeds into your health pillars</p>
            {analysis.pillar_contributions && Object.entries(analysis.pillar_contributions).map(([key, pillar]) => {
              const confStyle = CONFIDENCE_LABELS[pillar.confidence] || CONFIDENCE_LABELS.moderate;
              const pillarNames: Record<string, string> = {
                p1_energy: "P1 — Energy & Vitality",
                p2_organs: "P2 — Organ & Inflammatory Load",
                p4_metabolic: "P4 — Metabolic & Glycaemic",
              };
              return (
                <div key={key} className="p-3 bg-card/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-medium">{pillarNames[key] || key}</span>
                    <Badge className={`${confStyle.bg} ${confStyle.text} border-0 text-[9px]`}>{pillar.confidence}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{pillar.metric}</span>
                    <span className="text-xs font-display font-semibold">{pillar.value}</span>
                  </div>
                </div>
              );
            })}

            {/* Sublingual pillar contributions */}
            {sublingualDetail?.pillar_contributions && (
              <>
                <div className="border-t border-muted my-2" />
                <p className="text-[10px] text-muted-foreground">From sublingual vein analysis:</p>
                {Object.entries(sublingualDetail.pillar_contributions).map(([key, pillar]) => {
                  const confStyle = CONFIDENCE_LABELS[pillar.confidence] || CONFIDENCE_LABELS.moderate;
                  const pillarNames: Record<string, string> = {
                    p2_inflammatory: "P2 — Inflammatory Load (Veins)",
                    p4_vascular: "P4 — Vascular Health (Veins)",
                  };
                  return (
                    <div key={key} className="p-3 bg-card/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display font-medium">{pillarNames[key] || key}</span>
                        <Badge className={`${confStyle.bg} ${confStyle.text} border-0 text-[9px]`}>{pillar.confidence}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{pillar.metric}</span>
                        <span className="text-xs font-display font-semibold">{pillar.value}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {(!analysis.pillar_contributions || Object.keys(analysis.pillar_contributions).length === 0) && (
              <p className="text-[11px] text-muted-foreground text-center py-4">No pillar data available for this scan.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Tongue analysis provides indicators, not diagnoses. For accuracy, combine with voice, face, and lab data via the Two-Witness Rule.
      </p>

      <Button variant="outline" onClick={onReset} className="w-full h-12 rounded-xl font-display">
        <RotateCcw className="w-4 h-4 mr-2" /> New Scan
      </Button>
    </div>
  );
};

// ─── Shared Components ───────────────────────────

const FeatureCard = ({ title, icon, value, confidence, description }: { title: string; icon: React.ReactNode; value: string; confidence: number; description: string }) => (
  <div className="glass-card p-4 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">{icon}<span className="text-sm font-display font-medium">{title}</span></div>
      <span className="text-xs font-display font-semibold capitalize">{value}</span>
    </div>
    <p className="text-[11px] text-muted-foreground">{description}</p>
    <ConfidenceBar value={confidence} />
  </div>
);

const FlagItem = ({ label, active, message, critical }: { label: string; message: string; active: boolean; critical?: boolean }) => (
  <div className={`flex gap-2.5 items-start p-2.5 rounded-xl transition-colors ${active ? (critical ? "bg-destructive/10" : "bg-warning/10") : "bg-card/30"}`}>
    {active ? <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${critical ? "text-destructive" : "text-warning"}`} /> : <CheckCircle2 className="w-4 h-4 text-success/50 mt-0.5 shrink-0" />}
    <div>
      <span className={`text-xs font-display font-medium ${active ? (critical ? "text-destructive" : "text-warning") : "text-muted-foreground/60"}`}>{label}</span>
      <p className={`text-[10px] ${active ? "text-muted-foreground" : "text-muted-foreground/40"}`}>{active ? message : "Not detected"}</p>
    </div>
  </div>
);

export default TongueTest;
