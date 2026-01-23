import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                background: '#0f172a', /* slate-900 */
                foreground: '#f8fafc', /* slate-50 */
                primary: {
                    DEFAULT: '#3b82f6', /* blue-500 */
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: '#1e293b', /* slate-800 */
                    foreground: '#94a3b8', /* slate-400 */
                },
                accent: {
                    DEFAULT: '#1e293b',
                    foreground: '#f8fafc',
                },
                destructive: '#ef4444',
                warning: '#f59e0b',
                success: '#22c55e',
                border: 'rgba(255, 255, 255, 0.08)',
                input: 'rgba(0, 0, 0, 0.2)',
                ring: '#3b82f6',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 8s ease-in-out infinite alternate',
                'button-pulse': 'button-pulse 2s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%': { transform: 'scale(1)', opacity: '0.8' },
                    '100%': { transform: 'scale(1.1)', opacity: '1' },
                },
                'button-pulse': {
                    '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.7)' },
                    '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 15px rgba(245, 158, 11, 0)' },
                    '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(245, 158, 11, 0)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
