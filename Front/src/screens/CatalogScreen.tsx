import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Header from '../components/Header';
import ExerciseIllustration from '../components/ExerciseIllustration';
import exerciseService from '../services/exerciseService';
import { Ejercicio } from '../types';
import { useWorkout } from '../context/WorkoutContext';

interface Props {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onExerciseSelect?: (exercise: Ejercicio) => void;
  isSelectingForWorkout?: boolean;
}

export const CatalogScreen: React.FC<Props> = ({
  onOpenMenu,
  onOpenProfile,
  onExerciseSelect,
  isSelectingForWorkout = false,
}) => {
  const { isActive, addExerciseToWorkout } = useWorkout();
  const [exercises, setExercises] = useState<Ejercicio[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [selectedExercise, setSelectedExercise] = useState<Ejercicio | null>(null);

  const muscleGroups = ['Todos', ...Array.from(new Set(exercises.map((e) => e.grupoMuscular))).sort()];

  const loadExercises = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await exerciseService.getAll();
      setExercises(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el catálogo de ejercicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    let list = exercises;

    if (selectedMuscle !== 'Todos') {
      list = list.filter(
        (e) => e.grupoMuscular?.toLowerCase() === selectedMuscle.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          (e.descripcion && e.descripcion.toLowerCase().includes(q)) ||
          e.musculoPrincipal?.toLowerCase().includes(q) ||
          e.musculosSecundarios?.some((muscle) => muscle.toLowerCase().includes(q)) ||
          e.equipamiento?.toLowerCase().includes(q)
      );
    }

    setFilteredExercises(list);
  }, [search, selectedMuscle, exercises]);

  const handleCardPress = (item: Ejercicio) => {
    if (onExerciseSelect) {
      onExerciseSelect(item);
    } else {
      setSelectedExercise(item);
    }
  };

  const handleAddToActiveWorkout = (item: Ejercicio) => {
    addExerciseToWorkout(item);
    setSelectedExercise(null);
  };

  return (
    <View style={styles.container}>
      <Header onOpenMenu={onOpenMenu} onOpenProfile={onOpenProfile} />

      {/* Subtítulo exacto según Imagen 3 */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Catalogo de ejercicios</Text>
      </View>

      {/* Barra de Búsqueda */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Chips de filtro por grupo muscular */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={muscleGroups}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSel = selectedMuscle === item;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSel && styles.filterChipActive]}
                onPress={() => setSelectedMuscle(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      ) : loadError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExercises}>
            <Text style={styles.retryButtonText}>REINTENTAR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Grilla de 2 Columnas (Imagen 3) */
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.idEjercicio.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseCard}
              onPress={() => handleCardPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardImageWrapper}>
                <ExerciseIllustration
                  slug={item.slug}
                  fotogramasSvg={item.fotogramasSvg}
                  width={130}
                  height={110}
                  backgroundColor="#000000"
                />
              </View>
              <Text style={styles.cardExerciseName} numberOfLines={2}>
                {item.nombre}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron ejercicios con ese criterio.</Text>
            </View>
          }
        />
      )}

      {/* Modal de Detalle de Ejercicio */}
      <Modal visible={!!selectedExercise} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailBox}>
            {selectedExercise && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>{selectedExercise.nombre}</Text>
                  <TouchableOpacity onPress={() => setSelectedExercise(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailImageWrapper}>
                  <ExerciseIllustration
                    slug={selectedExercise.slug}
                    fotogramasSvg={selectedExercise.fotogramasSvg}
                    width={220}
                    height={160}
                    backgroundColor="#000000"
                  />
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>{selectedExercise.grupoMuscular}</Text>
                  </View>
                  {selectedExercise.equipamiento && (
                    <View style={styles.detailBadgeSecondary}>
                      <Text style={styles.detailBadgeTextSec}>{selectedExercise.equipamiento}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.detailDesc}>
                  {selectedExercise.musculoPrincipal
                    ? `Músculo principal: ${selectedExercise.musculoPrincipal}\n`
                    : ''}
                  {selectedExercise.musculosSecundarios?.length
                    ? `Músculos secundarios: ${selectedExercise.musculosSecundarios.join(', ')}\n`
                    : ''}
                  {selectedExercise.descripcion || `Tipo: ${selectedExercise.tipoEjercicio || 'No especificado'}${selectedExercise.esEstiramiento ? ' · Estiramiento' : ''}`}
                </Text>
                <Text style={styles.detailSource}>
                  Ilustraciones de Workout Guide por Bryl Lim y Everkinetic. Licencia CC BY-SA 4.0.
                </Text>

                {isActive ? (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleAddToActiveWorkout(selectedExercise)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color={colors.text} style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnText}>AÑADIR A ENTRENAMIENTO ACTIVO</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelectedExercise(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.closeBtnText}>CERRAR</Text>
                  </TouchableOpacity>
                )}
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
  titleSection: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  exerciseCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardImageWrapper: {
    width: '100%',
    height: 110,
    backgroundColor: '#000000',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardExerciseName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 36,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  detailHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  detailImageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  detailBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  detailBadgeSecondary: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  detailBadgeTextSec: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  detailDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  detailSource: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CatalogScreen;
