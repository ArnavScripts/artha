import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'accent';
  hover?: boolean;
  glow?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = true, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'carbon-card',
          hover && 'hover:translate-y-[-2px] hover:shadow-md hover:border-white/20 dark:hover:border-white/15',
          glow && 'shadow-glow',
          variant === 'gradient' && 'bg-gradient-to-br from-card to-muted/30',
          variant === 'accent' && 'border-l-4 border-l-carbon-tech',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
