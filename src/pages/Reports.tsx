import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, 
  ArrowUpRight, 
  Download, 
  Search, 
  ChevronRight, 
  FileText
} from "lucide-react";

// Dummy Data Riwayat Transaksi
const MOCK_HISTORY = [
  { id: "INV-1707361", date: "2024-02-08T10:30:00", total: 150000, method: "cash", status: "success", items: 3 },
  { id: "INV-1707362", date: "2024-02-08T11:15:00", total: 45000, method: "qris", status: "success", items: 1 },
  { id: "INV-1707363", date: "2024-02-08T13:00:00", total: 325000, method: "transfer", status: "success", items: 5 },
  { id: "INV-1707364", date: "2024-02-08T14:20:00", total: 12000, method: "cash", status: "success", items: 1 },
  { id: "INV-1707365", date: "2024-02-08T15:45:00", total: 850000, method: "qris", status: "success", items: 2 },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const { storeType } = useAuth();
  
  const [filterDate, setFilterDate] = useState("Hari Ini");
  
  const isPrinting = storeType === 'printing';
  const themeColor = isPrinting ? 'text-[#007AFF]' : 'text-[#5856D6]';
  const bgTheme = isPrinting ? 'bg-[#007AFF]' : 'bg-[#5856D6]';

  // Hitung Total Dummy
  const totalOmset = MOCK_HISTORY.reduce((acc, curr) => acc + curr.total, 0);
  const totalTransaksi = MOCK_HISTORY.length;

  // Fungsi Reprint (Simulasi)
  const handleReprint = (trx: any) => {
    const dummyReprintData = {
        id: trx.id,
        date: trx.date,
        items: [
            { name: "Produk Contoh (Reprint)", qty: trx.items, price: trx.total / trx.items, category_id: 1, unit: 'pcs', image_url: '', is_customizable: false, stock: 10 } 
        ],
        total: trx.total,
        payment: {
            method: trx.method,
            amount: trx.total,
            change: 0
        },
        storeType
    };
    // ------------------------------------------------------------------
    
    localStorage.setItem("last_transaction", JSON.stringify(dummyReprintData));
    navigate("/invoice");
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto min-h-screen pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-[34px] font-bold tracking-tight text-[#1C1C1E]">Laporan</h1>
           <p className="text-[#8E8E93] text-sm">Ringkasan penjualan & arus kas</p>
        </div>
        
        {/* Date Filter Pill */}
        <div className="flex items-center gap-2 self-start bg-white p-1 rounded-full shadow-sm border border-gray-100">
            {['Hari Ini', 'Minggu Ini', 'Bulan Ini'].map((label) => (
                <button 
                    key={label}
                    onClick={() => setFilterDate(label)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${filterDate === label ? `${bgTheme} text-white shadow-md` : 'text-[#8E8E93] hover:bg-gray-50'}`}
                >
                    {label}
                </button>
            ))}
        </div>
      </div>

      {/* 1. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         {/* Card Omset (Besar) */}
         <div className={`col-span-1 md:col-span-2 ${bgTheme} rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden group`}>
             <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
             
             <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-1 opacity-80">
                    <Calendar size={16} />
                    <span className="text-[13px] font-medium uppercase tracking-wider">Pendapatan {filterDate}</span>
                 </div>
                 <h2 className="text-[42px] font-black tracking-tight leading-none mb-4">
                    {formatRupiah(totalOmset)}
                 </h2>
                 
                 <div className="flex gap-4">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-[12px] flex items-center gap-2">
                        <ArrowUpRight size={16} className="text-green-300" />
                        <span className="text-[13px] font-semibold">+12% vs Kemarin</span>
                    </div>
                 </div>
             </div>
         </div>

         {/* Card Statistik Kecil */}
         <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
             <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col justify-center">
                 <span className="text-[12px] text-[#8E8E93] font-medium uppercase mb-1">Total Transaksi</span>
                 <span className="text-[24px] font-bold text-[#1C1C1E]">{totalTransaksi}</span>
             </div>
             <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col justify-center">
                 <span className="text-[12px] text-[#8E8E93] font-medium uppercase mb-1">Rata-rata Order</span>
                 <span className="text-[24px] font-bold text-[#1C1C1E]">{formatRupiah(totalOmset / totalTransaksi)}</span>
             </div>
         </div>
      </div>

      {/* 2. TRANSACTION HISTORY LIST */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* List Header */}
          <div className="p-5 border-b border-[#E5E5EA] flex justify-between items-center bg-gray-50/50">
              <h3 className="text-[17px] font-bold text-[#1C1C1E]">Riwayat Transaksi</h3>
              <button className={`flex items-center gap-2 text-[13px] font-bold ${themeColor} bg-[#F2F2F7] px-3 py-1.5 rounded-lg active:scale-95 transition-transform`}>
                  <Download size={16} /> Export Excel
              </button>
          </div>

          {/* Search Transaction */}
          <div className="p-4 border-b border-[#E5E5EA]">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari No. Invoice..." 
                    className="w-full h-[44px] pl-10 pr-4 bg-[#F2F2F7] rounded-[12px] text-[15px] outline-none placeholder:text-[#C7C7CC] focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
             </div>
          </div>

          {/* Table List */}
          <div className="divide-y divide-[#E5E5EA]">
              {MOCK_HISTORY.map((trx, index) => (
                  <div 
                    key={trx.id} 
                    onClick={() => handleReprint(trx)}
                    className="p-4 flex items-center justify-between hover:bg-[#F9F9F9] transition-colors cursor-pointer group"
                  >
                      <div className="flex items-center gap-4">
                          {/* Icon Status */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                             <FileText size={20} />
                          </div>
                          
                          <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-[15px] font-bold text-[#1C1C1E]">{trx.id}</h4>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F2F2F7] text-[#8E8E93] uppercase">{trx.method}</span>
                              </div>
                              <p className="text-[13px] text-[#8E8E93]">
                                {new Date(trx.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} • {trx.items} Item
                              </p>
                          </div>
                      </div>

                      <div className="flex items-center gap-4">
                          <span className="text-[15px] font-bold text-[#1C1C1E]">{formatRupiah(trx.total)}</span>
                          <ChevronRight size={20} className="text-[#C7C7CC] group-hover:text-[#8E8E93] transition-colors" />
                      </div>
                  </div>
              ))}
          </div>
          
          <div className="p-4 text-center border-t border-[#E5E5EA]">
             <button className={`text-[13px] font-semibold ${themeColor}`}>Lihat Semua Transaksi</button>
          </div>
      </div>

    </div>
  );
}