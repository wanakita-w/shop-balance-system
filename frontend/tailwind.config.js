/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class", // ← เพิ่มบรรทัดนี้
  theme: {
    extend: {
      colors: {
        // Light mode
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1e40af",
          light: "#dbeafe",
        },
        // Background
        background: {
          light: "#f8fafc",
          dark: "#0f172a",
        },
        // Card
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};
