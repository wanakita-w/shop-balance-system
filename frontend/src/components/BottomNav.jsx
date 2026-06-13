const NavIcon = ({ id, active }) => {
  const color = active ? "text-primary" : "text-gray-400 dark:text-gray-500";
  const sw = active ? 2.5 : 2;
  const icons = {
    home: (
      <svg
        className={`w-5 h-5 ${color}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    profile: (
      <svg
        className={`w-5 h-5 ${color}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  };
  return icons[id] || null;
};

export default function BottomNav({ active, onChange, onAdd }) {
  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden flex-shrink-0 overflow-visible relative z-10">
      <div className="flex items-center h-16 max-w-xl mx-auto px-6">
        {/* Home */}
        <button
          onClick={() => onChange("home")}
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
            active === "home"
              ? "text-primary"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <NavIcon id="home" active={active === "home"} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* Center FAB — โผล่เหนือ navbar */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={onAdd}
            className="w-14 h-14 -mt-7 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 active:scale-90 transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #4f46e5 100%)",
              boxShadow: "0 0 0 0 transparent, 0 8px 32px rgba(79,70,229,0.5), 0 2px 8px rgba(37,99,235,0.4)"
            }}
          >
            <svg
              className="w-10 h-10 text-white p-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Profile */}
        <button
          onClick={() => onChange("profile")}
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
            active === "profile"
              ? "text-primary"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <NavIcon id="profile" active={active === "profile"} />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
}
