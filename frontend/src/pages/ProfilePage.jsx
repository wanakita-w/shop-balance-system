import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [mode, setMode] = useState(null); // "name" | "password" | null

  const [name, setName] = useState(user?.name || "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const openMode = (m) => {
    setMode(m);
    setNameError("");
    setNameSuccess(false);
    setPwError("");
    setPwSuccess(false);
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setNameError("กรุณากรอกชื่อ"); return; }
    setNameLoading(true);
    setNameError("");
    try {
      await updateProfile({ name: name.trim() });
      setNameSuccess(true);
      setTimeout(() => { setNameSuccess(false); setMode(null); }, 1500);
    } catch (err) {
      setNameError(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setNameLoading(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setPwLoading(true);
    setPwError("");
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwSuccess(true);
      setTimeout(() => {
        setPwSuccess(false);
        setMode(null);
        setPwForm({ current: "", next: "", confirm: "" });
      }, 1500);
    } catch (err) {
      setPwError(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setPwLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Role</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                user?.role === "ADMIN"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {user?.role}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Member since</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Name */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        <button
          onClick={() => openMode(mode === "name" ? null : "name")}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Edit Name</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mode === "name" ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {mode === "name" && (
          <form onSubmit={handleNameSubmit} className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              placeholder="Your name"
              autoFocus
              className={inputCls}
            />
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
            {nameSuccess && <p className="text-xs text-green-500">อัปเดตชื่อสำเร็จ!</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode(null)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.97] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={nameLoading}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white bg-primary hover:bg-blue-700 disabled:opacity-50 active:scale-[0.97] transition-all"
              >
                {nameLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        <button
          onClick={() => openMode(mode === "password" ? null : "password")}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mode === "password" ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {mode === "password" && (
          <form onSubmit={handlePwSubmit} className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <input
              type="password"
              placeholder="Current password"
              value={pwForm.current}
              onChange={(e) => { setPwForm((p) => ({ ...p, current: e.target.value })); setPwError(""); }}
              autoComplete="current-password"
              autoFocus
              className={inputCls}
            />
            <input
              type="password"
              placeholder="New password"
              value={pwForm.next}
              onChange={(e) => { setPwForm((p) => ({ ...p, next: e.target.value })); setPwError(""); }}
              autoComplete="new-password"
              className={inputCls}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwForm.confirm}
              onChange={(e) => { setPwForm((p) => ({ ...p, confirm: e.target.value })); setPwError(""); }}
              autoComplete="new-password"
              className={inputCls}
            />
            {pwError && <p className="text-xs text-red-500 pt-1">{pwError}</p>}
            {pwSuccess && <p className="text-xs text-green-500 pt-1">เปลี่ยนรหัสผ่านสำเร็จ!</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setMode(null); setPwForm({ current: "", next: "", confirm: "" }); setPwError(""); }}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.97] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pwLoading}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 active:scale-[0.97] transition-all"
              >
                {pwLoading ? "Saving..." : "Change"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.98] transition-all"
      >
        Logout
      </button>
    </div>
  );
}
