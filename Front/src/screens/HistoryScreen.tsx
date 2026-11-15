import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Header from '../components/Header';
import workoutService from '../services/workoutService';
import { WorkoutResumen, WorkoutDetalle } from '../types';

interface Props {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onStartNewWorkout: () => void;
}

export const HistoryScreen: React.FC<Props> = ({
  onOpenMenu,
  onOpenProfile,
  onStartNewWorkout,
}) => {
  const [workouts, setWorkouts] = useState<WorkoutResumen[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const loadWorkouts = async () => {
    try {
      const data = await workoutService.getAll();
      setWorkouts(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const handleViewDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const detail = await workoutService.getById(id);
      setSelectedWorkout(detail);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo cargar el detalle del entrenamiento.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Deseas eliminar este entrenamiento del historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.delete(id);
              setWorkouts((prev) => prev.filter((w) => w.idEntrenamiento !== id));
              if (selectedWorkout?.idEntrenamiento === id) {
                setSelectedWorkout(null);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar el entrenamiento.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <Header onOpenMenu={onOpenMenu} onOpenProfile={onOpenProfile} />

      <View style={styles.topRow}>
        <Text style={styles.screenTitle}>Historial de Entrenamientos</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.idEntrenamiento.toString()}
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
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleViewDetail(item.idEntrenamiento)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutName}>{item.nombre || 'Entrenamiento'}</Text>
                  <Text style={styles.workoutDate}>{formatDate(item.fecha)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.idEntrenamiento)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.totalSeries}</Text>
                  <Text style={styles.statLbl}>Series</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.volumenTotal || 0} kg</Text>
                  <Text style={styles.statLbl}>Volumen</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={54} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aún no has registrado entrenamientos</Text>
              <Text style={styles.emptySub}>
                Completa tu primer entrenamiento para comenzar a llevar un historial detallado de tu progreso.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={onStartNewWorkout}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyBtnText}>INICIAR ENTRENAMIENTO</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal de Detalle de Entrenamiento */}
      <Modal visible={!!selectedWorkout} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedWorkout && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>
                      {selectedWorkout.nombre || 'Detalle del Entrenamiento'}
                    </Text>
                    <Text style={styles.modalSubtitle}>{formatDate(selectedWorkout.fecha)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalSummaryRow}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatVal}>{selectedWorkout.series?.length || 0}</Text>
                    <Text style={styles.modalStatLbl}>Total Series</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatVal}>{selectedWorkout.volumenTotal || 0} kg</Text>
                    <Text style={styles.modalStatLbl}>Volumen Total</Text>
                  </View>
                </View>

                <Text style={styles.seriesTableTitle}>Detalle de Series</Text>

                <FlatList
                  data={selectedWorkout.series}
                  keyExtractor={(item) => item.idSerie.toString()}
                  style={{ maxHeight: 300, width: '100%' }}
                  renderItem={({ item }) => (
                    <View style={styles.seriesDetailRow}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.seriesExName}>{item.nombreEjercicio}</Text>
                        <Text style={styles.seriesNum}>Serie #{item.numeroSerie}</Text>
                      </View>
                      <View style={styles.seriesDataCol}>
                        <Text style={styles.seriesDataText}>{item.peso} kg</Text>
                      </View>
                      <View style={styles.seriesDataCol}>
                        <Text style={styles.seriesDataText}>{item.repeticiones} reps</Text>
                      </View>
                    </View>
                  )}
                />

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedWorkout(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseBtnText}>CERRAR</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 22,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  workoutDate: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  deleteBtn: {
    padding: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: '700',
  },
  statLbl: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 70,
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
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  modalSummaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatVal: {
    color: colors.primaryLight,
    fontSize: 18,
    fontWeight: '700',
  },
  modalStatLbl: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  seriesTableTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  seriesDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  seriesExName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  seriesNum: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  seriesDataCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  seriesDataText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HistoryScreen;

