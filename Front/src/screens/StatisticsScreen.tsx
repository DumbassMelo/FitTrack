import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Header from '../components/Header';
import statsService from '../services/statsService';
import exerciseService from '../services/exerciseService';
import { ProgresoGeneral, ProgresoEjercicio, Ejercicio } from '../types';

interface Props {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
}

export const StatisticsScreen: React.FC<Props> = ({ onOpenMenu, onOpenProfile }) => {
  const [generalStats, setGeneralStats] = useState<ProgresoGeneral | null>(null);
  const [exerciseList, setExerciseList] = useState<Ejercicio[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [exerciseStats, setExerciseStats] = useState<ProgresoEjercicio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingEx, setLoadingEx] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [stats, exercises] = await Promise.allSettled([
        statsService.getGeneralProgress(),
        exerciseService.getAll(),
      ]);

      if (stats.status === 'fulfilled' && stats.value) {
        setGeneralStats(stats.value);
      }
      if (exercises.status === 'fulfilled' && exercises.value) {
        setExerciseList(exercises.value);
        if (exercises.value.length > 0 && !selectedExerciseId) {
          loadExerciseProgress(exercises.value[0].idEjercicio);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadExerciseProgress = async (id: number) => {
    setSelectedExerciseId(id);
    try {
      setLoadingEx(true);
      const exStats = await statsService.getExerciseProgress(id);
      setExerciseStats(exStats);
    } catch {
      // Fallback
    } finally {
      setLoadingEx(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Encontrar el volumen máximo para escalar las barras visuales
  const maxVolume = generalStats?.volumenPorEntrenamiento?.reduce(
    (max, item) => Math.max(max, item.volumen),
    1
  ) || 1;

  return (
    <View style={styles.container}>
      <Header onOpenMenu={onOpenMenu} onOpenProfile={onOpenProfile} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryLight}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Estadísticas y Progreso</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
          </View>
        ) : (
          <>
            {/* Tarjetas de Métricas Generales */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Ionicons name="barbell-outline" size={24} color={colors.primaryLight} />
                <Text style={styles.metricValue}>
                  {generalStats?.totalEntrenamientos || 0}
                </Text>
                <Text style={styles.metricLabel}>Entrenamientos</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="repeat-outline" size={24} color={colors.primaryLight} />
                <Text style={styles.metricValue}>{generalStats?.totalSeries || 0}</Text>
                <Text style={styles.metricLabel}>Total Series</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="flame-outline" size={24} color={colors.primaryLight} />
                <Text style={styles.metricValue}>
                  {generalStats?.volumenTotal ? `${Math.round(generalStats.volumenTotal)} kg` : '0 kg'}
                </Text>
                <Text style={styles.metricLabel}>Volumen Levantado</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="trophy-outline" size={24} color={colors.primaryLight} />
                <Text style={styles.metricValue}>
                  {generalStats?.pesoMaximo ? `${generalStats.pesoMaximo} kg` : '0 kg'}
                </Text>
                <Text style={styles.metricLabel}>Peso Máximo</Text>
              </View>
            </View>

            {/* Gráfico Visual: Evolución de Volumen por Entrenamiento */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Evolución de Volumen (kg)</Text>
              {generalStats?.volumenPorEntrenamiento &&
              generalStats.volumenPorEntrenamiento.length > 0 ? (
                <View style={styles.chartContainer}>
                  <View style={styles.barsRow}>
                    {generalStats.volumenPorEntrenamiento.slice(-7).map((item, index) => {
                      const heightPercent = Math.max(15, (item.volumen / maxVolume) * 100);
                      const dateObj = new Date(item.fecha);
                      const dayStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
                      return (
                        <View key={item.idEntrenamiento || index} style={styles.barCol}>
                          <Text style={styles.barValText}>{Math.round(item.volumen)}</Text>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                          </View>
                          <Text style={styles.barLabelText}>{dayStr}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyNote}>
                  Registra entrenamientos para visualizar tu gráfica de volumen semanal.
                </Text>
              )}
            </View>

            {/* Ejercicios Más Frecuentes */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Ejercicios Más Frecuentes</Text>
              {generalStats?.ejerciciosMasFrecuentes &&
              generalStats.ejerciciosMasFrecuentes.length > 0 ? (
                generalStats.ejerciciosMasFrecuentes.map((item, idx) => {
                  const maxSets = generalStats.ejerciciosMasFrecuentes[0]?.cantidadSeries || 1;
                  const percent = Math.min(100, Math.max(10, (item.cantidadSeries / maxSets) * 100));
                  return (
                    <View key={item.idEjercicio || idx} style={styles.frequentItem}>
                      <View style={styles.frequentHeader}>
                        <Text style={styles.frequentName}>{item.nombre}</Text>
                        <Text style={styles.frequentSets}>{item.cantidadSeries} series</Text>
                      </View>
                      <View style={styles.frequentProgressBar}>
                        <View style={[styles.frequentProgressFill, { width: `${percent}%` }]} />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyNote}>No hay datos suficientes de frecuencia aún.</Text>
              )}
            </View>

            {/* Progreso por Ejercicio Específico */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Progreso por Ejercicio</Text>

              {/* Selector de Ejercicios */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                {exerciseList.map((ex) => {
                  const isSel = selectedExerciseId === ex.idEjercicio;
                  return (
                    <TouchableOpacity
                      key={ex.idEjercicio}
                      style={[styles.exPill, isSel && styles.exPillActive]}
                      onPress={() => loadExerciseProgress(ex.idEjercicio)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.exPillText, isSel && styles.exPillTextActive]}>
                        {ex.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {loadingEx ? (
                <ActivityIndicator size="small" color={colors.primaryLight} style={{ margin: 20 }} />
              ) : exerciseStats ? (
                <View style={styles.exerciseStatsContainer}>
                  <View style={styles.exStatRow}>
                    <View style={styles.exStatItem}>
                      <Text style={styles.exStatVal}>{exerciseStats.pesoMaximo} kg</Text>
                      <Text style={styles.exStatLbl}>Peso Récord</Text>
                    </View>
                    <View style={styles.exStatItem}>
                      <Text style={styles.exStatVal}>{exerciseStats.repeticionesMaximas}</Text>
                      <Text style={styles.exStatLbl}>Máx Reps</Text>
                    </View>
                    <View style={styles.exStatItem}>
                      <Text style={styles.exStatVal}>{exerciseStats.totalSeries}</Text>
                      <Text style={styles.exStatLbl}>Series Hechas</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyNote}>Selecciona un ejercicio para ver su progreso individual.</Text>
              )}
            </View>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  chartContainer: {
    paddingTop: 8,
    height: 160,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 38,
  },
  barValText: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: colors.surfaceLight,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 7,
  },
  barLabelText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },
  emptyNote: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  frequentItem: {
    marginBottom: 12,
  },
  frequentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  frequentName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  frequentSets: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  frequentProgressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  frequentProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  selectorScroll: {
    marginBottom: 14,
  },
  exPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  exPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  exPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  exPillTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  exerciseStatsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
  },
  exStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exStatItem: {
    alignItems: 'center',
  },
  exStatVal: {
    color: colors.primaryLight,
    fontSize: 18,
    fontWeight: '700',
  },
  exStatLbl: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default StatisticsScreen;

