"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulate network request
        setTimeout(() => {
            setIsLoading(false);
            // Randomly succeed or fail to be confusing/convincing? 
            // Or just always fail with "Invalid credentials" which is common for a decoy.
            setError("Invalid email or password. Please try again.");
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full bg-background flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse-glow delay-1000" />
            </div>

            <div className="z-10 w-full max-w-md mx-auto flex-1 flex flex-col justify-center px-6 py-12">
                {/* Header */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2.5 group mb-8">
                        <span className="text-2xl font-bold tracking-tight">
                            Sanitized <span className="gradient-text">Ai</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your credentials to access your workspace
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-6 sm:p-8 space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-black/20 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                                    Password
                                </label>
                                <Link
                                    href="#"
                                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-10 px-3 pr-10 rounded-lg bg-black/20 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f172a] px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-foreground"
                            onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => setIsLoading(false), 2000);
                            }}
                        >
                            <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-foreground"
                            onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => setIsLoading(false), 2000);
                            }}
                        >
                            <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 23 23">
                                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                                <path fill="#f35325" d="M1 1h10v10H1z" />
                                <path fill="#81bc06" d="M12 1h10v10H12z" />
                                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                <path fill="#ffba08" d="M12 12h10v10H12z" />
                            </svg>
                            Microsoft
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/intake" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Apply for access
                        </Link>
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy Policy</Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
