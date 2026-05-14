import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Button from "./components/ui/Button";

function App() {
  const { user, loading, logout } = useAuth(); // ✅ เรียกที่ top level

  // กำลังโหลด
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ยังไม่ login
  if (!user) {
    return <LoginPage />;
  }

  // Login แล้ว
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome, {user.name}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Role: <span className="font-medium">{user.role}</span>
              </p>
            </div>

            <Button
              variant="danger"
              onClick={logout} // ✅ เรียก logout ตรงๆ
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Placeholder for Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Coming soon... 🚀</p>
        </div>
      </div>
    </div>
  );
}

export default App;
