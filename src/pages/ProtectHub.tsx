import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Gem, Zap, Sun, Play, Square, Clock, ChevronDown, Check, ScanLine, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import FractalAnimation from "@/components/FractalAnimation";
import GemSyncCountdown from "@/components/gem/GemSyncCountdown";

type Device = "phone" | "gem" | "mihealth" | "lightbed";

const PROTOCOLS = [
  { id: "tcm", label: "24hr TCM Clock", recommended: true },
  { id: "circadian", label: "Circadian Rhythm", recommended: true },
  { id: "personalized", label: "Personalized", recommended: false },
  { id: "bws", label: "BWS Scan Recommendations", recommended: false },
];

const BWS_SCAN_ITEMS = [
  { code: "ED4", name: "Nerve", scores: [15, 15, 15], intensity: 100 },
  { code: "ED6", name: "Heart", scores: [15, 15, 15], intensity: 100 },
  { code: "ET5", name: "BSV", scores: [15, 15, 15], intensity: 100 },
  { code: "ET12", name: "Liver 3", scores: [15, 15, 15], intensity: 100 },
  { code: "ES13", name: "COH", scores: [15, 15, 15], intensity: 100 },
];

const BIOSIGNATURE_OPTIONS = [
  "Liver / Gallbladder",
  "Kidney / Bladder",
  "Spleen / Stomach",
  "Heart / Vascular",
  "Lung / Colon",
  "Brain / Nervous System",
  "Inflamease",
  "Sleep",
  "Chill",
  "Energy",
  "Cell",
  "Focus",
  "Creativity",
];

const MEDITATION_TRACKS = {
  5: [
    { title: "Quick Reset", duration: "5 min" },
    { title: "Breath of Calm", duration: "5 min" },
    { title: "Energy Spark", duration: "5 min" },
    { title: "Morning Clarity", duration: "5 min" },
  ],
  10: [
    { title: "Heart Coherence", duration: "10 min" },
    { title: "Five Element Flow", duration: "10 min" },
    { title: "Deep Grounding", duration: "10 min" },
    { title: "Cellular Harmony", duration: "10 min" },
  ],
  20: [
    { title: "Full Body Restoration", duration: "20 min" },
    { title: "Sleep Preparation Journey", duration: "20 min" },
    { title: "Chakra Alignment Deep", duration: "20 min" },
    { title: "Emotional Release", duration: "20 min" },
  ],
};

const DEVICES: { key: Device; icon: typeof Smartphone; label: string }[] = [
  { key: "phone", icon: Smartphone, label: "Phone" },
  { key: "gem", icon: Gem, label: "GEM" },
  { key: "mihealth", icon: Zap, label: "miHealth" },
  { key: "lightbed", icon: Sun, label: "Light Bed" },
];

