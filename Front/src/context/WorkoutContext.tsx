import React, { createContext, useContext, useState } from 'react';
import workoutService from '../services/workoutService';
import { Ejercicio, Rutina, WorkoutCreateRequest, WorkoutDetalle } from '../types';

export interface ActiveSet {
  numeroSerie: number;
  peso: string;
  repeticiones: string;
  completada: boolean;
}

export interface ActiveExercise {
  idEjercicio: number;
  nombre: string;
  grupoMuscular?: string;
  slug?: string | null;
  fotogramasSvg?: string[];
  series: ActiveSet[];
}

interface WorkoutContextType {
  isActive: boolean;
  workoutName: string;
  idRutina: number | null;
  exercises: ActiveExercise[];
  startTime: Date | null;
  startWorkoutWithRoutine: (rutina: Rutina, catalogExercises?: Ejercicio[]) => void;
  startFreeWorkout: () => void;
  cancelWorkout: () => void;
  addExerciseToWorkout: (ejercicio: Ejercicio) => void;
  removeExerciseFromWorkout: (idEjercicio: number) => void;
  addSetToExercise: (idEjercicio: number) => void;
  removeSetFromExercise: (idEjercicio: number, index: number) => void;
  updateSetField: (
    idEjercicio: number,
    index: number,
    field: 'peso' | 'repeticiones',
    value: string
  ) => void;
  toggleSetCompleted: (idEjercicio: number, index: number) => void;
  finishWorkout: () => Promise<WorkoutDetalle | null>;
}

const WorkoutContext = createContext<WorkoutContextType>({} as WorkoutContextType);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [workoutName, setWorkoutName] = useState<string>('Entrenamiento');
  const [idRutina, setIdRutina] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const startWorkoutWithRoutine = (rutina: Rutina, catalogExercises: Ejercicio[] = []) => {
    setIdRutina(rutina.idRutina);
    setWorkoutName(rutina.nombre);
    setStartTime(new Date());

    const initialExercises: ActiveExercise[] = rutina.ejercicios.map((re) => {
      const matched = catalogExercises.find((ce) => ce.idEjercicio === re.idEjercicio);
      return {
        idEjercicio: re.idEjercicio,
        nombre: re.nombre,
        grupoMuscular: re.grupoMuscular,
        slug: matched?.slug ?? re.nombre.toLowerCase().replace(/\s+/g, '-'),
        fotogramasSvg: matched?.fotogramasSvg,
        series: [
          { numeroSerie: 1, peso: '', repeticiones: '', completada: false },
          { numeroSerie: 2, peso: '', repeticiones: '', completada: false },
          { numeroSerie: 3, peso: '', repeticiones: '', completada: false },
        ],
      };
    });

    setExercises(initialExercises);
    setIsActive(true);
  };

  const startFreeWorkout = () => {
    setIdRutina(null);
    setWorkoutName('Entrenamiento Libre');
    setStartTime(new Date());
    setExercises([]);
    setIsActive(true);
  };

  const cancelWorkout = () => {
    setIsActive(false);
    setExercises([]);
    setIdRutina(null);
    setStartTime(null);
  };

  const addExerciseToWorkout = (ejercicio: Ejercicio) => {
    // Si ya existe, no duplicar, solo enfocar
    if (exercises.some((e) => e.idEjercicio === ejercicio.idEjercicio)) return;

    const newEx: ActiveExercise = {
      idEjercicio: ejercicio.idEjercicio,
      nombre: ejercicio.nombre,
      grupoMuscular: ejercicio.grupoMuscular,
      slug: ejercicio.slug,
      fotogramasSvg: ejercicio.fotogramasSvg,
      series: [
        { numeroSerie: 1, peso: '', repeticiones: '', completada: false },
        { numeroSerie: 2, peso: '', repeticiones: '', completada: false },
        { numeroSerie: 3, peso: '', repeticiones: '', completada: false },
      ],
    };

    setExercises((prev) => [...prev, newEx]);
  };

  const removeExerciseFromWorkout = (idEjercicio: number) => {
    setExercises((prev) => prev.filter((e) => e.idEjercicio !== idEjercicio));
  };

  const addSetToExercise = (idEjercicio: number) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.idEjercicio !== idEjercicio) return e;
        const nextNum = e.series.length + 1;
        // Replicar el peso y repetición de la serie anterior como sugerencia
        const last = e.series[e.series.length - 1];
        const newSet: ActiveSet = {
          numeroSerie: nextNum,
          peso: last ? last.peso : '',
          repeticiones: last ? last.repeticiones : '',
          completada: false,
        };
        return {
          ...e,
          series: [...e.series, newSet],
        };
      })
    );
  };

  const removeSetFromExercise = (idEjercicio: number, index: number) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.idEjercicio !== idEjercicio) return e;
        const filtered = e.series.filter((_, i) => i !== index);
        // Renumerar series
        const reindexed = filtered.map((s, idx) => ({ ...s, numeroSerie: idx + 1 }));
        return {
          ...e,
          series: reindexed,
        };
      })
    );
  };

  const updateSetField = (
    idEjercicio: number,
    index: number,
    field: 'peso' | 'repeticiones',
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.idEjercicio !== idEjercicio) return e;
        const updatedSeries = [...e.series];
        if (updatedSeries[index]) {
          updatedSeries[index] = {
            ...updatedSeries[index],
            [field]: value,
          };
        }
        return {
          ...e,
          series: updatedSeries,
        };
      })
    );
  };

  const toggleSetCompleted = (idEjercicio: number, index: number) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.idEjercicio !== idEjercicio) return e;
        const updatedSeries = [...e.series];
        if (updatedSeries[index]) {
          updatedSeries[index] = {
            ...updatedSeries[index],
            completada: !updatedSeries[index].completada,
          };
        }
        return {
          ...e,
          series: updatedSeries,
        };
      })
    );
  };

  const finishWorkout = async (): Promise<WorkoutDetalle | null> => {
    // Preparar series válidas
    const payloadSeries: {
      idEjercicio: number;
      numeroSerie: number;
      peso: number;
      repeticiones: number;
    }[] = [];

    exercises.forEach((e) => {
      e.series.forEach((s) => {
        const p = parseFloat(s.peso);
        const r = parseInt(s.repeticiones, 10);
        if (!isNaN(p) && !isNaN(r) && r > 0) {
          payloadSeries.push({
            idEjercicio: e.idEjercicio,
            numeroSerie: s.numeroSerie,
            peso: p,
            repeticiones: r,
          });
        }
      });
    });

    if (payloadSeries.length === 0) {
      throw new Error('Debes registrar al menos una serie con peso y repeticiones válidas.');
    }

    const payload: WorkoutCreateRequest = {
      idRutina: idRutina,
      nombre: workoutName,
      fecha: new Date().toISOString(),
      series: payloadSeries,
    };

    const res = await workoutService.create(payload);

    // Resetear sesión
    setIsActive(false);
    setExercises([]);
    setIdRutina(null);
    setStartTime(null);

    return res;
  };

  return (
    <WorkoutContext.Provider
      value={{
        isActive,
        workoutName,
        idRutina,
        exercises,
        startTime,
        startWorkoutWithRoutine,
        startFreeWorkout,
        cancelWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSetToExercise,
        removeSetFromExercise,
        updateSetField,
        toggleSetCompleted,
        finishWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
export default WorkoutContext;

