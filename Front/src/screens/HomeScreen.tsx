import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import colors from '../constants/colors';
import Header from '../components/Header';
import WeekCalendar from '../components/WeekCalendar';
import routineService from '../services/routineService';
import exerciseService from '../services/exerciseService';
import { Rutina, Ejercicio } from '../types';
import { useWorkout } from '../context/WorkoutContext';

interface Props {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onStartWorkout: () => void;
  onStartFreeWorkout: () => void;
  onCreateRoutine: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onOpenMenu,
  onOpenProfile,
  onStartWorkout,
  onStartFreeWorkout,
  onCreateRoutine,
}) => {
  const { startWorkoutWithRoutine, startFreeWorkout } = useWorkout();
  const [recentRoutine, setRecentRoutine] = useState<Rutina | null>(null);
  const [catalogExercises, setCatalogExercises] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');

  const loadData = async () => {
    setLoadError('');
    try {
      const [recent, exercises] = await Promise.allSettled([
        routineService.getRecent(),
        exerciseService.getAll(),
      ]);

      if (exercises.status === 'fulfilled' && exercises.value) {
        setCatalogExercises(exercises.value);
      }

      if (recent.status === 'fulfilled' && recent.value) {
        setRecentRoutine(recent.value);
      } else if (recent.status === 'rejected') {
        setRecentRoutine(null);
        setLoadError(
          recent.reason instanceof Error
            ? recent.reason.message
            : 'No se pudo cargar la información de tus rutinas.'
        );
      } else {
        setRecentRoutine(null);
      }
      if (exercises.status === 'rejected') {
        setLoadError(
          exercises.reason instanceof Error
            ? exercises.reason.message
            : 'No se pudo cargar el catálogo de ejercicios.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStartRecentWorkout = () => {
    if (!recentRoutine) return;
    startWorkoutWithRoutine(recentRoutine, catalogExercises);
    onStartWorkout();
  };

  const handleStartFree = () => {
    startFreeWorkout();
    onStartFreeWorkout();
  };

  return (
    <View style={styles.container}>
      <Header onOpenMenu={onOpenMenu} onOpenProfile={onOpenProfile} />

      {/* Calendario Semanal Superior (Imagen 1) */}
      <WeekCalendar activeDays={[0, 2, 4]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primaryLight} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
          </View>
        ) : loadError ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>{loadError}</Text>
            <TouchableOpacity style={styles.startRoutineBtn} onPress={handleRefresh}>
              <Text style={styles.startRoutineText}>REINTENTAR</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {recentRoutine ? (
            <View style={styles.recentCard}>
              <Text style={styles.cardSubtitle}>Rutina Reciente</Text>
              <Text style={styles.cardTitle}>{recentRoutine.nombre}</Text>

              {/* Lista con viñetas de ejercicios */}
              <View style={styles.exerciseList}>
                {recentRoutine.ejercicios && recentRoutine.ejercicios.length > 0 ? (
                  recentRoutine.ejercicios.map((ej, index) => (
                    <View key={`${ej.idEjercicio}-${index}`} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.exerciseName}>{ej.nombre}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No hay ejercicios agregados a esta rutina.</Text>
                )}
              </View>

              {/* Botón Iniciar Entrenamiento */}
              <TouchableOpacity
                style={styles.startRoutineBtn}
                onPress={handleStartRecentWorkout}
                activeOpacity={0.8}
              >
                <Text style={styles.startRoutineText}>INICIAR ENTRENAMIENTO</Text>
              </TouchableOpacity>
            </View>
            ) : (
              <View style={styles.recentCard}>
                <Text style={styles.cardSubtitle}>Aún no tienes rutinas</Text>
                <Text style={styles.emptyText}>Crea una rutina para comenzar a entrenar.</Text>
                <TouchableOpacity
                  style={styles.startRoutineBtn}
                  onPress={onCreateRoutine}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startRoutineText}>CREAR RUTINA</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Botón Inferior: Entrenamiento Libre (Imagen 1) */}
            <TouchableOpacity
              style={styles.freeWorkoutBtn}
              onPress={handleStartFree}
              activeOpacity={0.8}
            >
              <Text style={styles.freeWorkoutText}>ENTRENAMIENTO LIBRE</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  exerciseList: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4.5,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: 18,
    marginRight: 10,
    lineHeight: 20,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '400',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  startRoutineBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startRoutineText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  freeWorkoutBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  freeWorkoutText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default HomeScreen;
