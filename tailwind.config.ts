import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ["var(--font-outfit)", ...defaultTheme.fontFamily.sans],
    },
  },
  darkMode: "class", // enable dark mode with class strategy
  plugins: [tailwindcssAnimate],
};

export default config;
