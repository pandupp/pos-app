import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/axios";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Item, CartItem, Category } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Plus, Minus, Package, Banknote, QrCode, X, Trash2 } from "lucide-react"; 

export default function POSPage() {
  const navigate = useNavigate();
  const { storeType } = useAuth();
  
  // --- STATE DATA ---
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  
  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [customDim, setCustomDim] = useState({ length: "1", width: "1", qty: 1 });
  
  // --- PAYMENT ---
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
  const [cashAmount, setCashAmount] = useState<string>("");

  const isPrinting = storeType === 'printing';
  const themeColor = isPrinting ? 'text-[#007AFF]' : 'text-[#5856D6]';
  const bgTheme = isPrinting ? 'bg-[#007AFF]' : 'bg-[#5856D6]';
  const borderTheme = isPrinting ? 'border-[#007AFF]' : 'border-[#5856D6]';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [i, c] = await Promise.all([apiClient.get('/items'), apiClient.get('/categories')]);
        setItems(i.data.data);
        setCategories(c.data.data);
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  // --- 🔊 AUDIO FX ENGINE ---
  
  // Helper: Cek Settingan Suara
  const isSoundEnabled = () => {
    const savedNotif = localStorage.getItem("settings_notif");
    if (savedNotif) {
        const config = JSON.parse(savedNotif);
        return config.sound;
    }
    return true; 
  };

  // 1. Suara Scan (Beep Pendek)
  const playScannerBeep = () => {
    if (!isSoundEnabled()) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine"; 
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08); 
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  // 2. Suara Sukses Bayar (Nada "Tring!" Naik)
  const playSuccessSound = () => {
    if (!isSoundEnabled()) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playNote = (freq: number, time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "triangle"; 
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.3);
        
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.3);
    };

    playNote(523.25, 0);  
    playNote(783.99, 0.1); 
  }; 

  // --- LOGIC CART ---
  
  const handleItemClick = (item: Item) => {
    if (storeType === 'retail' || !item.is_customizable) {
      addToCartSimple(item);
    } else {
      setSelectedItem(item);
      setCustomDim({ length: "1", width: "1", qty: 1 });
      setIsModalOpen(true);
    }
  };

  const addToCartSimple = (item: Item) => {
    playScannerBeep(); 
    setCart(prev => {
      const exist = prev.find(c => c.id === item.id && !c.custom_length);
      if (exist) {
        return prev.map(c => c.id === item.id && !c.custom_length ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const addToCartCustom = () => {
    if (!selectedItem) return;
    const l = parseFloat(customDim.length);
    const w = parseFloat(customDim.width);
    if (isNaN(l) || l <= 0) return alert("Panjang tidak valid");
    if (isNaN(w) || w <= 0) return alert("Lebar tidak valid");

    playScannerBeep(); 

    setCart(prev => [...prev, { 
      ...selectedItem, 
      qty: customDim.qty, 
      custom_length: l, 
      custom_width: w, 
      originalId: Date.now() 
    }]);
    setIsModalOpen(false);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const grandTotal = cart.reduce((sum, item) => {
    if (item.custom_length) {
       const area = item.custom_length * (item.custom_width || 1);
       return sum + (item.price * area * item.qty);
    }
    return sum + (item.price * item.qty);
  }, 0);
  
  const payValue = paymentMethod === 'cash' 
    ? parseInt(cashAmount.replace(/\D/g, '') || '0') 
    : grandTotal; 
    
  const change = payValue - grandTotal;
  const isEnough = payValue >= grandTotal;

  // --- PROSES BAYAR & PINDAH HALAMAN ---
  const processPayment = () => {
    playSuccessSound(); // <--- 🔊✨

    const transactionData = {
        id: `INV-${Date.now()}`,
        date: new Date().toISOString(),
        items: cart,
        total: grandTotal,
        payment: { method: paymentMethod, amount: payValue, change: change },
        storeType
    };
    
    localStorage.setItem("last_transaction", JSON.stringify(transactionData));
    
    setTimeout(() => {
        setCart([]); setCashAmount(""); setIsCheckoutOpen(false);
        navigate("/invoice");
    }, 300);
  };

  const filteredData = useMemo(() => {
    const validItems = items.filter(item => {
      if (storeType === 'printing') return item.category_id === 1 || item.category_id === 3;
      if (storeType === 'retail') return item.category_id === 2 || item.category_id === 3;
      return true;
    });
    const validCategories = categories.filter(cat => {
       if (storeType === 'printing') return cat.id === 1 || cat.id === 3;
       if (storeType === 'retail') return cat.id === 2 || cat.id === 3;
       return true;
    });
    const displayedItems = validItems.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) && 
      (selectedCat ? i.category_id === selectedCat : true)
    );
    return { displayedItems, validCategories };
  }, [items, categories, search, selectedCat, storeType]);

  const modalSubtotal = selectedItem ? (
      selectedItem.price * (parseFloat(customDim.length) || 0) * (parseFloat(customDim.width) || 1) * customDim.qty
  ) : 0;

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto min-h-screen pb-32">
      {/* HEADER & SEARCH */}
      <div className="mb-6">
        <h1 className="text-[34px] font-bold tracking-tight text-[#1C1C1E] mb-4">Kasir</h1>
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]"><Search size={18} /></div>
          <input type="text" placeholder="Cari Produk..." className="w-full h-[44px] pl-10 pr-4 bg-[#E5E5EA] rounded-[10px] text-[17px] placeholder-[#8E8E93] focus:outline-none" value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSelectedCat(null)} className={`px-5 h-[32px] rounded-full text-[15px] font-medium whitespace-nowrap transition-all ${selectedCat === null ? `${bgTheme} text-white` : 'bg-white text-[#1C1C1E] shadow-sm'}`}>Semua</button>
          {filteredData.validCategories.map(c => (
            <button key={c.id} onClick={() => setSelectedCat(c.id)} className={`px-5 h-[32px] rounded-full text-[15px] font-medium whitespace-nowrap transition-all ${selectedCat === c.id ? `${bgTheme} text-white` : 'bg-white text-[#1C1C1E] shadow-sm'}`}>{c.name}</button>
          ))}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredData.displayedItems.map(item => (
          <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white p-3 rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:scale-[0.97] transition-all duration-200 cursor-pointer overflow-hidden group">
            <div className="aspect-square w-full bg-[#F2F2F7] rounded-[14px] mb-3 relative overflow-hidden">
               {item.image_url ? (
                  <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#C7C7CC]"><Package size={32}/></div>
               )}
               <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-[6px] text-[10px] font-bold text-[#1C1C1E] shadow-sm">/{item.unit}</div>
            </div>
            <div className="px-1">
               <h3 className="text-[15px] font-semibold text-[#1C1C1E] leading-tight mb-1 line-clamp-2 min-h-[40px]">{item.name}</h3>
               <div className="flex items-center justify-between mt-1">
                 <span className={`text-[15px] font-bold ${themeColor}`}>{formatRupiah(item.price)}</span>
                 <div className={`w-7 h-7 rounded-full ${bgTheme} flex items-center justify-center text-white shadow-md`}><Plus size={16} strokeWidth={3}/></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* FLOATING CART */}
      {cart.length > 0 && (
        <div className="fixed bottom-[90px] md:bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
           <div className="bg-[#1C1C1E]/90 backdrop-blur-xl text-white rounded-[30px] p-2 pl-6 pr-2 flex justify-between items-center shadow-2xl ring-1 ring-white/10 animate-in slide-in-from-bottom-4">
              <div className="flex flex-col cursor-pointer" onClick={() => setIsCheckoutOpen(true)}>
                 <span className="text-[11px] text-[#8E8E93] font-medium uppercase tracking-wide">Total ({cart.length} Item)</span>
                 <span className="text-[18px] font-bold">{formatRupiah(grandTotal)}</span>
              </div>
              <button onClick={() => setIsCheckoutOpen(true)} className={`h-[48px] px-6 rounded-[24px] font-bold text-[15px] text-white ${bgTheme} shadow-lg active:scale-95 transition-transform`}>
                 Bayar
              </button>
           </div>
        </div>
      )}

      {/* MODAL UKURAN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[24px] w-[90%] max-w-sm border-0 bg-white/95 backdrop-blur-xl p-0 gap-0 overflow-hidden">
            <div className="p-4 border-b border-[#E5E5EA] text-center bg-[#F9F9F9]">
                <h2 className="text-[17px] font-semibold">Atur Ukuran</h2>
                <p className={`text-[15px] font-bold mt-1 ${themeColor}`}>{formatRupiah(modalSubtotal)}</p>
            </div>
            <div className="p-6 space-y-5">
                {selectedItem && (
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                         <div className="w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0">
                            {selectedItem.image_url ? <img src={selectedItem.image_url} className="w-full h-full object-cover"/> : <Package className="p-2"/>}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{selectedItem.name}</p>
                            <p className="text-xs text-slate-500">{formatRupiah(selectedItem.price)} / {selectedItem.unit}</p>
                         </div>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F2F2F7] p-3 rounded-[16px] text-center">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase">Panjang (m)</label>
                        <Input type="number" step="0.01" className="bg-transparent border-none text-center text-[22px] font-bold h-10 shadow-none focus-visible:ring-0 p-0 placeholder:text-gray-300" value={customDim.length} onChange={(e) => setCustomDim({...customDim, length: e.target.value})}/>
                    </div>
                    <div className="bg-[#F2F2F7] p-3 rounded-[16px] text-center">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase">Lebar (m)</label>
                        <Input type="number" step="0.01" className="bg-transparent border-none text-center text-[22px] font-bold h-10 shadow-none focus-visible:ring-0 p-0 placeholder:text-gray-300" value={customDim.width} onChange={(e) => setCustomDim({...customDim, width: e.target.value})}/>
                    </div>
                </div>
                <div className="bg-[#F2F2F7] p-3 rounded-[16px] flex items-center justify-between px-2">
                    <button onClick={() => setCustomDim(d => ({...d, qty: Math.max(1, d.qty - 1)}))} className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-[#1C1C1E] active:scale-90"><Minus size={16}/></button>
                    <span className="text-[14px] font-medium text-[#8E8E93]">Jumlah: <span className="text-[#1C1C1E] font-bold text-[18px] ml-1">{customDim.qty}</span></span>
                    <button onClick={() => setCustomDim(d => ({...d, qty: d.qty + 1}))} className={`w-8 h-8 ${bgTheme} rounded-full shadow-sm flex items-center justify-center text-white active:scale-90`}><Plus size={16}/></button>
                </div>
                <button onClick={addToCartCustom} className={`w-full h-[52px] ${bgTheme} rounded-[16px] font-bold text-white text-[17px] active:scale-[0.98] transition-all shadow-lg`}>Tambahkan</button>
            </div>
        </DialogContent>
      </Dialog>

      {/* MODAL CHECKOUT */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
         <DialogContent className="rounded-[24px] w-[90%] max-w-md border-0 bg-[#F2F2F7] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white p-5 shadow-sm z-10 shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-[17px] font-bold">Rincian Pembayaran</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} className="bg-gray-100 p-1 rounded-full"><X size={16}/></button>
                </div>
                <div className="max-h-[100px] overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-hide">
                    {cart.map((c, idx) => (
                        <div key={idx} className="flex justify-between text-[13px]">
                            <div className="flex gap-2">
                                <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:bg-red-50 rounded p-0.5"><Trash2 size={12}/></button>
                                <span className="text-gray-600 line-clamp-1 w-[140px]">{c.name} {c.custom_length ? `(${c.custom_length}x${c.custom_width||1}m)` : ''}</span>
                            </div>
                            <span className="font-semibold">{formatRupiah(c.price * (c.custom_length ? (c.custom_length * (c.custom_width||1)) : 1) * c.qty)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-end">
                    <span className="text-[13px] font-semibold text-[#8E8E93] uppercase">Total Tagihan</span>
                    <span className="text-[28px] font-black text-[#1C1C1E] leading-none">{formatRupiah(grandTotal)}</span>
                </div>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPaymentMethod('cash')} className={`h-[70px] rounded-[16px] flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'cash' ? `bg-white ${borderTheme} shadow-md` : 'bg-white border-transparent text-gray-400'}`}>
                        <Banknote size={20} className={paymentMethod === 'cash' ? themeColor : ''} />
                        <span className="text-[12px] font-bold">Tunai</span>
                    </button>
                    <button onClick={() => setPaymentMethod('qris')} className={`h-[70px] rounded-[16px] flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'qris' ? `bg-white ${borderTheme} shadow-md` : 'bg-white border-transparent text-gray-400'}`}>
                        <QrCode size={20} className={paymentMethod === 'qris' ? themeColor : ''} />
                        <span className="text-[12px] font-bold">QRIS / Transfer</span>
                    </button>
                </div>
                {paymentMethod === 'cash' ? (
                    <div className="bg-white p-4 rounded-[20px] shadow-sm">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Uang Diterima</label>
                        <Input type="number" className="bg-[#F2F2F7] border-none text-[24px] font-bold h-12 rounded-[14px] px-4 text-[#1C1C1E]" placeholder="0" autoFocus value={cashAmount} onChange={(e) => setCashAmount(e.target.value)}/>
                        <div className="flex justify-between mt-3 px-1 pt-2 border-t border-dashed border-gray-100">
                            <span className="text-[14px] font-medium text-[#8E8E93]">Kembalian</span>
                            <span className={`text-[18px] font-black ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatRupiah(change)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-[#1C1C1E] rounded-xl flex items-center justify-center text-white mb-2"><QrCode size={40} /></div>
                        <p className="text-[13px] font-bold">Scan QRIS</p>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 mt-auto shrink-0">
                <button onClick={processPayment} disabled={paymentMethod === 'cash' && !isEnough} className={`w-full h-[52px] ${isEnough || paymentMethod === 'qris' ? bgTheme : 'bg-[#E5E5EA] text-[#8E8E93]'} rounded-[16px] font-bold text-white text-[17px] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2`}>
                    {paymentMethod === 'cash' ? (isEnough ? 'Cetak Struk' : 'Uang Kurang') : 'Konfirmasi Lunas'}
                </button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}