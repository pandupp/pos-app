import type { Item, Category, User } from '@/types/api';

// --- 1. DATA USER (Login) ---
export const MOCK_USERS: User[] = [
  { 
    id: 1, 
    name: 'Admin Seragam', 
    email: 'admin@arjuna.seragam', 
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Seragam&background=random'
  },
  { 
    id: 2, 
    name: 'Operator Printing', 
    email: 'admin@arjuna.digital', 
    role: 'operator',
    avatar: 'https://ui-avatars.com/api/?name=Operator+Print&background=random'
  },
  { 
    id: 3, 
    name: 'Pak Bos', 
    email: 'owner@arjuna.group', 
    role: 'owner',
    avatar: 'https://ui-avatars.com/api/?name=Pak+Bos&background=random'
  },
];

// --- 2. DATA KATEGORI ---
export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Digital Printing' }, 
  { id: 2, name: 'Seragam Sekolah' },  
  { id: 3, name: 'ATK & Aksesoris' },  
];

// --- 3. DATA PRODUK (Items) ---
export const MOCK_ITEMS: Item[] = [
  // --- PRODUK TOKO 1: DIGITAL PRINTING ---
  {
    id: 101,
    category_id: 1,
    name: 'Flexi China 280g',
    description: 'Spanduk Outdoor Hemat',
    image_url: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=300&q=80',
    stock: 1000, 
    price: 15000, 
    unit: 'm²',   
    is_customizable: true 
  },
  {
    id: 102,
    category_id: 1,
    name: 'Sticker Vinyl (Meteran)',
    description: 'Bahan Ritrama/Orajet (Lebar 1m)',
    image_url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=300&q=80',
    stock: 500,
    price: 85000,
    unit: 'm',
    is_customizable: true 
  },
  {
    id: 103,
    category_id: 1, 
    name: 'Sticker Vinyl A3+ (Print & Cut)',
    description: 'Ukuran 32x48cm, sudah kiss cut',
    image_url: 'https://images.unsplash.com/photo-1616628188550-808963486a96?auto=format&fit=crop&w=300&q=80',
    stock: 1000,
    price: 15000,
    unit: 'lbr', 
    is_customizable: false 
  },

  // --- PRODUK TOKO 2: SERAGAM ---
  {
    id: 201,
    category_id: 2,
    name: 'Kemeja Putih SD (Pendek)',
    description: 'Bahan Oxford, tidak panas, Size M',
    image_url: 'https://images.unsplash.com/photo-1624225206972-e1610e6a1078?auto=format&fit=crop&w=300&q=80',
    stock: 50, 
    price: 45000,
    unit: 'pcs', 
    is_customizable: false
  },
  {
    id: 202,
    category_id: 2,
    name: 'Celana Merah SD (Panjang)',
    description: 'Bahan Drill kuat, pinggang karet',
    image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=300&q=80',
    stock: 35,
    price: 55000,
    unit: 'pcs',
    is_customizable: false
  },
  
  // --- PRODUK UMUM ---
  {
    id: 301,
    category_id: 3,
    name: 'Topi Sekolah Logo',
    description: 'Topi merah putih dengan logo tut wuri',
    image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=300&q=80',
    stock: 100,
    price: 15000,
    unit: 'pcs',
    is_customizable: false
  }
];