export default function BottomNav({ active, onChange }) {
  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "add", icon: "➕", label: "Add" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              active === item.id
                ? "text-primary"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
