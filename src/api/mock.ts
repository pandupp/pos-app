import type { AxiosRequestConfig } from 'axios';
import type { User, Category, Item } from '@/types/api';

// --- 1. DATA DUMMY HYBRID (Printing & Seragam) ---

const MOCK_USERS: User[] = [
  // --- USER 1: TOKO SERAGAM ---
  { 
    id: 1, 
    name: 'Admin Seragam', 
    email: 'admin@arjuna.seragam', 
    role: 'admin' 
  },

  // --- USER 2: TOKO PRINTING ---
  { 
    id: 2, 
    name: 'Operator Printing', 
    email: 'admin@arjuna.digital', 
    role: 'operator' 
  },

  // --- USER 3: OWNER ---
  { 
    id: 3, 
    name: 'Pak Bos', 
    email: 'owner@arjuna.group', 
    role: 'owner' 
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Digital Printing' }, 
  { id: 2, name: 'Seragam Sekolah' },  
  { id: 3, name: 'ATK & Aksesoris' },  
];

const MOCK_ITEMS: Item[] = [
  // --- PRODUK TOKO 1: DIGITAL PRINTING (Satuan Meter) ---
  {
    id: 101,
    category_id: 1,
    name: 'Flexi China 280g',
    description: 'Spanduk Outdoor Hemat',
    image_url: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=300&q=80',
    stock: 1000, 
    price: 15000, // Harga per m2
    unit: 'm²',   // Satuan meter persegi
    is_customizable: true // MUNCOL POP-UP
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
    is_customizable: true // MUNCOL POP-UP
  },

  {
    id: 103,
    category_id: 1, // Tetap kategori Printing
    name: 'Sticker Vinyl A3+ (Print & Cut)',
    description: 'Ukuran 32x48cm, sudah kiss cut',
    image_url: 'https://images.unsplash.com/photo-1616628188550-808963486a96?auto=format&fit=crop&w=300&q=80',
    stock: 1000,
    price: 15000,
    unit: 'lbr', // Satuan Lembar
    is_customizable: false // LANGSUNG MASUK KERANJANG (Gak perlu input P x L)
  },

  // --- PRODUK TOKO 2: SERAGAM (Satuan Pcs) ---
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

// --- 2. HANDLER UTAMA ---

export const mockHandler = (config: AxiosRequestConfig): any => {
  const { url, method, data } = config;
  const path = url?.replace('/v1', '') || '';

  // Helper Parsing Body
  let body: any = {};
  try {
    if (data && typeof data === 'string') body = JSON.parse(data);
    else if (data) body = data;
  } catch (e) { console.error("Parse Error", e); }

  console.log(`[MOCK API] ${method?.toUpperCase()} ${path}`, body);

  // --- LOGIN LOGIC (Updated) ---
  if (path.includes('/auth/login') && method === 'post') {
    const loginEmail = body.email; 
    
    // Cari user berdasarkan email yang diinput
    const user = MOCK_USERS.find((u) => u.email === loginEmail);

    // Password: 123456
    if (user && body.password === '123456') {
      return successResponse({
          user: user,
          token: 'mock-token-' + user.id,
      });
    }
    return errorResponse('Email atau Password salah! (Coba: admin@arjuna.seragam)', 401);
  }

  // --- DATA DASHBOARD ---
  if (path.includes('/dashboard/summary') && method === 'get') {
    return successResponse({
      total_revenue: 25800000,
      transaction_count: 45,
      items_sold: 120,
      top_selling_item: "Kemeja Putih SD (Pendek)" 
    });
  }

  // --- ITEMS & CATEGORIES ---
  if (path.includes('/items') && method === 'get') {
    return successResponse(MOCK_ITEMS);
  }
  if (path.includes('/categories') && method === 'get') {
    return successResponse(MOCK_CATEGORIES);
  }

  return errorResponse('Endpoint not found', 404);
};

// --- HELPER RESPONSE ---
const successResponse = (data: any) => ({
  success: true, message: 'OK', data
});

const errorResponse = (message: string, code: number = 400) => {
  const error: any = new Error(message);
  error.response = { status: code, data: { success: false, message } };
  throw error;
};