import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_STORAGE_KEY } from '../constants/config';
import { LoginRequest, RegisterRequest, Perfil, PerfilUpdateRequest, AuthResponse } from '../types';

export const authService = {
  async register(data: RegisterRequest): Promise<any> {
    return await api.post('/auth/register', data);
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    if (res?.token) {
      await api.setToken(res.token);
    }
    return res;
  },

  async getProfile(): Promise<Perfil> {
    const perfil = await api.get<Perfil>('/users/profile');
    if (perfil) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(perfil));
    }
    return perfil;
  },

  async updateProfile(data: PerfilUpdateRequest): Promise<Perfil> {
    const updated = await api.put<Perfil>('/users/profile', data);
    if (updated) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  async logout(): Promise<void> {
    await api.removeToken();
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  },

  async getCachedUser(): Promise<Perfil | null> {
    try {
      const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};

export default authService;

