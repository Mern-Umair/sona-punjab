import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdHome, MdImage, MdTitle, MdGroups, MdLogout } from "react-icons/md";
import { FaTrophy, FaDove, FaUserShield } from "react-icons/fa";

const links = [
  { label: "Dashboard",        to: "/",              icon: <MdDashboard size={18} /> },
  { label: "Home",             to: "/home-settings", icon: <MdHome size={18} /> },
  { label: "Banners",          to: "/banners",       icon: <MdImage size={18} /> },
  { label: "Headline",         to: "/headline",      icon: <MdTitle size={18} /> },
  { label: "Club",             to: "/club",          icon: <FaDove size={18} /> },
  { label: "Tournaments List", to: "/tournaments",   icon: <FaTrophy size={18} /> },
  { label: "Pigeon Owners",    to: "/pigeon-owners", icon: <MdGroups size={18} /> },
  { label: "SubAdmin List",    to: "/subadmin",      icon: <FaUserShield size={18} /> },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/login");
  };

  return (
    <aside className="w-56 shrink-0 bg-[#122654] flex flex-col sticky top-0 h-screen overflow-y-auto">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#1a3570] shrink-0">
        <p className="text-white font-bold text-base leading-tight">Sona Punjab</p>
        <p className="text-blue-300 text-[10px]">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
              ${pathname === link.to
                ? "bg-[#0ea5e9] text-white"
                : "text-blue-200 hover:bg-[#1a3570] hover:text-white"
              }`}
          >
            <span className="shrink-0">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-[#1a3570] shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 border border-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 text-sm font-medium"
        >
          <MdLogout size={18} className="shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}