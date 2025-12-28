import { useState, useMemo } from 'react';
import { format, subMonths, isSameMonth } from 'date-fns';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
    Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, Loader2, Plus, Minus,
    Shield, AlertCircle, Download, ChevronDown, ChevronUp, CheckCircle2, Copy, Lock
} from 'lucide-react';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { useCarbonData } from '@/hooks/useCarbonData';
import { useProfile } from '@/hooks/useProfile';
import { profileService, Organization } from '@/services/profile.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';

export default function Wallet() {
    const { balance, purchased, liability, isLoading } = useCarbonData();
    const { organization: rawOrg } = useProfile();
    const organization = rawOrg as Organization | null;
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedTx, setExpandedTx] = useState<string | null>(null);

    const { user } = useProfile();
    const isDemoUser = user?.email === 'demo@artha.com';

    // Fetch all transactions
    const { data: transactions } = useQuery({
        queryKey: ['transactions', organization?.id],
        queryFn: async () => {
            if (isDemoUser) {
                return [
                    {
                        id: 'tx-1',
                        type: 'deposit',
                        amount: 500000,
                        credits: 8333.33,
                        status: 'completed',
                        created_at: subMonths(new Date(), 0).toISOString()
                    },
                    {
                        id: 'tx-2',
                        type: 'withdraw',
                        amount: 120000,
                        credits: 2000,
                        status: 'completed',
                        created_at: subMonths(new Date(), 1).toISOString()
                    },
                    {
                        id: 'tx-3',
                        type: 'deposit',
                        amount: 300000,
                        credits: 5000,
                        status: 'completed',
                        created_at: subMonths(new Date(), 2).toISOString()
                    },
                    {
                        id: 'tx-4',
                        type: 'deposit',
                        amount: 450000,
                        credits: 7500,
                        status: 'completed',
                        created_at: subMonths(new Date(), 3).toISOString()
                    }
                ];
            }
            if (!organization) return [];
            return profileService.getTransactions(organization.id);
        },
        enabled: !!organization || isDemoUser,
    });

    // --- PHASE 3: DESIGN (Holographic Physics) ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 150, damping: 20 });
    const glareX = useTransform(x, [-100, 100], [0, 100]);
    const glareY = useTransform(y, [-100, 100], [0, 100]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    // --- PHASE 5: SECURITY (Masking) ---
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Wallet address copied to clipboard");
    };

    const handleTransaction = async (type: 'deposit' | 'withdraw') => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!organization) {
            toast.error('Organization not found');
            return;
        }

        setIsProcessing(true);
        try {
            const credits = Number(amount) / 60;
            const currentPurchased = organization.credits_purchased || 0;
            const newPurchased = type === 'deposit' ? currentPurchased + credits : currentPurchased - credits;

            if (newPurchased < 0) {
                toast.error('Insufficient funds to withdraw');
                return;
            }

            // --- PHASE 4: BACKEND (Optimistic UI) ---
            // In a real app, we would optimistically update the cache here before the API call

            await profileService.updateOrganization(organization.id, { credits_purchased: newPurchased });
            await profileService.createTransaction({
                organization_id: organization.id,
                type,
                amount: Number(amount),
                credits,
                status: 'completed'
            });

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['emissions-records'] }),
                queryClient.invalidateQueries({ queryKey: ['profile'] }),
                queryClient.invalidateQueries({ queryKey: ['organization'] }),
                queryClient.invalidateQueries({ queryKey: ['transactions'] })
            ]);

            toast.success(type === 'deposit' ? 'Funds added successfully' : 'Funds withdrawn successfully');
            setIsOpen(false);
            setAmount('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Fetch audits
    const { data: audits } = useQuery({
        queryKey: ['audits', organization?.id],
        queryFn: async () => {
            if (!organization) return [];
            return profileService.getAudits(organization.id);
        },
        enabled: !!organization,
    });

    // Chart Data Preparation
    const velocityData = useMemo(() => {
        if (!transactions) return [];

        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return {
                date,
                name: format(date, 'MMM'),
                inflow: 0,
                outflow: 0
            };
        });

        transactions.forEach((tx: any) => {
            const txDate = new Date(tx.created_at);
            const monthData = last6Months.find(m => isSameMonth(m.date, txDate));
            if (monthData) {
                if (tx.type === 'deposit') {
                    monthData.inflow += Number(tx.amount);
                } else {
                    monthData.outflow += Number(tx.amount);
                }
            }
        });

        return last6Months.map(({ name, inflow, outflow }) => ({ name, inflow, outflow }));
    }, [transactions]);

    const ecologyData = useMemo(() => {
        const totalPurchased = transactions
            ?.filter((t: any) => t.type === 'deposit')
            .reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0;

        const estimatedComplianceCost = (liability?.total || 0) * 60; // 60 INR per credit
        const auditCost = (audits?.length || 0) * 50000; // Est. 50k per audit

        return [
            { name: 'Compliance', value: estimatedComplianceCost, color: '#06b6d4' }, // Cyan
            { name: 'Purchases', value: totalPurchased, color: '#f59e0b' }, // Amber
            { name: 'Audits', value: auditCost, color: '#ec4899' },   // Pink
            { name: 'Fees', value: totalPurchased * 0.02, color: '#6366f1' },     // Indigo (2% est)
        ];
    }, [transactions, liability, audits]);

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

    return (
        <>
            <Helmet>
                <title>Carbon Wallet & Treasury - Artha</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Carbon Wallet & Treasury</h1>
                        <p className="text-muted-foreground mt-2 flex items-center gap-2">
                            Manage your digital assets and carbon credit liquidity.
                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                                <Shield className="w-3 h-3 mr-1" /> Escrow Secured
                            </Badge>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Asset Column (Col-span-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Holographic Card */}
                        <div className="perspective-1000">
                            <motion.div
                                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                className="relative aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-slate-900 to-[#0F172A] shadow-[0_20px_50px_-12px_rgba(8,145,178,0.4)] border border-white/10 group overflow-hidden"
                            >
                                {/* Noise Texture */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                                {/* Holographic Mesh */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-violet-500/10 to-transparent opacity-50" />

                                {/* Dynamic Shine Effect */}
                                <motion.div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-soft-light"
                                    style={{
                                        background: useTransform(
                                            [x, y],
                                            ([latestX, latestY]) => `radial-gradient(circle 400px at ${(latestX as number) + 200}px ${(latestY as number) + 125}px, rgba(255,255,255,0.4), transparent 80%)`
                                        )
                                    }}
                                />

                                <div className="relative z-10 p-6 flex flex-col justify-between h-full transform-style-3d">
                                    <div className="flex justify-between items-start translate-z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                                                <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                            </div>
                                            <span className="font-heading font-bold text-white tracking-wider text-lg">ARTHA</span>
                                        </div>
                                        <CreditCard className="w-6 h-6 text-white/50" />
                                    </div>

                                    <div className="translate-z-20">
                                        <p className="text-sm text-white/60 font-mono mb-1">Carbon Treasury Balance</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-white font-mono tracking-tight drop-shadow-lg">
                                                ₹{Math.round((balance || 0) * 60).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-xs text-emerald-400 font-medium tracking-wide">LIVE LIQUIDITY</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end translate-z-10">
                                        <div
                                            className="font-mono text-xs text-white/60 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                                            onClick={() => copyToClipboard("0x71C...9A21")}
                                        >
                                            0x71C...9A21 <Copy className="w-3 h-3" />
                                        </div>
                                        <div className="font-mono text-xs text-white/40">
                                            EXP 12/28
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-3 gap-3">
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] active:scale-95 transition-all">
                                        Add Funds
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-[#0B1120] border-white/10 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Manage Wallet Funds</DialogTitle>
                                    </DialogHeader>
                                    <Tabs defaultValue="deposit" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 bg-white/5">
                                            <TabsTrigger value="deposit" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Add Funds</TabsTrigger>
                                            <TabsTrigger value="withdraw" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">Withdraw</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="deposit" className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <p className="text-sm text-slate-400">Enter amount (INR)</p>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                                    <Input type="number" className="pl-7 bg-white/5 border-white/10 text-white focus:border-cyan-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                                </div>
                                                {amount && <p className="text-xs text-right text-cyan-400">≈ {(Number(amount) / 60).toFixed(2)} Credits</p>}
                                            </div>

                                            {/* Trust Signal */}
                                            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 my-2">
                                                <Lock className="w-3 h-3" />
                                                Encrypted via 256-bit SSL
                                            </div>

                                            <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold" onClick={() => handleTransaction('deposit')} disabled={isProcessing}>
                                                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Deposit'}
                                            </Button>
                                        </TabsContent>
                                        <TabsContent value="withdraw" className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <p className="text-sm text-slate-400">Enter amount (INR)</p>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                                    <Input type="number" className="pl-7 bg-white/5 border-white/10 text-white focus:border-amber-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                                </div>
                                            </div>
                                            <Button variant="destructive" className="w-full bg-rose-500 hover:bg-rose-600 font-bold" onClick={() => handleTransaction('withdraw')} disabled={isProcessing}>
                                                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Withdrawal'}
                                            </Button>
                                            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 my-2">
                                                <Shield className="w-3 h-3" />
                                                Funds held in Escrow
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline" className="h-12 border-white/10 text-foreground hover:bg-white/5 active:scale-95 transition-all">
                                Withdraw
                            </Button>

                            <Button className="h-12 bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] active:scale-95 transition-all">
                                Pay
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Data Column (Col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Visualization Engine */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Cash Flow Velocity */}
                            <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl">
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Cash Flow Velocity</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={velocityData}>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="inflow" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={8} />
                                            <Bar dataKey="outflow" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={8} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Spending Ecology */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl relative">
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Spend Ecology</h3>
                                <div className="h-48 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={ecologyData}
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {ecologyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Total</p>
                                            <p className="text-lg font-bold text-white">
                                                ₹{(ecologyData.reduce((acc, item) => acc + item.value, 0) / 100000).toFixed(1)}L
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Ledger */}
                        <div className="glass-panel overflow-hidden rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="font-medium text-white">Recent Transactions</h3>
                                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
                                    <Download className="w-3 h-3 mr-2" /> CSV
                                </Button>
                            </div>

                            <div className="p-4 space-y-1">
                                {transactions?.map((tx: any) => (
                                    <div key={tx.id} className="group">
                                        <div
                                            className="p-3 rounded-xl flex items-center justify-between bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                                            onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                    {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{tx.type === 'deposit' ? 'Funds Added' : 'Withdrawal'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                        <span className="text-xs text-slate-400">Artha Treasury</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <span className="px-2 py-1 rounded-full bg-white/5 text-[10px] text-slate-400 border border-white/5">
                                                    {tx.type === 'deposit' ? 'Fiat Inflow' : 'Liquidity'}
                                                </span>
                                                <div className="text-right min-w-[100px]">
                                                    <p className={`font-mono font-medium ${tx.type === 'deposit' ? 'text-cyan-400' : 'text-white'
                                                        }`}>
                                                        {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="w-4">
                                                    {tx.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Accordion Content */}
                                        <AnimatePresence>
                                            {expandedTx === tx.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-14 py-3 text-sm text-slate-400 space-y-2 bg-black/20 rounded-b-lg mx-2 mb-2 border-x border-b border-white/5">
                                                        <div className="flex justify-between">
                                                            <span>Transaction Hash</span>
                                                            <span className="font-mono text-xs text-slate-500">0x{tx.id.replace(/-/g, '')}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Credits Converted</span>
                                                            <span className="font-mono text-white">{tx.credits.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}

                                {(!transactions || transactions.length === 0) && (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                            <CreditCard className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-white font-medium mb-1">No Transactions Yet</h3>
                                        <p className="text-slate-500 text-sm mb-4">Start trading to build your carbon portfolio.</p>
                                        <Button
                                            variant="outline"
                                            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                                            onClick={() => setIsOpen(true)}
                                        >
                                            Add Funds to Start
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
