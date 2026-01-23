"use client";

import { useSearchParams } from "next/navigation";
import { dictionaries, type Lang } from "@/lib/i18n-data";

export function useTranslation() {
    const searchParams = useSearchParams();
    const langParam = searchParams.get("lang");

    // Default to 'en' if lang param is missing or invalid
    const lang: Lang = (langParam && (langParam in dictionaries)) ? (langParam as Lang) : "en";

    return {
        t: dictionaries[lang],
        lang
    };
}
