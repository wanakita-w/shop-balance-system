/**
 * Button Component — ปุ่มที่ใช้ทั่วทั้ง App
 *
 * Props:
 * - children: ข้อความในปุ่ม
 * - onClick: ฟังก์ชันที่จะรันเมื่อกดปุ่ม
 * - variant: สไตล์ปุ่ม ('primary', 'secondary', 'danger')
 * - fullWidth: ปุ่มเต็มความกว้างหรือไม่
 * - disabled: ปิดการใช้งานปุ่ม
 */

export default function Button({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  type = "button",
}) {
  // Base styles — สไตล์พื้นฐานทุกปุ่ม
  const baseStyles =
    "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant styles — สไตล์แต่ละแบบ
  const variants = {
    primary:
      "bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md active:scale-95",
    secondary:
      "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md active:scale-95",
  };

  // Full width style
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthStyle}`}
    >
      {children}
    </button>
  );
}
