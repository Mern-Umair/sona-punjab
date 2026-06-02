import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddTournamentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    startTime: "",
    entryFee: "",
    dates: "",
    lofts: "",
  });

  const handleSubmit = () => {
    alert("Tournament save ho gaya! (Demo)");
    navigate("/tournaments");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/tournaments")}
          className="text-slate-400 hover:text-[#122654] transition-colors text-xl"
        >
          ←
        </button>
        <h2 className="text-[#122654] font-bold text-xl">Add Tournament</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

        <div>
          <label className="text-slate-600 text-sm font-medium block mb-1">Tournament Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. ALSADAAT 7 ROZA TOURNAMINT"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1">Entry Fee (PKR)</label>
            <input
              type="number"
              value={form.entryFee}
              onChange={e => setForm({ ...form, entryFee: e.target.value })}
              placeholder="e.g. 15000"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-600 text-sm font-medium block mb-1">Tournament Dates</label>
          <input
            type="text"
            value={form.dates}
            onChange={e => setForm({ ...form, dates: e.target.value })}
            placeholder="e.g. 24.05.2026, 26.05.2026, 28.05.2026"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
          />
          <p className="text-slate-400 text-xs mt-1">Dates comma se alag karo</p>
        </div>

        <div>
          <label className="text-slate-600 text-sm font-medium block mb-1">Total Lofts</label>
          <input
            type="number"
            value={form.lofts}
            onChange={e => setForm({ ...form, lofts: e.target.value })}
            placeholder="e.g. 39"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            className="bg-[#122654] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors"
          >
            Save Tournament
          </button>
          <button
            onClick={() => navigate("/tournaments")}
            className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}