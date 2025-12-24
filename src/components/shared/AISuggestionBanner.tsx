import React from 'react';
import { Sparkles, ArrowRight, Loader2, AlertTriangle, Info, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AISuggestionBannerProps {
  type: 'info' | 'warning' | 'success' | 'suggestion';
  message: string;
  action: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export function AISuggestionBanner({ type, message, action, onAction, isLoading }: AISuggestionBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const bannerStyles = {
    warning: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20',
    info: 'bg-sky-50 dark:bg-carbon-tech/10 border border-sky-200 dark:border-carbon-tech/20',
    suggestion: 'bg-emerald-50 dark:bg-green-primary/10 border border-emerald-200 dark:border-green-primary/20',
    success: 'bg-emerald-50 dark:bg-green-primary/10 border border-emerald-200 dark:border-green-primary/20',
  };

  const iconContainerStyles = {
    warning: 'bg-amber-100 dark:bg-amber-500/20',
    info: 'bg-sky-100 dark:bg-carbon-tech/20',
    suggestion: 'bg-emerald-100 dark:bg-green-primary/20',
    success: 'bg-emerald-100 dark:bg-green-primary/20',
  };

  const iconStyles = {
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-sky-600 dark:text-carbon-tech',
    suggestion: 'text-emerald-600 dark:text-green-primary',
    success: 'text-emerald-600 dark:text-green-primary',
  };

  const textStyles = {
    warning: 'text-amber-900 dark:text-amber-200',
    info: 'text-sky-900 dark:text-sky-200',
    suggestion: 'text-emerald-900 dark:text-emerald-200',
    success: 'text-emerald-900 dark:text-emerald-200',
  };

  const buttonStyles = {
    warning: 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold',
    info: 'bg-sky-500 hover:bg-sky-600 text-white',
    suggestion: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };

  const IconComponent = type === 'warning' ? AlertTriangle : type === 'info' ? Info : TrendingUp;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(`flex items-center gap-3 px-4 py-3 rounded-xl mb-6`, bannerStyles[type])}
      >
        <div className={cn(`p-2 rounded-lg`, iconContainerStyles[type])}>
          <IconComponent className={cn(`w-4 h-4`, iconStyles[type])} />
        </div>
        <div className="flex-1">
          <p className={cn(`text-sm font-medium`, textStyles[type])}>
            {message}
          </p>
        </div>
        <button
          onClick={onAction}
          disabled={isLoading || !onAction}
          className={cn(
            `text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2`,
            buttonStyles[type],
            isLoading && "opacity-70 cursor-not-allowed",
            !onAction && "cursor-default"
          )}
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {action}
          {!isLoading && onAction && <ArrowRight className="w-3 h-3" />}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
