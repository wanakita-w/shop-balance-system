import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <Card padding="lg" className="mb-6">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-4xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
              {user?.name}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
              {user?.email}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === "ADMIN"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>

          {/* Created At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Member Since
            </label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button fullWidth variant="secondary" disabled>
            ✏️ Edit Profile (Coming Soon)
          </Button>

          <Button fullWidth variant="secondary" disabled>
            🔒 Change Password (Coming Soon)
          </Button>

          <Button fullWidth variant="danger" onClick={logout}>
            🚪 Logout
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          These actions cannot be undone
        </p>

        <Button fullWidth variant="danger" disabled>
          🗑️ Delete Account (Coming Soon)
        </Button>
      </Card>
    </div>
  );
}
