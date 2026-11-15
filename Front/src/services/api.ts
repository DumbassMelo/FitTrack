import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDefaultApiUrl, API_URL_KEY, TOKEN_STORAGE_KEY } from '../constants/config';

class ApiClient {
  private customBaseUrl: string | null = null;

  async getBaseUrl(): Promise<string> {
    if (this.customBaseUrl) return this.customBaseUrl;
    try {
      const stored = await AsyncStorage.getItem(API_URL_KEY);
      if (stored) {
        this.customBaseUrl = stored;
        return stored;
      }
    } catch {
      // Fallback
    }
    return getDefaultApiUrl();
  }

  async setBaseUrl(url: string): Promise<void> {
    this.customBaseUrl = url.trim().replace(/\/+$/, '');
    await AsyncStorage.setItem(API_URL_KEY, this.customBaseUrl);
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const token = await this.getToken();

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 204) {
        return null as unknown as T;
      }

      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        const errorMsg =
          (data && (data.mensaje || data.title || data.message)) ||
          `Error ${response.status}: ${response.statusText}`;
        const error: any = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado al conectar con el servidor.');
      }
      throw err;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;

