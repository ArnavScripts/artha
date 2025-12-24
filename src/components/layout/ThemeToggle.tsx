import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-full bg-muted/60 border border-border">
        <div className="w-8 h-8 rounded-full bg-card animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="relative flex items-center gap-1 p-1.5 rounded-full bg-muted/60 border border-border hover:bg-muted transition-all duration-300 group"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to terminal mode'}
        >
          {/* Track Background */}
          <div className="relative w-14 h-7 rounded-full overflow-hidden">
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: isDark 
                  ? 'linear-gradient(135deg, hsl(222 50% 12%) 0%, hsl(270 40% 18%) 100%)'
                  : 'linear-gradient(135deg, hsl(45 100% 90%) 0%, hsl(200 80% 88%) 100%)',
              }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Stars (visible in dark mode) */}
            <AnimatePresence>
              {isDark && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-1.5 left-2 w-0.5 h-0.5 bg-white/60 rounded-full" />
                  <div className="absolute top-3 left-4 w-1 h-1 bg-white/40 rounded-full" />
                  <div className="absolute bottom-2 left-1.5 w-0.5 h-0.5 bg-white/50 rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sliding Indicator */}
            <motion.div
              className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
              animate={{
                x: isDark ? 28 : 2,
                backgroundColor: isDark ? 'hsl(270 60% 55%)' : 'hsl(45 100% 60%)',
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-white" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Label */}
          <motion.span
            className="text-xs font-medium pr-2 hidden sm:block"
            animate={{
              color: isDark ? 'hsl(270 60% 70%)' : 'hsl(222 47% 30%)',
            }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? 'Terminal' : 'Corporate'}
          </motion.span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">
          {isDark ? 'Switch to Corporate Light' : 'Switch to Terminal Mode'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
