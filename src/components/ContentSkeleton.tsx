import { cn } from "@/lib/utils";
import { Film } from "lucide-react";

interface ContentSkeletonProps {
  variant?: "video" | "card" | "tile";
  className?: string;
}

const ContentSkeleton = ({ variant = "card", className }: ContentSkeletonProps) => {
  if (variant === "video") {
    return (
      <div className={cn("relative w-full h-40 rounded-t-2xl bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center", className)}>
        <Film className="w-8 h-8 text-muted-foreground/30" />
        <div className="absolute inset-0 animate-pulse bg-muted/10 rounded-t-2xl" />
      </div>
    );
  }

  if (variant === "tile") {
    return (
      <div className={cn("flex items-center gap-2 p-2 rounded-xl bg-muted/30", className)}>
        <div className="w-7 h-7 rounded-lg bg-muted/50 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-20 bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-12 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-4 space-y-3 animate-pulse", className)}>
      <div className="h-3 w-24 bg-muted/50 rounded" />
      <div className="h-4 w-32 bg-muted/50 rounded" />
      <div className="h-2.5 w-40 bg-muted/30 rounded" />
    </div>
  );
};

export default ContentSkeleton;
