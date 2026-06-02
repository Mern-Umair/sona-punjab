import { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";

function CreateClubModal({ onClose, onSave, initial }) {
  const [name, setName] = useState(initial || "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-slate-800 font-bold text-2xl">Create Club</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>
        <div className="p-6">
          <label className="text-slate-600 text-sm font-medium block mb-2">Club Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter club name"
            autoFocus
            className="w-full border border-[#0ea5e9] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#122654] transition-colors"
          />
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="bg-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
          <button
            onClick={() => { if (name.trim()) { onSave(name); onClose(); } }}
            className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClubPage() {
  const [clubs, setClubs] = useState([
    { id: 1, name: "Warraichan wala cup" },
    { id: 2, name: "Ashfaq Gaigi Memorial" },
    { id: 3, name: "Others" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleSave = (name) => {
    if (editId !== null) {
      setClubs(clubs.map(c => c.id === editId ? { ...c, name } : c));
      setEditId(null);
    } else {
      setClubs([...clubs, { id: Date.now(), name }]);
    }
  };

  const handleDelete = (id) => {
    setClubs(clubs.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <CreateClubModal
          onClose={() => { setShowModal(false); setEditId(null); }}
          onSave={handleSave}
          initial={editId !== null ? clubs.find(c => c.id === editId)?.name : ""}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">List of Clubs</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Create club
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-slate-500 font-medium w-12">#</th>
              <th className="px-4 py-3 text-left text-slate-500 font-medium">Club name</th>
              <th className="px-4 py-3 text-right text-slate-500 font-medium">Options</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c, i) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 text-slate-700 font-medium">{c.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditId(c.id); setShowModal(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 text-xs font-medium transition-colors"
                    >
                      <MdEdit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium transition-colors"
                    >
                      <MdDelete size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}