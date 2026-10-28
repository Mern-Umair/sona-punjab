import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../../redux/reducer/authReducer";

import { MdDashboard, MdImage, MdTitle, MdGroups, MdLogout, MdLanguage } from "react-icons/md";
import { FaTrophy, FaDove, FaUserShield } from "react-icons/fa";

const allLinks = [
  { label: "Dashboard", to: "/", icon: <MdDashboard size={18} />, roles: ["admin"] },
  { label: "Highflyer Pigeons", href: "/", icon: <MdLanguage size={18} />, roles: ["admin", "subadmin"] },
  { label: "Banners", to: "/banners", icon: <MdImage size={18} />, roles: ["admin"] },
  { label: "Headline", to: "/headline", icon: <MdTitle size={18} />, roles: ["admin"] },
  { label: "Club", to: "/club", icon: <FaDove size={18} />, roles: ["admin"] },
  { label: "Pigeon Owners", to: "/pigeon-owners", icon: <MdGroups size={18} />, roles: ["admin"] },
  { label: "Tournaments List", to: "/tournaments", icon: <FaTrophy size={18} />, roles: ["admin", "subadmin"] },
  { label: "SubAdmin List", to: "/subadmin", icon: <FaUserShield size={18} />, roles: ["admin"] },
];

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role || "subadmin";
  const filteredLinks = allLinks.filter((link) => link.roles.includes(role));

  const logout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen z-[110]
        w-56 shrink-0 bg-[#122654] flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:self-start
      `}>
        <div className="px-4 py-4 border-b border-[#1a3570] shrink-0 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base leading-tight">Highflyer Pigeons</p>
            <p className="text-blue-300 text-[10px]">
              {role === "admin" ? "Admin Panel" : "Sub Admin Panel"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-blue-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {filteredLinks.map((link) => (
            link.href ? (
              <button
                key={link.href + link.label}
                onClick={() => { window.open(link.href, "_blank", "noopener,noreferrer"); onClose?.(); }}
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
                  ${pathname === link.to || (link.to !== "/" && pathname.startsWith(link.to))
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
