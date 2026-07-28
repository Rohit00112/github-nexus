/** @type {import('tailwindcss').Config} */
import { nextui } from '@nextui-org/react';

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: '#fafafa',
            foreground: '#18181b',
            content1: '#ffffff',
            content2: '#f4f4f5',
            content3: '#e4e4e7',
            content4: '#d4d4d8',
            divider: '#e4e4e7',
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              DEFAULT: '#2563eb',
              foreground: '#ffffff',
            },
            focus: '#2563eb',
          },
          layout: {
            disabledOpacity: '0.3',
            radius: {
              small: '6px',
              medium: '8px',
              large: '12px',
            },
            borderWidth: {
              small: '1px',
              medium: '1px',
              large: '2px',
            },
          },
        },
        dark: {
          colors: {
            background: '#09090b',
            foreground: '#fafafa',
            content1: '#18181b',
            content2: '#27272a',
            content3: '#3f3f46',
            content4: '#52525b',
            divider: '#27272a',
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              DEFAULT: '#3b82f6',
              foreground: '#ffffff',
            },
            focus: '#3b82f6',
          },
          layout: {
            disabledOpacity: '0.3',
            radius: {
              small: '6px',
              medium: '8px',
              large: '12px',
            },
            borderWidth: {
              small: '1px',
              medium: '1px',
              large: '2px',
            },
          },
        },
      },
    }),
  ],
};

export default config;
