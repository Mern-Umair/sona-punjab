import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdMenu, MdLogout, MdPerson } from "react-icons/md";
import { useSelector } from "react-redux";

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-[101]">
      <div className="flex items-center justify-between px-4 py-3">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <MdMenu size={22} />
          </button>
          <span className="text-[#122654] font-bold text-sm sm:text-base">
            Sona Punjab Admin
          </span>
        </div>

        {/* Right — dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#122654] flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <span className="text-slate-600 text-sm hidden sm:block">
              {user?.username || "Admin"}
            </span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#122654] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user?.username?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800 text-sm font-semibold truncate">{user?.username || "Admin"}</p>
                    <p className="text-slate-400 text-xs capitalize">{user?.role || "admin"}</p>
                  </div>
                </div>
              </div>

              {/* Profile */}
              {/* <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 text-sm transition-colors"
              >
                <MdPerson size={16} />
                Profile
              </button> */}

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm transition-colors border-t border-slate-100"
              >
                <MdLogout size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}