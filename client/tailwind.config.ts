import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#08080d',
          secondary: '#0f0f17',
          card: '#14141f',
          elevated: '#1a1a2e',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover: 'rgba(255,255,255,0.12)',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#8888a0',
          muted: '#55556a',
        },
        accent: {
          DEFAULT: '#6c5ce7',
          glow: 'rgba(108, 92, 231, 0.3)',
        },
        burn: {
          DEFAULT: '#ff6b35',
          glow: 'rgba(255, 107, 53, 0.4)',
        },
        success: '#00d68f',
        danger: '#ff4757',
        'card-red': '#ef4444',
        'card-black': '#e2e2f0',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(100px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
