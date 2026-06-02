import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "السادات پیجن کلب دُھنی", to: "/results/c1" },
  { label: "السادات پیجن کلب گریس ایتھنز", to: "/results/c59" },
  { label: "Pir", to: "/results/c64" },
  { label: "Oslorenawkb ODI Dhani", to: "/results/c63" },
  { label: "Pigeon Tournament Abiyal", to: "/results/c61" },
  { label: "Weather", to: "/weather" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-gray sticky top-0 z-50 shadow-sm">

      {/* Top navy bar */}
      <div className="bg-navy py-1.5 px-4 flex items-center justify-between">
        <p className="text-white text-xs font-sans">
          🕊️ Sona Punjab — Pigeon Tournaments
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-xs font-sans">
            Online: <strong className="text-gold">476</strong>
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo — sirf text */}
          <Link to="/" className="min-w-0 shrink-0">
            <p className="text-navy font-heading font-bold text-lg sm:text-2xl leading-tight">
              Sona Punjab
            </p>
            <p className="text-gray font-sans text-[11px] sm:text-xs leading-tight">
              Pigeon Tournaments
            </p>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md border border-gray hover:bg-navypale text-navy transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-0.5 pb-2 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-sans whitespace-nowrap px-4 py-2 rounded-md transition-all duration-200 border
                ${pathname === link.to
                  ? "bg-navy text-white border-navy font-semibold"
                  : "text-dark hover:text-navy hover:bg-navypale border-transparent hover:border-navy"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-white border-t border-gray px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-sans px-4 py-3 rounded-md border transition-all duration-200 active:scale-95
                ${pathname === link.to
                  ? "bg-navy text-white border-navy font-semibold"
                  : "text-dark hover:text-navy hover:bg-navypale border-transparent"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="h-1 bg-gold" />
    </header>
  );
}