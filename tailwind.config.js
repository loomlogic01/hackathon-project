/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1628",
          900: "#0f1f38",
          800: "#152a49",
          700: "#1c3660",
          600: "#254377",
          500: "#2f5391",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#2f5391",
          600: "#254377",
          700: "#1c3660",
        },
        pass: { 50: "#f0faf4", 100: "#dcf5e5", 500: "#1f9d55", 600: "#16803f", 700: "#166534" },
        review: { 50: "#fffaeb", 100: "#fef0c7", 500: "#d97706", 600: "#b45309", 700: "#92400e" },
        fail: { 50: "#fef2f2", 100: "#fde2e2", 500: "#dc2626", 600: "#b91c1c", 700: "#991b1b" },
        info: { 50: "#eff6ff", 100: "#dbeafe", 500: "#2563eb", 600: "#1d4ed8" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 31, 56, 0.06), 0 1px 3px 0 rgba(15, 31, 56, 0.08)",
      },
    },
  },
  plugins: [],
};
