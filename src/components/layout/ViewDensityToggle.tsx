import { Briefcase, HardHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkspace, ViewDensity } from '@/contexts/WorkspaceContext';

const views: { id: ViewDensity; label: string; icon: typeof Briefcase }[] = [
  { id: 'owner', label: 'Owner View', icon: Briefcase },
  { id: 'officer', label: 'Officer View', icon: HardHat },
];

export function ViewDensityToggle() {
  const { viewDensity, setViewDensity, mode } = useWorkspace();

  return (
    <div className="flex items-center p-1 rounded-lg bg-muted/60 border border-border">
      {views.map((view) => {
        const isActive = viewDensity === view.id;
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            onClick={() => setViewDensity(view.id)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="density-indicator"
                className={`absolute inset-0 rounded-md ${
                  mode === 'carbon' ? 'bg-card shadow-sm' : 'bg-green-primary-light'
                }`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-1.5 ${
              isActive 
                ? mode === 'carbon' ? 'text-foreground' : 'text-green-primary' 
                : 'text-muted-foreground'
            }`}>
              <Icon className="w-3.5 h-3.5" />
              {view.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
