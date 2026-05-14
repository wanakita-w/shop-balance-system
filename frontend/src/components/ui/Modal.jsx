/**
 * Modal Component — Popup ที่แสดงทับหน้าจอ
 *
 * Props:
 * - isOpen: เปิด/ปิด modal (true/false)
 * - onClose: ฟังก์ชันเมื่อปิด modal
 * - title: หัวข้อ modal
 * - children: เนื้อหาใน modal
 * - size: ขนาด modal ('sm', 'md', 'lg', 'full')
 */

import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  // ปิด modal เมื่อกด Escape (ปุ่ม Esc จะมี key เป็น "Escape") e.key คือการตรวจสอบว่าปุ่มที่กดคือปุ่มอะไร
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // ป้องกัน scroll เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ถ้าไม่เปิด ไม่แสดงอะไร
  if (!isOpen) return null;

  // ขนาด modal
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    full: "max-w-full mx-4",
  };

  return (
    <>
      {/* Backdrop — พื้นหลังมืด */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            ${sizes[size]} w-full
            bg-white dark:bg-gray-800 
            rounded-xl shadow-2xl
            transform transition-all
            max-h-[90vh] overflow-y-auto
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
