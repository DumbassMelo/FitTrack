import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import colors from './src/constants/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WorkoutProvider, useWorkout } from './src/context/WorkoutContext';
import DrawerMenu from './src/components/DrawerMenu';
import HomeScreen from './src/screens/HomeScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';
import CreateRoutineScreen from './src/screens/CreateRoutineScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { Rutina, Ejercicio } from './src/types';

const MainNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isActive, addExerciseToWorkout } = useWorkout();

  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingRoutine, setEditingRoutine] = useState<Rutina | null>(null);
  const [isSelectingFromCatalog, setIsSelectingFromCatalog] = useState<boolean>(false);

  // Si no está autenticado, muestra Login o Registro
  if (!isAuthenticated) {
    return (
      <View style={styles.appContainer}>
        <StatusBar style="light" />
        {authScreen === 'login' ? (
          <LoginScreen onGoToRegister={() => setAuthScreen('register')} />
        ) : (
          <RegisterScreen onGoToLogin={() => setAuthScreen('login')} />
        )}
      </View>
    );
  }

  const handleOpenMenu = () => setIsDrawerOpen(true);
  const handleCloseMenu = () => setIsDrawerOpen(false);

  const handleNavigate = (screen: string) => {
    setIsSelectingFromCatalog(false);
    setCurrentScreen(screen);
  };

  const handleStartWorkout = () => {
    setCurrentScreen('activeWorkout');
  };

  const handleStartFreeWorkout = () => {
    setCurrentScreen('activeWorkout');
  };

  const handleCreateRoutine = () => {
    setEditingRoutine(null);
    setCurrentScreen('createRoutine');
  };

  const handleEditRoutine = (rutina: Rutina) => {
    setEditingRoutine(rutina);
    setCurrentScreen('createRoutine');
  };

  const handleExerciseSelectedFromCatalog = (exercise: Ejercicio) => {
    if (isSelectingFromCatalog && isActive) {
      addExerciseToWorkout(exercise);
      setIsSelectingFromCatalog(false);
      setCurrentScreen('activeWorkout');
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />

      {/* Pantalla Activa según el estado de navegación */}
      {currentScreen === 'home' && (
        <HomeScreen
          onOpenMenu={handleOpenMenu}
          onOpenProfile={() => setCurrentScreen('profile')}
          onStartWorkout={handleStartWorkout}
          onStartFreeWorkout={handleStartFreeWorkout}
          onCreateRoutine={handleCreateRoutine}
        />
      )}

      {currentScreen === 'activeWorkout' && (
        <ActiveWorkoutScreen
          onOpenMenu={handleOpenMenu}
          onOpenProfile={() => setCurrentScreen('profile')}
          onFinishWorkoutSuccess={() => setCurrentScreen('history')}
          onCancelWorkout={() => setCurrentScreen('home')}
          onOpenCatalogToAdd={() => {
            setIsSelectingFromCatalog(true);
            setCurrentScreen('catalog');
          }}
        />
      )}

      {currentScreen === 'catalog' && (
        <CatalogScreen
          onOpenMenu={handleOpenMenu}
          onOpenProfile={() => setCurrentScreen('profile')}
          isSelectingForWorkout={isSelectingFromCatalog}
          onExerciseSelect={
            isSelectingFromCatalog ? handleExerciseSelectedFromCatalog : undefined
          }
        />
      )}

      {currentScreen === 'routines' && (
        <RoutinesScreen
          onOpenMenu={handleOpenMenu}
          onOpenProfile={() => setCurrentScreen('profile')}
          onCreateRoutine={handleCreateRoutine}
          onEditRoutine={handleEditRoutine}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {currentScreen === 'createRoutine' && (
        <CreateRoutineScreen
          initialRoutine={editingRoutine}
          onBack={() => setCurrentScreen('routines')}
          onSaveSuccess={() => setCurrentScreen('routines')}
          onOpenProfile={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'history' && (
        <HistoryScreen
          onOpenMenu={handleOpenMenu}
          onOpenProfile={() => setCurrentScreen('profile')}
          onStartNewWorkout={handleStartFreeWorkout}
        />
      )}

      {currentScreen === 'stats' && (
        <StatisticsScreen
          onOpenMenu={handleOpenMenu}
          onOpenProfile={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          onOpenMenu={handleOpenMenu}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {/* Menú Lateral Desplegable */}
      <DrawerMenu
        visible={isDrawerOpen}
        onClose={handleCloseMenu}
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AuthProvider>
          <WorkoutProvider>
            <MainNavigator />
          </WorkoutProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
