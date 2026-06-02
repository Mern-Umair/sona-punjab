import { useState } from "react";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";

function CreateOwnerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", phone: "", city: "", image: null, preview: null });

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm({ ...form, image: f, preview: URL.createObjectURL(f) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center px-4 py-8">
        <div className="bg-white rounded-xl w-full max-w-xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-slate-800 font-bold text-lg">Create Pigeon Owner</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>
          <div className="p-6 space-y-5">
            {/* Image */}
            <div className="flex flex-col items-center">
              <p className="text-slate-600 text-sm font-medium mb-2">Owner Image (Optional)</p>
              <label className="w-40 h-44 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#122654] transition-colors overflow-hidden flex items-center justify-center">
                {form.preview
                  ? <img src={form.preview} alt="owner" className="w-full h-full object-cover" />
                  : <MdAdd size={36} className="text-slate-300" />
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            </div>

            {[
              { label: "Name",                    key: "name",  type: "text",   required: true },
              { label: "Phone Number (Optional)", key: "phone", type: "tel",    required: false },
              { label: "City (Optional)",         key: "city",  type: "text",   required: false },
            ].map(f => (
              <div key={f.key}>
                <label className="text-slate-600 text-sm font-medium block mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                />
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button
              onClick={() => { if (form.name.trim()) { onSave(form); onClose(); } }}
              className="w-full bg-[#0ea5e9] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PigeonOwnersPage() {
  const [owners, setOwners] = useState([
    { id: 1, name: "Arslan Akmal",      phone: "03074254897", city: "Lahore",         preview: null },
    { id: 2, name: "Ch Mubbashir Gaigi", phone: "",           city: "Warraichan wala", preview: null },
    { id: 3, name: "Ch Tuseef maher",   phone: "",            city: "Chakora",         preview: null },
    { id: 4, name: "Ch Mansha Gaigi",   phone: "",            city: "Chakora",         preview: null },
    { id: 5, name: "Ch Tariq kasana",   phone: "",            city: "Kamala",          preview: null },
  ]);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (data) => {
    setOwners([...owners, { id: Date.now(), name: data.name, phone: data.phone, city: data.city, preview: data.preview }]);
  };

  const handleDelete = (id) => {
    setOwners(owners.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <CreateOwnerModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">List of Users</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Create Pigeon Owners
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-slate-500 font-medium w-10">#</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Image</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Phone</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">City</th>
                <th className="px-4 py-3 text-right text-slate-500 font-medium">Potions</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o, i) => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                      {o.preview
                        ? <img src={o.preview} alt={o.name} className="w-full h-full object-cover" />
                        : <span className="text-slate-400 text-xs font-bold">{o.name.charAt(0)}</span>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{o.name}</td>
                  <td className="px-4 py-3 text-slate-500">{o.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{o.city || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 text-xs font-medium">
                        <MdEdit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium"
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
    </div>
  );
}