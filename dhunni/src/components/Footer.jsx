// src/components/Footer.jsx

import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();
  
    const quickLinks = [
      { label: "Home", to: "/" },
      { label: "السادات پیجن کلب دُھنی", to: "/results/c1" },
      { label: "السادات پیجن کلب گریس ایتھنز", to: "/results/c59" },
      { label: "Pir", to: "/results/c64" },
      { label: "Oslorenawkb ODI Dhani", to: "/results/c63" },
      { label: "Pigeon Tournament Abiyal", to: "/results/c61" },
      { label: "Weather", to: "/weather" },
    ];
  
    const stats = [
      { icon: "🕊️", label: "Total Pigeons", value: "429" },
      { icon: "🏆", label: "Active Lofts",  value: "39"  },
      { icon: "📅", label: "Tournaments",   value: "12+"  },
      { icon: "🌍", label: "Countries",     value: "3"   },
    ];
  
    return (
      <footer className="bg-green mt-10">
  
        {/* Top gold line */}
        <div className="h-1 bg-gold" />
  
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
  
            {/* Col 1 — Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center bg-greenl shrink-0">
                  <span className="text-2xl">🕊️</span>
                </div>
                <div>
                  <p className="text-white font-heading font-bold text-lg leading-tight">
                    Al-Sadat Dhunni
                  </p>
                  <p className="text-green-200 text-xs font-sans">
                    Pigeon Club — Pakistan
                  </p>
                </div>
              </div>
              <p className="text-green-200 text-sm font-sans leading-relaxed">
                Pakistan ka mash'hoor kabootar baazi ka club. Har tournament mein hazaron log shamil hote hain.
              </p>
              {/* Online badge */}
              <div className="flex items-center gap-2 mt-4 bg-greenl px-4 py-2 rounded-full w-fit">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <span className="text-white text-xs font-sans">
                  Online: <strong className="text-gold">476</strong>
                </span>
              </div>
            </div>
  
            {/* Col 2 — Quick Links */}
            <div>
              <h4 className="text-gold font-heading font-bold text-base mb-4 pb-2 border-b border-greenl">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      href={link.to}
                      className="text-green-200 hover:text-gold text-sm font-sans transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Col 3 — Stats */}
            <div>
              <h4 className="text-gold font-heading font-bold text-base mb-4 pb-2 border-b border-greenl">
                Club Stats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="bg-greenl rounded-lg p-3 text-center"
                  >
                    <div className="text-xl mb-1">{s.icon}</div>
                    <p className="text-gold font-bold text-lg font-sans leading-none">
                      {s.value}
                    </p>
                    <p className="text-green-200 text-[10px] font-sans mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Col 4 — Contact */}
            <div>
              <h4 className="text-gold font-heading font-bold text-base mb-4 pb-2 border-b border-greenl">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-lg shrink-0">📍</span>
                  <span className="text-green-200 text-sm font-sans leading-snug">
                    Dhunni, Gujrat, Punjab, Pakistan
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg shrink-0">📞</span>
                  <span className="text-green-200 text-sm font-sans">
                    +92 300 0000000
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg shrink-0">🌐</span>
                  <Link
                    href="https://www.alsadatdhunni.com"
                    className="text-green-200 hover:text-gold text-sm font-sans transition-colors"
                  >
                    alsadatdhunni.com
                  </Link>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg shrink-0">⏰</span>
                  <span className="text-green-200 text-sm font-sans">
                    Start Time: 05:00 AM daily
                  </span>
                </li>
              </ul>
            </div>
  
          </div>
        </div>
  
        {/* Bottom bar */}
        <div className="border-t border-greenl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-green-200 text-xs font-sans text-center sm:text-left">
              © {currentYear} Al-Sadat Dhunni Pigeon Club. All rights reserved.
            </p>
            <p className="text-green-200 text-xs font-sans text-center sm:text-right">
              Made with ❤️ in Pakistan 🇵🇰
            </p>
          </div>
        </div>
  
        {/* Bottom gold line */}
        <div className="h-1 bg-gold" />
  
      </footer>
    );
  }