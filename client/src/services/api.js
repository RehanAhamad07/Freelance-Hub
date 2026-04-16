import axios from 'axios';
import { mockServices, mockReviews, mockOrders } from './mockData';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
        if (url.includes('/services')) {
          const parts = url.split('/');
          const idIndex = parts.indexOf('services') + 1;
          const idParam = parts[idIndex];

          if (idParam && !idParam.includes('?')) {
            // It's a single service GET request
            const singleService = mockServices.find(s => s._id === idParam) || mockServices[0];
            return Promise.resolve({ data: singleService, status: 200 });
          } else {
            // Get all services
            let data = [...mockServices];
            if (error.config.params?.search) {
               data = data.filter(s => s.title.toLowerCase().includes(error.config.params.search.toLowerCase()) || s.category.toLowerCase().includes(error.config.params.search.toLowerCase()));
            }
            return Promise.resolve({ data, status: 200 });
          }
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: mockOrders, status: 200 });
        }
        if (url.includes('/reviews')) {
          return Promise.resolve({ data: mockReviews, status: 200 });
        }
        if (url.includes('/chat')) {
          return Promise.resolve({ data: [], status: 200 });
        }
        if (url.includes('/auth/profile')) {
          // Keep user logged in if they have a token locally
          return Promise.resolve({ 
            data: { id: 'user1', name: 'Demo User', email: 'user@test.com', role: 'client' }, 
            status: 200 
          });
        }
      }

      if (error.config.method === 'post') {
        if (url.includes('/auth/login') || url.includes('/auth/register')) {
           return Promise.resolve({
             data: { 
               token: 'mock_token_123', 
               user: { id: 'user1', name: JSON.parse(error.config.data).name || 'Demo User', email: JSON.parse(error.config.data).email, role: 'client' }
             },
             status: 200
           });
        }
        if (url.includes('/orders') || url.includes('/services')) {
           return Promise.resolve({ data: { message: 'Success (Mocked)' }, status: 201 });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
