import { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  useGetHeadlinesQuery,
  useCreateHeadlineMutation,
  useUpdateHeadlineMutation,
  useDeleteHeadlineMutation,
} from "../../redux/api/headlineApi";
import toast, { Toaster } from "react-hot-toast";

function AddHeadlineModal({ onClose, onSave, initial }) {
  const [text, setText] = useState(initial || "");
  const max = 2000;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-slate-800 font-bold text-lg">Add headline</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>
        <div className="p-6 space-y-3">
          <label className="text-slate-600 text-sm font-medium block">Headline text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, max))}
            rows={5}
            placeholder="Short message for the scrolling headline on home and club pages."
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#122654] resize-none transition-colors"
            dir="rtl"
          />
          <p className="text-slate-400 text-xs text-right">{text.length} / {max} characters</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="bg-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (text.trim()) { onSave(text); onClose(); } }}
            className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeadlinePage() {
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);

  const { data, isLoading }                     = useGetHeadlinesQuery();
  const [createHeadline, { isLoading: creating }] = useCreateHeadlineMutation();
  const [updateHeadline, { isLoading: updating }] = useUpdateHeadlineMutation();
  const [deleteHeadline, { isLoading: deleting }] = useDeleteHeadlineMutation();

  const headlines = data?.data || [];

  const handleSave = async (text) => {
    try {
      if (editItem) {
        await updateHeadline({ id: editItem._id, text }).unwrap();
        toast.success("Headline updated!");
      } else {
        await createHeadline({ text }).unwrap();
        toast.success("Headline created!");
      }
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHeadline(id).unwrap();
      toast.success("Headline deleted!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {showModal && (
        <AddHeadlineModal
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
          initial={editItem?.text || ""}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">Headlines</h2>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Add headline
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-t-transparent border-[#122654] rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-slate-500 font-medium w-12">#</th>
                <th className="px-4 py-3 text-left text-slate-500 font-medium">Headline</th>
                <th className="px-4 py-3 text-right text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {headlines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No headlines yet. Click "Add headline" to create one.
                  </td>
                </tr>
              ) : (
                headlines.map((h, i) => (
                  <tr key={h._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-700 text-right" dir="rtl">{h.text}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditItem(h); setShowModal(true); }}
                          disabled={updating}
                          className="p-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(h._id)}
                          disabled={deleting}
                          className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}