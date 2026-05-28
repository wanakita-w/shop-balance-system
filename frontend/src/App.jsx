// import สิ่งที่ต้องใช้จาก React และ context และ components ต่างๆ
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useTransactions } from "./context/TransactionContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import TransactionPage from "./pages/TransactionPage";
import TransactionForm from "./components/TransactionForm";
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
  const handleOpenAdd = () => {
    setEditingTransaction(null);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="max-w-xl mx-auto px-4 pt-5">
        {/* ── HOME ── */}
        {currentPage === "home" && (
          <HomePage onAdd={handleOpenAdd} onNavigate={setCurrentPage} /> // เรียก HomePage แล้วส่ง props 2 อย่างลงไปให้
        )}

        {/* ── TRANSACTIONS ── */}
        {currentPage === "transactions" && (
          <TransactionPage
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onBack={() => setCurrentPage("home")}
          />
        )}

        {/* ── PROFILE ── */}
        {currentPage === "profile" && <ProfilePage />}
      </main>
      <BottomNav
        active={currentPage} // ปุ่มไหน active (highlighted) ตาม currentPage
        onChange={setCurrentPage} // ฟังก์ชันเปลี่ยนหน้าเมื่อกดปุ่มใน BottomNav จะส่งชื่อหน้าที่ต้องการไปให้ setCurrentPage
        onAdd={handleOpenAdd} // กดปุ่ม add ใน BottomNav จะเปิดฟอร์มเพิ่มรายการใหม่
      />
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
