"use client";

import { Download, ChevronRight, ScanSearch, Bell, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function HowItWorks() {
    const { t } = useTranslation();

    const steps = [
        {
            icon: <Download />,
            title: t.how.step1Title,
            desc: t.how.step1Desc,
            num: "01"
        },
        {
            icon: <ScanSearch />,
            title: t.how.step2Title,
            desc: t.how.step2Desc,
            num: "02"
        },
        {
            icon: <Bell />,
            title: t.how.step3Title,
            desc: t.how.step3Desc,
            num: "03"
        },
        {
            icon: <ShieldCheck />,
            title: t.how.step4Title,
            desc: t.how.step4Desc,
            num: "04"
        }
    ];

    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full transform -translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-2xl mx-auto text-center mb-16">
                    <span className="eyebrow text-primary mb-4 block">{t.how.eyebrow}</span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t.how.titlePrefix}<br />
                        <span className="gradient-text">{t.how.titleSuffix}</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        {t.how.subtitle}
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Desktop Chevrons */}
                    <div className="hidden md:block absolute top-[28px] inset-x-0 z-0 pointer-events-none">
                        <div className="relative w-full h-full">
                            {[1, 2, 3].map((pos) => (
                                <div key={pos} className={`absolute left-${pos}/4 -translate-x-1/2 flex justify-center`} style={{ left: `${pos * 25}%` }}>
                                    <ChevronRight className="text-primary/20 w-8 h-8" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="relative mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 relative z-10 bg-[#020617]">
                                        <span className="[&>svg]:w-6 [&>svg]:h-6">{step.icon}</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border border-background z-20">
                                        {step.num}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
