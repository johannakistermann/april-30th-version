import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive page-content wrapper.
 * Mobile (<640px) keeps the original max-w-md design.
 * Wider viewports progressively widen so screens don't strand content
 * in a thin column on tablet/desktop.
 */
const PageContainer = ({ children, className }: PageContainerProps) => (
  <div
    className={cn(
      "w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto",
      className
    )}
  >
    {children}
  </div>
);

export default PageContainer;
