import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "supply-bold": ["SupplyBold", "sans-serif"],
        "supply-medium": ["SupplyMedium", "sans-serif"],
        "supply-light": ["SupplyLight", "sans-serif"],
        "supply-regular": ["SupplyRegular", "sans-serif"],
      },
      keyframes: {
        "spin-variable": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "spin-slow": "spin 5s linear infinite",
        "spin-variable":
          "spin-variable 8s cubic-bezier(0.4, 0.2, 0.6, 0.8) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
