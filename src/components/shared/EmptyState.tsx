import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, Search, FileX, AlertCircle, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'no-data';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; title: string; description: string }> = {
  default: {
    icon: Inbox,
    title: 'No data available',
    description: 'There\'s nothing to display here yet.',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We couldn\'t load this data. Please try again.',
  },
  'no-data': {
    icon: FileX,
    title: 'No data to display',
    description: 'This section will populate once data is available.',
  },
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    className, 
    variant = 'default', 
    icon: CustomIcon, 
    title, 
    description, 
    action,
    ...props 
  }, ref) => {
    const config = variantConfig[variant];
    const Icon = CustomIcon || config.icon;
    const displayTitle = title || config.title;
    const displayDescription = description || config.description;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-6 text-center',
          'rounded-xl border border-dashed border-border bg-muted/20',
          className
        )}
        {...props}
      >
        {/* Icon with gradient background */}
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-br from-carbon-tech to-primary rounded-full" />
          <div className="relative w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          {displayDescription}
        </p>

        {/* Action */}
        {action && (
          <Button
            variant="outline"
            className="mt-6"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
