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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Props {
  onOpenMenu: () => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ onOpenMenu, onBack }) => {
  const { user, updateProfile, logout } = useAuth();
  const [nombre, setNombre] = useState<string>(user?.nombre || '');
  const [correo, setCorreo] = useState<string>(user?.correo || '');
  const [nuevaPassword, setNuevaPassword] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [savingUrl, setSavingUrl] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setCorreo(user.correo);
    }
    loadCurrentApiUrl();
  }, [user]);

  const loadCurrentApiUrl = async () => {
    const current = await api.getBaseUrl();
    setApiUrl(current);
  };

  const handleSaveProfile = async () => {
    if (!nombre.trim() || !correo.trim()) {
      Alert.alert('Validación', 'El nombre y correo son obligatorios.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        nombre: nombre.trim(),
        correo: correo.trim(),
        nuevaPassword: nuevaPassword.trim() || undefined,
      });
      setNuevaPassword('');
      Alert.alert('Éxito', 'Tu perfil ha sido actualizado correctamente.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) return;
    try {
      setSavingUrl(true);
      await api.setBaseUrl(apiUrl.trim());
      Alert.alert('Configuración guardada', `La URL base de la API se cambió a:\n${apiUrl.trim()}`);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo guardar la URL');
    } finally {
      setSavingUrl(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar tu sesión en FitTrack?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Mi Perfil" showBack={true} onBack={onBack} onOpenMenu={onOpenMenu} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userNameHeader}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.userEmailHeader}>{user?.correo || ''}</Text>
          {user?.fechaRegistro && (
            <Text style={styles.memberSince}>
              Miembro desde {new Date(user.fechaRegistro).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>

        {/* Formulario de Perfil (RF03) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Editar Información Personal</Text>

          <Text style={styles.fieldLabel}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre completo"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Nueva Contraseña (dejar vacío si no deseas cambiarla)</Text>
          <TextInput
            style={styles.input}
            value={nuevaPassword}
            onChangeText={setNuevaPassword}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveProfile}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.saveBtnText}>GUARDAR CAMBIOS</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Ajustes de Conexión Backend */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Conexión con Backend API</Text>
          <Text style={styles.apiDesc}>
            Ajusta la dirección de la API si estás probando desde un emulador o dispositivo físico en red local.
          </Text>

          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://localhost:5123/api"
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={styles.saveUrlBtn}
            onPress={handleSaveApiUrl}
            disabled={savingUrl}
            activeOpacity={0.8}
          >
            {savingUrl ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.saveUrlText}>GUARDAR URL API</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión (RF12) */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  userNameHeader: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  userEmailHeader: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  memberSince: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  apiDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  saveUrlBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveUrlText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default ProfileScreen;
