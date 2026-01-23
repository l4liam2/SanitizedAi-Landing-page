"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Send } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function IntakePage() {
    const { t } = useTranslation();
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    // In a real Next.js app, we could use Server Actions. 
    // For now, we'll keep the FormSubmit.co endpoint but handle it better visually, or just use standard form behavior.
    // The original form used standard form submission which redirects. 
    // Let's implement handlesubmit to show loading state at least.

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // If we want to use the redirect behavior of formsubmit, we don't preventdefault unless we fetch manually.
        // Let's stick to simple form submission for reliability, but set status to submitting.
        setFormStatus('submitting');
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center relative overflow-hidden">
                {/* Ambient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto max-w-2xl relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        {t.nav.backToHome}
                    </Link>

                    <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {t.intake.titlePrefix} <span className="gradient-text">Sanitized Ai</span>
                            </h1>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {t.intake.subtitle}
                            </p>
                        </div>

                        <form
                            action="https://formsubmit.co/7b25cd2910d31abac6d0e57729834931"
                            method="POST"
                            className="space-y-6"
                            onSubmit={handleSubmit}
                        >
                            {/* FormSubmit Config */}
                            <input type="hidden" name="_subject" value="New Sanitized AI Intake Request" />
                            <input type="hidden" name="_template" value="table" />
                            <input type="hidden" name="_captcha" value="true" />
                            {/* Redirect back to index or a thank you page? Standard behavior is formsubmit page. Let's redirect to home for now or leave default. */}
                            <input type="hidden" name="_next" value="https://sanitized.ai" />

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                                        {t.intake.form.name}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:bg-black/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                        placeholder={t.intake.form.namePlaceholder}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        {t.intake.form.email}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:bg-black/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                        placeholder={t.intake.form.emailPlaceholder}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="company" className="text-sm font-medium text-foreground">
                                        {t.intake.form.company}
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:bg-black/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                        placeholder={t.intake.form.companyPlaceholder}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="role" className="text-sm font-medium text-foreground">
                                        {t.intake.form.role}
                                    </label>
                                    <input
                                        type="text"
                                        id="role"
                                        name="role"
                                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:bg-black/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                        placeholder={t.intake.form.rolePlaceholder}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="interest" className="text-sm font-medium text-foreground">
                                    {t.intake.form.interestLabel}
                                </label>
                                <div className="relative">
                                    <select
                                        id="interest"
                                        name="interest"
                                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:bg-black/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="access" className="bg-slate-900">{t.intake.form.interestOptions.access}</option>
                                        <option value="demo" className="bg-slate-900">{t.intake.form.interestOptions.demo}</option>
                                        <option value="general" className="bg-slate-900">{t.intake.form.interestOptions.general}</option>
                                    </select>
                                    {/* Custom arrow for styling since appearance-none removes it */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-foreground">
                                    {t.intake.form.message}
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:bg-black/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50"
                                    placeholder={t.intake.form.messagePlaceholder}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={formStatus === 'submitting'}
                                className="w-full py-4 mt-6 bg-gradient-to-br from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/25 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:grayscale flex items-center justify-center gap-2"
                            >
                                {formStatus === 'submitting' ? (
                                    <>
                                        <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        {t.intake.form.submit}
                                        <Send className="h-5 w-5" />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                {t.intake.form.microcopy}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
