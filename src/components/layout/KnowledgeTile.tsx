import { Lightbulb, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const carbonFacts = [
  "India's CCTS market launches in 2026. Are your Escrow accounts ready?",
  "PAT Scheme Cycle VII targets 8.6% energy savings across designated consumers.",
  "SEBI mandates BRSR Core for top 1000 listed companies from FY 2023-24.",
  "Average carbon credit price in India: ₹450-650 per tCO2e.",
  "Bureau of Energy Efficiency certifies ESCerts under PAT scheme.",
];

const greenFacts = [
  "Mangrove forests sequester 3-5x more carbon than terrestrial forests.",
  "India targets 500 GW renewable energy capacity by 2030.",
  "Green bonds issued in India crossed $20 billion in 2024.",
  "Verified Carbon Standard (VCS) is the most used voluntary standard globally.",
  "Solar capacity addition in India: 15 GW annually.",
];

export function KnowledgeTile() {
  const { mode } = useWorkspace();
  const [isVisible, setIsVisible] = useState(true);
  const [factIndex, setFactIndex] = useState(0);

  const facts = mode === 'carbon' ? carbonFacts : greenFacts;

  useEffect(() => {
    // Rotate facts daily (simulated with 30s for demo)
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [facts.length]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="mx-3 mb-3 p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
      >
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium mb-1 text-slate-800 dark:text-white">Did You Know?</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {facts[factIndex]}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}