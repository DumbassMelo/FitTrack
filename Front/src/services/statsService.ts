import api from './api';
import { ProgresoGeneral, ProgresoEjercicio } from '../types';

export const statsService = {
  async getGeneralProgress(): Promise<ProgresoGeneral> {
    return await api.get<ProgresoGeneral>('/statistics/progress');
  },

  async getExerciseProgress(idEjercicio: number): Promise<ProgresoEjercicio> {
    return await api.get<ProgresoEjercicio>(`/statistics/exercise/${idEjercicio}`);
  },
};

export default statsService;

