import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Building2, User } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArthaLogo } from '@/components/brand/ArthaLogo';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: User, 2: Company

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        companyName: '',
        industry: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const [otp, setOtp] = useState('');

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup'
            });

            if (error) throw error;

            toast.success('Email verified successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            });

            if (authError) throw authError;

            // 2. Create Organization (if user creation successful)
            if (authData.user) {
                // Note: In a real app, we'd use a transaction or Edge Function for this to be atomic.
                // For now, we rely on RLS policies allowing authenticated users to insert orgs.
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .insert({
                        name: formData.companyName,
                        industry: formData.industry,
                        tier: 'standard', // Default tier
                    } as any)
                    .select()
                    .single();

                if (orgError) {
                    console.error("Org creation failed", orgError);
                    // Non-blocking for demo, but should handle cleanup
                } else if (orgData) {
                    // 3. Link Profile to Organization
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({ organization_id: orgData.id } as any)
                        .eq('id', authData.user.id);

                    if (profileError) {
                        console.error("Failed to link profile to org", profileError);
                    }
                }
            }

            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Registration error:", error);
            if (error.message?.includes("Error sending confirmation email")) {
                toast.error("Account created, but email failed to send. Please disable 'Confirm email' in Supabase Auth settings or check your SMTP config.");
                // Optional: navigate to dashboard anyway if you want to allow login (but they won't have a session usually)
                // navigate('/login');
            } else {
                toast.error(error.message || "Registration failed");
            }
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
                    <h2 className="text-4xl font-bold mb-4 leading-tight">Join the network of <span className="text-cyan-400">sustainable leaders</span>.</h2>
                    <ul className="space-y-4 text-lg text-slate-400 mt-8">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">✓</div>
                            Automated Emissions Tracking
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">✓</div>
                            AI-Powered Market Intelligence
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">✓</div>
                            Instant Regulatory Compliance
                        </li>
                    </ul>
                </div>
                <p className="text-sm text-slate-500 relative z-10">© 2024 Artha Inc.</p>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                        </Link>
                        <h1 className="text-3xl font-bold">Create Account</h1>
                        <p className="text-muted-foreground">Step {step} of 2: {step === 1 ? 'Personal Details' : 'Company Information'}</p>
                    </div>

                    <form onSubmit={
                        step === 1 ? (e) => { e.preventDefault(); setStep(2); } :
                            step === 2 ? handleRegister :
                                handleVerifyOtp
                    } className="space-y-6">

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            className="pl-9"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Next Step
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="companyName"
                                            className="pl-9"
                                            placeholder="Acme Industries"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <Select onValueChange={(value) => {
                                        if (value === "Other") {
                                            setFormData({ ...formData, industry: "" });
                                        } else {
                                            setFormData({ ...formData, industry: value });
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                "Manufacturing",
                                                "Energy & Utilities",
                                                "Transportation & Logistics",
                                                "Construction & Real Estate",
                                                "Agriculture & Forestry",
                                                "Mining & Metals",
                                                "Chemicals",
                                                "Technology",
                                                "Financial Services",
                                                "Other"
                                            ].map((ind) => (
                                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Conditional Input for "Other" - We check if the current industry is NOT in the predefined list (or empty if they just clicked other) */}
                                {(formData.industry === "" || ![
                                    "Manufacturing",
                                    "Energy & Utilities",
                                    "Transportation & Logistics",
                                    "Construction & Real Estate",
                                    "Agriculture & Forestry",
                                    "Mining & Metals",
                                    "Chemicals",
                                    "Technology",
                                    "Financial Services"
                                ].includes(formData.industry)) && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label htmlFor="industry">Specify Industry</Label>
                                            <Input
                                                id="industry"
                                                placeholder="e.g. Aerospace"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Complete Registration
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        We've sent a 6-digit code to <span className="font-medium text-foreground">{formData.email}</span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={6}
                                        className="text-center text-lg tracking-widest"
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Verify Email
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-xs"
                                    onClick={() => setStep(2)}
                                >
                                    Change Email
                                </Button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        We've sent a 6-digit code to <span className="font-medium text-foreground">{formData.email}</span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={6}
                                        className="text-center text-lg tracking-widest"
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Verify Email
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-xs"
                                    onClick={() => setStep(2)}
                                >
                                    Change Email
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
