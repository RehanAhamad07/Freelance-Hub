import axios from 'axios';
import { mockReviews, mockOrders } from './mockData';

const api = axios.create({
  // baseURL: 'http://localhost:5002/api',
  baseURL: 'https://freelance-hub-1vrp.onrender.com/api',
  
});
// Request Interceptor: add JWT to header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Fallback to mock data if backend is offline
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.warn('Backend is unreachable! Falling back to Dummy Data.');
      
      const url = error.config.url.toLowerCase();
      
      if (error.config.method === 'get') {

        if (url.includes('/orders')) {
          return Promise.resolve({ data: mockOrders, status: 200 });
        }
        if (url.includes('/reviews')) {
          return Promise.resolve({ data: mockReviews, status: 200 });
        }
        if (url.includes('/chat')) {
          return Promise.resolve({ data: [], status: 200 });
        }
      }

      if (error.config.method === 'post') {
        if (url.includes('/orders')) {
           return Promise.resolve({ data: { message: 'Success (Mocked)' }, status: 201 });
        }
      }

      if (error.config.method === 'put') {
        if (url.includes('/orders/')) {
           return Promise.resolve({ data: { message: 'Action completed successfully (Mocked)' }, status: 200 });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
