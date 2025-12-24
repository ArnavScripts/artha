import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Award, 
  Leaf, 
  Sun,
  Droplets,
  Wind,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const projects = [
  {
    id: 1,
    name: 'Adani Solar Park',
    location: 'Rajasthan, India',
    type: 'Renewable Energy',
    icon: Sun,
    price: 450,
    credits: 12500,
    badges: ['Gold Standard', 'Verified'],
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    impact: '24,500 tonnes CO2/year',
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Sundarbans Mangrove Restoration',
    location: 'West Bengal, India',
    type: 'Nature Restoration',
    icon: Leaf,
    price: 380,
    credits: 8200,
    badges: ['Biodiversity', 'VCS Certified'],
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    impact: '15,000 tonnes CO2/year',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Gujarat Wind Farm',
    location: 'Gujarat, India',
    type: 'Wind Energy',
    icon: Wind,
    price: 520,
    credits: 18900,
    badges: ['Gold Standard', 'Premium'],
    image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop',
    impact: '42,000 tonnes CO2/year',
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Kerala Watershed Program',
    location: 'Kerala, India',
    type: 'Water Conservation',
    icon: Droplets,
    price: 290,
    credits: 5400,
    badges: ['Community Impact', 'Verified'],
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
    impact: '8,500 tonnes CO2/year',
    rating: 4.6,
  },
  {
    id: 5,
    name: 'Maharashtra Agroforestry',
    location: 'Maharashtra, India',
    type: 'Forestry',
    icon: Leaf,
    price: 340,
    credits: 9800,
    badges: ['Biodiversity', 'Farmer Support'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
    impact: '18,200 tonnes CO2/year',
    rating: 4.8,
  },
  {
    id: 6,
    name: 'Tamil Nadu Solar Initiative',
    location: 'Tamil Nadu, India',
    type: 'Renewable Energy',
    icon: Sun,
    price: 410,
    credits: 14200,
    badges: ['Gold Standard', 'Grid Connected'],
    image: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400&h=300&fit=crop',
    impact: '31,000 tonnes CO2/year',
    rating: 4.9,
  },
];

const filters = ['All Projects', 'Solar', 'Wind', 'Forestry', 'Water'];

export default function GreenMarketplace() {
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Helmet>
        <title>Green Marketplace - CarbonBook Enterprise</title>
        <meta name="description" content="Invest in verified environmental projects. Browse solar, wind, forestry, and water conservation projects." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Green Marketplace</h1>
          <p className="text-muted-foreground mt-1">Invest in verified environmental projects</p>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="green-card p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-primary/20 focus:border-green-primary"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? 'bg-green-primary text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {filter}
                </button>
              ))}
              <button className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="green-card overflow-hidden group hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {project.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white backdrop-blur-sm"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-green-primary transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{project.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-primary-light">
                      <Award className="w-3.5 h-3.5 text-green-primary" />
                      <span className="text-xs font-medium text-green-primary">{project.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{project.impact}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Price per credit</p>
                      <p className="text-xl font-bold text-foreground font-mono">₹{project.price}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-primary text-white font-medium text-sm hover:bg-green-primary/90 transition-colors"
                    >
                      Invest
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
