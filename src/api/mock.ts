import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse, User, Category, Item } from '@/types/api';

// --- 1. DATA DUMMY ---
const MOCK_USERS: User[] = [
  { id: 1, name: 'Budi Owner', email: 'owner@store.com', role: 'owner' },
  { id: 2, name: 'Siti Admin', email: 'admin@store.com', role: 'admin' },
  { id: 3, name: 'Andi Kasir', email: 'cashier@store.com', role: 'operator' },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Minuman' },
  { id: 2, name: 'Makanan' },
  { id: 3, name: 'Snack' },
];

const MOCK_ITEMS: Item[] = [
  {
    id: 101,
    category_id: 1,
    name: 'Kopi Susu Gula Aren',
    description: 'Robusta blend dengan gula aren asli',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop',
    stock: 45,
    price: 18000,
  },
];

// --- 2. HANDLER UTAMA ---
export const mockHandler = (config: AxiosRequestConfig): any => {
  const { url, method, data } = config;
  const path = url?.replace('/v1', '') || '';
  let body: any = {};
  try {
    if (data && typeof data === 'string') {
      body = JSON.parse(data);
    } else if (data) {
      body = data;
    }
  } catch (e) {
    console.error("Gagal parsing JSON:", e);
  }

  console.log(`[MOCK API] ${method?.toUpperCase()} ${path}`, body);

  // --- LOGIN ---
  if (path.includes('/auth/login') && method === 'post') {
    const user = MOCK_USERS.find((u) => u.email === body.email);

    // Cek password (Hardcode: 123456)
    if (user && body.password === '123456') {
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: user,
          token: 'mock-token-rahasia-123456',
        },
      };
    }
    return errorResponse('Email atau password salah!', 401);
  }

  // --- GET CATEGORIES ---
  if (path.includes('/categories') && method === 'get') {
    return successResponse(MOCK_CATEGORIES);
  }

  // --- GET ITEMS ---
  if (path.includes('/items') && method === 'get') {
    return successResponse(MOCK_ITEMS, {
      current_page: 1,
      total_pages: 1,
      total_items: MOCK_ITEMS.length,
    });
  }

  // --- TRANSACTIONS ---
  if (path.includes('/transactions') && method === 'post') {
    return successResponse({
      transaction_id: `TRX-${Date.now()}`,
      created_at: new Date().toISOString(),
      grand_total: 50000,
      cashier_name: 'Andi Kasir',
    });
  }

  return errorResponse('Endpoint not found in Mock', 404);
};

// --- HELPER ---
const successResponse = (data: any, meta?: any) => ({
  success: true,
  message: 'Operation successful (MOCK)',
  data,
  meta,
});

const errorResponse = (message: string, code: number = 400) => {
  const error: any = new Error(message);
  error.response = {
    status: code,
    data: { success: false, message },
  };
  throw error;
};