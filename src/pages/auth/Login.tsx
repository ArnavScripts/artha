import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ArthaLogo } from '@/components/brand/ArthaLogo';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Brand */}
            <div className="hidden md:flex flex-col justify-between p-10 bg-[#0B1120] border-r border-white/5 text-white relative overflow-hidden">
                {/* Aurora Background Effect */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
                </div>

                <Link to="/" className="flex items-center gap-3 font-bold text-xl relative z-10">
                    <ArthaLogo size="md" />
                    <span className="font-heading tracking-[0.2em]">ARTHA</span>
                </Link>
                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-4 leading-tight">The Operating System for <span className="text-cyan-400">Carbon Capital</span>.</h2>
                    <p className="text-slate-400 text-lg">
                        "Artha has transformed how we manage our environmental impact. It's not just a tool, it's our financial terminal for carbon."
                    </p>
                </div>
                <p className="text-sm text-slate-500 relative z-10">© 2024 CarbonTerminal</p>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold">Sign in</h1>
                        <p className="text-muted-foreground">Enter your credentials to access your workspace.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Sign In
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-medium hover:underline">
                            Start free trial
                        </Link>
                    </div>

                    {/* DEMO MODE SHORTCUT */}
                    <div className="pt-6 border-t border-border">
                        <Button
                            variant="outline"
                            className="w-full border-cyan-500/30 text-cyan-600 hover:bg-cyan-500/10 hover:text-cyan-700"
                            onClick={(e) => {
                                e.preventDefault();
                                setEmail('demo@artha.com');
                                setPassword('demo123'); // Preset for easy manual entry if needed
                                // Trigger login automatically
                                const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                                handleLogin(fakeEvent);
                            }}
                        >
                            <Loader2 className="w-4 h-4 mr-2 text-cyan-500" />
                            Pitch Mode: Login as Demo User
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                            Auto-fills credentials for Investor Demo (demo@artha.com)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
