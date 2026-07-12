import axios from 'axios';
import { ApiResponse, CreateVehicleData, LoginCredentials, RegisterCredentials, SearchFilters, UpdateVehicleData, Vehicle } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const AUTH_BASE = '/api/auth';
const VEHICLE_BASE = '/api/vehicles';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<{ token: string; user: any }>(`${AUTH_BASE}/login`, credentials);
    return response.data;
  },
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<{ token: string; user: any }>(`${AUTH_BASE}/register`, credentials);
    return response.data;
  },
};

export const vehicleApi = {
  getVehicles: async () => {
    const response = await api.get<ApiResponse<Vehicle[]>>(VEHICLE_BASE);
    return response.data;
  },
  searchVehicles: async (filters: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    const response = await api.get<ApiResponse<Vehicle[]>>(`${VEHICLE_BASE}/search?${params.toString()}`);
    return response.data;
  },
  createVehicle: async (data: CreateVehicleData) => {
    const response = await api.post<Vehicle>(VEHICLE_BASE, data);
    return response.data;
  },
  updateVehicle: async (id: string, data: UpdateVehicleData) => {
    const response = await api.put<Vehicle>(`${VEHICLE_BASE}/${id}`, data);
    return response.data;
  },
  deleteVehicle: async (id: string) => {
    const response = await api.delete<ApiResponse>(`${VEHICLE_BASE}/${id}`);
    return response.data;
  },
  purchaseVehicle: async (id: string) => {
    const response = await api.post<ApiResponse<Vehicle>>(`${VEHICLE_BASE}/${id}/purchase`);
    return response.data;
  },
  restockVehicle: async (id: string, quantity: number) => {
    const response = await api.post<ApiResponse<Vehicle>>(`${VEHICLE_BASE}/${id}/restock`, { quantity });
    return response.data;
  },
};

export default api;
