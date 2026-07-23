/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.jsx',
    './resources/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#00143C', deep: '#1A1A2E', light: '#0F2D5C' },
        gold:   { DEFAULT: '#C9A84C', light: '#E0C97A', pale: '#F5EDD4' },
        green:  { DEFAULT: '#0F6E56', light: '#17A882' },
        cream:  { DEFAULT: '#F7F5F0', dark: '#EDE9E0' },
        blue:   { DEFAULT: '#3C8CB4', light: '#5BA3CA' },
        gray:   { soft: '#8892A4' },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
        // Arabic premium
        arabic:         ['Tajawal', 'Noto Naskh Arabic', 'sans-serif'],
        'arabic-serif': ['Noto Naskh Arabic', 'Tajawal', 'serif'],
        'arabic-bold':  ['Tajawal', 'sans-serif'],
      },
      borderRadius: {
        '2xl':  '16px',
        '3xl':  '24px',
        '4xl':  '32px',
        '5xl':  '40px',
      },
      boxShadow: {
        'soft':  '0 4px 24px rgba(0,20,60,0.08)',
        'card':  '0 8px 40px rgba(0,20,60,0.12)',
        'float': '0 24px 64px rgba(0,20,60,0.18)',
        'gold':  '0 0 32px rgba(201,168,76,0.5)',
        'green': '0 8px 32px rgba(15,110,86,0.3)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C, #E0C97A)',
        'navy-gradient': 'linear-gradient(135deg, #00143C, #0F2D5C)',
        'green-gradient':'linear-gradient(135deg, #0F6E56, #17A882)',
      },
      animation: {
        'float': 'float-particle 4s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        'float-particle': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.4' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
