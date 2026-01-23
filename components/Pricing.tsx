"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function Pricing() {
    const { t } = useTranslation();

    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full transform translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto rounded-3xl glass-strong border border-white/10 p-8 md:p-12 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-500"></div>

                    <div className="relative z-10">
                        <span className="badge-pill mb-6 text-primary border-primary/20 bg-primary/5">{t.pricing.badge}</span>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            {t.pricing.titlePrefix} <span className="gradient-text">{t.pricing.titleSuffix}</span>
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            {t.pricing.subtitle}
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
                            <div className="flex items-center gap-3 text-sm text-foreground bg-white/[0.03] p-3 rounded-lg border border-white/5">
                                <Check className="h-4 w-4 text-primary shrink-0" />
                                <span>{t.pricing.featureSeats}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground bg-white/[0.03] p-3 rounded-lg border border-white/5">
                                <Check className="h-4 w-4 text-primary shrink-0" />
                                <span>{t.pricing.featurePii}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground bg-white/[0.03] p-3 rounded-lg border border-white/5">
                                <Check className="h-4 w-4 text-primary shrink-0" />
                                <span>{t.pricing.featureSupport}</span>
                            </div>
                        </div>

                        <Link
                            href="mailto:sales@sanitized.ai"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-white text-[#0f172a] hover:bg-white/90 font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02]"
                        >
                            {t.pricing.cta}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
