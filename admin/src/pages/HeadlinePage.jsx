import { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";

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
          <button onClick={onClose} className="bg-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
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
  const [headlines, setHeadlines] = useState([
    "خوش آمدید — سونا پنجاب میں آپ کو خوش آمدید کہا جاتا ہے، تمام امیدواروں کے لیے نیک تمنائیں، جبکہ کمیٹی کی تازہ اپڈیٹس اور آفرز یہاں ظاہر ہوتی رہیں گی۔"
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleSave = (text) => {
    if (editIndex !== null) {
      const updated = [...headlines];
      updated[editIndex] = text;
      setHeadlines(updated);
      setEditIndex(null);
    } else {
      setHeadlines([...headlines, text]);
    }
  };

  const handleDelete = (i) => {
    setHeadlines(headlines.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <AddHeadlineModal
          onClose={() => { setShowModal(false); setEditIndex(null); }}
          onSave={handleSave}
          initial={editIndex !== null ? headlines[editIndex] : ""}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">Headlines</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Add headline
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-slate-500 font-medium w-12">#</th>
              <th className="px-4 py-3 text-left text-slate-500 font-medium">Headline</th>
              <th className="px-4 py-3 text-right text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {headlines.map((h, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 text-slate-700 text-right" dir="rtl">{h}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditIndex(i); setShowModal(true); }}
                      className="p-1.5 rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <MdDelete size={16} />
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