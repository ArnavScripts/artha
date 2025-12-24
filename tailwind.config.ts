import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', ...defaultTheme.fontFamily.sans],
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // ARTHA Brand Colors
        artha: {
          ceramic: "hsl(var(--artha-ceramic))",
          "ceramic-light": "hsl(var(--artha-ceramic-light))",
          steel: "hsl(var(--artha-steel))",
          "steel-light": "hsl(var(--artha-steel-light))",
          vedic: "hsl(var(--artha-vedic))",
          "vedic-light": "hsl(var(--artha-vedic-light))",
          gold: "hsl(var(--artha-gold))",
          "gold-light": "hsl(var(--artha-gold-light))",
          "gold-hover": "hsl(var(--artha-gold-hover))",
          "gold-glow": "hsl(var(--artha-gold-glow))",
        },
        // Carbon Mode Colors
        carbon: {
          risk: "hsl(var(--carbon-risk))",
          "risk-light": "hsl(var(--carbon-risk-light))",
          success: "hsl(var(--carbon-success))",
          "success-light": "hsl(var(--carbon-success-light))",
          warning: "hsl(var(--carbon-warning))",
          "warning-light": "hsl(var(--carbon-warning-light))",
          slate: "hsl(var(--carbon-slate))",
          "slate-light": "hsl(var(--carbon-slate-light))",
          tech: "hsl(var(--carbon-tech))",
          "tech-light": "hsl(var(--carbon-tech-light))",
        },
        // Green Mode Colors
        green: {
          primary: "hsl(var(--green-primary))",
          "primary-light": "hsl(var(--green-primary-light))",
          accent: "hsl(var(--green-accent))",
          "accent-light": "hsl(var(--green-accent-light))",
          earth: "hsl(var(--green-earth))",
          "earth-light": "hsl(var(--green-earth-light))",
          sage: "hsl(var(--green-sage))",
          forest: "hsl(var(--green-forest))",
          solar: "hsl(var(--green-solar))",
          "solar-light": "hsl(var(--green-solar-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      // Strict Z-Index Scale to prevent z-index wars
      zIndex: {
        'base': '0',
        'raised': '10',
        'dropdown': '20',
        'header': '30',
        'sidebar': '40',
        'modal': '50',
        'tooltip': '60',
        'toast': '70',
      },
      boxShadow: {
        "glow-green": "var(--shadow-glow-green)",
        "glow-sage": "var(--shadow-glow-sage)",
        "glow-ai": "var(--shadow-glow-sage)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "sage-breathe": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(270 60% 55% / 0.3), 0 0 40px hsl(280 60% 45% / 0.15)" },
          "50%": { boxShadow: "0 0 35px hsl(270 60% 55% / 0.5), 0 0 70px hsl(280 60% 45% / 0.3)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "sage-breathe": "sage-breathe 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;