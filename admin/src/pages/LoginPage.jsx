import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDove } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/reducer/authReducer";
import { useLoginMutation } from "../../redux/api/authApi";
import toast, { Toaster } from "react-hot-toast";

const initialState = {
  username: "",
  password: "",
};

export default function LoginPage() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();

  const [formData, setFormData]         = useState(initialState);
  const [errors, setErrors]             = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: value ? "" : `${name.charAt(0).toUpperCase() + name.slice(1)} is required`,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await login(formData).unwrap();
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      localStorage.setItem("admin_token", res.data.token);
      toast.success(res.message || "Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || "Invalid credentials!");
    }
  };

  return (
    <div className="min-h-screen bg-[#122654] flex items-center justify-center px-4">
      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#e8ecf5] flex items-center justify-center">
            <FaDove size={26} className="text-[#122654]" />
          </div>
          <div>
            <p className="text-[#122654] font-bold text-lg">Sona Punjab</p>
            <p className="text-slate-400 text-xs">Sign in to admin panel</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Username */}
          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1.5">
              Username
            </label>
            <div className="relative">
              <MdPerson size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="username"
                placeholder="admin"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:border-[#122654] transition-colors"
                onKeyDown={e => e.key === "Enter" && handleSubmit(e)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#122654] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#1a3570] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              </div>
            ) : (
              "Sign In"
            )}
          </button>

        </form>

        <p className="text-slate-400 text-xs text-center mt-6">
          Sona Punjab © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}