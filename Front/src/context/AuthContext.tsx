import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import { Perfil, LoginRequest, RegisterRequest, PerfilUpdateRequest } from '../types';

interface AuthContextType {
  user: Perfil | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: PerfilUpdateRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Perfil | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const storedToken = await api.getToken();
      if (storedToken) {
        setToken(storedToken);
        const cachedUser = await authService.getCachedUser();
        if (cachedUser) setUser(cachedUser);

        // Intentar refrescar perfil desde backend
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          // Si el backend no responde, usamos el usuario en caché
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    setToken(res.token);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      // Perfil provisional si el endpoint tarda
      const fallbackUser: Perfil = {
        idUsuario: 1,
        nombre: data.correo.split('@')[0],
        correo: data.correo,
        fechaRegistro: new Date().toISOString(),
      };
      setUser(fallbackUser);
    }
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    // Auto-login después de registro
    await login({ correo: data.correo, password: data.password });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: PerfilUpdateRequest) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
  };

  const refreshProfile = async () => {
    const profile = await authService.getProfile();
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

