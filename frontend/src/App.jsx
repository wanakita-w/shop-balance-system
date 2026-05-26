import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import TransactionPage from "./pages/TransactionPage";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");

  // Loading
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

  // Not logged in
  if (!user) {
    return <LoginPage />;
  }

  // Logged in
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-16 md:pb-0">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentPage === "home" && (
          <>
            {/* Dashboard */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user.name}! 👋
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* ... (cards เดิม) */}
            </div>

            {/* Coming Soon */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                More features coming soon... 🚀
              </p>
            </div>
          </>
        )}

        {currentPage === "transactions" && <TransactionPage />}
        {currentPage === "profile" && <ProfilePage />}
      </main>

      <BottomNav active={currentPage} onChange={setCurrentPage} />
    </div>
  );
}

export default App;
