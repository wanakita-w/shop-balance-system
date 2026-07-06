/**
 * Input Component — ช่องกรอกข้อมูลที่ใช้ทั่วทั้ง App
 *
 * Props:
 * - label: ป้ายชื่อ (Email, Password, etc.)
 * - type: ประเภท input (text, email, password, number)
 * - placeholder: ข้อความตัวอย่าง
 * - value: ค่าที่กรอก
 * - onChange: ฟังก์ชันเมื่อค่าเปลี่ยน
 * - error: ข้อความ error
 * - required: บังคับกรอกหรือไม่
 * - disabled: ปิดการใช้งานหรือไม่
 */
// props คือข้อมูลที่ส่งเข้ามาให้ component เพื่อใช้ในการแสดงผลหรือทำงานต่างๆ คล้ายกับ parameter ที่ส่งค่าไปทำงานในฟังก์ชัน แต่ props จะถูกส่งเป็น object และสามารถมีหลายค่าได้ ในขณะที่ parameter ในฟังก์ชันจะเป็นค่าที่ส่งไปทีละตัว
export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  ...rest // รับ props อื่นๆ ที่เหลือ
}) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-white dark:bg-gray-800
          border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 
          ${error ? "focus:ring-red-500" : "focus:ring-primary"}
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        `}
        {...rest}
      />

      {/* Error Message */}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
