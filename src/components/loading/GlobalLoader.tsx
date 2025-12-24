import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';

export function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1120]">
            <div className="relative">
                {/* Pulsing Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full"
                />

                {/* Logo Icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative z-10 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
                >
                    <Hexagon className="w-12 h-12 text-cyan-400 stroke-[1.5]" />
                </motion.div>
            </div>

            {/* Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
            >
                <h1 className="text-2xl font-bold tracking-[0.2em] text-white font-sans">ARTHA</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Financial OS for Carbon</p>
            </motion.div>
        </div>
    );
}
