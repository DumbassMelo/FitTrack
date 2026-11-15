import { Platform } from 'react-native';

// URL base por defecto según la plataforma
// Android Emulator usa 10.0.2.2 para acceder al localhost del host
// iOS Simulator y Web usan localhost directamente
export const getDefaultApiUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5123/api';
  }
  return 'http://localhost:5123/api';
};

export const API_URL_KEY = 'fittrack_api_base_url';
export const TOKEN_STORAGE_KEY = 'fittrack_jwt_token';
export const USER_STORAGE_KEY = 'fittrack_user_data';

