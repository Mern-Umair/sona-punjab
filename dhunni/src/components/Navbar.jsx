import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetClubsQuery } from "../../redux/api/clubApi";

export default function Navbar() {
  const [now, setNow] = useState(new Date());
  const { pathname } = useLocation();

  const { data: clubsData } = useGetClubsQuery();
  const clubs = clubsData?.data || [];

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);


  const formattedDate = now
    .toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })
    .split("/")
    .join(".");
  const formattedTime = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Karachi" });

  const allLinks = [{ label: "Home", to: "/" }, ...clubs.map((c) => ({ label: c.name, to: `/club/${c._id}` }))];

  return (
    <header className="bg-navy sticky top-0 z-50 shadow-md w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Desktop row */}
        <div className="hidden lg:flex items-center justify-between h-14">
          <div className="flex items-stretch gap-1 overflow-x-auto py-1.5">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-sans text-center leading-tight flex items-center justify-center max-w-[9rem] px-3 py-1.5 rounded transition-colors
                  ${pathname === link.to ? "bg-white/10 text-white font-semibold" : "text-blue-100 hover:text-white hover:bg-white/5"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-blue-100 font-sans whitespace-nowrap">
            <div className="flex flex-col items-end leading-tight">
              <span>{formattedDate}</span>
              <span>{formattedTime}</span>
            </div>
            <a
              href="https://sona-punjab-admin.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold px-3 py-1.5 rounded border border-white/40 text-white hover:bg-white hover:text-navy transition-colors"
            >
              Admin Login
            </a>
          </div>
        </div>
      </div>

      {/* Mobile — full-bleed row, always edge-to-edge regardless of screen width */}
      <div className="lg:hidden bg-navypale w-screen relative left-1/2 -translate-x-1/2 flex items-center justify-between px-2">
        <div
          className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1 min-w-0"
          style={{ padding: "clamp(4px, 2vw, 10px) 0" }}
        >
          {allLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontSize: "clamp(10px, 2.6vw, 14px)",
                padding: "clamp(5px, 1.6vw, 8px) clamp(6px, 2vw, 12px)",
              }}
              className={`font-sans whitespace-nowrap shrink-0 rounded transition-colors
                ${pathname === link.to ? "bg-navy text-white font-semibold" : "text-navy hover:bg-white/50"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-navy/10">
          <div
            className="flex flex-col leading-tight text-navy text-right shrink-0"
            style={{ fontSize: "clamp(8px, 2.2vw, 12px)" }}
          >
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
          <a
            href="https://sona-punjab-admin.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "clamp(9px, 2.2vw, 14px)",
              padding: "clamp(5px, 1.4vw, 8px) clamp(7px, 2vw, 16px)",
            }}
            className="font-semibold rounded border border-navy text-navy hover:bg-navy hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Admin Login
          </a>
        </div>
      </div>
    </header>
  );
}