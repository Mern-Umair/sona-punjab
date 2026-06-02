import { useState } from "react";
import { MdAdd, MdDelete } from "react-icons/md";

function AddBannerModal({ onClose, onAdd }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-slate-800 font-bold text-lg">Create Banner</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>
        <div className="p-6">
          <label className="block w-full h-52 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#122654] transition-colors overflow-hidden">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MdAdd size={40} className="text-slate-300" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => { if (file) { onAdd(preview); onClose(); } }}
            className="bg-[#122654] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (src) => {
    setBanners([...banners, { id: Date.now(), src }]);
  };

  const handleDelete = (id) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <AddBannerModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 font-bold text-xl">List of Banners</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors"
        >
          Create New Banners
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {banners.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">No banners yet. Click "Create New Banners" to add.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="relative rounded-xl overflow-hidden border border-slate-200 group">
                <img src={b.src} alt="banner" className="w-full h-40 object-cover" />
                <button
                  onClick={() => handleDelete(b.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}