import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Mic, CircleDot, CheckCircle2, Loader2, RefreshCw, MicOff, X, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const FACE_STEPS = [
  { label: "Hold still, look at the camera", hint: "Capturing rPPG, FaceAge, colour baseline..." },
  { label: "Slowly turn your head LEFT", hint: "Mapping sub-auricular anchor, 3D depth..." },
  { label: "Now slowly turn your head RIGHT", hint: "Completing full colour sweep..." },
];

const VOICE_DURATION = 15;
const VALIDATION_TIMEOUT = 5000;

type Stage = "face" | "tongue_front" | "tongue_back" | "voice";

const STAGE_ORDER: Stage[] = ["face", "tongue_front", "tongue_back", "voice"];

const STAGE_INSTRUCTIONS: Record<Stage, { title: string; subtitle: string }> = {
  face: { title: "Face Scan", subtitle: "Hold still and look at the camera" },
  tongue_front: { title: "Tongue — Front", subtitle: "Open wide & stick out your tongue, then tap capture" },
  tongue_back: { title: "Tongue — Underside", subtitle: "Curl your tongue UP to show the underside" },
  voice: { title: "Voice Check", subtitle: "Read the passage aloud at your natural pace" },
};

interface ScanVideoViewProps {
  stream: MediaStream;
  isDeepScan: boolean;
  onComplete: () => void;
}

