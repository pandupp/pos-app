import axios, { AxiosError } from 'axios';
import { mockHandler } from '@/api/mock';

const API_URL = import.meta.env.VITE_API_URL;
const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (IS_DEV) {
      console.log('⚠️ [Interceptor] Error terdeteksi, mencoba switch ke Mock...');
      
      try {
        const mockResponse = mockHandler(error.config);
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK (MOCK)',
          headers: {},
          config: error.config,
        });
      } catch (mockError: any) {
        console.error('❌ [Mock Failed]', mockError);
        return Promise.reject(mockError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;