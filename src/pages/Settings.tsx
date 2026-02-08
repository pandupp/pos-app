import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ChevronRight, User, Printer, Bell, Store, Shield, X, Trash2, Lock, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Dummy Data Staff Awal
const INITIAL_STAFF = [
  { id: 1, name: "Budi Santoso", role: "Manager", email: "budi@arjuna.com" },
  { id: 2, name: "Siti Aminah", role: "Kasir", email: "siti@arjuna.com" },
];

export default function SettingsPage() {
  const { user, storeType, logout } = useAuth();
  const isPrinting = storeType === 'printing';
  const themeColor = isPrinting ? 'bg-[#007AFF]' : 'bg-[#5856D6]';
  const btnTheme = isPrinting ? 'bg-[#007AFF]' : 'bg-[#5856D6]';

  // --- STATE MODALS ---
  const [activeModal, setActiveModal] = useState<'store' | 'printer' | 'notif' | 'security' | 'staff' | null>(null);

  // --- 1. STORE & PRINTER DATA ---
  const [storeInfo, setStoreInfo] = useState({ name: "Arjuna Printing", address: "Jl. Ahmad Yani No. 88", phone: "0812-3456-7890" });
  const [printerConfig, setPrinterConfig] = useState({ paperSize: "58mm", autoCut: true, footerMsg: "Terima Kasih!" });

  // --- 2. NOTIFICATION DATA ---
  const [notifConfig, setNotifConfig] = useState({
      sound: true,
      lowStock: true,
      dailyReport: false
  });

  // --- 3. SECURITY DATA ---
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" });

  // --- 4. STAFF DATA ---
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [newStaff, setNewStaff] = useState({ name: "", role: "Kasir", email: "" });
  const [isAddStaffMode, setIsAddStaffMode] = useState(false);

  // Load Data LocalStorage
  useEffect(() => {
    const savedStore = localStorage.getItem("settings_store");
    const savedPrinter = localStorage.getItem("settings_printer");
    const savedStaff = localStorage.getItem("settings_staff");
    
    if (savedStore) setStoreInfo(JSON.parse(savedStore));
    if (savedPrinter) setPrinterConfig(JSON.parse(savedPrinter));
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
  }, []);

  // --- HANDLERS ---
  
  const handleSaveStore = () => {
    localStorage.setItem("settings_store", JSON.stringify(storeInfo));
    setActiveModal(null);
  };

  const handleSavePrinter = () => {
    localStorage.setItem("settings_printer", JSON.stringify(printerConfig));
    setActiveModal(null);
  };

  const handleSaveSecurity = () => {
      if (passForm.new !== passForm.confirm) {
          alert("Password Baru dan Konfirmasi tidak cocok!");
          return;
      }
      if (passForm.new.length < 6) {
          alert("Password minimal 6 karakter");
          return;
      }
      alert("Password berhasil diubah!");
      setPassForm({ old: "", new: "", confirm: "" });
      setActiveModal(null);
  };

  // Staff Handlers
  const handleAddStaff = () => {
      if (!newStaff.name || !newStaff.email) return alert("Nama dan Email wajib diisi");
      const updatedList = [...staffList, { ...newStaff, id: Date.now() }];
      setStaffList(updatedList);
      localStorage.setItem("settings_staff", JSON.stringify(updatedList));
      setNewStaff({ name: "", role: "Kasir", email: "" });
      setIsAddStaffMode(false);
  };

  const handleDeleteStaff = (id: number) => {
      if (confirm("Hapus akses staff ini?")) {
          const updatedList = staffList.filter(s => s.id !== id);
          setStaffList(updatedList);
          localStorage.setItem("settings_staff", JSON.stringify(updatedList));
      }
  };

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto pb-24">
      <h1 className="text-[34px] font-bold tracking-tight text-[#1C1C1E] mb-6">Setelan</h1>

      {/* PROFILE HEADER */}
      <div className="bg-white rounded-[18px] p-4 flex items-center gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-6">
        <div className={`w-16 h-16 ${themeColor} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
           {user?.name.charAt(0)}
        </div>
        <div className="flex-1">
           <h2 className="text-[19px] font-semibold text-[#1C1C1E]">{user?.name}</h2>
           <p className="text-[15px] text-[#8E8E93]">{user?.email}</p>
           <span className="inline-block mt-1 text-[11px] px-2 py-0.5 bg-[#F2F2F7] rounded-md font-medium text-[#8E8E93] uppercase tracking-wide">
             {user?.role} — {isPrinting ? 'Printing' : 'Retail'}
           </span>
        </div>
      </div>

      {/* MENU GROUP 1: Operasional */}
      <div className="bg-white rounded-[18px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-6">
         <MenuItem 
            icon={Printer} color="bg-blue-500" label="Printer & Struk" 
            value={printerConfig.paperSize} onClick={() => setActiveModal('printer')}
         />
         <MenuItem 
            icon={Store} color="bg-indigo-500" label="Informasi Toko" 
            value={storeInfo.name} onClick={() => setActiveModal('store')}
         />
         <MenuItem 
            icon={Bell} color="bg-red-500" label="Notifikasi" isLast 
            value={notifConfig.sound ? "On" : "Off"} onClick={() => setActiveModal('notif')}
         />
      </div>

      {/* MENU GROUP 2: Keamanan & Staff */}
      <div className="bg-white rounded-[18px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-8">
         <MenuItem 
            icon={Shield} color="bg-green-500" label="Keamanan Akun" 
            onClick={() => setActiveModal('security')}
         />
         <MenuItem 
            icon={User} color="bg-gray-500" label="Manajemen Staff" isLast 
            value={`${staffList.length} Orang`} onClick={() => setActiveModal('staff')}
         />
      </div>

      {/* LOGOUT */}
      <button 
        onClick={logout}
        className="w-full bg-white text-[#FF3B30] font-semibold text-[17px] h-[50px] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center active:bg-gray-50 active:scale-[0.98] transition-all"
      >
        <LogOut size={20} className="mr-2" />
        Keluar dari Aplikasi
      </button>

      {/* ================= MODALS ================= */}

      {/* 1. MODAL TOKO */}
      <Dialog open={activeModal === 'store'} onOpenChange={() => setActiveModal(null)}>
         <DialogContent className="rounded-[24px] w-[90%] max-w-md border-0 bg-white p-6">
            <h2 className="text-[17px] font-bold mb-4">Informasi Toko</h2>
            <div className="space-y-4">
                <Input className="bg-[#F2F2F7] border-none font-semibold h-11" value={storeInfo.name} onChange={e => setStoreInfo({...storeInfo, name: e.target.value})} placeholder="Nama Toko" />
                <Input className="bg-[#F2F2F7] border-none font-semibold h-11" value={storeInfo.address} onChange={e => setStoreInfo({...storeInfo, address: e.target.value})} placeholder="Alamat" />
                <Input className="bg-[#F2F2F7] border-none font-semibold h-11" value={storeInfo.phone} onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})} placeholder="No HP" />
                <button onClick={handleSaveStore} className={`w-full h-[50px] ${btnTheme} rounded-[14px] font-bold text-white mt-2`}>Simpan</button>
            </div>
         </DialogContent>
      </Dialog>

      {/* 2. MODAL PRINTER */}
      <Dialog open={activeModal === 'printer'} onOpenChange={() => setActiveModal(null)}>
         <DialogContent className="rounded-[24px] w-[90%] max-w-md border-0 bg-white p-6">
            <h2 className="text-[17px] font-bold mb-4">Printer & Struk</h2>
            <div className="space-y-4">
                <div className="flex gap-3">
                    {['58mm', '80mm'].map(size => (
                        <button key={size} onClick={() => setPrinterConfig({...printerConfig, paperSize: size})} className={`flex-1 h-12 rounded-lg font-bold text-sm border-2 ${printerConfig.paperSize === size ? `border-blue-500 bg-blue-50 text-blue-600` : 'border-transparent bg-[#F2F2F7] text-gray-500'}`}>{size}</button>
                    ))}
                </div>
                <Input className="bg-[#F2F2F7] border-none font-semibold h-11" value={printerConfig.footerMsg} onChange={e => setPrinterConfig({...printerConfig, footerMsg: e.target.value})} placeholder="Pesan Footer" />
                <button onClick={handleSavePrinter} className={`w-full h-[50px] ${btnTheme} rounded-[14px] font-bold text-white mt-2`}>Simpan</button>
            </div>
         </DialogContent>
      </Dialog>

      {/* 3. MODAL NOTIFIKASI */}
      <Dialog open={activeModal === 'notif'} onOpenChange={() => setActiveModal(null)}>
         <DialogContent className="rounded-[24px] w-[90%] max-w-sm border-0 bg-white p-0 overflow-hidden">
             <div className="p-4 border-b border-[#E5E5EA] flex justify-between items-center bg-[#F9F9F9]">
                <h2 className="text-[17px] font-bold">Notifikasi</h2>
                <button onClick={() => setActiveModal(null)} className="bg-[#E5E5EA] p-1 rounded-full"><X size={16}/></button>
            </div>
            <div className="p-2">
                <ToggleItem label="Suara 'Beep' Kasir" checked={notifConfig.sound} onChange={() => setNotifConfig({...notifConfig, sound: !notifConfig.sound})} />
                <ToggleItem label="Peringatan Stok Menipis" checked={notifConfig.lowStock} onChange={() => setNotifConfig({...notifConfig, lowStock: !notifConfig.lowStock})} />
                <ToggleItem label="Laporan Harian via Email" checked={notifConfig.dailyReport} onChange={() => setNotifConfig({...notifConfig, dailyReport: !notifConfig.dailyReport})} isLast />
            </div>
         </DialogContent>
      </Dialog>

      {/* 4. MODAL KEAMANAN (Ganti Password) */}
      <Dialog open={activeModal === 'security'} onOpenChange={() => setActiveModal(null)}>
         <DialogContent className="rounded-[24px] w-[90%] max-w-md border-0 bg-white p-6">
            <h2 className="text-[17px] font-bold mb-4">Ganti Password</h2>
            <div className="space-y-3">
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <Input type="password" placeholder="Password Lama" className="pl-10 bg-[#F2F2F7] border-none font-semibold h-12" value={passForm.old} onChange={e => setPassForm({...passForm, old: e.target.value})} />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <Input type="password" placeholder="Password Baru" className="pl-10 bg-[#F2F2F7] border-none font-semibold h-12" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} />
                </div>
                <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <Input type="password" placeholder="Konfirmasi Password" className="pl-10 bg-[#F2F2F7] border-none font-semibold h-12" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} />
                </div>
                <button onClick={handleSaveSecurity} className={`w-full h-[50px] bg-[#34C759] rounded-[14px] font-bold text-white mt-2`}>Update Password</button>
            </div>
         </DialogContent>
      </Dialog>

      {/* 5. MODAL MANAJEMEN STAFF */}
      <Dialog open={activeModal === 'staff'} onOpenChange={() => setActiveModal(null)}>
         <DialogContent className="rounded-[24px] w-[95%] max-w-md border-0 bg-[#F2F2F7] p-0 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-[#E5E5EA] flex justify-between items-center bg-white shadow-sm shrink-0">
                <h2 className="text-[17px] font-bold">Manajemen Staff</h2>
                <button onClick={() => setIsAddStaffMode(!isAddStaffMode)} className={`text-[13px] font-bold ${isAddStaffMode ? 'text-red-500' : 'text-blue-600'}`}>
                    {isAddStaffMode ? 'Batal' : 'Tambah Staff'}
                </button>
            </div>

            {/* Content Area */}
            <div className="p-4 overflow-y-auto">
                {isAddStaffMode && (
                    <div className="bg-white p-4 rounded-[18px] mb-4 shadow-sm animate-in slide-in-from-top-2">
                        <h3 className="text-[13px] font-bold text-[#8E8E93] uppercase mb-3">Staff Baru</h3>
                        <div className="space-y-3">
                            <Input placeholder="Nama Lengkap" className="bg-[#F2F2F7] border-none" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                            <Input placeholder="Email Login" className="bg-[#F2F2F7] border-none" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                            <div className="flex gap-2">
                                {['Manager', 'Kasir'].map(role => (
                                    <button key={role} onClick={() => setNewStaff({...newStaff, role})} className={`flex-1 h-9 rounded-lg text-xs font-bold ${newStaff.role === role ? 'bg-blue-600 text-white' : 'bg-[#F2F2F7] text-gray-500'}`}>{role}</button>
                                ))}
                            </div>
                            <button onClick={handleAddStaff} className="w-full h-10 bg-blue-600 text-white rounded-xl font-bold text-sm">Simpan Staff</button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {staffList.map(staff => (
                        <div key={staff.id} className="bg-white p-3 rounded-[16px] flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">{staff.name.charAt(0)}</div>
                                <div>
                                    <p className="text-[15px] font-bold text-[#1C1C1E]">{staff.name}</p>
                                    <p className="text-[12px] text-[#8E8E93]">{staff.role} • {staff.email}</p>
                                </div>
                            </div>
                            {staff.id !== 1 && ( // Manager utama gak bisa dihapus
                                <button onClick={() => handleDeleteStaff(staff.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}

// Components Helper
function MenuItem({ icon: Icon, color, label, value, isLast, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center pl-4 active:bg-gray-50 transition-colors cursor-pointer hover:bg-gray-50/50`}>
       <div className={`w-[30px] h-[30px] rounded-[8px] ${color} flex items-center justify-center text-white mr-3 shadow-sm`}>
          <Icon size={18} />
       </div>
       <div className={`flex-1 flex justify-between items-center py-3 pr-4 border-b border-[#E5E5EA] ${isLast ? 'border-none' : ''}`}>
          <span className="text-[16px] font-medium text-[#1C1C1E]">{label}</span>
          <div className="flex items-center gap-2">
             {value && <span className="text-[15px] text-[#8E8E93] truncate max-w-[150px]">{value}</span>}
             <ChevronRight size={20} className="text-[#C7C7CC]" />
          </div>
       </div>
    </div>
  )
}

function ToggleItem({ label, checked, onChange, isLast }: any) {
    return (
        <div className={`flex items-center justify-between p-3 border-b border-[#E5E5EA] ${isLast ? 'border-none' : ''}`}>
            <span className="text-[15px] font-medium text-[#1C1C1E]">{label}</span>
            <div 
                onClick={onChange}
                className={`w-[50px] h-[30px] rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
            >
                <div className={`w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </div>
        </div>
    )
}