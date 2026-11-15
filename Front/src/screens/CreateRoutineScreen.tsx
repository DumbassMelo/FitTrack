import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Header from '../components/Header';
import routineService from '../services/routineService';
import exerciseService from '../services/exerciseService';
import { Rutina, Ejercicio, RutinaCreateRequest } from '../types';

interface Props {
  initialRoutine?: Rutina | null;
  onBack: () => void;
  onSaveSuccess: () => void;
  onOpenProfile: () => void;
}

export const CreateRoutineScreen: React.FC<Props> = ({
  initialRoutine,
  onBack,
  onSaveSuccess,
  onOpenProfile,
}) => {
  const isEditing = !!initialRoutine;
  const [nombre, setNombre] = useState<string>(initialRoutine?.nombre || '');
  const [descripcion, setDescripcion] = useState<string>(initialRoutine?.descripcion || '');
  const [selectedExercises, setSelectedExercises] = useState<
    { idEjercicio: number; nombre: string; orden: number }[]
  >(
    initialRoutine?.ejercicios?.map((e, idx) => ({
      idEjercicio: e.idEjercicio,
      nombre: e.nombre,
      orden: e.orden || idx + 1,
    })) || []
  );

  const [catalogExercises, setCatalogExercises] = useState<Ejercicio[]>([]);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const data = await exerciseService.getAll();
      setCatalogExercises(data);
    } catch {
      // Fallback
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleAddExercise = (exercise: Ejercicio) => {
    if (selectedExercises.some((e) => e.idEjercicio === exercise.idEjercicio)) {
      Alert.alert('Información', 'Este ejercicio ya está incluido en la rutina.');
      return;
    }

    const nextOrden = selectedExercises.length + 1;
    setSelectedExercises((prev) => [
      ...prev,
      { idEjercicio: exercise.idEjercicio, nombre: exercise.nombre, orden: nextOrden },
    ]);
    setShowCatalogModal(false);
  };

  const handleRemoveExercise = (idEjercicio: number) => {
    setSelectedExercises((prev) => {
      const filtered = prev.filter((e) => e.idEjercicio !== idEjercicio);
      return filtered.map((e, idx) => ({ ...e, orden: idx + 1 }));
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...selectedExercises];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    const reindexed = items.map((e, idx) => ({ ...e, orden: idx + 1 }));
    setSelectedExercises(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedExercises.length - 1) return;
    const items = [...selectedExercises];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    const reindexed = items.map((e, idx) => ({ ...e, orden: idx + 1 }));
    setSelectedExercises(reindexed);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Validación', 'Por favor ingresa un nombre para la rutina.');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Validación', 'Debes añadir al menos un ejercicio a la rutina.');
      return;
    }

    const payload: RutinaCreateRequest = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      ejercicios: selectedExercises.map((e) => ({
        idEjercicio: e.idEjercicio,
        orden: e.orden,
      })),
    };

    try {
      setSaving(true);
      if (isEditing && initialRoutine) {
        await routineService.update(initialRoutine.idRutina, payload);
      } else {
        await routineService.create(payload);
      }
      onSaveSuccess();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar la rutina.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
        showBack={true}
        onBack={onBack}
        onOpenProfile={onOpenProfile}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Campo Nombre */}
        <Text style={styles.label}>Nombre de la rutina *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Push, Pierna y Abdomen, Fullbody..."
          placeholderTextColor={colors.textMuted}
          value={nombre}
          onChangeText={setNombre}
        />

        {/* Campo Descripción */}
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Objetivo o notas de la rutina..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          value={descripcion}
          onChangeText={setDescripcion}
        />

        {/* Sección de Ejercicios */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Ejercicios ({selectedExercises.length})
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowCatalogModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={colors.text} style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Añadir Ejercicio</Text>
          </TouchableOpacity>
        </View>

        {selectedExercises.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="barbell-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyText}>No has seleccionado ningún ejercicio.</Text>
          </View>
        ) : (
          selectedExercises.map((item, index) => (
            <View key={item.idEjercicio} style={styles.exerciseRow}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderNumber}>{item.orden}</Text>
              </View>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {item.nombre}
              </Text>

              <View style={styles.reorderActions}>
                <TouchableOpacity
                  style={[styles.arrowBtn, index === 0 && styles.arrowBtnDisabled]}
                  onPress={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <Ionicons
                    name="chevron-up"
                    size={18}
                    color={index === 0 ? colors.textMuted : colors.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.arrowBtn,
                    index === selectedExercises.length - 1 && styles.arrowBtnDisabled,
                  ]}
                  onPress={() => handleMoveDown(index)}
                  disabled={index === selectedExercises.length - 1}
                >
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={
                      index === selectedExercises.length - 1
                        ? colors.textMuted
                        : colors.text
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemoveExercise(item.idEjercicio)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Botón Guardar */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEditing ? 'ACTUALIZAR RUTINA' : 'GUARDAR RUTINA'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para Elegir Ejercicio del Catálogo */}
      <Modal visible={showCatalogModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.catalogModalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Ejercicio</Text>
              <TouchableOpacity onPress={() => setShowCatalogModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingCatalog ? (
              <ActivityIndicator size="large" color={colors.primaryLight} style={{ margin: 40 }} />
            ) : (
              <FlatList
                data={catalogExercises}
                keyExtractor={(item) => item.idEjercicio.toString()}
                renderItem={({ item }) => {
                  const alreadySelected = selectedExercises.some(
                    (e) => e.idEjercicio === item.idEjercicio
                  );
                  return (
                    <TouchableOpacity
                      style={[
                        styles.catalogItem,
                        alreadySelected && styles.catalogItemDisabled,
                      ]}
                      onPress={() => !alreadySelected && handleAddExercise(item)}
                      disabled={alreadySelected}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.catalogItemName}>{item.nombre}</Text>
                        <Text style={styles.catalogItemMuscle}>{item.grupoMuscular}</Text>
                      </View>
                      {alreadySelected ? (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primaryLight} />
                      ) : (
                        <Ionicons name="add-circle-outline" size={22} color={colors.primaryLight} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    marginBottom: 18,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  orderBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumber: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  reorderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBtn: {
    padding: 6,
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 6,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  catalogModalBox: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  catalogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  catalogItemDisabled: {
    opacity: 0.4,
  },
  catalogItemName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  catalogItemMuscle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default CreateRoutineScreen;

