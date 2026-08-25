import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8f0',
          100: '#f5efdb',
          200: '#ebdcb2',
          300: '#dfba73',
          400: '#d4a84b',
          500: '#c59b27',
          600: '#b0841d',
          700: '#8c6419',
          800: '#73501a',
          900: '#61431a',
          950: '#38230b',
        },
        dark: {
          950: '#09090b',
          900: '#111114',
          850: '#16161b',
          800: '#1d1d24',
          750: '#25252e',
          700: '#32323e',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #dfba73 0%, #c59b27 50%, #997534 100%)',
        'dark-card': 'linear-gradient(180deg, rgba(29, 29, 36, 0.8) 0%, rgba(17, 17, 20, 0.95) 100%)',
      },
      boxShadow: {
        'gold': '0 4px 20px -2px rgba(197, 155, 39, 0.25)',
        'gold-lg': '0 10px 30px -4px rgba(197, 155, 39, 0.35)',
      }
    },
  },
  plugins: [],
};
export default config;
