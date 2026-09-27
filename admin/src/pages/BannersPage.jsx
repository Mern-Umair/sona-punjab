import { useRef, useState } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import BannerCropper from "../components/BannerCropper";
import { cropBanner, BANNER_W, BANNER_H } from "../utils/bannerCrop";
import { useGetBannersQuery, useCreateBannerMutation, useDeleteBannerMutation } from "../../redux/api/bannerApi";
import toast, { Toaster } from "react-hot-toast";

const START_CROP = { zoom: 1, center: { x: 0.5, y: 0.5 } };

function AddBannerModal({ onClose }) {
  const [preview, setPreview] = useState(null);
  const [crop, setCrop]       = useState(START_CROP);
  const [preparing, setPreparing] = useState(false);
  const imageRef = useRef(null);

  const [createBanner, { isLoading: uploading }] = useCreateBannerMutation();
  const isLoading = preparing || uploading;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setCrop(START_CROP);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!preview || !imageRef.current?.naturalWidth) {
      toast.error("Please select an image!");
      return;
    }
    try {
      // Upload exactly what is inside the frame
      setPreparing(true);
      const file = await cropBanner(imageRef.current, crop);
      const formData = new FormData();
      formData.append("image", file);
      await createBanner(formData).unwrap();
      toast.success("Banner uploaded!");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Upload failed!");
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex items-center justify-center px-3 py-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-full overflow-y-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200">
          <h3 className="text-slate-800 font-bold text-lg">Create Banner</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>
        <div className="p-4 sm:p-6">
          {preview ? (
            <>
              <BannerCropper src={preview} crop={crop} onChange={setCrop} imageRef={imageRef} />
              <label className="inline-block mt-4 text-sm font-semibold text-[#0ea5e9] cursor-pointer hover:underline">
                Choose another image
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </>
          ) : (
            <label
              className="flex w-full items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#122654] transition-colors"
              style={{ aspectRatio: `${BANNER_W} / ${BANNER_H}` }}
            >
              <MdAdd size={40} className="text-slate-300" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="bg-[#122654] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Uploading...
              </div>
            ) : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading: fetching } = useGetBannersQuery();
  const [deleteBanner, { isLoading: deleting }] = useDeleteBannerMutation();

  const banners = data?.data || [];

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner? This cannot be undone.")) return;
    try {
      await deleteBanner(id).unwrap();
      toast.success("Banner deleted!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {showModal && <AddBannerModal onClose={() => setShowModal(false)} />}

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
        {fetching ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-t-transparent border-[#122654] rounded-full animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">
            No banners yet. Click "Create New Banners" to add.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div key={b._id} className="relative rounded-xl overflow-hidden border border-slate-200 group">
                <img src={b.imageUrl} alt="banner" className="w-full h-40 object-cover" />
                <button
                  onClick={() => handleDelete(b._id)}
                  disabled={deleting}
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