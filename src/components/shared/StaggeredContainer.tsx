import { motion, Variants, Easing } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

const snappyEase: Easing = [0.32, 0.72, 0, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: snappyEase,
    },
  },
};

export function StaggeredContainer({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0,
}: StaggeredContainerProps) {
  const dynamicContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={dynamicContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// Export variants for use in custom implementations
export { containerVariants, itemVariants };
