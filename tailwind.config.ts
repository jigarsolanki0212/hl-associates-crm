import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      '2xs': '320px',
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        brand: {
          navy: '#041627',
          blue: '#0040e0',
          focusBlue: '#1A73E8',
          dark: '#020d18',
          lightNavy: '#0a2540',
        },
        surface: {
          app: '#fbf9fa',
          card: '#ffffff',
          secondary: '#f5f3f5',
          hover: '#e5eeff',
          subtle: '#e9e7e9',
          borderSubtle: '#e4e2e3',
          border: '#e2e8f0',
        },
        status: {
          newBg: '#e5eeff',
          newText: '#0040e0',
          proformaBg: '#f3e8ff',
          proformaText: '#7c3aed',
          acceptedBg: '#dcfce7',
          acceptedText: '#1a853c',
          convertedBg: '#dcfce7',
          convertedText: '#1a853c',
          lostBg: '#f3f4f6',
          lostText: '#4b5563',
          expiringBg: '#fef3c7',
          expiringText: '#ca8a04',
          urgentBg: '#fee2e2',
          urgentText: '#ba1a1a',
        },
      },
      borderRadius: {
        none: '0',
        sm: '2px', // Status badges: 2px
        DEFAULT: '4px', // Inputs & Buttons: 4px
        md: '6px',
        lg: '8px', // Cards: 8px
        xl: '12px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '1440px',
      },
      spacing: {
        sidebarExpanded: '280px',
        sidebarCollapsed: '72px',
        desktopEdge: '32px',
        gutter: '24px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        modal: '0 10px 25px -5px rgba(4, 22, 39, 0.1), 0 8px 10px -6px rgba(4, 22, 39, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
