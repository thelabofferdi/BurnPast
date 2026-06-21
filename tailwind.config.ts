import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
    content: [
        './app/**/*.{js,vue,ts}',
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
    ],
    theme: {
        extend: {
            colors: {
                background: '#ffffff',
                surface: '#f8f9fa',
                primary: {
                    DEFAULT: '#ff6b35', // Orange
                    hover: '#e85a2d',
                },
                secondary: '#ffd93d', // Yellow
                text: {
                    primary: '#1a1a1a',
                    secondary: '#6c757d',
                },
                border: '#e9ecef',
                // Keep some existing colors for utility
                code: '#00ff9d',
                danger: '#ff4444',
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            backgroundImage: {
                'gradient-text': 'linear-gradient(90deg, #ff6b35 0%, #ffd93d 100%)',
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'window': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
} satisfies Config
