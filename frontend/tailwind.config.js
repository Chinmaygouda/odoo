/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0F',
        ink: '#111118',
        slate: '#1A1A28',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
        },
        teal: '#2DD4BF',
        cream: '#F5F0E8',
        muted: '#6B6B7A',
        ruby: '#E85D75',
        emerald: '#10B981',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
