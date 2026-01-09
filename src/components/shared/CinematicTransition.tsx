import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CinematicTransitionProps {
    children: ReactNode;
}

export const CinematicTransition = ({ children }: CinematicTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, rotateX: 2 }}
            animate={{
                opacity: 1,
                scale: 1,
                rotateX: 0,
                transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    mass: 1
                }
            }}
            exit={{
                opacity: 0,
                scale: 1.02,
                rotateX: -2,
                transition: { duration: 0.3, ease: "easeInOut" }
            }}
            style={{
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                backfaceVisibility: 'hidden'
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};
