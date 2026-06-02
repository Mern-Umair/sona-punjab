import { useState } from "react";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";

const clubs = ["Warraichan wala cup", "Ashfaq Gaigi Memorial", "Others"];
const owners = [
  { id: 1, name: "Arslan Akmal",      city: "Lahore" },
  { id: 2, name: "Ch Mubbashir Gaigi", city: "Warraichan wala" },
  { id: 3, name: "Ch Tuseef maher",   city: "Chakora" },
  { id: 4, name: "Ch Mansha Gaigi",   city: "Chakora" },
  { id: 5, name: "Ch Tariq kasana",   city: "Kamala" },
];

function CreateTournamentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    poster: null, posterPreview: null,
    name: "", club: "", startDate: "", startTime: "",
    days: "", continueDays: "", pigeons: "", helperPigeons: "",
    prizes: "", screen: "Off Screen", subadmins: [],
  });
  const [search, setSearch] = useState("");
  const [selectedOwners, setSelectedOwners] = useState([]);

  const filtered = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOwner = (owner) => {
    setSelectedOwners(prev =>
      prev.find(o => o.id === owner.id)
        ? prev.filter(o => o.id !== owner.id)
        : [...prev, owner]
    );
  };

  const handlePoster = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm({ ...form, poster: f, posterPreview: URL.createObjectURL(f) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center px-4 py-8">
        <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-slate-800 font-bold text-lg">Create New Tournament</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>

          <div className="p-6 space-y-5">
            {/* Poster */}
            <div className="flex flex-col items-center">
              <p className="text-slate-600 text-sm font-medium mb-2">Tournament Poster</p>
              <label className="w-44 h-52 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#122654] transition-colors overflow-hidden flex items-center justify-center">
                {form.posterPreview ? (
                  <img src={form.posterPreview} alt="poster" className="w-full h-full object-cover" />
                ) : (
                  <MdAdd size={36} className="text-slate-300" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePoster} />
              </label>
            </div>

            {/* Fields */}
            {[
              { label: "Tournament Name", key: "name",          type: "text" },
              { label: "Start Date",      key: "startDate",     type: "date" },
              { label: "Start Time",      key: "startTime",     type: "time" },
              { label: "Number of Days",  key: "days",          type: "number", hint: "Max 50" },
              { label: "Continue Days",   key: "continueDays",  type: "number" },
              { label: "Number of Pigeons", key: "pigeons",     type: "number", hint: "Max 50" },
              { label: "Helper Pigeons (Optional)", key: "helperPigeons", type: "number", hint: "Max 50" },
              { label: "Number of Prizes", key: "prizes",       type: "number", hint: "Max 50" },
            ].map(f => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 text-sm font-medium">{f.label}</label>
                  {f.hint && <span className="text-slate-400 text-xs">{f.hint}</span>}
                </div>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                />
              </div>
            ))}

            {/* Club */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Club</label>
              <select
                value={form.club}
                onChange={e => setForm({ ...form, club: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors bg-white"
              >
                <option value="">Select an option</option>
                {clubs.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Screen */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Show on screen</label>
              <select
                value={form.screen}
                onChange={e => setForm({ ...form, screen: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors bg-white"
              >
                <option value="Off Screen">Off Screen</option>
                <option value="On Screen">On Screen</option>
              </select>
            </div>

            {/* Pigeon Owners */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-2">Pigeons Owners</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Search pigeon owner by name"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                />
                <button className="bg-[#0ea5e9] text-white px-4 py-2 rounded-lg text-sm font-semibold">Search</button>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-500 font-medium w-10">#</th>
                      <th className="px-3 py-2 text-left text-slate-500 font-medium">Pigeon Owners</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o, i) => (
                      <tr
                        key={o.id}
                        onClick={() => toggleOwner(o)}
                        className={`border-t border-slate-100 cursor-pointer transition-colors ${selectedOwners.find(s => s.id === o.id) ? "bg-blue-50" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-slate-700 font-medium">{o.name}</p>
                          <p className="text-slate-400 text-xs">{o.city}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" readOnly checked={!!selectedOwners.find(s => s.id === o.id)} className="accent-[#0ea5e9]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100">
            <button
              onClick={() => { onSave({ ...form, owners: selectedOwners }); onClose(); }}
              className="w-full bg-[#0ea5e9] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
            >
              Create Tournament
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([
    { id: 1, name: "Etihad Piegion One day Tournament", club: "Warraichan wala cup", startDate: "17/04/2026", pigeons: 7, lofts: 19, screen: "Off" },
    { id: 2, name: "Ashfaq gagi mamoryal warichanwalla", club: "Ashfaq Gaigi Memorial Cup warraichan wala", startDate: "24/04/2026", pigeons: 9, lofts: 70, screen: "On" },
  ]);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (data) => {
    setTournaments([...tournaments, {
      id: Date.now(),
      name: data.name,
      club: data.club,
      startDate: data.startDate,
      pigeons: data.pigeons,
      lofts: 0,
      screen: data.screen === "On Screen" ? "On" : "Off",
      poster: data.posterPreview,
    }]);
  };

  const handleDelete = (id) => {
    setTournaments(tournaments.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <CreateTournamentModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">List of Tournaments</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Create New Tournament
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-slate-500 font-medium w-10">#</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Poster</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Club</th>
                <th className="px-4 py-3 text-center text-slate-500 font-medium">Start Date</th>
                <th className="px-4 py-3 text-center text-slate-500 font-medium">Pigeons</th>
                <th className="px-4 py-3 text-center text-slate-500 font-medium">Lofts</th>
                <th className="px-4 py-3 text-center text-slate-500 font-medium">Options</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t, i) => (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      {t.poster
                        ? <img src={t.poster} alt="poster" className="w-full h-full object-cover" />
                        : <FaTrophy size={20} className="text-slate-300" />
                      }
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 font-medium max-w-[160px]">{t.name}</td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-slate-600 text-xs">{t.club}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block
                        ${t.screen === "On" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        Screen: {t.screen}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-500">{t.startDate}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{t.pigeons}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{t.lofts}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5 items-center">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 text-xs font-medium w-full justify-center">
                        <MdEdit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium w-full justify-center"
                      >
                        <MdDelete size={14} /> Delete
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 text-xs font-medium w-full justify-center">
                        Result
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}