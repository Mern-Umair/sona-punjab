const tournament = {
    title: "ALSADAAT PIGEON CLUB DHUNI SADAAT ( 7 )ROZA TOURNAMINT INTRY FEES ( 15 ) HAZAAR",
    startTime: "05:00",
    stats: {
      lofts: 39,
      totalPigeons: 429,
      landed: 366,
      remaining: 63,
      winnerTime: "18:32",
      winnerName: "Ustad Mubasher Ali",
    },
    dates: [
      "24.05.2026","26.05.2026","28.05.2026",
      "30.05.2026","01.06.2026","03.06.2026","05.06.2026","Total"
    ],
    results: [
      { rank: 1,  name: "Ch Tariq l langrial",           times: ["10:34","11:14","11:31","11:37","12:05","14:12","14:32","15:34","15:42","15:50","16:56"], total: "94:47" },
      { rank: 2,  name: "Muhammad Aslam khatna - Majid", times: ["07:20","09:51","09:53","13:09","13:17","13:56","13:56","14:14","14:20","14:22","14:28"], total: "83:46" },
      { rank: 3,  name: "Ustad Malik Arif Dhing",        times: ["09:12","10:43","10:57","12:28","12:46","14:34","14:52","14:52","14:53","15:48",""],      total: "81:05" },
      { rank: 4,  name: "Pola butt & Ali Raza",          times: ["08:10","09:57","11:10","12:05","12:39","12:39","13:15","13:22","13:34","13:36","14:00"], total: "79:27" },
      { rank: 5,  name: "Ustad Mian Abid mandeer",       times: ["07:02","07:17","11:46","11:49","11:50","12:05","12:34","13:45","13:47","15:05","15:47"], total: "77:47" },
      { rank: 6,  name: "Ustad gulnaz Makwal",           times: ["08:08","09:54","12:42","14:26","14:41","14:48","14:58","16:15","16:41","",""],           total: "77:33" },
      { rank: 7,  name: "Irfan ali sher Smaila",         times: ["13:22","13:45","14:18","14:30","14:32","14:32","15:36","15:36","","",""],                total: "76:11" },
      { rank: 8,  name: "Ch karamat kotla",              times: ["06:40","07:00","07:01","11:06","12:03","12:07","12:20","13:54","15:18","16:12","16:13"], total: "74:54" },
      { rank: 9,  name: "Ch Yasir plaza thapla",         times: ["07:55","07:59","09:52","10:12","10:29","11:12","13:12","13:22","13:41","13:41","14:52"], total: "71:27" },
      { rank: 10, name: "Hafeez Butt Modal Town",        times: ["07:21","09:40","10:16","10:46","11:06","12:57","13:01","13:30","16:04","16:06",""],      total: "70:47" },
    ],
  };
  
  const medalColors = {
    1: "bg-yellow-400 text-yellow-900",
    2: "bg-gray-300 text-gray-800",
    3: "bg-amber-600 text-white",
  };
  
  export default function TournamentSection() {
    return (
      <section className="w-full px-2 sm:px-4 py-8">
  
        {/* Tournament Title */}
        <div className="bg-navy rounded-t-xl px-4 sm:px-6 py-4">
          <h2 className="text-white font-heading font-bold text-sm sm:text-base lg:text-lg text-center leading-snug">
            {tournament.title}
          </h2>
          <p className="text-blue-200 text-xs text-center mt-1 font-sans">
            Start time: {tournament.startTime}
          </p>
        </div>
  
        {/* Date Tabs */}
        <div className="bg-white border-x border-gray overflow-x-auto">
          <div className="flex min-w-max">
            {tournament.dates.map((date, i) => (
              <button
                key={i}
                className={`px-4 py-2.5 text-xs sm:text-sm font-sans font-medium whitespace-nowrap border-b-2 transition-colors
                  ${i === 0
                    ? "border-navy text-navy bg-navypale"
                    : "border-transparent text-gray hover:text-navy hover:bg-navypale"
                  }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
  
        {/* Stats Bar */}
        <div className="bg-navypale border-x border-gray px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="text-center">
            <p className="text-gray text-[10px] sm:text-xs font-sans uppercase tracking-wide">Lofts</p>
            <p className="text-navy font-bold text-lg sm:text-xl font-sans">{tournament.stats.lofts}</p>
          </div>
          <div className="text-center">
            <p className="text-gray text-[10px] sm:text-xs font-sans uppercase tracking-wide">Total Pigeons</p>
            <p className="text-navy font-bold text-lg sm:text-xl font-sans">{tournament.stats.totalPigeons}</p>
          </div>
          <div className="text-center">
            <p className="text-gray text-[10px] sm:text-xs font-sans uppercase tracking-wide">Landed</p>
            <p className="text-navy font-bold text-lg sm:text-xl font-sans">{tournament.stats.landed}</p>
          </div>
          <div className="text-center">
            <p className="text-gray text-[10px] sm:text-xs font-sans uppercase tracking-wide">Remaining</p>
            <p className="text-navy font-bold text-lg sm:text-xl font-sans">{tournament.stats.remaining}</p>
          </div>
          <div className="text-center col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="text-gray text-[10px] sm:text-xs font-sans uppercase tracking-wide">Today's Winner</p>
            <p className="text-gold font-bold text-sm sm:text-base font-sans">{tournament.stats.winnerTime}</p>
            <p className="text-dark text-[10px] sm:text-xs font-sans truncate">{tournament.stats.winnerName}</p>
          </div>
        </div>
  
        {/* Results Table */}
        <div className="bg-white border border-gray rounded-b-xl overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] text-xs sm:text-sm font-sans">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-3 py-3 text-left w-10">#</th>
                  <th className="px-3 py-3 text-left min-w-[160px]">Name</th>
                  {[1,2,3,4,5,6,7,8,9,10,11].map(n => (
                    <th key={n} className="px-2 py-3 text-center min-w-[52px]">#{n}</th>
                  ))}
                  <th className="px-3 py-3 text-center min-w-[60px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {tournament.results.map((row, i) => (
                  <tr
                    key={row.rank}
                    className={`border-t border-gray transition-colors hover:bg-navypale
                      ${i % 2 === 0 ? "bg-white" : "bg-light"}`}
                  >
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                        ${medalColors[row.rank] || "bg-navypale text-navy"}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-navypale border border-navy flex items-center justify-center shrink-0">
                          <span className="text-navy text-xs font-bold">
                            {row.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-dark font-medium leading-tight line-clamp-2 max-w-[140px]">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    {Array.from({ length: 11 }).map((_, ti) => (
                      <td key={ti} className="px-2 py-3 text-center text-gray">
                        {row.times[ti] || "—"}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-bold text-navy">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }