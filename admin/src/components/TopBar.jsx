import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdHome, MdImage, MdTitle, MdGroups, MdLogout, MdMenu } from "react-icons/md";
import { FaTrophy, FaDove, FaUserShield } from "react-icons/fa";

const links = [
  { label: "Dashboard",        to: "/",              icon: <MdDashboard size={16} /> },
  { label: "Home",             to: "/home-settings", icon: <MdHome size={16} /> },
  { label: "Banners",          to: "/banners",       icon: <MdImage size={16} /> },
  { label: "Headline",         to: "/headline",      icon: <MdTitle size={16} /> },
  { label: "Club",             to: "/club",          icon: <FaDove size={16} /> },
  { label: "Tournaments",      to: "/tournaments",   icon: <FaTrophy size={16} /> },
  { label: "Pigeon Owners",    to: "/pigeon-owners", icon: <MdGroups size={16} /> },
  { label: "SubAdmin",         to: "/subadmin",      icon: <FaUserShield size={16} /> },
];

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <MdMenu size={22} />
          </button>
          <span className="text-[#122654] font-bold text-sm sm:text-base">
            Sona Punjab Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#122654] flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-slate-600 text-sm hidden sm:block">Admin</span>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-3 py-2 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === link.to
                  ? "bg-[#0ea5e9] text-white"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 border border-red-300 mt-1"
          >
            <MdLogout size={16} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </header>
  );
}