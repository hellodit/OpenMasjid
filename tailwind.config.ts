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
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Lora"', 'Georgia', 'serif'],
        arab: ['"Amiri"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
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
