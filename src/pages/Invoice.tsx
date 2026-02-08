import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "@/lib/utils";
import { Printer, Share2, ChevronLeft, CheckCircle2, Store } from "lucide-react";

// Tipe Data Transaksi
interface TransactionData {
  id: string;
  date: string;
  items: any[];
  total: number;
  payment: {
    method: 'cash' | 'qris';
    amount: number;
    change: number;
  };
  storeType: 'printing' | 'retail';
}

export default function InvoicePage() {
  const navigate = useNavigate();
  const [trx, setTrx] = useState<TransactionData | null>(null);

  useEffect(() => {
    // 1. Ambil data dari LocalStorage
    const savedData = localStorage.getItem("last_transaction");
    
    if (!savedData) {
      navigate("/pos"); 
      return;
    }

    setTrx(JSON.parse(savedData));
  }, [navigate]);

  if (!trx) return null; // Loading state

  // Config Tema Warna (Biru vs Ungu)
  const isPrinting = trx.storeType === 'printing';
  const themeColor = isPrinting ? 'text-[#007AFF]' : 'text-[#5856D6]';
  const bgTheme = isPrinting ? 'bg-[#007AFF]' : 'bg-[#5856D6]';

  // --- LOGIC 1: SHARE STRUK (WA/Copy) ---
  const handleShare = async () => {
    if (!trx) return;

    // Format Teks Struk Digital
    const shareText = `
*STRUK DIGITAL - ${isPrinting ? 'ARJUNA PRINT' : 'ARJUNA RETAIL'}*
--------------------------------
No: ${trx.id}
Tgl: ${new Date(trx.date).toLocaleDateString('id-ID')}
--------------------------------
${trx.items.map((item: any) => `${item.name} (${item.qty}x)`).join('\n')}
--------------------------------
*Total: ${formatRupiah(trx.total)}*
${trx.payment.method === 'cash' ? `Tunai: ${formatRupiah(trx.payment.amount)}` : 'Lunas via QRIS'}
--------------------------------
Terima kasih! Simpan struk ini sebagai bukti sah.
    `.trim();

    // Cek Fitur Share Bawaan HP (Mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Struk Arjuna POS',
          text: shareText,
        });
      } catch (err) {
        console.log('User membatalkan share');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Struk berhasil disalin! Silakan Paste (Ctrl+V) di WhatsApp Web.");
      } catch (err) {
        alert("Gagal menyalin struk. Browser tidak mendukung.");
      }
    }
  };

  // --- LOGIC 2: PRINT STRUK ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] py-6 px-4 md:py-10 font-sans relative">
      
      {/* --- NAVIGATION BAR --- */}
      {/* Disembunyikan saat mode cetak (print:hidden) */}
      <div className="max-w-md mx-auto flex justify-between items-center mb-6 print:hidden">
        <button 
          onClick={() => navigate("/pos")}
          className={`flex items-center gap-1 font-medium text-[17px] ${themeColor} active:opacity-50 transition-opacity`}
        >
          <ChevronLeft size={24} /> Kembali
        </button>
        
        <div className="flex gap-3">
           {/* Tombol Share */}
           <button 
             onClick={handleShare}
             className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#007AFF] shadow-sm active:scale-90 transition-transform"
             title="Bagikan Struk"
           >
             <Share2 size={20} />
           </button>
           
           {/* Tombol Print */}
           <button 
             onClick={handlePrint}
             className={`w-10 h-10 ${bgTheme} rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform`}
             title="Cetak Struk"
           >
             <Printer size={20} />
           </button>
        </div>
      </div>

      {/* --- KERTAS STRUK --- */}
      <div className="max-w-md mx-auto bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden print:shadow-none print:rounded-0 print:w-full print:max-w-none">
         
         {/* 1. Header Toko */}
         <div className="text-center pt-10 pb-6 px-8 border-b border-dashed border-gray-200">
            <div className={`w-16 h-16 ${bgTheme}/10 rounded-[20px] flex items-center justify-center mx-auto mb-4 ${themeColor}`}>
              <Store size={32} />
            </div>
            <h1 className="text-[28px] font-black text-[#1C1C1E] tracking-tight leading-none mb-2">ARJUNA</h1>
            <p className={`text-[13px] font-bold tracking-[2px] uppercase ${themeColor}`}>
              {isPrinting ? 'DIGITAL PRINTING' : 'RETAIL STORE'}
            </p>
            <p className="text-[13px] text-[#8E8E93] mt-3 leading-relaxed">
              Jl. Ahmad Yani No. 88, Kota<br/>
              WhatsApp: 0812-3456-7890
            </p>
         </div>

         {/* 2. Detail Info */}
         <div className="px-8 py-6 space-y-4">
            <div className="flex justify-between items-center text-[13px]">
               <span className="text-[#8E8E93] font-medium">No. Invoice</span>
               <span className="font-bold text-[#1C1C1E]">{trx.id}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
               <span className="text-[#8E8E93] font-medium">Tanggal</span>
               <span className="font-bold text-[#1C1C1E]">
                 {new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
               <span className="text-[#8E8E93] font-medium">Metode Bayar</span>
               <span className="font-bold text-[#1C1C1E] uppercase bg-gray-100 px-2 py-0.5 rounded text-[11px]">{trx.payment.method}</span>
            </div>
         </div>

         {/* 3. Daftar Item (Tabel) */}
         <div className="bg-[#F9F9F9] px-8 py-4 border-t border-b border-gray-100">
            <table className="w-full text-[13px]">
               <thead>
                 <tr className="text-[#8E8E93] text-left border-b border-gray-200">
                    <th className="pb-2 font-medium w-[50%]">Item</th>
                    <th className="pb-2 font-medium text-center w-[15%]">Qty</th>
                    <th className="pb-2 font-medium text-right w-[35%]">Total</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200/50">
                 {trx.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 align-top">
                        <div className="font-bold text-[#1C1C1E]">{item.name}</div>
                        {item.custom_length && (
                          <div className="text-[11px] text-[#8E8E93] mt-0.5">
                            Ukuran: {item.custom_length}m x {item.custom_width || 1}m
                          </div>
                        )}
                      </td>
                      <td className="py-3 align-top text-center font-medium text-[#1C1C1E]">{item.qty}</td>
                      <td className="py-3 align-top text-right font-bold text-[#1C1C1E]">
                        {formatRupiah(item.price * (item.custom_length || 1) * item.qty)}
                      </td>
                    </tr>
                 ))}
               </tbody>
            </table>
         </div>

         {/* 4. Total & Pembayaran */}
         <div className="px-8 py-6 space-y-3">
             <div className="flex justify-between text-[13px]">
                <span className="text-[#8E8E93] font-medium">Subtotal</span>
                <span className="font-bold text-[#1C1C1E]">{formatRupiah(trx.total)}</span>
             </div>
             <div className="flex justify-between text-[13px]">
                <span className="text-[#8E8E93] font-medium">Pajak (0%)</span>
                <span className="font-bold text-[#1C1C1E]">Rp 0</span>
             </div>
             
             {/* Highlight Total Bayar */}
             <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                <span className="text-[15px] font-bold text-[#1C1C1E]">Total Bayar</span>
                <span className={`text-[20px] font-black ${themeColor}`}>
                   {formatRupiah(trx.total)}
                </span>
             </div>

             {/* Info Kembalian (Jika Tunai) */}
             {trx.payment.method === 'cash' && (
               <div className="bg-[#F2F2F7] rounded-[12px] p-3 flex justify-between items-center text-[13px] mt-2">
                  <div className="text-[#8E8E93]">
                    Tunai: <span className="font-bold text-[#1C1C1E]">{formatRupiah(trx.payment.amount)}</span>
                  </div>
                  <div className="text-[#8E8E93]">
                    Kembali: <span className={`font-bold ${trx.payment.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatRupiah(trx.payment.change)}</span>
                  </div>
               </div>
             )}
         </div>

         {/* 5. Footer / QR */}
         <div className="bg-gray-50 p-8 text-center border-t border-gray-100">
             <div className="bg-white p-2 rounded-[12px] shadow-sm inline-block mb-4 border border-gray-100">
                {/* Simulasi QR Code */}
                <div className="w-24 h-24 bg-[#1C1C1E] rounded-[8px] flex items-center justify-center">
                   <CheckCircle2 className="text-white" size={32}/>
                </div>
             </div>
             <p className="text-[12px] text-[#8E8E93] font-medium italic">
               "Terima kasih telah mempercayai Arjuna"
             </p>
             <p className="text-[10px] text-[#C7C7CC] mt-1">Simpan struk ini sebagai bukti pembayaran sah.</p>
         </div>

      </div>
    </div>
  );
}