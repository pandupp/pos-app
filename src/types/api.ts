export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    current_page: number;
    total_pages: number;
    total_items: number;
  };
  error_code?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'operator';
  token?: string; 
}

export interface Category {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  category_id?: number;
  category_name?: string;
  name: string;
  description: string;
  image_url: string;
  stock: number;
  price: number;
}

export interface CartItem {
  item_id: number;
  qty: number;
  note?: string;
  name: string;
  price: number;
  image_url: string;
}

export interface TransactionPayload {
  items: { item_id: number; qty: number; note?: string }[];
  manual_discount: number;
  tax_percent: number;
  payment_method: 'cash' | 'qris' | 'transfer';
  customer_name?: string;
}