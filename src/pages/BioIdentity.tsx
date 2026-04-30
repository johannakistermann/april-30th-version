import { ArrowLeft, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const BioIdentity = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Bio-Identity</h1>
      </div>

      <div className="px-6">
        {/* Bio-Identity Card (9:16 aspect preview) */}
        <div className="glass-card overflow-hidden border-primary/20 glow-primary">
          <div className="bg-gradient-to-b from-element-wood/10 to-card p-8 flex flex-col items-center gap-6">
            {/* Element emoji & type */}
            <div className="text-6xl">🌿</div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-display">Your Element</p>
              <h2 className="text-3xl font-display font-bold text-element-wood">Wood</h2>
            </div>

            {/* Attributes */}
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Superpower</p>
                <p className="text-sm font-display font-semibold text-success">Vision & Drive</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Kryptonite</p>
                <p className="text-sm font-display font-semibold text-destructive">Frustration</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Stress Response</p>
                <p className="text-sm font-display font-semibold">Fight</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Thermal</p>
                <p className="text-sm font-display font-semibold">Hot / Dry</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Wood types are natural visionaries with strong drive and determination. 
              You excel at planning and strategy, but watch for frustration when things don't move fast enough.
            </p>

            {/* Branding */}
            <div className="flex items-center gap-2 mt-2 opacity-50">
              <span className="text-[10px] font-display tracking-wider">GEM</span>
              <span className="text-[10px]">by Energy 4 Life</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-display">
            <Share2 className="w-4 h-4 mr-2" />
            Share Card
          </Button>
          <Button variant="outline" className="flex-1 h-12 rounded-2xl font-display" onClick={() => navigate("/couples")}>
            💕 Compatibility
          </Button>
        </div>

        {/* Unlock info */}
        <div className="glass-card p-4 mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Unlocked after 3+ scans over 14+ days. Your constitution stabilizes with more data.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default BioIdentity;
