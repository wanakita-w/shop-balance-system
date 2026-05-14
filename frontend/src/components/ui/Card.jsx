/**
 * Card Component — การ์ดสวยๆ ที่ใช้ทั่วทั้ง App
 *
 * Props:
 * - children: เนื้อหาภายในการ์ด
 * - className: class เพิ่มเติม
 * - padding: ขนาด padding ('none', 'sm', 'md', 'lg')
 * - hover: เมื่อ hover มีเอฟเฟกต์ไหม
 */

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}) {
  // Base styles — สไตล์พื้นฐาน
  const baseStyles =
    "bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200";

  // Padding sizes
  const paddingSizes = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  // Hover effect
  const hoverEffect = hover
    ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    : "shadow-sm";

  return (
    <div
      className={`${baseStyles} ${paddingSizes[padding]} ${hoverEffect} ${className}`}
    >
      {children}
    </div>
  );
}
