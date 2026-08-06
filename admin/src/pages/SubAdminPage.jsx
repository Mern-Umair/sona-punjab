import { useState } from "react";
import { MdEdit, MdDelete, MdContentCopy, MdVisibility, MdVisibilityOff } from "react-icons/md";
import {
  useGetSubAdminsQuery,
  useCreateSubAdminMutation,
  useUpdateSubAdminMutation,
  useDeleteSubAdminMutation,
} from "../../redux/api/subAdminApi";
import toast, { Toaster } from "react-hot-toast";

function CreateSubAdminModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState({
    username: initial?.username || "",
    phone: initial?.phone || "",
    role: initial?.role || "subadmin",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (!form.username.trim()) return toast.error("Username is required!");
    if (!initial && !form.password) return toast.error("Password is required!");
    if (form.password && form.password !== form.confirm) return toast.error("Passwords do not match!");

    const data = { username: form.username, phone: form.phone, role: form.role };
    if (form.password) data.password = form.password;
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center px-4 py-8 mt-8">
        <div className="bg-white rounded-xl w-full max-w-xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-slate-800 font-bold text-lg">
              {initial ? "Edit Sub Admin" : "Create Sub Admin"}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>

          <div className="p-6 space-y-4">
            {/* Username */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">User Name</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors bg-white"
              >
                <option value="subadmin">Sub Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            {[
              { label: "Password", key: "password", show: showPass, toggle: () => setShowPass(!showPass) },
              { label: "Confirm Password", key: "confirm", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
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
                  <button
                    type="button"
                    onClick={f.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {f.show ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-center">
            <button
              onClick={handleSubmit}
              className="w-48 bg-[#0ea5e9] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
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
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data, isLoading } = useGetSubAdminsQuery();
  const [createSubAdmin, { isLoading: creating }] = useCreateSubAdminMutation();
  const [updateSubAdmin, { isLoading: updating }] = useUpdateSubAdminMutation();
  const [deleteSubAdmin, { isLoading: deleting }] = useDeleteSubAdminMutation();

  const admins = data?.data || [];

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await updateSubAdmin({ id: editItem._id, ...formData }).unwrap();
        toast.success("SubAdmin updated!");
      } else {
        await createSubAdmin(formData).unwrap();
        toast.success("SubAdmin created!");
      }
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubAdmin(id).unwrap();
      toast.success("SubAdmin deleted!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {showModal && (
        <CreateSubAdminModal
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
          initial={editItem}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">List of Users</h2>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Create Sub Admin
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
                  <th className="px-4 py-3 text-left text-slate-500 font-medium">User Name</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-medium">Phone</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-medium">Password</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-medium">Role</th>
                  <th className="px-4 py-3 text-right text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-sm">
                      No subadmins yet.
                    </td>
                  </tr>
                ) : (
                  admins.map((a, i) => (
                    <tr key={a._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-4 text-slate-700 font-medium">{a.username}</td>
                      <td className="px-4 py-4 text-slate-500">{a.phone || "—"}</td>
                      <td className="px-4 py-4 text-slate-500">••••••••</td>
                      <td className="px-4 py-4 text-left">
                        <span className={`text-xs font-bold ${a.role === "admin" ? "text-green-600" : "text-amber-500"}`}>
                          {a.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopy(a.username)}
                            className="flex gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 text-xs font-medium justify-center"
                          >
                            <MdContentCopy size={14} />
                          </button>
                          <button
                            onClick={() => { setEditItem(a); setShowModal(true); }}
                            disabled={updating}
                            className="flex gap-1 px-3 py-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 text-xs font-medium  justify-center"
                          >
                            <MdEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            disabled={deleting}
                            className="flex gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium justify-center"
                          >
                            <MdDelete size={14} />
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