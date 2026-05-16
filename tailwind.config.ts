import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // TV display (dark theme) — keep as-is
        bg: 'oklch(0.18 0.04 155)',
        'bg-2': 'oklch(0.22 0.05 155)',
        'bg-3': 'oklch(0.28 0.06 155)',
        line: 'oklch(0.32 0.05 155)',
        'line-soft': 'oklch(0.26 0.05 155 / 0.6)',
        ink: 'oklch(0.97 0.015 90)',
        'ink-2': 'oklch(0.85 0.03 100)',
        muted: 'oklch(0.65 0.04 145)',
        gold: 'oklch(0.78 0.10 78)',
        'gold-2': 'oklch(0.85 0.07 78)',
        'green-glow': 'oklch(0.55 0.10 155)',
        rose: 'oklch(0.70 0.12 25)',

        // CMS (cream theme)
        'cms-bg': '#ffffff',
        'cms-surface': '#ffffff',
        'cms-surface-2': 'oklch(0.975 0.012 95)',
        'cms-border': 'oklch(0.91 0.012 100)',
        'cms-border-strong': 'oklch(0.84 0.015 100)',
        'cms-ink': 'oklch(0.22 0.025 155)',
        'cms-ink-2': 'oklch(0.36 0.025 155)',
        'cms-muted': 'oklch(0.55 0.018 145)',
        'cms-muted-2': 'oklch(0.68 0.012 140)',
        'cms-gold': 'oklch(0.72 0.10 78)',
        'cms-gold-soft': 'oklch(0.93 0.04 78)',
        'cms-gold-ink': 'oklch(0.45 0.10 78)',
        'cms-rose': 'oklch(0.62 0.13 25)',
        'cms-rose-soft': 'oklch(0.95 0.025 25)',
        'cms-info': 'oklch(0.58 0.10 240)',
        'cms-info-soft': 'oklch(0.94 0.03 240)',
        'cms-green-50': 'oklch(0.97 0.015 155)',
        'cms-green-100': 'oklch(0.94 0.03 155)',
        'cms-green-300': 'oklch(0.85 0.06 155)',
        'cms-green-500': 'oklch(0.65 0.09 155)',
        'cms-green-600': 'oklch(0.55 0.10 155)',
        'cms-green-700': 'oklch(0.45 0.10 155)',
        'cms-green-800': 'oklch(0.36 0.09 155)',
        'cms-green-900': 'oklch(0.28 0.06 155)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Lora"', 'Georgia', 'serif'],
        arab: ['"Amiri"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'cms-xs': '0 1px 0 rgba(20, 50, 35, 0.04)',
        'cms-sm': '0 1px 2px rgba(20, 50, 35, 0.05), 0 1px 0 rgba(20, 50, 35, 0.03)',
        'cms': '0 6px 18px -8px rgba(20, 50, 35, 0.12), 0 1px 2px rgba(20, 50, 35, 0.05)',
        'cms-lg': '0 24px 48px -24px rgba(20, 50, 35, 0.22), 0 2px 6px rgba(20, 50, 35, 0.06)',
        'cms-primary': '0 1px 0 oklch(0.55 0.12 155) inset, 0 6px 14px -6px oklch(0.45 0.10 155 / 0.5)',
      },
      borderRadius: {
        'cms-sm': '8px',
        'cms': '12px',
        'cms-lg': '18px',
        'cms-xl': '24px',
      },
      keyframes: {
        'gold-pulse': {
          '0%':   { boxShadow: '0 0 0 0 oklch(0.78 0.10 78 / 0.7)' },
          '70%':  { boxShadow: '0 0 0 14px oklch(0.78 0.10 78 / 0)' },
          '100%': { boxShadow: '0 0 0 0 oklch(0.78 0.10 78 / 0)' },
        },
        'marquee-scroll': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'gold-pulse': 'gold-pulse 1.6s ease-in-out infinite',
        'marquee-scroll': 'marquee-scroll 60s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
