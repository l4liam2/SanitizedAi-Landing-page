"use client";

import Link from "next/link";
import { ArrowRight, Play, Shield, Eye, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { DemoPlayer } from "@/components/DemoPlayer";

export function Hero() {
    const { t } = useTranslation();

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden ambient-bg">
            <div className="absolute inset-0 grid-pattern opacity-40"></div>

            <div className="container mx-auto relative z-10 px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="badge-pill mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="flex h-2 w-2 rounded-full bg-success animate-pulse"></span>
                        <span>{t.hero.badge}</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        {t.hero.titlePrefix}<br />
                        <span className="gradient-text">{t.hero.titleSuffix}</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        {t.hero.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link
                            href="/intake"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] hover:brightness-110 h-14 px-10 text-lg rounded-xl"
                        >
                            {t.hero.ctaAccess}
                            <ArrowRight className="h-5 w-5" />
                        </Link>

                        <button
                            // ID for demo scroll?
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white/[0.1] bg-white/[0.03] text-foreground backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.2] h-14 px-10 text-lg rounded-xl"
                            onClick={() => {
                                document.getElementById('demo-player-container')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Play className="h-5 w-5 fill-current" />
                            {t.hero.ctaDemo}
                        </button>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/[0.08] animate-in fade-in delay-500 duration-1000">
                    <p className="eyebrow mb-6 text-muted-foreground">{t.hero.trusted}</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70">
                        <div className="group flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                            <span className="text-xl font-bold text-white">OpenAI</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-muted-foreground">ChatGPT</span>
                        </div>
                        <div className="group flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                            <span className="text-xl font-bold text-white">Anthropic</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-muted-foreground">Claude</span>
                        </div>
                        <div className="group flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                            <span className="text-xl font-bold text-white">Google</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-muted-foreground">Gemini</span>
                        </div>
                        <div className="group flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                            <span className="text-xl font-bold text-white">Microsoft</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-muted-foreground">Copilot</span>
                        </div>
                    </div>
                </div>

                {/* Demo Video Container Placeholder */}
                <div id="demo-player-container" className="mt-16 relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10 group animate-in fade-in slide-in-from-bottom-12 delay-700 duration-1000">
                    <DemoPlayer />
                </div>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-1/4 left-[10%] animate-float hidden lg:block">
                <div className="glass h-16 w-16 rounded-2xl flex items-center justify-center glow-subtle">
                    <Shield className="h-8 w-8 text-primary" />
                </div>
            </div>
            <div className="absolute top-1/3 right-[15%] animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
                <div className="glass h-14 w-14 rounded-2xl flex items-center justify-center">
                    <Eye className="h-7 w-7 text-primary/80" />
                </div>
            </div>
            <div className="absolute top-[35%] left-[20%] animate-float hidden lg:block" style={{ animationDelay: '4s' }}>
                <div className="glass h-12 w-12 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>
    );
}
