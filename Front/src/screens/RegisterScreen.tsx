import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';

interface Props {
  onGoToLogin: () => void;
}

export const RegisterScreen: React.FC<Props> = ({ onGoToLogin }) => {
  const { register } = useAuth();
  const [nombre, setNombre] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!nombre.trim() || !correo.trim() || !password) {
      Alert.alert('Validación', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validación', 'La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validación', 'Las contraseñas ingresadas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await register({
        nombre: nombre.trim(),
        correo: correo.trim(),
        password,
      });
      Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente.');
    } catch (err: any) {
      Alert.alert(
        'Error de Registro',
        err.message || 'No se pudo crear la cuenta. Es posible que el correo ya esté registrado.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.headerBox}>
          <Text style={styles.brandTitle}>Crear Cuenta</Text>
          <Text style={styles.brandSubtitle}>
            Únete a FitTrack y lleva el registro de tus entrenamientos
          </Text>
        </View>

        {/* Tarjeta de Formulario (RF01) */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Nombre Completo *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor={colors.textMuted}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <Text style={styles.label}>Correo Electrónico *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textMuted}
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Contraseña (mínimo 6 caracteres) *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.registerBtnText}>REGISTRARSE</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Enlace hacia Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={onGoToLogin}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    marginBottom: 24,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  registerBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  registerBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RegisterScreen;

