// src/services/api.ts
import type { AxiosError, InternalAxiosRequestConfig  }from 'axios';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuthStore } from '../store/authStore'; // We'll create this next
import type { ApiErrorResponse } from '@/types'; // Using path alias

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => { // Add type for config
    const token = useAuthStore.getState().token;
        console.log('[API Interceptor] Token from store:', token); // <<< ADD THIS LOG

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
            console.log('[API Interceptor] Authorization header set:', config.headers['Authorization']); // <<< ADD THIS LOG

    } else {
      console.log('[API Interceptor] No token found in store.'); // <<< ADD THIS LOG
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => { // Type the error
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors
      // useAuthStore.getState().logout(); // Example: auto-logout
      // window.location.href = '/login';
      console.error("API request unauthorized:", error.response.data.message);
    }
    // You can add more specific error handling here if needed
    return Promise.reject(error);
  }
);

export default api;