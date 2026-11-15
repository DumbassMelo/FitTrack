import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';

interface Props {
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onGoToRegister }) => {
  const { login } = useAuth();
  const [correo, setCorreo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLogin = async () => {
    if (!correo.trim() || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await login({ correo: correo.trim(), password });
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Correo o contraseña incorrectos. Intenta nuevamente.'
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
        {/* Logo / Encabezado */}
        <View style={styles.headerBox}>
          <View style={styles.logoBadge}>
            <Ionicons name="fitness-outline" size={38} color={colors.primaryLight} />
          </View>
          <Text style={styles.brandTitle}>FitTrack</Text>
          <Text style={styles.brandSubtitle}>
            Seguimiento de rutinas y entrenamientos de fuerza
          </Text>
        </View>

        {/* Tarjeta de Formulario */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>

          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textMuted}
              value={correo}
              onChangeText={(t) => { setCorreo(t); setErrorMsg(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
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

          {/* Banner de error inline — visible cuando las credenciales son incorrectas */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.loginBtnText}>INGRESAR</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Enlace hacia Registro */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿No tienes una cuenta aún? </Text>
          <TouchableOpacity onPress={onGoToRegister}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
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
    marginBottom: 32,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(99, 85, 164, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 122, 216, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 34,
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
  formTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
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
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnText: {
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
  registerLink: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
