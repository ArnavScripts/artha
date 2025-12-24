import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Loader2, Plus, Minus } from 'lucide-react';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { useCarbonData } from '@/hooks/useCarbonData';
import { useProfile } from '@/hooks/useProfile';
import { profileService } from '@/services/profile.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function CarbonWallet() {
  const { balance, purchased, liability, isLoading } = useCarbonData();
  const { organization } = useProfile();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransaction = async (type: 'deposit' | 'withdraw') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      const credits = Number(amount) / 60; // Convert INR to Credits
      const currentPurchased = organization?.credits_purchased || 0;
      const newPurchased = type === 'deposit'
        ? currentPurchased + credits
        : currentPurchased - credits;

      if (newPurchased < 0) {
        toast.error('Insufficient funds to withdraw');
        return;
      }

      await profileService.updateOrganization(organization!.id, {
        credits_purchased: newPurchased
      });

      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['organization'] });

      toast.success(type === 'deposit' ? 'Funds added successfully' : 'Funds withdrawn successfully');
      setIsOpen(false);
      setAmount('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-center h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-white/10 border border-white/5">
          <Wallet className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-label">Carbon Wallet</h3>
          <p className="text-xs text-slate-500">IND-CCC Credits</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Available Balance</p>
        <AnimatedNumber
          value={balance}
          duration={800}
          className="text-3xl font-bold font-mono text-foreground"
        />
        <p className="text-xs text-muted-foreground mt-1">≈ ₹{(balance * 60).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-4 h-4 text-carbon-success" />
            <span className="text-xs text-muted-foreground">Received</span>
          </div>
          <p className="font-mono text-sm text-foreground">+{Math.round(purchased || 0).toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-carbon-risk" />
            <span className="text-xs text-muted-foreground">Spent</span>
          </div>
          <p className="font-mono text-sm text-foreground">-{Math.round(liability?.total || 0).toLocaleString()}</p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            disabled={!organization}
            className="relative w-full overflow-hidden bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors group shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
            <CreditCard className="w-4 h-4 relative z-10" />
            <span className="relative z-10 font-semibold">Fund Wallet</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Wallet Funds</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Add Funds</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit" className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Enter amount to add (INR). This will be converted to Carbon Credits.</p>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                {amount && (
                  <p className="text-xs text-muted-foreground text-right">
                    ≈ {(Number(amount) / 60).toFixed(2)} Credits
                  </p>
                )}
              </div>
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black"
                onClick={() => handleTransaction('deposit')}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Funds
              </Button>
            </TabsContent>
            <TabsContent value="withdraw" className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Enter amount to withdraw (INR).</p>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                {amount && (
                  <p className="text-xs text-muted-foreground text-right">
                    ≈ {(Number(amount) / 60).toFixed(2)} Credits
                  </p>
                )}
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleTransaction('withdraw')}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
                Withdraw Funds
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
