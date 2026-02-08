import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Item, Category } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Plus, Package, Edit3, Trash2, Save, X, Image as ImageIcon } from "lucide-react";

export default function ItemsPage() {
  const { storeType } = useAuth();
  
  // State Data
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<number | null>(null);

  // State Modal (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const defaultForm = {
    id: 0,
    name: "",
    description: "", 
    price: "",
    stock: "",
    category_id: storeType === 'printing' ? 1 : 2,
    unit: "pcs",
    image_url: "",
    is_customizable: false
  };
  const [formData, setFormData] = useState(defaultForm);

  const isPrinting = storeType === 'printing';
  const themeColor = isPrinting ? 'text-[#007AFF]' : 'text-[#5856D6]';
  const bgTheme = isPrinting ? 'bg-[#007AFF]' : 'bg-[#5856D6]';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [i, c] = await Promise.all([apiClient.get('/items'), apiClient.get('/categories')]);
      setItems(i.data.data);
      setCategories(c.data.data);
    } catch (e) { console.error(e); }
  };

  // --- CRUD LOGIC ---
  
  const handleEdit = (item: Item) => {
    setFormData({
        id: item.id,
        name: item.name,
        description: item.description || "", 
        price: item.price.toString(),
        stock: item.stock.toString(),
        category_id: item.category_id || 1, 
        unit: item.unit,
        image_url: item.image_url || "",
        is_customizable: item.is_customizable || false
    });
    setIsEditing(true);
    setIsModalOpen(true);
};

  const handleAdd = () => {
    setFormData(defaultForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return alert("Nama dan Harga wajib diisi");

    const newItem: Item = {
        ...formData,
        description: formData.description || "Deskripsi produk", 
        id: isEditing ? formData.id : Date.now(),
        price: parseFloat(formData.price.toString()) || 0,
        stock: parseInt(formData.stock.toString()) || 0,
        category_id: Number(formData.category_id) 
    };

    if (isEditing) {
        setItems(prev => prev.map(item => item.id === newItem.id ? newItem : item));
    } else {
        setItems(prev => [newItem, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
        setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? item.category_id === filterCat : true;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto min-h-screen pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
           <h1 className="text-[34px] font-bold tracking-tight text-[#1C1C1E]">Produk</h1>
           <p className="text-[#8E8E93] text-sm">Kelola stok dan harga barang</p>
        </div>
        <button onClick={handleAdd} className={`h-[44px] px-6 rounded-full font-bold text-white ${bgTheme} shadow-lg active:scale-95 transition-transform flex items-center gap-2 self-start md:self-auto`}>
            <Plus size={20} /> Tambah Produk
        </button>
      </div>

      {/* TOOLS */}
      <div className="bg-white p-2 rounded-[16px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2 mb-6">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={18} />
            <input type="text" placeholder="Cari nama barang..." className="w-full h-[40px] pl-10 pr-4 bg-transparent text-[15px] outline-none placeholder:text-[#C7C7CC]" value={search} onChange={e => setSearch(e.target.value)}/>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide px-2">
            <button onClick={() => setFilterCat(null)} className={`px-4 h-[32px] rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${filterCat === null ? 'bg-[#1C1C1E] text-white' : 'bg-[#F2F2F7] text-[#8E8E93]'}`}>Semua</button>
            {categories.map(c => (
                 <button key={c.id} onClick={() => setFilterCat(c.id)} className={`px-4 h-[32px] rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${filterCat === c.id ? 'bg-[#1C1C1E] text-white' : 'bg-[#F2F2F7] text-[#8E8E93]'}`}>{c.name}</button>
            ))}
         </div>
      </div>

      {/* LIST ITEM */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
         {filteredItems.length === 0 ? (
             <div className="p-10 text-center text-[#8E8E93]">
                 <Package size={48} className="mx-auto mb-3 opacity-20"/>
                 <p>Belum ada produk</p>
             </div>
         ) : (
             <div className="divide-y divide-[#E5E5EA]">
                 {filteredItems.map(item => (
                     <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-[#F9F9F9] transition-colors group">
                         <div className="w-12 h-12 rounded-[10px] bg-[#F2F2F7] overflow-hidden flex-shrink-0 border border-gray-100">
                             {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#C7C7CC]"><Package size={20}/></div>}
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start">
                                 <h3 className="text-[16px] font-semibold text-[#1C1C1E] truncate pr-2">{item.name}</h3>
                                 <span className={`text-[15px] font-bold ${themeColor}`}>{formatRupiah(item.price)}</span>
                             </div>
                             <div className="flex justify-between items-center mt-1">
                                 <p className="text-[13px] text-[#8E8E93]">Stok: <span className={item.stock < 10 ? 'text-red-500 font-bold' : 'text-[#1C1C1E]'}>{item.stock} {item.unit}</span></p>
                                 <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => handleEdit(item)} className="p-2 rounded-full bg-[#F2F2F7] text-[#007AFF] hover:bg-blue-100"><Edit3 size={16}/></button>
                                     <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full bg-[#F2F2F7] text-[#FF3B30] hover:bg-red-100"><Trash2 size={16}/></button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {/* MODAL FORM */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[24px] w-[95%] max-w-md bg-[#F2F2F7] p-0 gap-0 overflow-hidden border-0">
            <div className="bg-white p-4 flex justify-between items-center shadow-sm">
                <h2 className="text-[17px] font-bold">{isEditing ? 'Edit Produk' : 'Produk Baru'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-[#E5E5EA] rounded-full p-1.5"><X size={18} className="text-[#8E8E93]" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="bg-white p-4 rounded-[16px] flex flex-col items-center justify-center border-2 border-dashed border-[#C7C7CC] cursor-pointer hover:border-[#007AFF] transition-colors group">
                    {formData.image_url ? (
                        <img src={formData.image_url} className="h-32 object-contain rounded-lg" />
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 bg-[#F2F2F7] rounded-full flex items-center justify-center text-[#8E8E93] mx-auto mb-2 group-hover:text-[#007AFF]"><ImageIcon size={24}/></div>
                            <p className="text-[13px] text-[#8E8E93] font-medium">Ketuk untuk upload foto</p>
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-[16px] p-4 space-y-4 shadow-sm">
                    <div>
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Nama Produk</label>
                        <Input className="bg-[#F2F2F7] border-none h-10 font-semibold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Kemeja SD"/>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Deskripsi</label>
                        <Input className="bg-[#F2F2F7] border-none h-10 font-semibold" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Keterangan singkat..."/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Harga (Rp)</label>
                            <Input type="number" className="bg-[#F2F2F7] border-none h-10 font-semibold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0"/>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Stok Awal</label>
                            <Input type="number" className="bg-[#F2F2F7] border-none h-10 font-semibold" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="0"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Satuan</label>
                            <select className="w-full h-10 bg-[#F2F2F7] rounded-md px-3 text-sm font-semibold outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                                <option value="pcs">Pcs</option>
                                <option value="m">Meter (m)</option>
                                <option value="lbr">Lembar</option>
                                <option value="lsn">Lusin</option>
                            </select>
                        </div>
                        <div>
                             <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Tipe Input</label>
                             <div className="flex items-center gap-2 h-10">
                                <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-0" checked={formData.is_customizable} onChange={e => setFormData({...formData, is_customizable: e.target.checked})} />
                                <span className="text-[13px] font-medium">Custom Ukuran?</span>
                             </div>
                        </div>
                    </div>
                     <div>
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase mb-1 block">Kategori</label>
                        <select className="w-full h-10 bg-[#F2F2F7] rounded-md px-3 text-sm font-semibold outline-none" value={formData.category_id} onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white border-t border-[#E5E5EA]">
                <button onClick={handleSave} className={`w-full h-[50px] ${bgTheme} rounded-[14px] font-bold text-white text-[17px] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2`}>
                    <Save size={20} /> Simpan Produk
                </button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}