const ProtectHub = () => {
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device>("phone");
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>(
    PROTOCOLS.filter(p => p.recommended).map(p => p.id)
  );
  const [selectedBiosignatures, setSelectedBiosignatures] = useState<string[]>(BIOSIGNATURE_OPTIONS);
  const [editingBiosignatures, setEditingBiosignatures] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState("Liver / Gallbladder");
  const [selectedMeditationCategory, setSelectedMeditationCategory] = useState<5 | 10 | 20>(10);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [gemSyncing, setGemSyncing] = useState(false);
  const [cycleSyncing, setCycleSyncing] = useState(false);
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [showBwsPrompt, setShowBwsPrompt] = useState(false);
  const [showBwsDetails, setShowBwsDetails] = useState(false);
  const [selectedBwsItems, setSelectedBwsItems] = useState<string[]>(BWS_SCAN_ITEMS.map(i => i.code));

  // Mock: set to true to simulate a user with a practitioner + BWS scan
  const hasPractitioner = true; // TODO: check practitioner_clients table

  const isMiHealthOrLightbed = device === "mihealth" || device === "lightbed";
  const isPhoneOrGem = device === "phone" || device === "gem";

  const handlePlay = () => {
    if (isMiHealthOrLightbed) {
      setCycleSyncing(true);
    } else if (device === "gem") {
      setGemSyncing(true);
    } else {
      setIsRunning(true);
    }
  };

  const handleGemSyncComplete = useCallback(() => {
    setGemSyncing(false);
    setIsRunning(true);
  }, []);

  const handleCycleSyncComplete = useCallback(() => {
    setCycleSyncing(false);
    setIsRunning(true);
  }, []);

  const handleStop = () => {
    setIsRunning(false);
    setCurrentCycleIndex(0);
  };

  const toggleProtocol = (id: string) => {
    if (id === "bws" && !hasPractitioner) {
      setShowBwsPrompt(prev => !prev);
      return;
    }
    setSelectedProtocols((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    if (id === "bws") {
      setShowBwsPrompt(false);
    }
  };

  const toggleBiosignature = (biosig: string) => {
    setSelectedBiosignatures((prev) =>
      prev.includes(biosig) ? prev.filter((b) => b !== biosig) : [...prev, biosig]
    );
  };

  const hasSelections = isPhoneOrGem
    ? selectedProtocols.length > 0
    : selectedBiosignatures.length > 0 && selectedTrack;

  return (
    <div className="min-h-screen bg-background pb-32">
      <TopMenu />
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Protect</h1>
          <p className="text-[10px] text-muted-foreground">Run full protocols on your devices</p>
        </div>
      </div>

      {/* Device Selector */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {DEVICES.map((d) => (
            <button
              key={d.key}
              onClick={() => { setDevice(d.key); setIsRunning(false); setGemSyncing(false); setCycleSyncing(false); }}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[10px] font-display font-medium transition-all ${
                device === d.key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <d.icon className="w-4 h-4" />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* GEM Syncing */}
      {gemSyncing && (
        <div className="px-6 mb-6">
          <div className="glass-card p-6 glow-primary">
            <GemSyncCountdown onComplete={handleGemSyncComplete} />
          </div>
        </div>
      )}

      {/* Cycle Syncing */}
      {cycleSyncing && (
        <div className="px-6 mb-6">
          <div className="glass-card p-6 glow-primary">
            <GemSyncCountdown onComplete={handleCycleSyncComplete} />
          </div>
        </div>
      )}

      {/* Running State */}
      {isRunning && (
        <div className="px-6 mb-6">
          <div className="glass-card p-6 glow-primary">
            <div className="text-center mb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Running on {DEVICES.find((d) => d.key === device)?.label}
              </p>
              {isPhoneOrGem && selectedProtocols.length > 0 && (
                <p className="text-sm font-display font-semibold mt-1">
                  {selectedProtocols.map(id => PROTOCOLS.find(p => p.id === id)?.label).join(" + ")}
                </p>
              )}
            </div>

            {isPhoneOrGem && <FractalAnimation isPlaying={true} />}

            {isMiHealthOrLightbed && (
              <div className="space-y-3 my-4">
                <p className="text-[10px] text-muted-foreground text-center">
                  Cycling through biosignatures · 2 min each
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {selectedBiosignatures.map((biosig, i) => (
                    <span
                      key={biosig}
                      className={`text-[10px] px-2 py-1 rounded-full font-display ${
                        i === currentCycleIndex
                          ? "bg-primary text-primary-foreground"
                          : i < currentCycleIndex
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {biosig}
                    </span>
                  ))}
                </div>
                {selectedTrack && (
                  <p className="text-[10px] text-muted-foreground text-center mt-2">🎵 {selectedTrack}</p>
                )}
              </div>
            )}

            {isPhoneOrGem && (
              <div className="mt-4 text-center">
                <p className="text-[10px] text-muted-foreground">🎵 Meditation music playing...</p>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={handleStop}
                className="px-6 py-2 rounded-full bg-destructive text-destructive-foreground text-xs font-display font-medium inline-flex items-center gap-1.5"
              >
                <Square className="w-3 h-3" />
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection UI */}
      {!isRunning && !gemSyncing && !cycleSyncing && (
        <>
          {/* Phone & GEM: Multi-select protocols */}
          {isPhoneOrGem && (
            <div className="px-6 space-y-3">
              <h2 className="text-sm font-display font-semibold">Select Protocols</h2>
              {PROTOCOLS.map((protocol) => {
                const isBws = protocol.id === "bws";
                const selected = selectedProtocols.includes(protocol.id);
                const disabled = isBws && !hasPractitioner;

                return (
                  <div key={protocol.id}>
                    <button
                      onClick={() => toggleProtocol(protocol.id)}
                      className={`glass-card p-4 w-full flex items-center gap-3 text-left transition-all ${
                        disabled ? "opacity-50 cursor-not-allowed" :
                        selected ? "border-primary/30 bg-primary/5" : "hover:border-primary/20"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selected && !disabled ? "bg-primary border-primary" : "border-muted-foreground/30"
                      }`}>
                        {selected && !disabled && <Check className="w-3 h-3 text-primary-foreground" />}
                        {disabled && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <span className="text-sm font-display font-medium flex-1">{protocol.label}</span>
                      {isBws && !hasPractitioner && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Requires BWS</span>
                      )}
                    </button>

                    {/* BWS: No practitioner prompt */}
                    {isBws && showBwsPrompt && !hasPractitioner && (
                      <div className="glass-card p-4 mt-2 border-primary/20">
                        <p className="text-xs text-muted-foreground mb-3">
                          Connect with a practitioner for a full bioenergetic wellness scan to unlock personalized BWS recommendations.
                        </p>
                        <button
                          onClick={() => navigate("/find-practitioner")}
                          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-display font-semibold"
                        >
                          Find a Practitioner
                        </button>
                      </div>
                    )}

                    {/* BWS: Has practitioner — show edit expander */}
                    {isBws && selected && hasPractitioner && (
                      <div className="mt-2">
                        <button
                          onClick={() => setShowBwsDetails(!showBwsDetails)}
                          className="flex items-center gap-2 text-xs text-primary font-display font-medium"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBwsDetails ? "rotate-180" : ""}`} />
                          Edit BWS Scan Recommendations
                        </button>
                        {showBwsDetails && (
                          <div className="glass-card p-4 mt-2 space-y-2">
                            {BWS_SCAN_ITEMS.map((item) => {
                              const checked = selectedBwsItems.includes(item.code);
                              return (
                                <label key={item.code} className="flex items-center gap-2 cursor-pointer">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(val) => {
                                      setSelectedBwsItems(prev =>
                                        val ? [...prev, item.code] : prev.filter(c => c !== item.code)
                                      );
                                    }}
                                  />
                                  <span className="text-[11px] font-display font-medium">{item.code} – {item.name}</span>
                                </label>
                              );
                            })}
                            <p className="text-[9px] text-muted-foreground italic pt-1">Based on your latest BWS scan from 28 Mar 2026, 10:32 AM</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Personalized: Edit biosignatures expander */}
                    {protocol.id === "personalized" && selected && (
                      <div className="mt-2">
                        <button
                          onClick={() => setEditingBiosignatures(!editingBiosignatures)}
                          className="flex items-center gap-2 text-xs text-primary font-display font-medium"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${editingBiosignatures ? "rotate-180" : ""}`} />
                          Edit Personalized Biosignatures
                        </button>
                        {editingBiosignatures && (
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="text-[10px] text-muted-foreground font-display mb-1 block">Time of Day Focus</label>
                              <select
                                value={timeOfDay}
                                onChange={(e) => setTimeOfDay(e.target.value)}
                                className="w-full glass-card px-3 py-2 text-xs font-display bg-card text-foreground rounded-xl border border-border/50"
                              >
                                {BIOSIGNATURE_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {BIOSIGNATURE_OPTIONS.map((biosig) => {
                                const isSelected = selectedBiosignatures.includes(biosig);
                                return (
                                  <button
                                    key={biosig}
                                    onClick={() => toggleBiosignature(biosig)}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl text-[10px] font-display font-medium transition-all ${
                                      isSelected
                                        ? "bg-primary/10 text-primary border border-primary/30"
                                        : "glass-card text-muted-foreground"
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                    </div>
                                    {biosig}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* miHealth & Light Bed */}
          {isMiHealthOrLightbed && (
            <div className="px-6 space-y-4">
              <h2 className="text-sm font-display font-semibold">
                {device === "mihealth" ? "miHealth" : "Light Bed"} Protocol
              </h2>
              <p className="text-xs text-muted-foreground">
                Runs each biosignature for 2 minutes in sequence.
              </p>

              {/* Meditation Music Selection */}
              <div>
                <label className="text-[10px] text-muted-foreground font-display mb-2 block">Meditation Music</label>
                <div className="flex gap-2 mb-3">
                  {([5, 10, 20] as const).map((dur) => (
                    <button
                      key={dur}
                      onClick={() => { setSelectedMeditationCategory(dur); setSelectedTrack(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-display font-medium transition-all ${
                        selectedMeditationCategory === dur
                          ? "bg-primary text-primary-foreground"
                          : "glass-card text-muted-foreground"
                      }`}
                    >
                      {dur} min
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {MEDITATION_TRACKS[selectedMeditationCategory].map((track) => (
                    <button
                      key={track.title}
                      onClick={() => setSelectedTrack(track.title)}
                      className={`glass-card p-3 w-full flex items-center gap-3 text-left transition-all ${
                        selectedTrack === track.title ? "border-primary/30 bg-primary/5" : ""
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedTrack === track.title ? "bg-primary border-primary" : "border-muted-foreground/30"
                      }`}>
                        {selectedTrack === track.title && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-display font-medium">{track.title}</p>
                        <p className="text-[9px] text-muted-foreground">{track.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit biosignatures */}
              <div>
                <button
                  onClick={() => setEditingBiosignatures(!editingBiosignatures)}
                  className="flex items-center gap-2 text-xs text-primary font-display font-medium"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${editingBiosignatures ? "rotate-180" : ""}`} />
                  Edit Cycle Biosignatures
                </button>
                {editingBiosignatures && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {BIOSIGNATURE_OPTIONS.map((biosig) => {
                      const selected = selectedBiosignatures.includes(biosig);
                      return (
                        <button
                          key={biosig}
                          onClick={() => toggleBiosignature(biosig)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-[10px] font-display font-medium transition-all ${
                            selected
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "glass-card text-muted-foreground"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}>
                            {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          {biosig}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Play Button */}
          <div className="fixed bottom-20 left-0 right-0 px-6 z-10">
            <button
              onClick={handlePlay}
              disabled={!hasSelections}
              className={`w-full py-3.5 rounded-2xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                hasSelections
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Play className="w-4 h-4" />
              Sync to GEM device
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default ProtectHub;
