import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const DrawerMenu: React.FC<Props> = ({
  visible,
  onClose,
  currentScreen,
  onNavigate,
}) => {
  const { user, logout } = useAuth();

  const handleItemPress = (screen: string) => {
    onClose();
    onNavigate(screen);
  };

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: 'home-outline' as const },
    { id: 'catalog', label: 'Catálogo de Ejercicios', icon: 'barbell-outline' as const },
    { id: 'routines', label: 'Mis Rutinas', icon: 'list-outline' as const },
    { id: 'history', label: 'Historial', icon: 'calendar-outline' as const },
    { id: 'stats', label: 'Estadísticas', icon: 'trending-up-outline' as const },
    { id: 'profile', label: 'Mi Perfil', icon: 'person-outline' as const },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.drawerContainer}>
              {/* Encabezado del Usuario */}
              <View style={styles.userSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>
                    {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.nombre || 'Usuario FitTrack'}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user?.correo || ''}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Lista de Navegación */}
              <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                {menuItems.map((item) => {
                  const isActive = currentScreen === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.menuItem, isActive && styles.menuItemActive]}
                      onPress={() => handleItemPress(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={item.icon}
                        size={22}
                        color={isActive ? colors.primaryLight : colors.textSecondary}
                        style={styles.menuIcon}
                      />
                      <Text
                        style={[
                          styles.menuLabel,
                          isActive && styles.menuLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.divider} />

              {/* Cerrar Sesión */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  onClose();
                  logout();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={22} color={colors.danger} style={styles.menuIcon} />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: 'space-between',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  menuList: {
    flex: 1,
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: 'rgba(99, 85, 164, 0.2)',
  },
  menuIcon: {
    marginRight: 14,
  },
  menuLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DrawerMenu;
