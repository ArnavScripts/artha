import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statusBadgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium transition-colors',
  {
    variants: {
      variant: {
        risk: 'bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20',
        warning: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20',
        success: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20',
        info: 'bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400 border border-slate-500/20',
        low: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'info',
      size: 'default',
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
