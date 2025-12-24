import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  showHeader?: boolean;
  showChart?: boolean;
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, lines = 3, showHeader = true, showChart = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'carbon-card p-6 animate-pulse',
          className
        )}
        {...props}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted shimmer" />
              <div className="h-5 w-32 rounded bg-muted shimmer" />
            </div>
            <div className="h-4 w-20 rounded bg-muted shimmer" />
          </div>
        )}

        {/* Chart skeleton */}
        {showChart && (
          <div className="h-48 rounded-lg bg-muted shimmer mb-6 relative overflow-hidden">
            {/* Fake chart bars */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-2 h-32">
              {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-muted-foreground/10"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content lines */}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 rounded bg-muted shimmer',
                i === lines - 1 && 'w-2/3'
              )}
            />
          ))}
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

// Skeleton for stats/metric cards
const SkeletonMetricCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('carbon-card p-4 animate-pulse', className)}
        {...props}
      >
        <div className="w-10 h-10 rounded-xl bg-muted shimmer mb-3" />
        <div className="h-7 w-24 rounded bg-muted shimmer mb-2" />
        <div className="h-4 w-16 rounded bg-muted shimmer" />
      </div>
    );
  }
);

SkeletonMetricCard.displayName = 'SkeletonMetricCard';

export { SkeletonCard, SkeletonMetricCard };
