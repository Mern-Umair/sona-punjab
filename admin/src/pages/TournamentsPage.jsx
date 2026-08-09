import { useState } from "react";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";
import {
  useGetTournamentsQuery,
  useCreateTournamentMutation,
  useUpdateTournamentMutation,
  useDeleteTournamentMutation,
  useToggleScreenMutation,
} from "../../redux/api/tournamentApi";
import { useGetClubsQuery } from "../../redux/api/clubApi";
import { useGetOwnersQuery } from "../../redux/api/ownerApi";
import toast, { Toaster } from "react-hot-toast";

function CreateTournamentModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    startDate: initial?.startDate ? new Date(initial.startDate).toISOString().split("T")[0] : "",
    startTime: initial?.startTime || "",
    days: initial?.days || "",
    continueDays: initial?.continueDays || "",
    pigeons: initial?.pigeons || "",
    helperPigeons: initial?.helperPigeons || "",
    prizes: initial?.prizes || "",
    screen: initial?.screen || "Off Screen",
    club: initial?.club?._id || "",
    poster: null,
    posterPreview: initial?.posterUrl || null,
  });

  const [dates, setDates] = useState(initial?.dates?.map(d => d.split("T")[0]) || []);
  const [prizeDetails, setPrizeDetails] = useState(initial?.prizeDetails || []);
  const [search, setSearch] = useState("");
  const [selectedOwners, setSelectedOwners] = useState(initial?.owners || []);

  const { data: clubsData } = useGetClubsQuery();
  const { data: ownersData } = useGetOwnersQuery(search);

  const clubs = clubsData?.data || [];
  const owners = ownersData?.data || [];

  const handleDaysChange = (val) => {
    const num = parseInt(val) || 0;
    setForm({ ...form, days: val });
    setDates(prev => {
      const arr = [...prev];
      while (arr.length < num) arr.push("");
      return arr.slice(0, num);
    });
  };

  const handlePrizesChange = (val) => {
    const num = parseInt(val) || 0;
    setForm({ ...form, prizes: val });
    setPrizeDetails(prev => {
      const arr = [...prev];
      while (arr.length < num) arr.push("");
      return arr.slice(0, num);
    });
  };

  const handlePoster = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm({ ...form, poster: f, posterPreview: URL.createObjectURL(f) });
  };

  const toggleOwner = (owner) => {
    setSelectedOwners(prev =>
      prev.find(o => o._id === owner._id)
        ? prev.filter(o => o._id !== owner._id)
        : [...prev, owner]
    );
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Tournament name is required!");
      return;
    }
    const formData = new FormData();
    formData.set("name", form.name);
    formData.set("startDate", form.startDate);
    formData.set("startTime", form.startTime);
    formData.set("days", form.days);
    formData.set("continueDays", form.continueDays);
    formData.set("pigeons", form.pigeons);
    formData.set("helperPigeons", form.helperPigeons);
    formData.set("prizes", form.prizes);
    formData.set("screen", form.screen);
    formData.set("club", form.club);
    formData.set("dates", JSON.stringify(dates));
    formData.set("prizeDetails", JSON.stringify(prizeDetails));
    formData.set("owners", JSON.stringify(selectedOwners.map(o => o._id)));
    if (form.poster) formData.set("poster", form.poster);
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center px-4 py-8 mt-8">
        <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-slate-800 font-bold text-lg">
              {initial ? "Edit Tournament" : "Create New Tournament"}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>

          <div className="p-6 space-y-5">

            {/* Poster */}
            <div className="flex flex-col items-center">
              <p className="text-slate-600 text-sm font-medium mb-2">Tournament Poster</p>
              <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#122654] transition-colors overflow-hidden flex items-center justify-center">
                {form.posterPreview
                  ? <img src={form.posterPreview} alt="poster" className="w-full h-full object-cover" />
                  : <MdAdd size={36} className="text-slate-300" />
                }
                <input type="file" accept="image/*" className="hidden" onChange={handlePoster} />
              </label>
            </div>

            {/* Name */}
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

            {/* Club */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Club</label>
              <select
                value={form.club}
                onChange={e => setForm({ ...form, club: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors bg-white"
              >
                <option value="">Select an option</option>
                {clubs.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Number of Days */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 text-sm font-medium">Number of Days</label>
                <span className="text-slate-400 text-xs">Max 50</span>
              </div>
              <input
                type="number"
                value={form.days}
                onChange={e => handleDaysChange(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Dynamic Date Fields */}
            {dates.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dates.map((d, i) => (
                  <div key={i}>
                    <label className="text-slate-600 text-sm font-medium block mb-1">Date {i + 1}</label>
                    <input
                      type="date"
                      value={d}
                      onChange={e => {
                        const arr = [...dates];
                        arr[i] = e.target.value;
                        setDates(arr);
                      }}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Continue Days */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Continue Days</label>
              <input
                type="number"
                value={form.continueDays}
                onChange={e => setForm({ ...form, continueDays: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Pigeons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 text-sm font-medium">Number of Pigeons</label>
                <span className="text-slate-400 text-xs">Max 50</span>
              </div>
              <input
                type="number"
                value={form.pigeons}
                onChange={e => setForm({ ...form, pigeons: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Helper Pigeons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 text-sm font-medium">Helper Pigeons (Optional)</label>
                <span className="text-slate-400 text-xs">Max 50</span>
              </div>
              <input
                type="number"
                value={form.helperPigeons}
                onChange={e => setForm({ ...form, helperPigeons: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Number of Prizes */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 text-sm font-medium">Number of Prizes</label>
                <span className="text-slate-400 text-xs">Max 50</span>
              </div>
              <input
                type="number"
                value={form.prizes}
                onChange={e => handlePrizesChange(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Dynamic Prize Fields */}
            {prizeDetails.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prizeDetails.map((p, i) => (
                  <div key={i}>
                    <label className="text-slate-600 text-sm font-medium block mb-1">Prize {i + 1}</label>
                    <input
                      type="text"
                      value={p}
                      placeholder="e.g. Honda Motorcycle"
                      onChange={e => {
                        const arr = [...prizeDetails];
                        arr[i] = e.target.value;
                        setPrizeDetails(arr);
                      }}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}

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
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search pigeon owner by name"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                />
              </div>

              {selectedOwners.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedOwners.map(o => (
                    <span key={o._id} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {o.name}
                      <button onClick={() => toggleOwner(o)} className="text-blue-400 hover:text-blue-700">✕</button>
                    </span>
                  ))}
                </div>
              )}

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
                    {owners.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-slate-400 text-xs">
                          No owners found
                        </td>
                      </tr>
                    ) : (
                      owners.map((o, i) => (
                        <tr
                          key={o._id}
                          onClick={() => toggleOwner(o)}
                          className={`border-t border-slate-100 cursor-pointer transition-colors
                            ${selectedOwners.find(s => s._id === o._id) ? "bg-blue-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2.5">
                            <p className="text-slate-700 font-medium">{o.name}</p>
                            <p className="text-slate-400 text-xs">{o.city}</p>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              readOnly
                              checked={!!selectedOwners.find(s => s._id === o._id)}
                              className="accent-[#0ea5e9]"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-center">
            <button
              onClick={handleSubmit}
              className="w-48 bg-[#0ea5e9] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
            >
              {initial ? "Update Tournament" : "Create Tournament"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data, isLoading } = useGetTournamentsQuery();
  const [createTournament, { isLoading: creating }] = useCreateTournamentMutation();
  const [updateTournament, { isLoading: updating }] = useUpdateTournamentMutation();
  const [deleteTournament, { isLoading: deleting }] = useDeleteTournamentMutation();
  const [toggleScreen, { isLoading: toggling }] = useToggleScreenMutation();

  const tournaments = data?.data || [];

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await updateTournament({ id: editItem._id, formData }).unwrap();
        toast.success("Tournament updated!");
      } else {
        await createTournament(formData).unwrap();
        toast.success("Tournament created!");
      }
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTournament(id).unwrap();
      toast.success("Tournament deleted!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const handleToggleScreen = async (id) => {
    try {
      await toggleScreen(id).unwrap();
      toast.success("Screen toggled!");
    } catch (err) {
      toast.error(err?.data?.message || "Toggle failed!");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {showModal && (
        <CreateTournamentModal
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
          initial={editItem}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">List of Tournaments</h2>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Create New Tournament
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-t-transparent border-[#122654] rounded-full animate-spin" />
          </div>
        ) : (
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
                  <th className="px-4 py-3 text-center text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                      No tournaments yet. Click "Create New Tournament" to add.
                    </td>
                  </tr>
                ) : (
                  tournaments.map((t, i) => (
                    <tr key={t._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-4">
                        <div className="w-14 h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                          {t.posterUrl
                            ? <img src={t.posterUrl} alt="poster" className="w-full h-full object-cover" />
                            : <FaTrophy size={20} className="text-slate-300" />
                          }
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700 font-medium max-w-[160px]">
                        <p className="truncate">{t.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-slate-500 text-xs mb-1">{t.club?.name || "—"}</p>
                        <button
                          onClick={() => handleToggleScreen(t._id)}
                          disabled={toggling}
                          className={`text-xs font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors
                            ${t.screen === "On Screen"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                        >
                          Screen: {t.screen === "On Screen" ? "On" : "Off"}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center text-slate-500">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">{t.pigeons}</td>
                      <td className="px-4 py-4 text-center text-slate-600">{t.lofts}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditItem(t); setShowModal(true); }}
                            disabled={updating}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 text-xs font-medium justify-center"
                          >
                            <MdEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            disabled={deleting}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium justify-center"
                          >
                            <MdDelete size={14} />
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 text-xs font-medium justify-center">
                            Result
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}