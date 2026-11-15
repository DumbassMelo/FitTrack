import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Header from '../components/Header';
import ExerciseIllustration from '../components/ExerciseIllustration';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutDetalle } from '../types';

interface Props {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onFinishWorkoutSuccess: () => void;
  onCancelWorkout: () => void;
  onOpenCatalogToAdd: () => void;
}

export const ActiveWorkoutScreen: React.FC<Props> = ({
  onOpenMenu,
  onOpenProfile,
  onFinishWorkoutSuccess,
  onCancelWorkout,
  onOpenCatalogToAdd,
}) => {
  const {
    workoutName,
    exercises,
    addSetToExercise,
    removeSetFromExercise,
    updateSetField,
    removeExerciseFromWorkout,
    finishWorkout,
    cancelWorkout,
  } = useWorkout();

  const [saving, setSaving] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [savedSummary, setSavedSummary] = useState<WorkoutDetalle | null>(null);

  const handleFinish = async () => {
    try {
      setSaving(true);
      const res = await finishWorkout();
      if (res) {
        setSavedSummary(res);
        setSuccessModalVisible(true);
      }
    } catch (err: any) {
      Alert.alert(
        'Atención',
        err.message || 'No se pudo guardar el entrenamiento. Verifica los campos.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmCancel = () => {
    Alert.alert(
      'Cancelar Entrenamiento',
      '¿Estás seguro de cancelar este entrenamiento? Se perderán las series ingresadas.',
      [
        { text: 'No, continuar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            cancelWorkout();
            onCancelWorkout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="FitTrack"
        showBack={true}
        onBack={handleConfirmCancel}
        onOpenProfile={onOpenProfile}
      />

      {/* Barra de estado del entrenamiento activo */}
      <View style={styles.topBar}>
        <View style={styles.titleInfo}>
          <Text style={styles.workoutTitle}>{workoutName}</Text>
          <Text style={styles.workoutSubtitle}>
            {exercises.length} {exercises.length === 1 ? 'ejercicio' : 'ejercicios'} en curso
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addExerciseBtn}
          onPress={onOpenCatalogToAdd}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color={colors.text} />
          <Text style={styles.addExerciseBtnText}>Ejercicio</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={54} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin ejercicios añadidos</Text>
            <Text style={styles.emptySub}>
              Añade ejercicios desde el catálogo para comenzar a registrar tus series y pesos.
            </Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={onOpenCatalogToAdd} activeOpacity={0.8}>
              <Text style={styles.emptyAddBtnText}>AÑADIR EJERCICIO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.idEjercicio} style={styles.exerciseCard}>
              {/* Imagen/Ilustración del Ejercicio (Imagen 2) */}
              <View style={styles.imageContainer}>
                <ExerciseIllustration
                  slug={exercise.slug}
                  fotogramasSvg={exercise.fotogramasSvg}
                  width={280}
                  height={150}
                  backgroundColor="#000000"
                />
              </View>

              {/* Título del ejercicio */}
              <View style={styles.cardHeaderRow}>
                <Text style={styles.exerciseTitle}>{exercise.nombre}</Text>
                <TouchableOpacity
                  onPress={() => removeExerciseFromWorkout(exercise.idEjercicio)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Tabla de Series (Imagen 2) */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCol, styles.colSerie]}>Serie</Text>
                <Text style={[styles.headerCol, styles.colPeso]}>Peso</Text>
                <Text style={[styles.headerCol, styles.colReps]}>Repeticiones</Text>
                <Text style={[styles.headerCol, styles.colAction]}></Text>
              </View>

              {exercise.series.map((serie, sIndex) => (
                <View key={serie.numeroSerie} style={styles.setRow}>
                  <Text style={[styles.colSerie, styles.setIndexText]}>
                    {serie.numeroSerie}
                  </Text>

                  {/* Input Peso */}
                  <View style={[styles.colPeso, styles.inputWrapper]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Value"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      value={serie.peso}
                      onChangeText={(val) =>
                        updateSetField(exercise.idEjercicio, sIndex, 'peso', val)
                      }
                    />
                  </View>

                  {/* Input Repeticiones */}
                  <View style={[styles.colReps, styles.inputWrapper]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Value"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      value={serie.repeticiones}
                      onChangeText={(val) =>
                        updateSetField(exercise.idEjercicio, sIndex, 'repeticiones', val)
                      }
                    />
                  </View>

                  {/* Botón Borrar Serie */}
                  <TouchableOpacity
                    style={[styles.colAction, styles.removeSetBtn]}
                    onPress={() => removeSetFromExercise(exercise.idEjercicio, sIndex)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Botón Añadir Serie (Imagen 2) */}
              <TouchableOpacity
                style={styles.addSetBtn}
                onPress={() => addSetToExercise(exercise.idEjercicio)}
                activeOpacity={0.8}
              >
                <Text style={styles.addSetText}>AÑADIR SERIE</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {exercises.length > 0 && (
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={handleFinish}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.finishBtnText}>GUARDAR ENTRENAMIENTO</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal de Éxito al finalizar entrenamiento */}
      <Modal visible={successModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark" size={32} color={colors.text} />
            </View>
            <Text style={styles.modalTitle}>¡Entrenamiento Completado!</Text>
            <Text style={styles.modalMessage}>
              Tu sesión se ha guardado exitosamente en el servidor.
            </Text>

            {savedSummary && (
              <View style={styles.statsSummaryBox}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {savedSummary.series?.length || 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Series</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {savedSummary.volumenTotal || 0} kg
                  </Text>
                  <Text style={styles.summaryLabel}>Volumen</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={() => {
                setSuccessModalVisible(false);
                onFinishWorkoutSuccess();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalConfirmBtnText}>CONTINUAR</Text>
            </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  titleInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  workoutSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExerciseBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    marginTop: 8,
    marginBottom: 24,
  },
  emptyAddBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    height: 150,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  exerciseTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  headerCol: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  colSerie: {
    width: 50,
    textAlign: 'center',
  },
  colPeso: {
    flex: 1,
    paddingHorizontal: 6,
  },
  colReps: {
    flex: 1,
    paddingHorizontal: 6,
  },
  colAction: {
    width: 32,
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  setIndexText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  removeSetBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  addSetText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  finishBtn: {
    backgroundColor: '#2ED573',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  finishBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  statsSummaryBox: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: colors.primaryLight,
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  modalConfirmBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default ActiveWorkoutScreen;

