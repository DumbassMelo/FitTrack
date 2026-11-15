import api from './api';
import { Ejercicio } from '../types';

export const exerciseService = {
  async getAll(params?: { grupoMuscular?: string; equipamiento?: string; buscar?: string }): Promise<Ejercicio[]> {
    const query = new URLSearchParams();
    if (params?.grupoMuscular) query.append('grupoMuscular', params.grupoMuscular);
    if (params?.equipamiento) query.append('equipamiento', params.equipamiento);
    if (params?.buscar) query.append('buscar', params.buscar);

    const qs = query.toString();
    const endpoint = `/exercises${qs ? `?${qs}` : ''}`;
    return await api.get<Ejercicio[]>(endpoint);
  },

  async getById(id: number): Promise<Ejercicio> {
    return await api.get<Ejercicio>(`/exercises/${id}`);
  },

  async create(data: Partial<Ejercicio>): Promise<Ejercicio> {
    return await api.post<Ejercicio>('/exercises', data);
  },

  async update(id: number, data: Partial<Ejercicio>): Promise<void> {
    return await api.put<void>(`/exercises/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return await api.delete<void>(`/exercises/${id}`);
  },
};

export default exerciseService;

