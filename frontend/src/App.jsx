// import สิ่งที่ต้องใช้จาก React และ context และ components ต่างๆ
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useTransactions } from "./context/TransactionContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import TransactionPage from "./pages/TransactionPage";
import TransactionForm from "./components/TransactionForm";
import AdminPage from "./pages/AdminPage";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

function App() {
  const { user, loading } = useAuth();
  const { fetchTransactions } = useTransactions();
  const [currentPage, setCurrentPage] = useState("home"); // เริ่มต้นที่หน้า Home ใช้เก็บสถานะว่าผู้ใช้กำลังดูหน้าไหนอยู่
  const [showAddForm, setShowAddForm] = useState(false); // เริ่มต้นที่ไม่แสดงฟอร์ม
  const [editingTransaction, setEditingTransaction] = useState(null);

  // เมื่อ user เปลี่ยนค่า และไม่เป็น null ให้ fetch transactions ของ user นั้น
  useEffect(() => {
    if (user) fetchTransactions(1);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ฟังก์ชันสำหรับเปิดฟอร์มเพิ่มรายการใหม่ edit จะเป็น null ส่วนถ้าเปิดเพื่อแก้ไข จะส่ง transaction ที่ต้องการแก้ไขเข้าไป
  const handleOpenAdd = (defaults = null) => {
    setEditingTransaction(defaults);
    setShowAddForm(true);
  };
  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setShowAddForm(true);
  };
  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingTransaction(null);
  };

  // ถ้าโหลดอยู่ แสดง spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // ถ้าไม่มี user แสดงหน้า login
  if (!user) return <LoginPage />;

  // Layout หลักของแอป เมื่อ user เข้าสู่ระบบแล้ว
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 pt-5 pb-6">
          {/* ── HOME ── */}
          {currentPage === "home" && (
            <HomePage onAdd={handleOpenAdd} onNavigate={setCurrentPage} />
          )}

          {/* ── TRANSACTIONS ── */}
          {currentPage === "transactions" && (
            <TransactionPage
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onBack={() => setCurrentPage("home")}
            />
          )}

          {/* ── ADMIN ── */}
          {currentPage === "admin" && <AdminPage />}

          {/* ── PROFILE ── */}
          {currentPage === "profile" && <ProfilePage onNavigate={setCurrentPage} />}
        </div>
      </main>

      <BottomNav active={currentPage} onChange={setCurrentPage} />

      {showAddForm && (
        <TransactionForm
          isOpen={showAddForm}
          onClose={handleCloseForm}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
}

export default App;
