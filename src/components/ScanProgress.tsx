import { cn } from "@/lib/utils";

const STEPS = ["Prepare", "Capture", "Voice", "Results"];

interface ScanProgressProps {
  currentStep: 0 | 1 | 2 | 3;
  totalSteps?: 3 | 4;
}

const ScanProgress = ({ currentStep, totalSteps = 4 }: ScanProgressProps) => {
  const labels = totalSteps === 3 ? ["Prepare", "Scan", "Results"] : STEPS;
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i < currentStep
                  ? "bg-primary"
                  : i === currentStep
                  ? "bg-primary w-5 rounded-full"
                  : "bg-muted"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-display font-medium transition-colors",
                i <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div
              className={cn(
                "w-6 h-px transition-colors",
                i < currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ScanProgress;
