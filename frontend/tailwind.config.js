// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // or module.exports if using CJS
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}", // For Next.js if you use /pages
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}", // For Next.js /app dir
    "./src/**/*.{ts,tsx}", // For Vite /src dir
  ],
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
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          // Added for completeness
          from: { height: "0px" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          // Added for completeness
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out", // Added
        "collapsible-up": "collapsible-up 0.2s ease-out", // Added
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
