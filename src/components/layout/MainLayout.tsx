import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { OmniAIButton } from './OmniAIButton';
import { ChatPanel } from './ChatPanel';
import { ViewDensityToggle } from './ViewDensityToggle';
import { ThemeToggle } from './ThemeToggle';
import { CommandPalette } from './CommandPalette';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AnimatePresence, motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { mode, isChatPanelOpen } = useWorkspace();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="h-svh overflow-hidden">
      {/* 1. Command Palette (OS Level) */}
      <CommandPalette />

      {/* Fixed Optical Prism Sidebar */}
      <AppSidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="h-full md:ml-64 flex flex-col relative">
        {/* Optical Glass Header */}
        <header className="absolute top-0 left-0 right-0 h-14 flex items-center gap-4 px-6 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 z-40 theme-transition">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground mr-2 font-mono hidden md:inline-block">
              ⌘K
            </span>
            <ViewDensityToggle />
            <div className="hidden sm:block w-px h-6 bg-border" />
            <ThemeToggle />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm theme-transition">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${mode === 'carbon' ? 'bg-carbon-slate' : 'bg-green-primary'}`} />
              <span className="font-medium capitalize">{mode} Mode</span>
            </div>
          </div>
        </header>

        {/* Scrollable content with AnimatePresence */}
        <main
          ref={mainRef}
          className="flex-1 min-h-0 overflow-y-auto bg-background custom-scrollbar"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="p-6 pt-20"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* FAB - z-[9999] to float above everything, centered on mobile */}
      {!isChatPanelOpen && <OmniAIButton />}

      {/* Global Chat Panel */}
      <ChatPanel />
    </div>
  );
}
