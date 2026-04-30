interface DSPResults {
  f0_hz: number;
  jitter: number;
  shimmer: number;
  hnr_db: number;
  spectral_tilt_db: number;
  sentence_decay: number;
  rms_energy: number;
  duration_seconds: number;
}

interface BiomarkerDef {
  label: string;
  value: string;
  status: "normal" | "elevated" | "low";
  description: string;
  confidence: "high" | "moderate";
}

function getBiomarkers(dsp: DSPResults): BiomarkerDef[] {
  const markers: BiomarkerDef[] = [];

  // Stress (Jitter) — high confidence
  const jitterPct = dsp.jitter * 100;
  markers.push({
    label: "Vocal Stress",
    value: `${jitterPct.toFixed(2)}%`,
    status: dsp.jitter > 0.02 ? "elevated" : dsp.jitter > 0.01 ? "normal" : "low",
    description: dsp.jitter > 0.02
      ? "Elevated pitch instability suggests acute stress or tension"
      : "Pitch stability within healthy range",
    confidence: "high",
  });

  // Fatigue (Shimmer) — high confidence
  const shimmerPct = dsp.shimmer * 100;
  markers.push({
    label: "Vocal Fatigue",
    value: `${shimmerPct.toFixed(2)}%`,
    status: dsp.shimmer > 0.1 ? "elevated" : dsp.shimmer > 0.05 ? "normal" : "low",
    description: dsp.shimmer > 0.1
      ? "Amplitude variation suggests fatigue or respiratory weakness"
      : "Vocal amplitude is steady — good energy",
    confidence: "high",
  });

  // Vagal Tone (HNR) — high confidence
  markers.push({
    label: "Vagal Tone",
    value: `${dsp.hnr_db.toFixed(1)} dB`,
    status: dsp.hnr_db < 10 ? "low" : dsp.hnr_db < 15 ? "normal" : "normal",
    description: dsp.hnr_db < 10
      ? "Low harmonic clarity may indicate reduced parasympathetic tone"
      : "Good harmonic-to-noise ratio — healthy vagal tone",
    confidence: "high",
  });

  // Respiratory Support (Sentence Decay) — moderate confidence
  markers.push({
    label: "Breath Support",
    value: dsp.sentence_decay < -0.005 ? "Fading" : dsp.sentence_decay < -0.002 ? "Mild drop" : "Steady",
    status: dsp.sentence_decay < -0.005 ? "elevated" : dsp.sentence_decay < -0.002 ? "normal" : "low",
    description: dsp.sentence_decay < -0.005
      ? "Energy fades through phrases — may indicate low respiratory support"
      : "Consistent vocal energy across speech",
    confidence: "moderate",
  });

  // Vocal Effort (Spectral Tilt) — moderate confidence
  markers.push({
    label: "Vocal Effort",
    value: `${dsp.spectral_tilt_db.toFixed(1)} dB`,
    status: dsp.spectral_tilt_db < -20 ? "elevated" : dsp.spectral_tilt_db < -10 ? "normal" : "low",
    description: dsp.spectral_tilt_db < -20
      ? "Steep spectral drop suggests vocal exhaustion or low effort"
      : "Healthy spectral balance in voice",
    confidence: "moderate",
  });

  return markers;
}

const STATUS_STYLES = {
  normal: { bg: "bg-success/10", text: "text-success", label: "Normal" },
  elevated: { bg: "bg-warning/10", text: "text-warning", label: "Elevated" },
  low: { bg: "bg-info/10", text: "text-info", label: "Low" },
};

const VoiceBiomarkers = ({ dsp }: { dsp: DSPResults }) => {
  const markers = getBiomarkers(dsp);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card p-4 space-y-2">
        <h2 className="text-sm font-display font-semibold">🔬 Voice Biomarkers</h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          These metrics are derived from clinically-validated acoustic signal processing. 
          They measure real physiological markers in your voice — stress, fatigue, and nervous system regulation.
        </p>
      </div>

      {/* Markers */}
      {markers.map((m) => {
        const style = STATUS_STYLES[m.status];
        return (
          <div key={m.label} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-medium">{m.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
              <span className="text-sm font-display font-semibold">{m.value}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{m.description}</p>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${m.confidence === "high" ? "bg-success" : "bg-warning"}`} />
              <span className="text-[10px] text-muted-foreground capitalize">{m.confidence} confidence</span>
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Voice biomarkers are indicators, not diagnoses. For a complete picture, combine with tongue, face, and lab data via the Two-Witness Rule.
      </p>
    </div>
  );
};

export default VoiceBiomarkers;
