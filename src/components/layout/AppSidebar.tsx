import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Landmark,
  BrainCircuit,
  Settings,
  TreeDeciduous,
  Store,
  Wallet,
  ShieldCheck,
  User,
  Menu
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { KnowledgeTile } from './KnowledgeTile';
import { ArthaLogo } from '@/components/brand/ArthaLogo';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const carbonNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Wallet & Treasury', url: '/wallet', icon: Wallet },
  { title: 'Emissions (Live)', url: '/emissions', icon: Activity },
  { title: 'Market (Trading)', url: '/market', icon: TrendingUp },
  { title: 'Regulatory', url: '/regulatory', icon: Landmark },
  { title: 'Intelligence', url: '/intelligence', icon: BrainCircuit },
];

const greenNavItems = [
  { title: 'Impact Dashboard', url: '/green', icon: TreeDeciduous },
  { title: 'Marketplace', url: '/green/marketplace', icon: Store },
  { title: 'Portfolio', url: '/green/portfolio', icon: Wallet },
  { title: 'Verification', url: '/green/verification', icon: ShieldCheck },
];

// Shared navigation content component
function SidebarNavContent({ className = '' }: { className?: string }) {
  const location = useLocation();
  const { mode } = useWorkspace();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems = mode === 'carbon' ? carbonNavItems : greenNavItems;

  const isActive = (item: typeof navItems[0]) => {
    if (item.url === '/green') {
      return location.pathname === item.url;
    }
    return location.pathname.startsWith(item.url);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Logo Header */}
      <div className="h-16 px-5 flex items-center border-b border-slate-200/60 dark:border-white/5">
        <div className="flex items-center gap-3">
          <ArthaLogo size="md" />
          <span className="font-heading font-bold text-lg tracking-[0.2em] text-slate-900 dark:text-white">
            ARTHA
          </span>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="p-4 border-b border-slate-200/60 dark:border-white/5">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-3 px-3">
          <span className="text-xs font-heading font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {mode === 'carbon' ? 'Carbon Management' : 'Green Impact'}
          </span>
        </div>

        <div className="space-y-1 relative" onMouseLeave={() => setHoveredIndex(null)}>
          {navItems.map((item, index) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/' || item.url === '/green'}
                className="relative flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group z-10"
                onMouseEnter={() => setHoveredIndex(index)}
              >

                {/* Active Pill - Slides between items */}
                {active && (
                  <motion.div
                    layoutId="active-pill-nav"
                    className="absolute inset-0 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/10 border-r-2 border-cyan-400 z-0"
                    initial={false}
                    transition={{
                      type: 'tween',
                      ease: [0.25, 0.1, 0.25, 1.0],
                      duration: 0.15
                    }}
                  />
                )}

                {/* Glow Orb Hover Effect */}
                {hoveredIndex === index && !active && (
                  <motion.div
                    layoutId="hover-glow"
                    className="absolute inset-0 rounded-lg bg-white/5 dark:bg-white/5 z-[-1]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400/50 blur-md rounded-full" />
                  </motion.div>
                )}

                {/* Content */}
                <div className={`relative z-10 flex items-center gap-3 transition-all duration-200 ${active
                  ? 'text-cyan-700 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                      }`}
                  />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Knowledge Tile */}
      <div className="px-3">
        <KnowledgeTile />
      </div>

      {/* Glass Separator */}
      <div className="mx-4 my-2">
        <div className="h-[1px] bg-slate-200/60 dark:bg-white/10" />
      </div>

      {/* Command Center Footer */}
      <div className="p-3 space-y-1">
        {/* User Profile */}
        <NavLink
          to="/profile"
          className="relative flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group"
        >
          {location.pathname === '/profile' && (
            <motion.div
              layoutId="active-pill-profile"
              className="absolute inset-0 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/10 border-r-2 border-cyan-400"
              initial={false}
              transition={{
                type: 'tween',
                ease: [0.25, 0.1, 0.25, 1.0],
                duration: 0.15
              }}
            />
          )}
          <div className={`relative z-10 flex items-center gap-3 ${location.pathname === '/profile'
            ? 'text-cyan-700 dark:text-cyan-400'
            : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
            }`}>
            <User className={`w-5 h-5 ${location.pathname === '/profile' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
            <span className="font-medium text-sm">Profile</span>
          </div>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className="relative flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group"
        >
          {location.pathname === '/settings' && (
            <motion.div
              layoutId="active-pill-settings"
              className="absolute inset-0 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/10 border-r-2 border-cyan-400"
              initial={false}
              transition={{
                type: 'tween',
                ease: [0.25, 0.1, 0.25, 1.0],
                duration: 0.15
              }}
            />
          )}
          <div className={`relative z-10 flex items-center gap-3 ${location.pathname === '/settings'
            ? 'text-cyan-700 dark:text-cyan-400'
            : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
            }`}>
            <Settings className={`w-5 h-5 ${location.pathname === '/settings' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
            <span className="font-medium text-sm">Settings</span>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

// Mobile Bottom Sheet
function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-white/70 dark:bg-[#0B1120]/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/5">
        <SidebarNavContent />
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 z-sidebar flex-col bg-white/70 dark:bg-[#0B1120]/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/5">
      <SidebarNavContent />
    </aside>
  );
}

export function AppSidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
