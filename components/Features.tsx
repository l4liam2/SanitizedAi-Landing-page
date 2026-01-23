"use client";

import { Eye, AlertTriangle, FileSearch, BarChart2, Lock, Users } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function Features() {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Eye className="h-6 w-6 text-primary" />,
            title: t.features.card1Title,
            desc: t.features.card1Desc,
        },
        {
            icon: <AlertTriangle className="h-6 w-6 text-primary" />,
            title: t.features.card2Title,
            desc: t.features.card2Desc,
            glow: "glow-subtle",
        },
        {
            icon: <FileSearch className="h-6 w-6 text-primary" />,
            title: t.features.card3Title,
            desc: t.features.card3Desc,
        },
        {
            icon: <BarChart2 className="h-6 w-6 text-primary" />,
            title: t.features.card4Title,
            desc: t.features.card4Desc,
        },
        {
            icon: <Lock className="h-6 w-6 text-primary" />,
            title: t.features.card5Title,
            desc: t.features.card5Desc,
        },
        {
            icon: <Users className="h-6 w-6 text-primary" />,
            title: t.features.card6Title,
            desc: t.features.card6Desc,
        },
    ];

    return (
        <section id="features" className="py-24 relative">
            <div className="container mx-auto relative z-10 px-6">
                <div className="max-w-2xl mx-auto text-center mb-16">
                    <span className="eyebrow text-primary mb-4 block">{t.features.eyebrow}</span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t.features.titlePrefix}<br />
                        <span className="gradient-text">{t.features.titleSuffix}</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        {t.features.subtitle}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`glass-card p-6 card-hover ${feature.glow || ''}`}
                        >
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
