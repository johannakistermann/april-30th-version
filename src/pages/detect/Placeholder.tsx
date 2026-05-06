import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

interface PlaceholderProps {
  title: string;
  description: string;
}

const Placeholder = ({ title, description }: PlaceholderProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-[0.95] transition-transform"
          aria-label="Back to Detect"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-display font-bold">{title}</h1>
      </div>
      <div className="px-6">
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          <p className="text-[11px] text-muted-foreground mt-3 italic">Coming soon — placeholder screen.</p>
        </div>
      </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Placeholder;
