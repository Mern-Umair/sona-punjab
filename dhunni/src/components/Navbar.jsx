import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetClubsQuery } from "../../redux/api/clubApi";

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

/**
 * Menu bar styled after sikeryalipigeon.com: a full-width blue bar at the very top
 * (the slider sits below it), white links, the active link on a red pill, and a
 * "Clubs" dropdown that lists every club.
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const { data: clubsData } = useGetClubsQuery();
  const clubs = clubsData?.data || [];

  const [clubsOpen, setClubsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const dropdownRef = useRef(null);

  // Close menus on navigation (state adjustment during render, no effect needed)
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setClubsOpen(false);
    setMobileOpen(false);
  }

  // Close the desktop dropdown when clicking outside of it
  useEffect(() => {
    if (!clubsOpen) return;
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setClubsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [clubsOpen]);

  const isClubActive = pathname.startsWith("/club/");
  const activeClub = clubs.find((c) => pathname === `/club/${c._id}`);

  const linkBase =
    "font-sans text-sm font-semibold uppercase tracking-wide px-4 py-2 rounded transition-colors whitespace-nowrap";
  const linkIdle = "text-white hover:bg-white/15";
  const linkActive = "bg-[#ff0000] text-white shadow-sm";

  return (
    <header className="sticky top-0 z-50 w-full shadow-md nav-gradient">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className={`${linkBase} ${pathname === "/" ? linkActive : linkIdle}`}>
              Home
            </Link>

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setClubsOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={clubsOpen}
                className={`${linkBase} flex items-center gap-1.5 ${isClubActive ? linkActive : linkIdle}`}
              >
                {activeClub ? activeClub.name : "Clubs"}
                <ChevronIcon open={clubsOpen} />
              </button>

              {clubsOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 min-w-[14rem] max-h-[70vh] overflow-y-auto bg-white rounded-md shadow-xl border border-gray py-1 z-50"
                >
                  {clubs.length === 0 ? (
                    <p className="px-4 py-2 text-gray text-sm">No clubs yet</p>
                  ) : (
                    clubs.map((c) => (
                      <Link
                        key={c._id}
                        to={`/club/${c._id}`}
                        role="menuitem"
                        className={`block px-4 py-2 text-sm font-sans transition-colors
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
          </nav>

          {/* Mobile: hamburger + brand */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="text-white p-1.5 rounded hover:bg-white/15"
            >
              <MenuIcon open={mobileOpen} />
            </button>
            <Link to="/" className="text-white font-heading font-bold text-base tracking-wide">
              Sona Punjab
            </Link>
          </div>

          {/* Admin link (right side) */}
          <a
            href="https://sona-punjab-admin.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded border border-white/60 text-white hover:bg-white hover:text-[#003F72] transition-colors whitespace-nowrap"
          >
            Admin Login
          </a>
        </div>

        {/* Mobile collapsible menu */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 border-t border-white/15">
            <Link
              to="/"
              className={`block mt-2 ${linkBase} ${pathname === "/" ? linkActive : linkIdle}`}
            >
              Home
            </Link>
            <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
              Clubs
            </p>
            <div className="flex flex-col gap-0.5">
              {clubs.length === 0 ? (
                <p className="px-4 py-2 text-blue-100 text-sm">No clubs yet</p>
              ) : (
                clubs.map((c) => (
                  <Link
                    key={c._id}
                    to={`/club/${c._id}`}
                    className={`font-sans text-sm px-4 py-2 rounded transition-colors
                      ${pathname === `/club/${c._id}` ? linkActive : "text-white hover:bg-white/15"}`}
                  >
                    {c.name}
                  </Link>
                ))
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
