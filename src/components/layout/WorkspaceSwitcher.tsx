import { ChevronDown, Leaf, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace, WorkspaceMode } from '@/contexts/WorkspaceContext';

const workspaces = [
  {
    id: 'carbon' as WorkspaceMode,
    name: 'Artha OS: Carbon',
    description: 'Risk & Compliance',
    icon: BarChart3,
    color: 'text-artha-steel',
    bgColor: 'bg-artha-steel-light',
    defaultRoute: '/carbon',
  },
  {
    id: 'green' as WorkspaceMode,
    name: 'Artha OS: Green',
    description: 'Impact & Assets',
    icon: Leaf,
    color: 'text-artha-vedic',
    bgColor: 'bg-artha-vedic-light',
    defaultRoute: '/green',
  },
];

export function WorkspaceSwitcher() {
  const { mode, setMode } = useWorkspace();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const currentWorkspace = workspaces.find(w => w.id === mode) ?? workspaces[0];
  const Icon = currentWorkspace.icon;

  const handleModeSwitch = useCallback((workspace: typeof workspaces[0]) => {
    try {
      setIsOpen(false);
      setMode(workspace.id);
      navigate(workspace.defaultRoute, { replace: true });
    } catch (error) {
      console.error('Error switching workspace:', error);
      setMode('carbon');
      navigate('/', { replace: true });
    }
  }, [setMode, navigate]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl ${currentWorkspace.bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${currentWorkspace.color}`} />
        </div>
        <div className="flex-1 text-left">
          <div className="font-heading font-semibold text-sm text-sidebar-foreground">
            {currentWorkspace.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentWorkspace.description}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden"
            >
              <div className="p-2 border-b border-border">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
                  Switch Context
                </p>
              </div>
              {workspaces.map((workspace) => {
                const WIcon = workspace.icon;
                const isActive = workspace.id === mode;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => handleModeSwitch(workspace)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${isActive ? 'bg-accent' : ''
                      }`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${workspace.bgColor} flex items-center justify-center`}>
                      <WIcon className={`w-4 h-4 ${workspace.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-heading font-medium text-sm">{workspace.name}</div>
                      <div className="text-xs text-muted-foreground">{workspace.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-artha-vedic" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}