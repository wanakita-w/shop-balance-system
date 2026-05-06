/** @type {import('tailwindcss').Config} */
export default {
  // บอก Tailwind ให้สแกนหา class ใน src ทั้งหมด
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
//content คือบอก Tailwind ให้สแกนหา class ในไฟล์พวกนี้ เพื่อ generate CSS เฉพาะที่ใช้จริงเท่านั้น ไม่งั้น CSS จะใหญ่มาก
