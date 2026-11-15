import api from './api';
import { Rutina, RutinaCreateRequest } from '../types';

export const routineService = {
  async getAll(): Promise<Rutina[]> {
    return await api.get<Rutina[]>('/routines');
  },

  async getRecent(): Promise<Rutina | null> {
    try {
      return await api.get<Rutina>('/routines/recent');
    } catch {
      // Si el endpoint recent falla o no hay entrenos previos, probamos la primera de la lista
      const list = await this.getAll();
      return list.length > 0 ? list[0] : null;
    }
  },

  async getById(id: number): Promise<Rutina> {
    return await api.get<Rutina>(`/routines/${id}`);
  },

  async create(data: RutinaCreateRequest): Promise<Rutina> {
    return await api.post<Rutina>('/routines', data);
  },

  async update(id: number, data: RutinaCreateRequest): Promise<Rutina> {
    return await api.put<Rutina>(`/routines/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return await api.delete<void>(`/routines/${id}`);
  },
};

export default routineService;

