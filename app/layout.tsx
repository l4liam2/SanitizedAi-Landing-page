import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Sanitized Ai - Shadow AI Detection & PII Protection for Enterprises",
    description: "Monitor and protect your organization from shadow AI usage and sensitive data exposure in LLM prompts. Enterprise-grade security for the AI era.",
    keywords: ["Shadow AI", "AI Security", "PII Detection", "LLM Security", "Enterprise AI", "AI Data Leakage", "ChatGPT Security", "AI Compliance"],
    metadataBase: new URL('https://sanitized.ai'),
    openGraph: {
        title: "Sanitized Ai - Clear Shadow AI Risks With Sanitized Ai",
        description: "Monitor and protect your organization from shadow AI usage and sensitive data exposure in LLM prompts.",
        type: "website",
        images: ['/logo-horizontal-blue.png'],
    },
    twitter: {
        card: "summary_large_image",
        site: "@SanitizedAi",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
