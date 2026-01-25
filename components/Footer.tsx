"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="py-12 border-t border-white/10 relative z-10 bg-background">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 md:flex-1">
                        <span className="text-lg font-bold tracking-tight">
                            Sanitized <span className="gradient-text">Ai</span>
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                        {t.footer.rights}
                    </p>

                    <div className="flex items-center gap-6 md:flex-1 md:justify-end">
                        <Link
                            href="/blog"
                            className="text-sm text-neutral-500 hover:text-white transition-colors"
                        >
                            {t.nav.blog}
                        </Link>
                        <Link
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            aria-label={t.footer.linkedin}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-linkedin"
                            >
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect width="4" height="12" x="2" y="9" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer >
    );
}
