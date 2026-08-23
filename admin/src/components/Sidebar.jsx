import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { MdDashboard, MdImage, MdTitle, MdGroups, MdLogout } from "react-icons/md";
import { FaTrophy, FaDove, FaUserShield } from "react-icons/fa";

const links = [
  { label: "Dashboard", to: "/", icon: <MdDashboard size={18} /> },
  { label: "Banners", to: "/banners", icon: <MdImage size={18} /> },
  { label: "Headline", to: "/headline", icon: <MdTitle size={18} /> },
  { label: "Club", to: "/club", icon: <FaDove size={18} /> },
  { label: "Pigeon Owners", to: "/pigeon-owners", icon: <MdGroups size={18} /> },

  { label: "Tournaments List", to: "/tournaments", icon: <FaTrophy size={18} /> },
  { label: "SubAdmin List", to: "/subadmin", icon: <FaUserShield size={18} /> },
];

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const user = useSelector(state => state.auth.user);
  const filteredLinks = user?.role === "admin"
    ? links
    : links.filter(link => link.to !== "/subadmin");

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-[110] 
        w-56 shrink-0 bg-[#122654] flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:self-start
      `}>

        {/* Logo */}
        <div className="px-4 py-4 border-b border-[#1a3570] shrink-0 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base leading-tight">Sona Punjab</p>
            <p className="text-blue-300 text-[10px]">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-blue-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {filteredLinks.map((link) => (
            link.href ? (
              <button
                key={link.href}
                onClick={() => { window.location.href = link.href; onClose?.(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium text-blue-200 hover:bg-[#1a3570] hover:text-white w-full text-left"
              >
                <span className="shrink-0">{link.icon}</span>
                <span className="truncate">{link.label}</span>
              </button>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                  ${pathname === link.to
                    ? "bg-[#0ea5e9] text-white"
                    : "text-blue-200 hover:bg-[#1a3570] hover:text-white"
                  }`}
              >
                <span className="shrink-0">{link.icon}</span>
                <span className="truncate">{link.label}</span>
              </Link>
            )
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
    </>
  );
}