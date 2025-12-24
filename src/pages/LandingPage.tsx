import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BarChart3, Globe, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { ArthaLogo } from '@/components/brand/ArthaLogo';

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <div className="min-h-screen bg-[#0B1120] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Aurora Borealis Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-blue-600/10 rounded-full blur-[150px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0B1120]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ArthaLogo size="md" />
                        <span className="font-heading font-bold text-xl tracking-[0.2em] text-white">
                            ARTHA
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link to="/register">
                            <Button className="bg-white text-[#0B1120] hover:bg-slate-200 font-semibold rounded-full px-6">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={containerRef} className="relative pt-40 pb-32 px-6 z-10 perspective-1000">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-400 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            v2.0 Now Live: AI-Powered Trading
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold tracking-[-0.02em] leading-[0.95] mb-8 bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
                            The Operating System <br />
                            for <span className="text-cyan-400">Carbon Capital.</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Automate emissions tracking, streamline audits, and trade carbon credits with the precision of a financial terminal.
                        </p>

                        <div className="flex items-center justify-center gap-4 mb-24">
                            <Link to="/register">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] border-0 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
                                    <span className="relative z-10 flex items-center">Start Terminal <ArrowRight className="w-5 h-5 ml-2" /></span>
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm">
                                    Live Demo
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* 3D Tilted Interface */}
                    <motion.div
                        style={{ y, opacity, transformStyle: "preserve-3d", transform: "perspective(1000px) rotateX(20deg) rotateY(-10deg) rotateZ(5deg)" }}
                        initial={{ rotateX: 20, rotateY: 0, scale: 0.9, opacity: 0 }}
                        animate={{ rotateX: 20, rotateY: 0, scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                        className="relative mx-auto max-w-6xl"
                    >
                        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] -z-10" />
                        <div className="rounded-xl border border-white/10 bg-[#0B1120]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                            <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <img
                                src="/landingPageImg.png"
                                alt="Dashboard Interface"
                                className="w-full h-auto opacity-90"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm font-mono text-slate-500 mb-8 uppercase tracking-widest">Trusted by Industrial Giants</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale mix-blend-screen">
                        {/* Replace with actual SVGs in production */}
                        <h3 className="text-2xl font-bold text-white">TATA STEEL</h3>
                        <h3 className="text-2xl font-bold text-white">JSW</h3>
                        <h3 className="text-2xl font-bold text-white">RELIANCE</h3>
                        <h3 className="text-2xl font-bold text-white">ADANI</h3>
                        <h3 className="text-2xl font-bold text-white">VEDANTA</h3>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <FeatureCard
                                icon={<BarChart3 className="w-6 h-6 text-cyan-400" />}
                                title="Real-time Tracking"
                                description="Monitor Scope 1, 2, and 3 emissions with granular precision. Live data feeds from IoT sensors and ERP systems."
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <FeatureCard
                                icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
                                title="Audit Ready"
                                description="Generate BRSR and CBAM compliant reports instantly. Never miss a regulatory deadline with automated checks."
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <FeatureCard
                                icon={<Zap className="w-6 h-6 text-amber-400" />}
                                title="AI Intelligence"
                                description="Predictive analytics and anomaly detection powered by Gemini 1.5 Pro. Spot inefficiencies before they cost you."
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
            <div className="mb-6 p-3 bg-white/5 rounded-2xl w-fit border border-white/5 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>

            <div className="mt-8 flex items-center text-sm font-medium text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
            </div>
        </div>
    );
}
