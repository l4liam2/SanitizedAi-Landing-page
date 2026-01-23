"use client";

import { useTranslation } from "@/hooks/use-translation";

export function Security() {
    const { t } = useTranslation();

    return (
        <section id="security" className="py-24 relative overflow-hidden">
            <div className="container mx-auto relative z-10 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="eyebrow text-primary mb-4 block">{t.security.eyebrow}</span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                {t.security.titlePrefix}<br />
                                <span className="gradient-text">{t.security.titleSuffix}</span>
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8">
                                {t.security.subtitle}
                            </p>
                        </div>

                        <div className="relative">
                            <div className="glass-card p-6 glow-primary">
                                <div className="rounded-xl bg-background/50 border border-white/[0.05] overflow-hidden">
                                    <div className="p-4 border-b border-white/[0.05] flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-destructive/60"></div>
                                        <div className="h-3 w-3 rounded-full bg-warning/60"></div>
                                        <div className="h-3 w-3 rounded-full bg-success/60"></div>
                                        <span className="ml-2 text-xs text-muted-foreground font-mono">security-dashboard</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="glass p-3 rounded-xl">
                                                <div className="text-2xl font-bold text-primary">99.9%</div>
                                                <div className="eyebrow mt-1">{t.security.dashboardUptime}</div>
                                            </div>
                                            <div className="glass p-3 rounded-xl">
                                                <div className="text-2xl font-bold text-success">0</div>
                                                <div className="eyebrow mt-1">{t.security.dashboardBreaches}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 font-mono text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-success">✓</span>
                                                <span className="text-muted-foreground">{t.security.checkEncryption}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-success">✓</span>
                                                <span className="text-muted-foreground">{t.security.checkTokens}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-success">✓</span>
                                                <span className="text-muted-foreground">{t.security.checkLogs}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-primary animate-pulse">●</span>
                                                <span className="text-muted-foreground">{t.security.checkMonitoring}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-[60px]"></div>
                            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/15 blur-[60px]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
