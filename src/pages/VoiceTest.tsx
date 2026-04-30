import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import VoiceBiomarkers from "@/components/voice/VoiceBiomarkers";

interface VoiceAnalysisResult {
  dsp: {
    f0_hz: number;
    jitter: number;
    shimmer: number;
    hnr_db: number;
    spectral_tilt_db: number;
    sentence_decay: number;
    rms_energy: number;
    duration_seconds: number;
  };
  ai: any;
  organ_signals: any;
  pillar_contributions: any;
  scan_type: string;
  timestamp: string;
}

const VOICE_ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-analyze`;


const VoiceTest = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await analyzeAudio(blob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert webm to WAV using AudioContext
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const wavBase64 = audioBufferToWavBase64(audioBuffer);
      await audioContext.close();

      const resp = await fetch(VOICE_ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          audio_base64: wavBase64,
          transcription: null, // Could add speech-to-text later
          scan_type: "voice_test",
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${resp.status})`);
      }

      const data: VoiceAnalysisResult = await resp.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pt-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold">Voice Analysis Test</h1>
            <p className="text-xs text-muted-foreground">
              Record your voice to test DSP + AI analysis
            </p>
          </div>
        </div>

        {/* Recording Section */}
        <div className="glass-card p-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Speak naturally for 10–35 seconds. Try: "How are you feeling today?
            Share one intention for the day."
          </p>

          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-destructive/20 animate-pulse"
                  : "bg-primary/10"
              }`}
            >
              {isAnalyzing ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : isRecording ? (
                <Square className="w-8 h-8 text-destructive" />
              ) : (
                <Mic className="w-10 h-10 text-primary" />
              )}
            </div>
          </div>

          {isRecording && (
            <p className="text-lg font-display font-semibold text-destructive">
              {duration}s
            </p>
          )}

          {!isAnalyzing && (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full h-12 rounded-xl font-display font-semibold ${
                isRecording
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          )}

          {isAnalyzing && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Analyzing voice... DSP + AI processing
            </p>
          )}
        </div>

        {error && (
          <div className="glass-card p-4 border border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && <VoiceBiomarkers dsp={result.dsp} />}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// WAV Encoding — Convert AudioBuffer to base64 WAV
// ─────────────────────────────────────────────

function audioBufferToWavBase64(buffer: AudioBuffer): string {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = samples.length * blockAlign;
  const bufferSize = 44 + dataSize;

  const wav = new ArrayBuffer(bufferSize);
  const view = new DataView(wav);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Write samples as 16-bit PCM
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  // Convert to base64
  const bytes = new Uint8Array(wav);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export default VoiceTest;
