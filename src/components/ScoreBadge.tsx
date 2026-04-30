import { cn } from "@/lib/utils";

export function getScoreLabel(score: number): { label: string; colorClass: string } {
  if (score >= 80) return { label: "Excellent", colorClass: "text-success" };
  if (score >= 65) return { label: "Good", colorClass: "text-success" };
  if (score >= 50) return { label: "Needs Attention", colorClass: "text-warning" };
  return { label: "Low", colorClass: "text-destructive" };
}

interface ScoreBadgeProps {
  score: number;
  trend?: string;
  showLabel?: boolean;
  className?: string;
}

const ScoreBadge = ({ score, trend, showLabel = true, className }: ScoreBadgeProps) => {
  const { label, colorClass } = getScoreLabel(score);

  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <span className="text-sm font-display font-bold">{score}</span>
      {showLabel && (
        <span className={cn("text-[9px] font-display font-medium", colorClass)}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreBadge;
