import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

interface Props {
  title?: string;
  onOpenMenu?: () => void;
  onOpenProfile?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<Props> = ({
  title = 'FitTrack',
  onOpenMenu,
  onOpenProfile,
  showBack = false,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      {/* Botón Izquierdo: Back o Hamburguesa */}
      {showBack ? (
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenMenu} activeOpacity={0.7}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
      )}

      {/* Título Central */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Botón Derecho: Badge de Perfil */}
      <TouchableOpacity style={styles.iconBtn} onPress={onOpenProfile} activeOpacity={0.7}>
        <View style={styles.badgeWrapper}>
          <Ionicons name="sparkles" size={16} color={colors.primaryLight} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 85, 164, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(139, 122, 216, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;

