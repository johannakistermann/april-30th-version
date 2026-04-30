import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Lightbulb, Volume2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScanVideoView from "@/components/scan/ScanVideoView";
import ScanProgress from "@/components/ScanProgress";

const TIPS = [
  { icon: Lightbulb, text: "Find a well-lit room with even lighting" },
  { icon: Volume2, text: "Move somewhere quiet with minimal noise" },
  { icon: User, text: "Center your face in the frame" },
];

const MirrorCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Default to deep (full weekly) scan unless explicitly disabled
  const isDeepScan = location.state?.deepScan !== false;
  const [ready, setReady] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Request camera on mount for preview
  useEffect(() => {
    if (ready) return;
    let cancelled = false;

    setRequesting(true);
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
        audio: true,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setCameraStream(stream);
        setPermissionDenied(false);
      })
      .catch(() => {
        if (!cancelled) setPermissionDenied(true);
      })
      .finally(() => {
        if (!cancelled) setRequesting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  // Attach preview stream
  useEffect(() => {
    if (previewVideoRef.current && cameraStream && !ready) {
      previewVideoRef.current.srcObject = cameraStream;
      previewVideoRef.current.play().catch(() => {});
    }
  }, [cameraStream, ready]);

  // Start scan: pass existing stream to ScanVideoView
  const handleStart = () => {
    setReady(true);
  };

  // Tips screen
  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <ScanProgress currentStep={0} />
        <div className="max-w-sm w-full flex flex-col items-center text-center gap-6">
          {/* Camera preview */}
          {cameraStream ? (
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/30 bg-card">
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
              <Sun className="w-10 h-10 text-warning" />
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold">
              {isDeepScan ? "Weekly Scan" : "Quick Scan"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quick tips for the best results:
            </p>
          </div>

          {/* Tips list */}
          <div className="w-full space-y-2.5">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className="flex items-center gap-3 glass-card p-3 w-full text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <tip.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground">{tip.text}</p>
              </div>
            ))}
          </div>

          {permissionDenied && (
            <p className="text-xs text-destructive text-center">
              Camera & microphone access is required. Please allow access and refresh.
            </p>
          )}

          <div className="w-full space-y-2 mt-2">
            <p className="text-[10px] text-muted-foreground">
              {isDeepScan
                ? "Captures face, tongue and voice — about 2 minutes. Powers your Vitality Score and all four pillars."
                : "Quick 60-second face, tongue, and voice capture."}
            </p>
            <Button
              onClick={handleStart}
              disabled={!cameraStream || requesting}
              className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground glow-primary disabled:opacity-40"
            >
              Start Scan
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="w-full text-muted-foreground text-sm"
            >
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Go directly into ScanVideoView with the existing stream
  if (cameraStream) {
    return (
      <ScanVideoView
        stream={cameraStream}
        isDeepScan={isDeepScan}
        onComplete={() => {
          if (isDeepScan) {
            navigate("/deep-scan", { state: { fromMirrorCheck: true } });
          } else {
            navigate("/results-loading");
          }
        }}
      />
    );
  }

  // Fallback: stream lost
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground mb-4">
        Camera connection lost. Please restart the scan.
      </p>
      <Button onClick={() => setReady(false)} className="rounded-2xl">
        Restart
      </Button>
    </div>
  );
};

export default MirrorCheck;
