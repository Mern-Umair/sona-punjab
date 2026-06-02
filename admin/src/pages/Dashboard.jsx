import { FaTrophy, FaDove } from "react-icons/fa";
import { MdHome, MdGroups } from "react-icons/md";

const stats = [
  { icon: <FaTrophy size={24} />, label: "Total Tournaments", value: "12",  bg: "bg-blue-50",  text: "text-blue-600"  },
  { icon: <FaDove size={24} />,   label: "Total Pigeons",     value: "429", bg: "bg-green-50", text: "text-green-600" },
  { icon: <MdHome size={24} />,   label: "Active Lofts",      value: "39",  bg: "bg-amber-50", text: "text-amber-600" },
  { icon: <MdGroups size={24} />, label: "Online Users",      value: "476", bg: "bg-rose-50",  text: "text-rose-600"  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-[#122654] font-bold text-xl">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.text} flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="font-bold text-2xl text-[#122654]">{s.value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#122654] px-5 py-3">
          <h3 className="text-white font-bold text-base">Recent Tournaments</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { name: "ALSADAAT 7 ROZA TOURNAMINT", date: "24.05.2026", lofts: 39, status: "Live" },
            { name: "Pigeon Tournament Abiyal",    date: "20.05.2026", lofts: 25, status: "Done" },
            { name: "ODI Dhani Tournament",        date: "15.05.2026", lofts: 18, status: "Done" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
              <div>
                <p className="text-slate-800 font-medium text-sm">{t.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t.date} — {t.lofts} Lofts</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full
                ${t.status === "Live" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}