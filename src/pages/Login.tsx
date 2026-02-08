import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, User, Lock, Store } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate("/pos");
      }
    } catch (err: any) {
      setError("ID Karyawan atau Password salah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-[#F2F2F7] flex flex-col justify-center items-center font-sans p-6">
      
      {/* --- BACKGROUND AMBIENT (Perbaikan Posisi) --- */}
      {/* Bias Biru di Pojok Kiri Atas (Jauh dari teks) */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Bias Ungu di Pojok Kanan Bawah */}
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 w-full max-w-sm">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Store size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">ARJUNA</h1>
          <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">POS System</p>
          <p className="text-sm text-slate-400">Solusi Terintegrasi Printing & Retail</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-[32px] p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Staff Login</h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ID Karyawan</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Contoh: ARJ-001" 
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-300 placeholder:font-normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-300 placeholder:font-normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all mt-4 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Masuk Sistem"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 Arjuna Group</p>
        </div>

      </div>
    </div>
  );
}