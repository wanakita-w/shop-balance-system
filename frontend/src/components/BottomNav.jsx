const NavIcon = ({ id, active }) => {
  const color = active ? "text-primary" : "text-gray-400 dark:text-gray-500";
  const sw = active ? 2.5 : 2;
  const icons = {
    home: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    transactions: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    products: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    profile: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };
  return icons[id] || null;
};

export default function BottomNav({ active, onChange }) {
  const items = [
    { id: "home", label: "Home" },
    { id: "transactions", label: "Transactions" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden flex-shrink-0">
      <div className="flex items-center h-16 max-w-xl mx-auto px-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
              active === item.id ? "text-primary" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <NavIcon id={item.id} active={active === item.id} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
