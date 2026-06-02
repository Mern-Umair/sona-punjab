import { useState } from "react";
import { MdEdit, MdDelete, MdContentCopy, MdVisibility, MdVisibilityOff } from "react-icons/md";

function CreateSubAdminModal({ onClose, onSave }) {
  const [form, setForm] = useState({ username: "", phone: "", role: "Sub Admin", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.username.trim()) return setError("Username is required");
    if (form.password !== form.confirm) return setError("Passwords do not match!");
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center px-4 py-8">
        <div className="bg-white rounded-xl w-full max-w-xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-slate-800 font-bold text-lg">Create Sub Admin</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">User Name</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors bg-white"
              >
                <option value="Sub Admin">Sub Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {[
              { label: "Password",         key: "password", show: showPass,    toggle: () => setShowPass(!showPass) },
              { label: "Confirm Password", key: "confirm",  show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(f => (
              <div key={f.key}>
                <label className="text-slate-600 text-sm font-medium block mb-1">{f.label}</label>
                <div className="relative">
                  <input
                    type={f.show ? "text" : "password"}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 pr-10 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                  />
                  <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {f.show ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>
            ))}
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button
              onClick={handleSubmit}
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

export default function SubAdminPage() {
  const [admins, setAdmins] = useState([
    { id: 1, username: "Saamali",  phone: "", password: "pakistan", role: "admin" },
    { id: 2, username: "Saamali1", phone: "", password: "pakistan", role: "admin" },
    { id: 3, username: "Mubashir", phone: "", password: "pakistan", role: "subadmin" },
    { id: 4, username: "Ali",      phone: "", password: "pakistan", role: "subadmin" },
  ]);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (data) => {
    setAdmins([...admins, { id: Date.now(), username: data.username, phone: data.phone, password: data.password, role: data.role === "admin" ? "admin" : "subadmin" }]);
  };

  const handleDelete = (id) => {
    setAdmins(admins.filter(a => a.id !== id));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <CreateSubAdminModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">List of Users</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Create Sub Admin
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-slate-500 font-medium w-10">#</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">User Name</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Phone</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Password</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Role</th>
                <th className="px-4 py-3 text-center text-slate-500 font-medium">Options</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-4 text-slate-700 font-medium">{a.username}</td>
                  <td className="px-4 py-4 text-slate-500">{a.phone || "—"}</td>
                  <td className="px-4 py-4 text-slate-500">{a.password}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold ${a.role === "admin" ? "text-green-600" : "text-amber-500"}`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5 items-center">
                      <button
                        onClick={() => handleCopy(a.password)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 text-xs font-medium w-full justify-center"
                      >
                        <MdContentCopy size={14} /> Copy
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 text-xs font-medium w-full justify-center">
                        <MdEdit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium w-full justify-center"
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