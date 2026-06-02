import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDove } from "react-icons/fa";
import { MdLock, MdPerson } from "react-icons/md";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (form.username === "admin" && form.password === "admin123") {
      localStorage.setItem("admin_auth", "true");
      navigate("/");
    } else {
      setError("Invalid username or password!");
    }
  };

  return (
    <div className="min-h-screen bg-[#122654] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#e8ecf5] flex items-center justify-center mx-auto mb-3">
            <FaDove size={28} className="text-[#122654]" />
          </div>
          <p className="text-[#122654] font-bold text-2xl">Sona Punjab</p>
          <p className="text-slate-500 text-sm mt-1">Admin Panel Login</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1">Username</label>
            <div className="relative">
              <MdPerson size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="admin"
                className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1">Password</label>
            <div className="relative">
              <MdLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-[#122654] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#1a3570] transition-colors"
          >
            Login
          </button>
        </div>

        <p className="text-slate-400 text-xs text-center mt-6">
          Sona Punjab © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}