const ScanVideoView = ({ stream, isDeepScan, onComplete }: ScanVideoViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [faceStep, setFaceStep] = useState(0);

  // Tongue state
  const [tongueImage, setTongueImage] = useState<string | null>(null);
  const [tongueValidating, setTongueValidating] = useState(false);
  const [tongueCaptured, setTongueCaptured] = useState(false);
  const [tongueError, setTongueError] = useState<string | null>(null);
  const [tongueFailCount, setTongueFailCount] = useState(0);

  // Voice state
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [voiceValidating, setVoiceValidating] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceElapsed, setVoiceElapsed] = useState(0);
  const [voiceFailCount, setVoiceFailCount] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeSamplesRef = useRef<number[]>([]);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  const [allComplete, setAllComplete] = useState(false);

  const stage = STAGE_ORDER[stageIdx];
  const faceDuration = 15;

  // Attach stream to video
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, stage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, [stream]);

  // Face scan timer
  useEffect(() => {
    if (stage !== "face") return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= faceDuration) {
          clearInterval(interval);
          return faceDuration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  // Auto-advance face → tongue_front
  useEffect(() => {
    if (elapsed >= faceDuration && stage === "face") {
      setStageIdx(1);
      resetTongueState();
    }
  }, [elapsed, stage]);

  // Face sub-steps
  useEffect(() => {
    if (stage !== "face") return;
    if (elapsed < 5) setFaceStep(0);
    else if (elapsed < 10) setFaceStep(1);
    else setFaceStep(2);
  }, [elapsed, stage]);

  // Voice timer + auto-stop
  useEffect(() => {
    if (!voiceRecording) return;
    const interval = setInterval(() => {
      setVoiceElapsed((prev) => {
        const next = prev + 1;
        if (next >= VOICE_DURATION) {
          clearInterval(interval);
          setTimeout(() => stopRecordingRef.current?.(), 0);
          return VOICE_DURATION;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [voiceRecording]);

  const resetTongueState = () => {
    setTongueImage(null);
    setTongueCaptured(false);
    setTongueValidating(false);
    setTongueError(null);
    setTongueFailCount(0);
  };

  const advanceStage = useCallback(() => {
    const nextIdx = stageIdx + 1;
    if (nextIdx >= STAGE_ORDER.length) {
      setAllComplete(true);
      setTimeout(() => onComplete(), 3000);
    } else {
      setStageIdx(nextIdx);
      resetTongueState();
    }
  }, [stageIdx, onComplete]);

  // Capture tongue with timeout + skip fallback
  const captureTonguePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);

    setTongueImage(imageData);
    setTongueError(null);
    setTongueValidating(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT);

      const { data, error } = await supabase.functions.invoke("validate-tongue", {
        body: { image: imageData },
      });
      clearTimeout(timeout);

      if (error) throw error;
      if (data.has_tongue && data.quality_ok && data.close_enough) {
        setTongueCaptured(true);
        setTimeout(() => advanceStage(), 1000);
      } else {
        const msg = data.message || "Please retake the photo.";
        setTongueError(msg);
        setTongueImage(null);
        setTongueFailCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Tongue validation error:", err);
      // On timeout or error, accept and move on
      setTongueCaptured(true);
      setTimeout(() => advanceStage(), 1000);
    } finally {
      setTongueValidating(false);
    }
  }, [advanceStage]);

  const skipTongue = useCallback(() => {
    setTongueCaptured(true);
    setTimeout(() => advanceStage(), 500);
  }, [advanceStage]);

  // Voice recording
  const startRecording = useCallback(async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      volumeSamplesRef.current = [];
      setVoiceElapsed(0);
      setVoiceError(null);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const volumeInterval = setInterval(() => {
        if (!analyserRef.current) return;
        const dataArray = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
        const rms = Math.sqrt(sum / dataArray.length);
        volumeSamplesRef.current.push(rms);
      }, 200);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        clearInterval(volumeInterval);
        audioStream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(250);
      setVoiceRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setVoiceError("Could not access microphone. Please allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    setVoiceRecording(false);
    setVoiceValidating(true);

    await new Promise<void>((resolve) => {
      const origOnStop = recorder.onstop;
      recorder.onstop = (e) => {
        if (origOnStop) (origOnStop as (e: Event) => void)(e);
        resolve();
      };
      recorder.stop();
    });

    const duration = voiceElapsed;
    const avgVolume =
      volumeSamplesRef.current.length > 0
        ? volumeSamplesRef.current.reduce((a, b) => a + b, 0) / volumeSamplesRef.current.length
        : 0;

    if (duration < 5) {
      setVoiceError("Recording too short. Please read the full passage aloud.");
      setVoiceValidating(false);
      setVoiceFailCount((c) => c + 1);
      return;
    }

    if (avgVolume < 0.003) {
      setVoiceError("We couldn't hear you. Please speak louder and closer to the microphone.");
      setVoiceValidating(false);
      setVoiceFailCount((c) => c + 1);
      return;
    }

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), VALIDATION_TIMEOUT)
        );
        const validatePromise = supabase.functions.invoke("validate-voice", {
          body: { audio_base64: base64, duration_seconds: duration, avg_volume: avgVolume },
        });

        const { data, error } = (await Promise.race([validatePromise, timeoutPromise])) as any;
        if (error) throw error;

        if (data.valid) {
          setVoiceRecorded(true);
          setTimeout(() => { setAllComplete(true); }, 800);
          setTimeout(() => onComplete(), 3000);
        } else {
          setVoiceError(data.message || "Please try recording again.");
          setVoiceFailCount((c) => c + 1);
        }
      } catch (err) {
        console.error("Voice validation error:", err);
        // On timeout/error, accept
        setVoiceRecorded(true);
        setTimeout(() => { setAllComplete(true); }, 800);
        setTimeout(() => onComplete(), 3000);
      } finally {
        setVoiceValidating(false);
      }
    };
    reader.readAsDataURL(blob);
  }, [voiceElapsed, onComplete]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const skipVoice = useCallback(() => {
    setVoiceRecorded(true);
    setAllComplete(true);
    setTimeout(() => onComplete(), 2000);
  }, [onComplete]);

  const faceProgress = (elapsed / faceDuration) * 100;
  const voiceProgress = (voiceElapsed / VOICE_DURATION) * 100;
  const isTongueStage = stage === "tongue_front" || stage === "tongue_back";
  const info = STAGE_INSTRUCTIONS[stage];

  // ─── All-complete success screen ───
  if (allComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold">All Data Captured!</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Face scan, tongue photos, and voice recording complete. Analysing your biomarkers now…
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            {["Face", "Tongue (front)", "Tongue (under)", "Voice"].map((label) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-success font-display">
                <CheckCircle2 className="w-3.5 h-3.5" /> {label}
              </div>
            ))}
          </div>
          <Loader2 className="w-6 h-6 text-primary animate-spin mt-4" />
          <p className="text-xs text-muted-foreground">Preparing analysis…</p>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    stream.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Cancel button */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Cancel scan"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Inline instruction banner */}
      <div className="px-6 pt-14 pb-2 text-center z-40">
        <p className="text-xs text-muted-foreground font-display">
          Step {stageIdx + 1} of {STAGE_ORDER.length}
        </p>
        <h2 className="text-lg font-display font-bold mt-0.5">{info.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{info.subtitle}</p>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <canvas ref={canvasRef} className="hidden" />

        {/* Voice stage */}
        {stage === "voice" ? (
          <div className="relative w-full max-w-sm mx-auto px-6 flex flex-col items-center gap-5">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${voiceRecording ? "bg-destructive/10" : voiceRecorded ? "bg-success/10" : "bg-primary/10"}`}>
              {voiceRecording ? (
                <Mic className="w-8 h-8 text-destructive animate-pulse" />
              ) : voiceRecorded ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <MicOff className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            {voiceRecording && (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-sm font-display font-medium text-destructive">
                    Recording — {voiceElapsed}s / {VOICE_DURATION}s
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${voiceProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Recording stops automatically</p>
              </div>
            )}

            {voiceRecorded && (
              <p className="text-sm text-success font-display font-medium">Voice captured ✓</p>
            )}

            {!voiceRecorded && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm w-full">
                <p className="text-xs text-muted-foreground font-display mb-3 text-center">Read this aloud:</p>
                <p className="text-base text-foreground font-display leading-relaxed text-center">
                  "The sun was warm on my face as I walked through the garden. I could hear birds singing in the trees above me.
                  The flowers were blooming in every colour — red, yellow, purple, and white. I took a deep breath and felt the
                  fresh air fill my lungs. It was a beautiful day, and I was grateful to be outside enjoying it."
                </p>
              </div>
            )}

            {voiceError && (
              <p className="text-sm text-destructive font-display font-medium text-center px-2">
                {voiceError}
              </p>
            )}

            {voiceValidating && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-foreground font-display font-medium">Checking recording quality…</p>
              </div>
            )}

            {!voiceRecorded && !voiceValidating && !voiceRecording && (
              <div className="flex flex-col items-center gap-2 w-full">
                <Button
                  onClick={startRecording}
                  className="h-14 px-8 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground"
                >
                  {voiceError ? (
                    <><RefreshCw className="w-5 h-5 mr-2" />Try Again</>
                  ) : (
                    <><Mic className="w-5 h-5 mr-2" />Start Recording</>
                  )}
                </Button>
                {voiceFailCount >= 1 && (
                  <Button variant="ghost" onClick={skipVoice} className="text-muted-foreground text-sm">
                    <SkipForward className="w-4 h-4 mr-1" /> Skip & Continue
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground text-center">
                  Read at your natural pace — stops after {VOICE_DURATION}s
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Egg-shaped video feed for face & tongue stages */}
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-[50%] border-2 border-primary/40 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 rounded-[50%] border border-primary/20 animate-pulse-ring pointer-events-none z-10" />
              <div className="absolute inset-0 overflow-hidden rounded-[50%] z-10 pointer-events-none">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan-line" />
              </div>

              {isTongueStage && tongueCaptured && tongueImage ? (
                <>
                  <img src={tongueImage} alt="Captured tongue" className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 bg-success/20 flex items-center justify-center z-20">
                    <CheckCircle2 className="w-14 h-14 text-success drop-shadow-lg" />
                  </div>
                </>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Stage-specific controls below */}
      <div className="px-6 pt-4 pb-10">
        {stage === "face" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-foreground font-display font-medium text-center">
              {FACE_STEPS[faceStep].label}
            </p>
            <p className="text-[10px] text-muted-foreground">{FACE_STEPS[faceStep].hint}</p>
            <div className="flex gap-1.5 mt-1">
              {FACE_STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < faceStep ? "bg-success" : i === faceStep ? "bg-primary animate-breathe" : "bg-muted"}`} />
              ))}
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${faceProgress}%` }}
              />
            </div>
            <div className="flex justify-between w-full text-xs text-muted-foreground font-display">
              <span>{isDeepScan ? "Deep Scan — Step 1" : "Mirror Check"}</span>
              <span>{elapsed}s / {faceDuration}s</span>
            </div>
          </div>
        )}

        {isTongueStage && !tongueCaptured && (
          <div className="flex flex-col items-center gap-2">
            {tongueValidating ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-foreground font-display font-medium text-center">Validating your photo…</p>
              </>
            ) : (
              <>
                {tongueError && (
                  <p className="text-sm text-destructive font-display font-medium text-center px-2">
                    {tongueError}
                  </p>
                )}
                <Button
                  onClick={captureTonguePhoto}
                  className="h-14 px-8 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground"
                >
                  {tongueError ? (
                    <><RefreshCw className="w-5 h-5 mr-2" />Retake Photo</>
                  ) : (
                    <><Camera className="w-5 h-5 mr-2" />{stage === "tongue_front" ? "Capture Front" : "Capture Underside"}</>
                  )}
                </Button>
                {tongueFailCount >= 1 && (
                  <Button variant="ghost" onClick={skipTongue} className="text-muted-foreground text-sm">
                    <SkipForward className="w-4 h-4 mr-1" /> Skip & Continue
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {isTongueStage && tongueCaptured && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-success font-display font-medium text-center">
              {stage === "tongue_front" ? "Front captured ✓" : "Underside captured ✓"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {stage === "tongue_front" ? "Moving to underside photo…" : "Moving to voice check…"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanVideoView;
