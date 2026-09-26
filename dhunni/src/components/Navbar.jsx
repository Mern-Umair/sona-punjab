import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetClubsQuery } from "../../redux/api/clubApi";

function ChevronIcon({ open }) {
  return (
    <svg
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      style={{ width: "clamp(10px, 2.4vw, 14px)", height: "clamp(10px, 2.4vw, 14px)" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Menu bar styled after sikeryalipigeon.com: a full-width blue bar at the very top
 * (the slider sits below it) with plain white links and a "Clubs" dropdown.
 * One single row on every screen size — no hamburger; sizes shrink with the
 * viewport via clamp().
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const { data: clubsData } = useGetClubsQuery();
  const clubs = clubsData?.data || [];

  const [clubsOpen, setClubsOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const dropdownRef = useRef(null);

  // Close the dropdown on navigation (state adjustment during render, no effect needed)
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setClubsOpen(false);
  }

  // Close the dropdown when clicking/tapping outside of it
  useEffect(() => {
    if (!clubsOpen) return;
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setClubsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [clubsOpen]);

  const isClubActive = pathname.startsWith("/club/");

  // Fluid sizing: shrinks smoothly as the screen gets narrower
  const linkStyle = {
    fontSize: "clamp(10px, 2.6vw, 15px)",
    padding: "clamp(4px, 1.1vw, 8px) clamp(6px, 1.6vw, 16px)",
  };
  const linkBase =
    "font-sans font-semibold text-white rounded transition-colors whitespace-nowrap hover:bg-white/10 shrink-0";
  const linkActive = "font-bold";

  return (
    <header className="sticky top-0 z-50 w-full shadow-md nav-gradient">
      <div
        className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2"
        style={{
          padding: "clamp(4px, 1.2vw, 8px) clamp(6px, 2.5vw, 32px)",
          minHeight: "clamp(40px, 9vw, 56px)",
        }}
      >
        {/* Never wraps or overlaps: if a screen is too narrow the links row scrolls sideways */}
        <nav className="flex items-center min-w-0 overflow-x-auto no-scrollbar" style={{ gap: "clamp(2px, 0.8vw, 6px)" }}>
          <Link to="/" style={linkStyle} className={`${linkBase} ${pathname === "/" ? linkActive : ""}`}>
            Home
          </Link>

          <div ref={dropdownRef} className="relative min-w-0">
            <button
              type="button"
              onClick={() => setClubsOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={clubsOpen}
              style={linkStyle}
              className={`${linkBase} flex items-center gap-1 max-w-[46vw] ${isClubActive ? linkActive : ""}`}
            >
              <span>Clubs</span>
              <ChevronIcon open={clubsOpen} />
            </button>

            {clubsOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-1 min-w-[12rem] max-w-[85vw] max-h-[70vh] overflow-y-auto bg-white rounded-md shadow-xl border border-gray py-1 z-50"
              >
                {clubs.length === 0 ? (
                  <p className="px-4 py-2 text-gray text-sm">No clubs yet</p>
                ) : (
                  clubs.map((c) => (
                    <Link
                      key={c._id}
                      to={`/club/${c._id}`}
                      role="menuitem"
                      style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
                      className={`block px-4 py-2 font-sans transition-colors
                        ${pathname === `/club/${c._id}`
                          ? "bg-[#003F72] text-white font-semibold"
                          : "text-dark hover:bg-navypale hover:text-navy"}`}
                    >
                      {c.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            to="/tournaments"
            style={linkStyle}
            className={`${linkBase} ${pathname === "/tournaments" ? linkActive : ""}`}
          >
            Tournaments
          </Link>
        </nav>

        <a
          href="https://sona-punjab-admin.onrender.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "clamp(9px, 2.3vw, 14px)",
            padding: "clamp(3px, 1vw, 6px) clamp(6px, 1.8vw, 12px)",
          }}
          className="shrink-0 font-semibold rounded border border-white/60 text-white hover:bg-white hover:text-[#003F72] transition-colors whitespace-nowrap"
        >
          Admin Login
        </a>
      </div>
    </header>
  );
}
