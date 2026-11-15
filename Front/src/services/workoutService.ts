import api from './api';
import { WorkoutResumen, WorkoutDetalle, WorkoutCreateRequest } from '../types';

export const workoutService = {
  async getAll(): Promise<WorkoutResumen[]> {
    return await api.get<WorkoutResumen[]>('/workouts');
  },

  async getById(id: number): Promise<WorkoutDetalle> {
    return await api.get<WorkoutDetalle>(`/workouts/${id}`);
  },

  async create(data: WorkoutCreateRequest): Promise<WorkoutDetalle> {
    return await api.post<WorkoutDetalle>('/workouts', data);
  },

  async delete(id: number): Promise<void> {
    return await api.delete<void>(`/workouts/${id}`);
  },
};

export default workoutService;

