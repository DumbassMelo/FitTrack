import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Header from '../components/Header';
import routineService from '../services/routineService';
import exerciseService from '../services/exerciseService';
import { Rutina, Ejercicio } from '../types';
import { useWorkout } from '../context/WorkoutContext';

interface Props {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onCreateRoutine: () => void;
  onEditRoutine: (rutina: Rutina) => void;
  onStartWorkout: () => void;
}

export const RoutinesScreen: React.FC<Props> = ({
  onOpenMenu,
  onOpenProfile,
  onCreateRoutine,
  onEditRoutine,
  onStartWorkout,
}) => {
  const { startWorkoutWithRoutine } = useWorkout();
  const [routines, setRoutines] = useState<Rutina[]>([]);
  const [catalogExercises, setCatalogExercises] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [ruts, exercises] = await Promise.allSettled([
        routineService.getAll(),
        exerciseService.getAll(),
      ]);

      if (ruts.status === 'fulfilled' && ruts.value) {
        setRoutines(ruts.value);
      }
      if (exercises.status === 'fulfilled' && exercises.value) {
        setCatalogExercises(exercises.value);
      }
    } catch {
      // Manejo silencioso
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

  const handleDelete = (rutina: Rutina) => {
    Alert.alert(
      'Eliminar Rutina',
      `¿Deseas eliminar la rutina "${rutina.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await routineService.delete(rutina.idRutina);
              setRoutines((prev) => prev.filter((r) => r.idRutina !== rutina.idRutina));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar la rutina.');
            }
          },
        },
      ]
    );
  };

  const handleStart = (rutina: Rutina) => {
    startWorkoutWithRoutine(rutina, catalogExercises);
    onStartWorkout();
  };

  return (
    <View style={styles.container}>
      <Header onOpenMenu={onOpenMenu} onOpenProfile={onOpenProfile} />

      <View style={styles.topRow}>
        <Text style={styles.title}>Mis Rutinas</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={onCreateRoutine}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.text} style={{ marginRight: 4 }} />
          <Text style={styles.createBtnText}>Nueva Rutina</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.idRutina.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primaryLight}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.routineCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routineName}>{item.nombre}</Text>
                  {item.descripcion ? (
                    <Text style={styles.routineDesc}>{item.descripcion}</Text>
                  ) : null}
                </View>

                {/* Acciones de edición y borrado */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => onEditRoutine(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil-outline" size={19} color={colors.primaryLight} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={19} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Lista resumida de ejercicios */}
              <View style={styles.exerciseChips}>
                {item.ejercicios && item.ejercicios.length > 0 ? (
                  item.ejercicios.map((ej, idx) => (
                    <View key={`${ej.idEjercicio}-${idx}`} style={styles.exerciseChip}>
                      <Text style={styles.exerciseChipText}>{ej.nombre}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noExercisesText}>Sin ejercicios añadidos</Text>
                )}
              </View>

              {/* Iniciar entrenamiento con esta rutina */}
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => handleStart(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={16} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={styles.startBtnText}>ENTRENAR CON ESTA RUTINA</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="list-circle-outline" size={60} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aún no tienes rutinas</Text>
              <Text style={styles.emptySub}>
                Crea tus propias rutinas personalizadas seleccionando ejercicios del catálogo.
              </Text>
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={onCreateRoutine}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyCreateText}>CREAR PRIMERA RUTINA</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  createBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  routineCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routineName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  routineDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  exerciseChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  exerciseChip: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  exerciseChipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  noExercisesText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  emptyCreateBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  emptyCreateText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RoutinesScreen;

