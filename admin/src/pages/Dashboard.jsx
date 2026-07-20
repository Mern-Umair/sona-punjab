import { FaTrophy, FaDove } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { useGetTournamentsQuery } from "../../redux/api/tournamentApi";
import { useGetOwnersQuery } from "../../redux/api/ownerApi";
import { useGetSubAdminsQuery } from "../../redux/api/subAdminApi";

export default function Dashboard() {
  const { data: tournamentsData } = useGetTournamentsQuery();
  const { data: ownersData } = useGetOwnersQuery("");
  const { data: subAdminsData } = useGetSubAdminsQuery();

  const tournaments = tournamentsData?.data || [];
  const owners = ownersData?.data || [];
  const subAdmins = subAdminsData?.data || [];

  const stats = [
    { icon: <FaTrophy size={24} />, label: "Total Tournaments", value: tournaments.length, bg: "bg-blue-50", text: "text-blue-600" },
    { icon: <FaDove size={24} />, label: "Total Pigeon Owners", value: owners.length, bg: "bg-green-50", text: "text-green-600" },
    { icon: <MdGroups size={24} />, label: "Total Users", value: subAdmins.length, bg: "bg-rose-50", text: "text-rose-600" },
  ];

  const recentTournaments = [...tournaments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-[#122654] font-bold text-xl">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Recent Tournaments */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#122654] px-5 py-3">
          <h3 className="text-white font-bold text-base">Recent Tournaments</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTournaments.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No tournaments yet.</p>
          ) : (
            recentTournaments.map((t) => (
              <div key={t._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                <div>
                  <p className="text-slate-800 font-medium text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"} — {t.lofts} Lofts
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full
                  ${t.status === "live" ? "bg-green-100 text-green-700" :
                    t.status === "done" ? "bg-slate-100 text-slate-500" :
                      "bg-yellow-100 text-yellow-700"}`}>
                  {t.status === "live" ? "Live" : t.status === "done" ? "Done" : "Upcoming"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}