import { useNavigate } from "react-router-dom";
import { MdMenu, MdLogout } from "react-icons/md";
import { useSelector } from "react-redux";

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const user     = useSelector(state => state.auth.user);

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#122654] flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <span className="text-slate-600 text-sm hidden sm:block">
              {user?.username || "Admin"}
            </span>
          </div>
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}