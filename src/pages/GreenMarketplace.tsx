import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Award,
  Leaf,
  Sun,
  Droplets,
  Wind,
  ChevronRight,
  Info,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { z } from 'zod';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// --- PHASE 5: SECURITY (Zod Schema) ---
const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  type: z.enum(['Renewable Energy', 'Nature Restoration', 'Wind Energy', 'Water Conservation', 'Forestry']),
  price: z.number().positive(),
  credits: z.number().positive(),
  badges: z.array(z.string()),
  image: z.string().url(),
  impact: z.string(),
  rating: z.number().min(0).max(5),
  roi: z.number().optional(), // Added for CFO Persona
});

type Project = z.infer<typeof ProjectSchema>;

// --- MOCK DATA (Moved to be validated) ---
const rawProjects = [
  {
    id: 1,
    name: 'Adani Solar Park',
    location: 'Rajasthan, India',
    type: 'Renewable Energy',
    price: 450,
    credits: 12500,
    badges: ['Gold Standard', 'Verified'],
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    impact: '24,500 tonnes CO2/year',
    rating: 4.9,
    roi: 12.5
  },
  {
    id: 2,
    name: 'Sundarbans Mangrove Restoration',
    location: 'West Bengal, India',
    type: 'Nature Restoration',
    price: 380,
    credits: 8200,
    badges: ['Biodiversity', 'VCS Certified'],
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    impact: '15,000 tonnes CO2/year',
    rating: 4.8,
    roi: 8.2
  },
  {
    id: 3,
    name: 'Gujarat Wind Farm',
    location: 'Gujarat, India',
    type: 'Wind Energy',
    price: 520,
    credits: 18900,
    badges: ['Gold Standard', 'Premium'],
    image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop',
    impact: '42,000 tonnes CO2/year',
    rating: 4.7,
    roi: 10.1
  },
  {
    id: 4,
    name: 'Kerala Watershed Program',
    location: 'Kerala, India',
    type: 'Water Conservation',
    price: 290,
    credits: 5400,
    badges: ['Community Impact', 'Verified'],
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
    impact: '8,500 tonnes CO2/year',
    rating: 4.6,
    roi: 6.5
  },
  {
    id: 5,
    name: 'Maharashtra Agroforestry',
    location: 'Maharashtra, India',
    type: 'Forestry',
    price: 340,
    credits: 9800,
    badges: ['Biodiversity', 'Farmer Support'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
    impact: '18,200 tonnes CO2/year',
    rating: 4.8,
    roi: 9.0
  },
  {
    id: 6,
    name: 'Tamil Nadu Solar Initiative',
    location: 'Tamil Nadu, India',
    type: 'Renewable Energy',
    price: 410,
    credits: 14200,
    badges: ['Gold Standard', 'Grid Connected'],
    image: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400&h=300&fit=crop',
    impact: '31,000 tonnes CO2/year',
    rating: 4.9,
    roi: 11.8
  },
];

// Validate Data
const projects = rawProjects.map(p => ProjectSchema.parse(p));

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

  // --- PHASE 5: SECURITY (Input Sanitization) ---
  const sanitizedQuery = useMemo(() => searchQuery.replace(/[<>]/g, ''), [searchQuery]);

  // --- PHASE 4: BACKEND (Logic & Data Flow) ---
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesFilter = activeFilter === 'All Projects' ||
        (activeFilter === 'Solar' && project.type === 'Renewable Energy') ||
        (activeFilter === 'Wind' && project.type === 'Wind Energy') ||
        (activeFilter === 'Forestry' && (project.type === 'Forestry' || project.type === 'Nature Restoration')) ||
        (activeFilter === 'Water' && project.type === 'Water Conservation');

      const matchesSearch = project.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(sanitizedQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, sanitizedQuery]);

  return (
    <TooltipProvider>
      <Helmet>
        <title>Green Marketplace - CarbonBook Enterprise</title>
        <meta name="description" content="Invest in verified environmental projects. Browse solar, wind, forestry, and water conservation projects." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Green Marketplace</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Invest in verified environmental projects
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-500 bg-green-500/10">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
              </Badge>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Market Live
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const Icon = getIcon(project.type);
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
                  {/* Image & Overlay */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                      {project.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="bg-black/50 backdrop-blur-md text-white border-white/10 hover:bg-black/70">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-green-500/50 transition-colors">
                      <Icon className="w-5 h-5 text-green-400" />
                    </div>

                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="flex items-center gap-1 text-xs font-medium text-green-400 mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Top Rated {project.rating}</span>
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

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xs text-muted-foreground">
                        <span className="block mb-1">Annual Impact</span>
                        <span className="text-white font-medium">{project.impact}</span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10" />
                      <div className="text-xs text-muted-foreground text-right">
                        <span className="block mb-1">Available Credits</span>
                        <span className="text-white font-medium">{project.credits.toLocaleString()}</span>
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
                              <p>Est. ROI: {project.roi}% / yr</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-2xl font-bold text-foreground font-mono tracking-tight">₹{project.price}</p>
                      </div>
                      <Button
                        className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-6 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] active:scale-95 transition-all"
                      >
                        Invest <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {/* Trust Signal Micro-copy */}
                    <div className="text-[10px] text-center text-muted-foreground/50 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified by Gold Standard & Verra
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
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

