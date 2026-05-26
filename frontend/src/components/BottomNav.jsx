const NavIcon = ({ id, active }) => {
  const color = active ? "text-primary" : "text-gray-400 dark:text-gray-500";
  const sw = active ? 2.5 : 2;
  const icons = {
    home: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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

export default function BottomNav({ active, onChange, onAdd }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
      <div className="flex items-center h-16 max-w-xl mx-auto px-6">

        {/* Home */}
        <button
          onClick={() => onChange("home")}
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
            active === "home" ? "text-primary" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <NavIcon id="home" active={active === "home"} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* Center FAB */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={onAdd}
            className="w-13 h-13 w-[52px] h-[52px] bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 active:scale-95 transition-all duration-150"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Profile */}
        <button
          onClick={() => onChange("profile")}
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
            active === "profile" ? "text-primary" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <NavIcon id="profile" active={active === "profile"} />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>

      </div>
    </nav>
  );
}
