import { cn } from "@/lib/utils";

const STEPS = ["Prepare", "Scan", "Results"];

interface ScanProgressProps {
  currentStep: 0 | 1 | 2;
}

const ScanProgress = ({ currentStep }: ScanProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {STEPS.map((label, i) => (
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
          {i < STEPS.length - 1 && (
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
