import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        arabic: ['"Amiri"', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
          950: '#052e16',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        floatOrb1: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.08)" },
          "66%": { transform: "translate(-25px, 20px) scale(0.95)" },
        },
        floatOrb2: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(-35px, 30px) scale(1.12)" },
          "66%": { transform: "translate(25px, -20px) scale(0.92)" },
        },
        laserSweep: {
          "0%, 100%": { transform: "translateY(-10px)", opacity: "0.2" },
          "50%": { transform: "translateY(10px)", opacity: "1" },
        },
        radarSweep: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "20%": { opacity: "0.85" },
          "80%": { opacity: "0.85" },
          "100%": { transform: "translateX(250%)", opacity: "0" },
        }
      },
      animation: {
        "orb-1": "floatOrb1 18s ease-in-out infinite",
        "orb-2": "floatOrb2 22s ease-in-out infinite",
        "laser-sweep": "laserSweep 1.8s ease-in-out infinite",
        "radar-sweep": "radarSweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      }
    },
  },
  plugins: [],
};

export default config;
