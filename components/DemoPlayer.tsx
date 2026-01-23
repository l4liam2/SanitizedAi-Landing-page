"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Maximize2, Minimize2, RotateCcw, ArrowLeft, Play } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

type StepType = 'intro' | 'transition' | 'end' | 'normal';

interface DemoStep {
    id: number | string;
    type?: StepType;
    nextStep?: number | string;
    image?: string;
    title?: string;
    subtitle?: string;
    hotspots?: { x: number; y: number; text: string; nextStep?: number | string }[];
    annotations?: { x: number; y: number; text: string }[];
}

export function DemoPlayer() {
    const { t } = useTranslation();
    const [currentStepId, setCurrentStepId] = useState<number | string>('intro');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useState<(number | string)[]>([]);

    // Demo Data - Mapped from original script.js but using translation keys where possible
    // We use the raw keys here, and the component will use t.demo[key] or fallback
    // Actually, t is a nested object, so we need to access via path or just use the translated strings directly if we structure data to use keys.
    // For simplicity given the translation hook structure, I'll map keys to the t object.

    // Helper to resolve translation key or return raw string
    // In this app, t is the dictionary object. 
    // We'll construct the data array inside the component so it reacts to language changes.

    const demoData: DemoStep[] = [
        { id: 'intro', type: 'intro', nextStep: 1 },
        {
            id: 1,
            image: '/demo/1.png',
            hotspots: [{ x: 87.5, y: 6.5, text: t.demo.step1, nextStep: 2 }]
        },
        {
            id: 2,
            image: '/demo/2.png',
            hotspots: [{ x: 34, y: 51, text: t.demo.step2, nextStep: 3 }]
        },
        {
            id: 3,
            image: '/demo/3.png',
            hotspots: [{ x: 72, y: 67, text: t.demo.step3, nextStep: 4 }]
        },
        {
            id: 4,
            image: '/demo/4.png',
            hotspots: [{ x: 91.5, y: 71, text: t.demo.step4, nextStep: 5 }],
            annotations: [{ x: 75, y: 40, text: t.demo.step4_annotation }]
        },
        {
            id: 5,
            image: '/demo/5.png',
            hotspots: [{ x: 60.5, y: 21.5, text: t.demo.step5, nextStep: 'transition-1' }]
        },
        {
            id: 'transition-1',
            type: 'transition',
            title: t.demo.transition.title,
            subtitle: t.demo.transition.subtitle,
            nextStep: 6
        },
        {
            id: 6,
            image: '/demo/6.png',
            hotspots: [{ x: 12, y: 29, text: t.demo.step6, nextStep: 7 }]
        },
        {
            id: 7,
            image: '/demo/7.png',
            hotspots: [{ x: 47, y: 60, text: t.demo.step7, nextStep: 'end' }]
        },
        { id: 'end', type: 'end' }
    ];

    const currentStep = demoData.find(s => s.id === currentStepId) || demoData[0];

    // Preload images
    useEffect(() => {
        const imagesToLoad = demoData
            .filter(s => s.image)
            .map(s => s.image as string);

        let loadedCount = 0;
        if (imagesToLoad.length === 0) {
            setIsLoading(false);
            return;
        }

        imagesToLoad.forEach(src => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === imagesToLoad.length) setIsLoading(false);
            };
            img.onerror = () => {
                // Continue anyway
                loadedCount++;
                if (loadedCount === imagesToLoad.length) setIsLoading(false);
            };
        });
    }, []);

    const goToStep = (stepId: number | string) => {
        setHistory(prev => [...prev, currentStepId]);
        setCurrentStepId(stepId);
    };

    const goBack = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setCurrentStepId(previous);
    };

    const restart = () => {
        setHistory([]);
        setCurrentStepId('intro');
    };

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Calculate progress
    // Real steps are 1-7
    const totalRealSteps = 7;
    const currentStepNum = typeof currentStepId === 'number' ? currentStepId :
        (currentStepId === 'end' ? 7 : (currentStepId === 'intro' ? 0 : 5.5)); // 5.5 for transition logic hack
    const progress = (currentStepNum / totalRealSteps) * 100;

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full aspect-video bg-slate-900 overflow-hidden group border border-white/10 shadow-2xl transition-all duration-500",
                !isFullscreen && "rounded-2xl",
                isFullscreen && "flex items-center justify-center bg-black"
            )}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-50 bg-slate-900">
                    {t.demo.loading}
                </div>
            )}

            {/* Top Bar Controls */}
            <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {currentStepId !== 'intro' && (
                    <button
                        onClick={restart}
                        className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                        aria-label={t.demo.restart}
                    >
                        <RotateCcw className="h-5 w-5" />
                    </button>
                )}
                <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                    aria-label={isFullscreen ? "Minimize" : "Maximize"}
                >
                    {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
            </div>

            {/* Back Button */}
            {currentStepId !== 'intro' && history.length > 0 && (
                <button
                    onClick={goBack}
                    className="absolute top-4 left-4 z-30 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
            )}

            {/* Content Area */}
            <div className={cn("relative w-full h-full", isFullscreen && "max-w-[177.78vh]")}> {/* 16:9 check */}

                {/* Intro Screen */}
                {currentStep.type === 'intro' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#0f172a_100%)] z-50">
                        <div className="animate-in slide-in-from-bottom-5 duration-700">
                            {/* Removed icon to match original text-only style if preferred, or kept if user likes it. 
                                 Original css had h1 with gradient text. */}
                            <h1 className="text-[3.5rem] font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-[#a5b4fc]">
                                Sanitized Ai
                            </h1>
                            <p className="text-slate-400 mb-12 text-xl font-light">{t.demo.intro.subtitle}</p>
                            <button
                                onClick={() => goToStep(1)}
                                className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 px-12 py-5 rounded-full text-xl font-bold transition-all animate-button-pulse hover:animate-none hover:scale-105 hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.6)]"
                            >
                                {t.demo.intro.start}
                            </button>
                        </div>
                    </div>
                )}

                {/* Transition Screen */}
                {currentStep.type === 'transition' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-slate-900/95 backdrop-blur-md z-40 animate-in fade-in duration-500">
                        <h1 className="text-[2.5rem] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                            {currentStep.title}
                        </h1>
                        <p className="text-slate-300 mb-8 text-xl max-w-2xl">{currentStep.subtitle}</p>
                        <button
                            onClick={() => currentStep.nextStep && goToStep(currentStep.nextStep)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-3 rounded-xl text-base font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse hover:animate-none hover:-translate-y-0.5"
                        >
                            {t.demo.transition.continue}
                        </button>
                    </div>
                )}

                {/* End Screen */}
                {currentStep.type === 'end' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-slate-900 to-slate-800 animate-in fade-in duration-500">
                        <h3 className="text-3xl font-bold mb-3">{t.demo.end.title}</h3>
                        <p className="text-muted-foreground mb-8 text-lg">{t.demo.end.subtitle}</p>
                        <div className="flex gap-4">
                            <a
                                href="/intake"
                                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-500/50 hover:-translate-y-0.5"
                            >
                                {t.demo.end.cta}
                            </a>
                            <button
                                onClick={restart}
                                className="border border-white/20 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-colors"
                            >
                                {t.demo.end.restart}
                            </button>
                        </div>
                    </div>
                )}

                {/* Normal Step Image & Hotspots */}
                {!['intro', 'transition', 'end'].includes(currentStep.type || '') && (
                    <div className="relative w-full h-full animate-in fade-in duration-300">
                        {currentStep.image && (
                            <Image
                                src={currentStep.image}
                                alt={`Step ${currentStep.id}`}
                                fill
                                className="object-contain"
                                priority
                            />
                        )}

                        {/* Hotspots layer */}
                        <div className="absolute inset-0 pointer-events-none">
                            {currentStep.hotspots?.map((hs, i) => (
                                <div
                                    key={i}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group z-10"
                                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                                    onClick={() => hs.nextStep && goToStep(hs.nextStep)}
                                >
                                    {/* Ring Animation matching original CSS */}
                                    <div className="absolute inset-0 rounded-full bg-[#6366f1]/60 animate-ping opacity-75"></div>

                                    {/* Dot */}
                                    <div className="relative h-8 w-8">
                                        <div className="absolute inset-2 bg-[#6366f1] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-transform duration-200 group-hover:scale-125 group-hover:bg-white"></div>
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute left-1/2 top-[140%] -translate-x-1/2 -translate-y-2 bg-slate-900/95 text-white text-sm px-4 py-2 rounded-md whitespace-normal max-w-[250px] text-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-0 transition-all duration-300 shadow-md pointer-events-none after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-ml-[6px] after:border-[6px] after:border-transparent after:border-b-slate-900/95">
                                        {hs.text}
                                    </div>
                                </div>
                            ))}

                            {/* Annotations layer */}
                            {currentStep.annotations?.map((note, i) => (
                                <div
                                    key={`note-${i}`}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 bg-slate-900/85 backdrop-blur-md border border-white/15 text-white p-5 rounded-xl text-base leading-relaxed max-w-[300px] shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-4 duration-800 ease-out"
                                    style={{ left: `${note.x}%`, top: `${note.y}%` }}
                                >
                                    {note.text}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {currentStepId !== 'intro' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div
                        className="h-full bg-amber-500 transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
}
