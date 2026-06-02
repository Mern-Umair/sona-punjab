const stats = [
    { icon: "🕊️", number: "429",   label: "Total Pigeons",    sub: "Is tournament mein" },
    { icon: "🏆", number: "39",    label: "Active Lofts",     sub: "Registered clubs"   },
    { icon: "📍", number: "366",   label: "Pigeons Landed",   sub: "Successfully returned" },
    { icon: "⏱️", number: "18:32", label: "Best Time Today",  sub: "Ustad Mubasher Ali" },
  ];
  
  const recentWinners = [
    { rank: 1, name: "Ch Tariq l langrial",        total: "94:47", badge: "🥇" },
    { rank: 2, name: "Muhammad Aslam khatna",      total: "83:46", badge: "🥈" },
    { rank: 3, name: "Ustad Malik Arif Dhing",     total: "81:05", badge: "🥉" },
  ];
  
  const upcomingDates = [
    { date: "26 May", day: "Tuesday"  },
    { date: "28 May", day: "Thursday" },
    { date: "30 May", day: "Saturday" },
    { date: "01 Jun", day: "Monday"   },
  ];
  
  export default function ClubStatsSection() {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
  
        {/* Stats Cards */}
        <div>
          <h2 className="text-navy font-heading font-bold text-xl sm:text-2xl mb-6 text-center">
            Club Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white border border-gray rounded-xl p-4 sm:p-6 text-center hover:shadow-md hover:border-navy transition-all duration-200">
                <div className="text-3xl sm:text-4xl mb-2">{s.icon}</div>
                <p className="text-navy font-bold text-2xl sm:text-3xl font-sans leading-tight">{s.number}</p>
                <p className="text-dark font-semibold text-sm font-sans mt-1">{s.label}</p>
                <p className="text-gray text-xs font-sans mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Winners + Upcoming */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
          {/* Top 3 */}
          <div className="bg-white border border-gray rounded-xl overflow-hidden">
            <div className="bg-navy px-5 py-3">
              <h3 className="text-white font-heading font-bold text-base sm:text-lg">🏆 Top 3 Winners</h3>
              <p className="text-blue-200 text-xs font-sans">24 May 2026</p>
            </div>
            <div className="divide-y divide-gray">
              {recentWinners.map((w) => (
                <div key={w.rank} className="flex items-center justify-between px-5 py-4 hover:bg-navypale transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.badge}</span>
                    <div>
                      <p className="text-dark font-semibold text-sm font-sans leading-tight">{w.name}</p>
                      <p className="text-gray text-xs font-sans">Rank #{w.rank}</p>
                    </div>
                  </div>
                  <span className="text-navy font-bold text-sm font-sans bg-navypale px-3 py-1 rounded-full border border-navy">
                    {w.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
  
          {/* Upcoming Dates */}
          <div className="bg-white border border-gray rounded-xl overflow-hidden">
            <div className="bg-navy px-5 py-3">
              <h3 className="text-white font-heading font-bold text-base sm:text-lg">📅 Upcoming Rounds</h3>
              <p className="text-blue-200 text-xs font-sans">Tournament schedule</p>
            </div>
            <div className="divide-y divide-gray">
              {upcomingDates.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-navypale transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navypale border border-navy flex flex-col items-center justify-center shrink-0">
                      <span className="text-navy font-bold text-xs font-sans leading-none">{d.date.split(" ")[0]}</span>
                      <span className="text-navy text-[10px] font-sans leading-none">{d.date.split(" ")[1]}</span>
                    </div>
                    <div>
                      <p className="text-dark font-semibold text-sm font-sans">{d.date}</p>
                      <p className="text-gray text-xs font-sans">{d.day}</p>
                    </div>
                  </div>
                  <span className="text-xs font-sans font-medium px-3 py-1 rounded-full bg-gold text-white">
                    Upcoming
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }