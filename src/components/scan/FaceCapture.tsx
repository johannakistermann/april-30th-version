import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FaceCaptureProps {
  onCaptureComplete: (imageData: string, stream?: MediaStream) => void;
}

type CaptureState = "loading" | "preview" | "reviewing" | "validating" | "validated" | "error";

interface ValidationResult {
  valid: boolean;
  hasFace: boolean;
  qualityOk: boolean;
  message: string;
}

const FaceCapture = ({ onCaptureComplete }: FaceCaptureProps) => {
  const [state, setState] = useState<CaptureState>("loading");
  const [error, setError] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Auto-request camera on mount
  useEffect(() => {
    requestCamera();
  }, []);

  // Attach stream to video element whenever state becomes "preview" and stream exists
  useEffect(() => {
    if (state === "preview" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [state]);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      // Set state first — video element will mount, then useEffect attaches stream
      setState("preview");
    } catch {
      setError("Camera access denied. Please allow camera access in your browser settings and try again.");
      setState("error");
    }
  };

  const validateFaceWithAI = async (imageData: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("validate-face", {
        body: { image: imageData },
      });

      if (error) throw error;

      return {
      hasFace: data.has_face ?? false,
        qualityOk: data.quality_ok ?? false,
        faceCloseEnough: data.face_close_enough ?? false,
        message: data.message ?? "Could not validate the photo. Please try again.",
      };
    } catch (err) {
      console.error("Face validation error:", err);
      return {
        hasFace: false,
        qualityOk: false,
        faceCloseEnough: false,
        message: "Validation failed. Please try again.",
      };
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(imageData);
    setState("validating");

    const result = await validateFaceWithAI(imageData);

    if (result.hasFace && result.qualityOk && result.faceCloseEnough) {
      setValidation({ valid: true, hasFace: true, qualityOk: true, message: result.message });
      setState("validated");
    } else {
      setValidation({ valid: false, hasFace: result.hasFace, qualityOk: result.qualityOk, message: result.message });
      setState("reviewing");
    }
  };

  const retake = async () => {
    setCapturedImage(null);
    setValidation(null);
    // Restart preview if stream still active
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
      setState("preview");
    } else {
      requestCamera();
    }
  };

  const confirmAndProceed = () => {
    if (capturedImage) {
      // Pass stream to parent instead of stopping it — parent can reuse for video scan
      const stream = streamRef.current;
      streamRef.current = null; // Prevent cleanup from stopping it
      onCaptureComplete(capturedImage, stream ?? undefined);
    }
  };

  // Loading screen while camera is being acquired
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center text-center gap-6 px-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Requesting camera access…</p>
      </div>
    );
  }

  // Error screen
  if (state === "error") {
    return (
      <div className="flex flex-col items-center text-center gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-display font-bold">Camera Access Denied</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
        </div>
        <Button
          onClick={requestCamera}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-sm">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video preview or captured image */}
      <div className="relative w-48 h-60 sm:w-56 sm:h-72 rounded-[50%] overflow-hidden border-2 border-primary/40 bg-card flex items-center justify-center">
        {state === "preview" && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 rounded-[50%] border-2 border-dashed border-primary/30 pointer-events-none" />
          </>
        )}
        {(state === "reviewing" || state === "validated" || state === "validating") && capturedImage && (
          <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover scale-x-[-1]" />
        )}

        {/* Overlay indicators */}
        {state === "validating" && (
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
            <Loader2 className="w-14 h-14 text-primary animate-spin" />
          </div>
        )}
        {state === "validated" && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-success drop-shadow-lg" />
          </div>
        )}
        {state === "reviewing" && validation && !validation.valid && (
          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-14 h-14 text-destructive drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Status message */}
      {state === "preview" && (
        <p className="text-sm text-muted-foreground text-center">
          Position your face in the circle and tap capture
        </p>
      )}
      {state === "validating" && (
        <p className="text-sm text-muted-foreground text-center animate-pulse">
          Analysing your photo...
        </p>
      )}
      {validation && (state === "reviewing" || state === "validated") && (
        <p className={`text-sm text-center ${validation.valid ? "text-success" : "text-destructive"}`}>
          {validation.message}
        </p>
      )}

      {/* Action buttons */}
      <div className="w-full space-y-2 mt-1">
        {state === "preview" && (
          <Button
            onClick={capturePhoto}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground"
          >
            <Camera className="w-5 h-5 mr-2" />
            Capture Photo
          </Button>
        )}

        {state === "reviewing" && validation && !validation.valid && (
          <Button
            onClick={retake}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retake Photo
          </Button>
        )}

        {state === "validated" && (
          <Button
            onClick={confirmAndProceed}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-success text-success-foreground glow-primary"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Photo Uploaded — Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
