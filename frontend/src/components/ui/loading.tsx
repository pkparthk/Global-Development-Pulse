import { cn } from "@/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Loading Skeleton component
 */
interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({
  className,
  lines = 1,
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            "loading-skeleton h-4 w-full",
            i === lines - 1 && lines > 1 && "w-3/4", // Last line shorter
            className
          )}
        />
      ))}
    </div>
  );
}

/**
 * Chart Loading Skeleton
 */
export function ChartLoadingSkeleton() {
  return (
    <div className="chart-container flex flex-col space-y-4">
      <LoadingSkeleton className="h-6 w-1/3" />
      <div className="flex-1 loading-skeleton rounded-lg" />
      <div className="flex justify-between">
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
