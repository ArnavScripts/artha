import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { OmniAIButton } from './OmniAIButton';
import { ChatPanel } from './ChatPanel';
import { ViewDensityToggle } from './ViewDensityToggle';
import { ThemeToggle } from './ThemeToggle';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { mode, isChatPanelOpen } = useWorkspace();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionRef = useRef<number>();

  // Instant transition on route change - no animation queue
  useEffect(() => {
    // Clear any pending transition
    if (transitionRef.current) {
      cancelAnimationFrame(transitionRef.current);
    }

    // Scroll to top
    mainRef.current?.scrollTo(0, 0);

    // Trigger fade transition
    setIsTransitioning(true);
    transitionRef.current = requestAnimationFrame(() => {
      setIsTransitioning(false);
    });

    return () => {
      if (transitionRef.current) {
        cancelAnimationFrame(transitionRef.current);
      }
    };
  }, [location.pathname]);

  return (
    <div className="h-svh overflow-hidden">
      {/* Fixed Optical Prism Sidebar */}
      <AppSidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="h-full md:ml-64 flex flex-col relative">
        {/* Optical Glass Header */}
        <header className="absolute top-0 left-0 right-0 h-14 flex items-center gap-4 px-6 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 z-40 theme-transition">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ViewDensityToggle />
            <div className="hidden sm:block w-px h-6 bg-border" />
            <ThemeToggle />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm theme-transition">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${mode === 'carbon' ? 'bg-carbon-slate' : 'bg-green-primary'}`} />
              <span className="font-medium capitalize">{mode} Mode</span>
            </div>
          </div>
        </header>

        {/* Scrollable content - CSS transition for instant, non-queued transitions */}
        <main
          ref={mainRef}
          className="flex-1 min-h-0 overflow-y-auto bg-background custom-scrollbar"
        >
          <div
            className={`p-6 pt-20 workspace-transition theme-transition transition-opacity duration-100 ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* FAB - z-[9999] to float above everything, centered on mobile */}
      {!isChatPanelOpen && <OmniAIButton />}

      {/* Global Chat Panel */}
      <ChatPanel />
    </div>
  );
}
