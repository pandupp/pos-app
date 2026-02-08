import axios from 'axios';
import { MOCK_USERS, MOCK_ITEMS, MOCK_CATEGORIES } from '@/api/mock';

// Buat instance axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // URL dummy 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.defaults.adapter = async (config) => {
    // 1. Simulasi Loading
    await new Promise(resolve => setTimeout(resolve, 600));

    const { url, method, data } = config;

    console.log(`[MOCK API] Request: ${method?.toUpperCase()} ${url}`);

    // --- A. ROUTES LOGIN ---
    if (url?.endsWith('/login') && method === 'post') {
        try {
            const body = JSON.parse(data); // Parse data dari string
            const { email, password } = body;

            // Cari user di mock data
            const user = MOCK_USERS.find(u => u.email === email);
            if (user && password === '123456') {
                return {
                    data: {
                        success: true,
                        message: 'Login Berhasil',
                        data: {
                            user: user,
                            token: `mock-token-${user.id}-${Date.now()}`
                        }
                    },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                };
            } else {
                // Gagal Login
                const error = new Error('Unauthorized') as any;
                error.response = { status: 401, data: { success: false, message: "Email atau Password Salah!" } };
                throw error;
            }
        } catch (e) {
            console.error("Login Error Parsing", e);
            throw e;
        }
    }

    // --- B. ROUTES ITEMS (PRODUK) ---
    if (url?.endsWith('/items') && method === 'get') {
        return {
            data: { success: true, data: MOCK_ITEMS },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        };
    }

    // --- C. ROUTES CATEGORIES ---
    if (url?.endsWith('/categories') && method === 'get') {
        return {
            data: { success: true, data: MOCK_CATEGORIES },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        };
    }

    // --- D. ROUTES DASHBOARD ---
    if (url?.includes('/dashboard') && method === 'get') {
         return {
            data: { 
                success: true, 
                data: {
                    total_revenue: 15500000,
                    transaction_count: 24,
                    items_sold: 80,
                    top_selling_item: "Flexi China" 
                } 
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        };
    }

    // Jika route tidak ditemukan
    return {
        data: { message: "Route Not Found (Mock)" },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
    };
};

export default apiClient;