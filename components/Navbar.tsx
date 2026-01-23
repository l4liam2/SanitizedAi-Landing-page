"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled || isMobileMenuOpen ? "glass-strong" : "bg-transparent"
                )}
            >
                <div className="container mx-auto px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <span className="text-xl font-bold tracking-tight">
                                Sanitized <span className="gradient-text">Ai</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link
                                href="#features"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                                {t.nav.features}
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                                {t.nav.howItWorks}
                            </Link>
                            <Link
                                href="#security"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                                {t.nav.security}
                            </Link>
                            <Link
                                href="#pricing"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                                {t.nav.pricing}
                            </Link>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium hover:bg-white/[0.05] hover:text-foreground h-9 rounded-lg px-4 transition-colors"
                            >
                                {t.nav.login}
                            </Link>
                            <Link
                                href="/intake"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:brightness-110 h-9 rounded-lg px-4 transition-all"
                            >
                                {t.nav.getStarted}
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            id="mobile-menu-btn"
                            aria-label="Open menu"
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="md:hidden fixed inset-x-0 top-[64px] bg-background/95 backdrop-blur-xl border-b border-white/10 p-6 shadow-2xl z-40 animate-in slide-in-from-top-4"
                    >
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="#features"
                                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 block"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t.nav.features}
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 block"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t.nav.howItWorks}
                            </Link>
                            <Link
                                href="#security"
                                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 block"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t.nav.security}
                            </Link>
                            <Link
                                href="#pricing"
                                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 block"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t.nav.pricing}
                            </Link>
                            <div className="pt-4 flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium hover:bg-white/[0.05] hover:text-foreground h-10 rounded-lg border border-white/10"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t.nav.login}
                                </Link>
                                <Link
                                    href="/intake"
                                    className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:brightness-110 h-10 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t.nav.getStarted}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
