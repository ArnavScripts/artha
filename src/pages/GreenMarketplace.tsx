import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Award,
  Leaf,
  Sun,
  Droplets,
  Wind,
  ChevronRight,
  Info,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { greenService, GreenProject } from '@/services/green.service';
import { toast } from 'sonner';

const filters = ['All Projects', 'Solar', 'Wind', 'Forestry', 'Water'];

const getIcon = (type: string) => {
  switch (type) {
    case 'Renewable Energy': return Sun;
    case 'Wind Energy': return Wind;
    case 'Water Conservation': return Droplets;
    default: return Leaf;
  }
};

export default function GreenMarketplace() {
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // --- 1. Fetch Projects (Real Data) ---
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['greenProjects'],
    queryFn: greenService.getProjects
  });

  // --- 3. Wallet Balance ---
  const { data: walletBalance = 0 } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: greenService.getWalletBalance
  });

  // --- 2. Purchase Mutation ---
  const purchaseMutation = useMutation({
    mutationFn: async ({ inventoryId, quantity }: { inventoryId: number, quantity: number }) => {
      const result = await greenService.purchaseCredits(inventoryId, quantity);
      return result;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success("Purchase Successful!", { description: `Transaction ID: ${data.transaction_id}` });
        queryClient.invalidateQueries({ queryKey: ['greenProjects'] }); // Refresh inventory
        queryClient.invalidateQueries({ queryKey: ['walletBalance'] }); // Refresh wallet
      } else {
        toast.error("Purchase Failed", { description: data.message });
      }
    },
    onError: (error: any) => {
      toast.error("Transaction Error", { description: error.message });
    }
  });

  const handleBuy = (project: GreenProject) => {
    // Logic to select the oldest vintage or specific vintage. 
    // For this demo, we auto-select the first available vintage.
    const inventory = project.inventory?.find(i => i.available_quantity > 0);

    if (!inventory) {
      toast.error("Out of Stock", { description: "This project has no available credits currently." });
      return;
    }

    const cost = inventory.price_per_credit * 100;
    if (walletBalance < cost) {
      toast.error("Insufficient Funds", { description: `You need ₹${cost.toLocaleString()} but have ₹${walletBalance.toLocaleString()}` });
      return;
    }

    // Simplified Quick Buy (100 credits) for Demo
    // In a real app, this would open a dialog to select quantity.
    purchaseMutation.mutate({ inventoryId: inventory.id, quantity: 100 });
  };

  const sanitizedQuery = useMemo(() => searchQuery.replace(/[<>]/g, ''), [searchQuery]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Normalize type from DB if needed, or ensure DB matches filter options
      // Our DB has 'Renewable Energy', 'Wind Energy', etc.
      const matchesFilter = activeFilter === 'All Projects' ||
        (activeFilter === 'Solar' && project.type === 'Renewable Energy') ||
        (activeFilter === 'Wind' && project.type === 'Wind Energy') ||
        (activeFilter === 'Forestry' && (project.type === 'Forestry' || project.type === 'Nature Restoration')) ||
        (activeFilter === 'Water' && project.type === 'Water Conservation');

      const matchesSearch = project.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(sanitizedQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, sanitizedQuery, projects]);

  return (
    <TooltipProvider>
      <Helmet>
        <title>Green Marketplace - CarbonBook Enterprise</title>
        <meta name="description" content="Invest in verified environmental projects." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Green Marketplace</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Invest in verified environmental projects
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-500 bg-green-500/10">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Registry
              </Badge>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cash Balance</span>
              <span className="text-xl font-mono font-bold text-green-400">₹{walletBalance.toLocaleString()}</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Real-time Inventory
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 mb-8 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                placeholder="Search projects by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeFilter === filter
                    ? 'bg-green-500 text-black shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] scale-105'
                    : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-white/10'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Project Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const Icon = getIcon(project.type);
                // Calculate display price (lowest available or base)
                const inventory = project.inventory?.length ? project.inventory[0] : null;
                const price = inventory ? inventory.price_per_credit : 0;
                const available = project.inventory?.reduce((sum, i) => sum + i.available_quantity, 0) || 0;

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative rounded-3xl bg-card/40 border border-white/5 overflow-hidden hover:border-green-500/30 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                      <img
                        src={project.image_url} // Corrected property name from DB
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      {project.sdg_goals && (
                        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                          {/* Only show first 2 badges to avoid clutter */}
                          {project.sdg_goals.slice(0, 2).map((goal, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-black/50 backdrop-blur-md text-white border-white/10 hover:bg-black/70">
                              SDG {goal}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-green-500/50 transition-colors">
                        <Icon className="w-5 h-5 text-green-400" />
                      </div>

                      <div className="absolute bottom-4 left-4 z-20">
                        <div className="flex items-center gap-1 text-xs font-medium text-green-400 mb-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Registry: {project.registry_id || 'Verra'}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white leading-tight mb-1 group-hover:text-green-400 transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{project.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-xs text-muted-foreground">
                          <span className="block mb-1">Annual Impact</span>
                          <span className="text-white font-medium">{project.impact_vcp || 'N/A'}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <div className="text-xs text-muted-foreground text-right">
                          <span className="block mb-1">Available Credits</span>
                          <span className={`font-medium ${available > 0 ? 'text-white' : 'text-red-400'}`}>
                            {available.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            Price per credit
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Est. ROI: {project.roi_percentage}% / yr</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-2xl font-bold text-foreground font-mono tracking-tight">₹{price}</p>
                        </div>
                        <Button
                          onClick={() => handleBuy(project)}
                          disabled={purchaseMutation.isPending || available === 0}
                          className={`font-bold rounded-xl px-6 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] active:scale-95 transition-all
                                ${available > 0
                              ? 'bg-green-500 hover:bg-green-400 text-black'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                          {purchaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>Invest <ChevronRight className="w-4 h-4 ml-1" /></>
                          )}
                        </Button>
                      </div>

                      {(project.inventory?.[0]?.vintage_year) && (
                        <div className="text-[10px] text-center text-muted-foreground/50">
                          Vintage: {project.inventory[0].vintage_year}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

