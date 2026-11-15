import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

interface Props {
  activeDays?: number[]; // Índices 0-6 de los días con entrenamiento
}

export const WeekCalendar: React.FC<Props> = ({ activeDays = [0, 2, 4] }) => {
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Calcular las fechas de la semana actual (de Lunes a Domingo)
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 es Domingo
  // Ajustar para que Lunes sea 0 y Domingo sea 6
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: dayNames[i],
      dateNumber: d.getDate(),
      isToday:
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear(),
      hasWorkout: activeDays.includes(i),
    };
  });

  return (
    <View style={styles.container}>
      {weekDates.map((item, index) => (
        <View key={index} style={styles.dayCol}>
          <Text style={[styles.dayName, item.isToday && styles.todayText]}>
            {item.name}
          </Text>
          <Text style={[styles.dayNumber, item.isToday && styles.todayNumber]}>
            {item.dateNumber}
          </Text>
          <View
            style={[
              styles.dot,
              item.hasWorkout ? styles.dotActive : styles.dotInactive,
              item.isToday && styles.dotToday,
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  dayCol: {
    alignItems: 'center',
    width: 38,
  },
  dayName: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  dayNumber: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayText: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  todayNumber: {
    color: colors.primaryLight,
    fontWeight: '800',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  dotInactive: {
    backgroundColor: '#383348',
  },
  dotToday: {
    borderWidth: 1,
    borderColor: colors.text,
  },
});

export default WeekCalendar;

