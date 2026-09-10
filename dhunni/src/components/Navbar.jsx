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

  const formattedDate = now.toLocaleDateString("en-GB").split("/").join(".");
  const formattedTime = now.toLocaleTimeString("en-GB");

  const allLinks = [{ label: "Home", to: "/" }, ...clubs.map((c) => ({ label: c.name, to: `/club/${c._id}` }))];

  return (
    <header className="bg-navy sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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

        {/* Mobile — always-visible stacked list, no hamburger */}
               {/* Mobile — always-visible stacked list, no hamburger — fluid sizing */}
               <div className="lg:hidden" style={{ padding: "clamp(4px, 2vw, 12px) 0" }}>
          <div className="flex flex-col divide-y divide-white/10">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: "clamp(11px, 3.2vw, 16px)",
                  padding: "clamp(6px, 2.2vw, 12px) 0",
                }}
                className={`font-sans transition-colors
                  ${pathname === link.to ? "text-white font-bold" : "text-blue-200"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div
            className="flex items-center justify-between text-blue-200"
            style={{ paddingTop: "clamp(6px, 2vw, 12px)", paddingBottom: "clamp(3px, 1vw, 6px)" }}
          >
            <div className="flex flex-col leading-tight" style={{ fontSize: "clamp(9px, 2.5vw, 12px)" }}>
              <span>{formattedDate}</span>
              <span>{formattedTime}</span>
            </div>
            <a
              href="https://sona-punjab-admin.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "clamp(11px, 3vw, 14px)",
                padding: "clamp(6px, 1.8vw, 8px) clamp(10px, 3vw, 16px)",
              }}
              className="font-semibold rounded border border-white/40 text-white"
            >
              Admin Login
            </a>
          </div>
        </div>
      </div >
    </header >
  );
}