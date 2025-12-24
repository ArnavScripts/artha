import { motion } from 'framer-motion';

interface ArthaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'carbon' | 'green';
}

export function ArthaLogo({ className = '', size = 'md', variant = 'default' }: ArthaLogoProps) {
  const sizes = {
    sm: { width: 28, height: 28, strokeWidth: 2.5 },
    md: { width: 36, height: 36, strokeWidth: 2.5 },
    lg: { width: 48, height: 48, strokeWidth: 3 },
  };

  const { width, height, strokeWidth } = sizes[size];

  // Use currentColor so it inherits from parent's text color (semantic theming)
  const color = 'currentColor';

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mountain/Stability - The 'A' base */}
      <motion.path
        d="M20 6L6 34H14L20 22L26 34H34L20 6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {/* Leaf/Growth - Crossing element */}
      <motion.path
        d="M12 24C12 24 16 20 20 20C24 20 28 24 28 24"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      />
      {/* Subtle leaf accent at the peak */}
      <motion.path
        d="M20 6C20 6 22 10 24 12C22 12 20 14 20 14C20 14 18 12 16 12C18 10 20 6 20 6Z"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
    </motion.svg>
  );
}

export function ArthaLogomark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Semantic color: dark in light mode, white in dark mode */}
      <div className="text-slate-900 dark:text-white">
        <ArthaLogo size="md" />
      </div>
      <span className="font-heading font-bold text-xl tracking-[0.2em] text-slate-900 dark:text-white">
        ARTHA
      </span>
    </div>
  );
}