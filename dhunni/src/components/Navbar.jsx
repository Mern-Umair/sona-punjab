import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetClubsQuery } from "../../redux/api/clubApi";
import { useGetTournamentsQuery } from "../../redux/api/tournamentApi";

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

const MIN_FONT_PX = 8;
const SCREEN_MARGIN_PX = 6;

// Fluid sizing: shrinks smoothly as the screen gets narrower
const linkStyle = {
  fontSize: "clamp(10px, 2.6vw, 15px)",
  padding: "clamp(4px, 1.1vw, 8px) clamp(6px, 1.6vw, 16px)",
};
const linkBase =
  "font-sans font-semibold text-white rounded transition-colors whitespace-nowrap hover:bg-white/10";
const linkActive = "font-bold";

/**
 * Menu dropdown whose button shows the selected item's name (or `title` when nothing is
 * selected). It takes whatever width is left in the bar; a long name shrinks its own font
 * until it fits, so it never collides with its neighbours.
 * `items` = [{ key, to, label }]
 */
function NavDropdown({ title, items, emptyText, open, onToggle, onClose }) {
  const { pathname } = useLocation();
  const dropdownRef = useRef(null);
  const labelRef = useRef(null);
  const menuRef = useRef(null);

  const selected = items.find((item) => item.to === pathname);
  const buttonLabel = selected ? selected.label : title;

  // Close when clicking/tapping outside of it
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, onClose]);

  // Fit the name to the space the button got: start at the normal size, then shrink the
  // font just enough for the whole name to fit on one line.
  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = ""; // reset to the fluid base size
      el.style.whiteSpace = "nowrap";
      const base = parseFloat(getComputedStyle(el).fontSize);
      const needed = el.scrollWidth;
      const available = el.clientWidth;
      if (needed > available && available > 0) {
        const scaled = Math.floor(base * (available / needed) * 100) / 100;
        if (scaled >= MIN_FONT_PX) {
          el.style.fontSize = `${scaled}px`;
        } else {
          // Too long even at the smallest readable size: keep 8px and wrap onto a second line
          el.style.fontSize = `${MIN_FONT_PX}px`;
          el.style.whiteSpace = "normal";
        }
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  });

  // The list opens under its button, moved left when it would run off the screen
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    menu.style.left = "0px";
    const overflow = menu.getBoundingClientRect().right - (window.innerWidth - SCREEN_MARGIN_PX);
    if (overflow > 0) {
      const room = menu.getBoundingClientRect().left - SCREEN_MARGIN_PX;
      menu.style.left = `${-Math.min(overflow, Math.max(0, room))}px`;
    }
  }, [open, items.length]);

  return (
    <div ref={dropdownRef} className="relative min-w-0 shrink" style={{ flex: "0 1 auto" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        style={linkStyle}
        className={`${linkBase} flex items-center gap-1 w-full min-w-0 ${selected ? linkActive : ""}`}
      >
        <span ref={labelRef} className="block min-w-0 overflow-hidden whitespace-nowrap leading-tight">
          {buttonLabel}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 top-full mt-1 min-w-[12rem] max-w-[85vw] max-h-[70vh] overflow-y-auto bg-white rounded-md shadow-xl border border-gray py-1 z-50"
        >
          {items.length === 0 ? (
            <p className="px-4 py-2 text-gray text-sm">{emptyText}</p>
          ) : (
            items.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                role="menuitem"
                style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
                className={`block px-4 py-2 font-sans transition-colors
                  ${pathname === item.to
                    ? "bg-[#003F72] text-white font-semibold"
                    : "text-dark hover:bg-navypale hover:text-navy"}`}
              >
                {item.label}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Menu bar styled after sikeryalipigeon.com: a full-width blue bar at the very top
 * (the slider sits below it) with plain white links and two dropdowns, "Clubs" and
 * "Tournaments", that show the selected item's name. One single row on every screen
 * size, no hamburger. Sizes shrink with the viewport via clamp().
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const { data: clubsData } = useGetClubsQuery();
  const { data: tournamentsData } = useGetTournamentsQuery("");

  const clubItems = (clubsData?.data || []).map((c) => ({
    key: c._id,
    to: `/club/${c._id}`,
    label: c.name,
  }));

  // Newest first, with the full list on top
  const tournaments = [...(tournamentsData?.data || [])].sort(
    (a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt)
  );
  const tournamentItems =
    tournaments.length === 0
      ? []
      : [
          { key: "all", to: "/tournaments", label: "All Tournaments" },
          ...tournaments.map((t) => ({ key: t._id, to: `/results/${t._id}`, label: t.name })),
        ];

  // Only one list is open at a time: "clubs", "tournaments" or null
  const [openMenu, setOpenMenu] = useState(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the lists on navigation (state adjustment during render, no effect needed)
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenMenu(null);
  }

  const toggle = (name) => setOpenMenu((current) => (current === name ? null : name));
  const closeClubs = () => setOpenMenu((current) => (current === "clubs" ? null : current));
  const closeTournaments = () =>
    setOpenMenu((current) => (current === "tournaments" ? null : current));
  const closeContact = () => setOpenMenu((current) => (current === "contact" ? null : current));

  const contactRef = useRef(null);

  useEffect(() => {
    if (openMenu !== "contact") return;
    const onDown = (e) => {
      if (contactRef.current && !contactRef.current.contains(e.target)) closeContact();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-50 w-full shadow-md nav-gradient">
      <div
        className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2"
        style={{
          padding: "clamp(4px, 1.2vw, 8px) clamp(6px, 2.5vw, 32px)",
          minHeight: "clamp(40px, 9vw, 56px)",
        }}
      >
        <nav className="flex items-center min-w-0 flex-1" style={{ gap: "clamp(2px, 0.8vw, 6px)" }}>
          <Link to="/" style={linkStyle} className={`${linkBase} shrink-0 ${pathname === "/" ? linkActive : ""}`}>
            Home
          </Link>

          <NavDropdown
            title="Clubs"
            items={clubItems}
            emptyText="No clubs yet"
            open={openMenu === "clubs"}
            onToggle={() => toggle("clubs")}
            onClose={closeClubs}
          />

          <NavDropdown
            title="Tournaments"
            items={tournamentItems}
            emptyText="No tournaments yet"
            open={openMenu === "tournaments"}
            onToggle={() => toggle("tournaments")}
            onClose={closeTournaments}
          />
        </nav>

        <div className="flex items-center shrink-0" style={{ gap: "clamp(6px, 1.5vw, 12px)" }}>
          <div ref={contactRef} className="relative">
            <button
              type="button"
              onClick={() => toggle("contact")}
              aria-haspopup="menu"
              aria-expanded={openMenu === "contact"}
              style={linkStyle}
              className={`${linkBase} flex items-center gap-1 shrink-0`}
            >
              Contact
              <ChevronIcon open={openMenu === "contact"} />
            </button>

            {openMenu === "contact" && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 min-w-[12rem] bg-white rounded-md shadow-xl border border-gray py-1 z-50"
              >
                <a
                  href="tel:+923436586872"
                  role="menuitem"
                  style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
                  className="block px-4 py-2 font-sans font-semibold text-dark hover:bg-navypale hover:text-navy transition-colors whitespace-nowrap"
                >
                  +92 343 6586872
                </a>
              </div>
            )}
          </div>

          <a
            href="https://sona-punjab-admin.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "clamp(9px, 2.3vw, 14px)",
              padding: "clamp(3px, 1vw, 6px) clamp(6px, 1.8vw, 12px)",
            }}
            className="font-semibold rounded border border-white/60 text-white hover:bg-white hover:text-[#003F72] transition-colors whitespace-nowrap"
          >
            sona punjab
          </a>
        </div>
      </div>
    </header>
  );
}
