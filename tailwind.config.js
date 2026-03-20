/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#EAF6FF",
          300: "#7AD7FF",
          500: "#2AA9FF",
          700: "#006DFF",
          900: "#001B5E",
        },
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px #2AA9FF" },
          "100%": { boxShadow: "0 0 40px #2AA9FF" },
        },
        particles: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          "50%": { transform: "translateY(-20px) rotate(180deg)", opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
};
