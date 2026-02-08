import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, storeType, logout } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  // Warna Tema 
  const isPrinting = storeType === 'printing';
  const activeColor = isPrinting ? 'text-[#007AFF]' : 'text-[#5856D6]';

  const menus = [
    { label: "Kasir", icon: ShoppingCart, path: "/pos" },
    { label: "Produk", icon: Package, path: "/items" },
    { label: "Laporan", icon: LayoutDashboard, path: "/reports" },
    { label: "Setelan", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex font-sans text-[#1C1C1E]">
      
      {/* --- DESKTOP SIDEBAR (iPad Sidebar Style) --- */}
      <aside className="hidden md:flex w-[280px] bg-[#F2F2F7]/80 backdrop-blur-xl border-r border-[#E5E5EA] flex-col fixed h-full z-30">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
             <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white shadow-sm ${isPrinting ? 'bg-[#007AFF]' : 'bg-[#5856D6]'}`}>
                <Store size={20} />
             </div>
             <div>
                <h1 className="font-bold text-lg leading-tight">Arjuna</h1>
                <p className="text-xs text-[#8E8E93] font-medium">{isPrinting ? 'Digital Printing' : 'Retail Store'}</p>
             </div>
          </div>
          
          <div className="h-[1px] bg-[#E5E5EA] w-full mb-4"></div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menus.map((item) => {
             const isActive = location.pathname === item.path;
             return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 font-medium text-[15px] ${
                  isActive 
                    ? `bg-white shadow-sm ${activeColor}` 
                    : 'text-[#8E8E93] hover:bg-black/5'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
             )
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E5EA]">
          <button onClick={logout} className="flex items-center gap-3 text-[#FF3B30] hover:bg-red-50 px-4 py-3 rounded-[12px] w-full transition-colors text-[15px] font-medium">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-[280px] min-h-screen pb-[100px] md:pb-0">
        <Outlet />
      </main>

      {/* --- MOBILE TAB BAR (iPhone Native Style) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/85 backdrop-blur-xl border-t border-[#C6C6C8] flex justify-around items-end pb-[20px] pt-3 z-50">
        {menus.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 w-16 active:scale-90 transition-transform ${
                isActive ? activeColor : 'text-[#999999]'
              }`}
            >
              <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  );
}