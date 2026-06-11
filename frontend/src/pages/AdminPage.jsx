import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

const RoleBadge = ({ role }) => (
  <span
    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
      role === "ADMIN"
        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    }`}
  >
    {role}
  </span>
);

export default function AdminPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // updatingId = id ของ user ที่กำลังเปลี่ยน role อยู่
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await userService.getAll();
      if (result.success) {
        setUsers(result.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    setUpdatingId(targetUser.id);
    setUpdateError("");
    try {
      const result = await userService.updateRole(targetUser.id, newRole);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || "เปลี่ยน Role ไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {users.length} users ในระบบ
        </p>
      </div>

      {updateError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3 text-sm text-red-600 dark:text-red-400">
          {updateError}
        </div>
      )}

      {/* User list */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {users.map((u, idx) => {
          const isMe = u.id === currentUser?.id;
          const isUpdating = updatingId === u.id;

          return (
            <div
              key={u.id}
              className={`flex items-center gap-3 px-5 py-4 ${
                idx !== users.length - 1
                  ? "border-b border-gray-100 dark:border-gray-700/50"
                  : ""
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">
                  {u.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {u.name}
                  </p>
                  {isMe && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      คุณ
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
              </div>

              {/* Role control */}
              <div className="flex-shrink-0">
                {isMe ? (
                  <RoleBadge role={u.role} />
                ) : (
                  <select
                    value={u.role}
                    disabled={isUpdating}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
