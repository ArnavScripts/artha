import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type WorkspaceMode = 'carbon' | 'green';
export type ViewDensity = 'owner' | 'officer';

interface WorkspaceContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  toggleMode: () => void;
  viewDensity: ViewDensity;
  setViewDensity: (density: ViewDensity) => void;
  isSimpleView: boolean;
  isChatPanelOpen: boolean;
  setChatPanelOpen: (open: boolean) => void;
  initialChatMessage: string | null;
  setInitialChatMessage: (message: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>('carbon');
  const [viewDensity, setViewDensity] = useState<ViewDensity>('owner');
  const [isChatPanelOpen, setChatPanelOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);

  const setMode = useCallback((newMode: WorkspaceMode) => {
    try {
      setModeState(newMode);
    } catch (error) {
      console.error('Error switching mode:', error);
      setModeState('carbon'); // Fallback to carbon mode
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'carbon' ? 'green' : 'carbon');
  }, [mode, setMode]);

  const isSimpleView = viewDensity === 'owner';

  return (
    <WorkspaceContext.Provider value={{
      mode,
      setMode,
      toggleMode,
      viewDensity,
      setViewDensity,
      isSimpleView,
      isChatPanelOpen,
      setChatPanelOpen,
      initialChatMessage,
      setInitialChatMessage
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
