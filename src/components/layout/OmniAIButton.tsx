import { Sparkles } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const contextualActions: Record<string, { label: string; action: string }> = {
  '/': { label: 'Predict Prices', action: 'Analyzing market trends...' },
  '/emissions': { label: 'Detect Anomalies', action: 'Running AI simulation...' },
  '/market': { label: 'Smart Trade', action: 'Finding best opportunities...' },
  '/regulatory': { label: 'Audit Prep', action: 'Compliance check...' },
  '/intelligence': { label: 'Deep Analysis', action: 'AI-powered insights...' },
  '/compliance': { label: 'Audit Check', action: 'Scanning compliance...' },
  '/green': { label: 'Impact Report', action: 'Generating PR content...' },
  '/green/marketplace': { label: 'Find Projects', action: 'Best ROI opportunities...' },
  '/green/portfolio': { label: 'Optimize Portfolio', action: 'Rebalancing assets...' },
  '/green/verification': { label: 'Verify Credits', action: 'Audit trail check...' },
  '/settings': { label: 'Artha SAGE', action: 'How can I help?' },
};

export function OmniAIButton() {
  const location = useLocation();
  const { setChatPanelOpen } = useWorkspace();
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const { scrollY } = useScroll();

  // Handle scroll direction for collapse/expand
  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY.current ? 'down' : 'up';
    const delta = Math.abs(latest - lastScrollY.current);
    
    // Only react to significant scroll (>10px)
    if (delta > 10) {
      if (direction === 'down' && latest > 100) {
        setIsCollapsed(true);
      }
      
      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Expand after scroll stops
      scrollTimeout.current = setTimeout(() => {
        setIsCollapsed(false);
      }, 800);
    }
    
    lastScrollY.current = latest;
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Subtle pulse every 5 seconds
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseScale(1.05);
      setTimeout(() => setPulseScale(1), 200);
    }, 5000);

    return () => clearInterval(pulseInterval);
  }, []);

  const context = contextualActions[location.pathname] || { label: 'Artha SAGE', action: 'How can I help?' };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={() => setChatPanelOpen(true)}
          className="fixed bottom-8 right-8 md:right-8 md:bottom-8 z-[9999] flex items-center gap-3 h-14 rounded-full cursor-pointer ring-1 ring-white/30 max-md:left-1/2 max-md:-translate-x-1/2 max-md:right-auto overflow-hidden"
          style={{
            background: isHovered 
              ? 'linear-gradient(135deg, #A855F7 0%, #9333EA 35%, #8B5CF6 65%, #7C3AED 100%)'
              : 'linear-gradient(135deg, #8B5CF6 0%, #9333EA 35%, #7C3AED 65%, #6366F1 100%)',
          }}
          animate={{
            width: isCollapsed ? 56 : 'auto',
            paddingLeft: isCollapsed ? 16 : 24,
            paddingRight: isCollapsed ? 16 : 24,
            scale: isHovered ? 1.05 : pulseScale,
            boxShadow: isHovered 
              ? '0 0 50px rgba(147, 51, 234, 0.7), 0 15px 40px rgba(124, 58, 237, 0.5)'
              : '0 0 25px rgba(147, 51, 234, 0.5), 0 10px 30px rgba(124, 58, 237, 0.35)',
          }}
          transition={{
            width: { type: 'spring', stiffness: 400, damping: 30 },
            paddingLeft: { type: 'spring', stiffness: 400, damping: 30 },
            paddingRight: { type: 'spring', stiffness: 400, damping: 30 },
            scale: { duration: 0.2, ease: 'easeOut' },
            boxShadow: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Icon - Always visible */}
          <motion.div
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex-shrink-0"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>

          {/* Text - Fades out when collapsed */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-left whitespace-nowrap overflow-hidden"
              >
                <span className="font-heading font-semibold text-sm text-white tracking-wide">
                  Artha SAGE
                </span>
                <p className="text-[10px] text-white/70 hidden sm:block">{context.label}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-card border-border">
        <p>{context.action}</p>
      </TooltipContent>
    </Tooltip>
  );
}
