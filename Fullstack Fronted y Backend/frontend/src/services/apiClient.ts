import axios from 'axios';
import { getAuthHeaders, limpiarSesion } from '../services/authSession'; // Ajusta la ruta si authSession.ts está en otra carpeta

/**
 * URL base del API Gateway (Spring Cloud Gateway en puerto 8088).
 */
export const GATEWAY_URL = 'http://localhost:8088';

/**
 * Instancia Axios configurada para comunicarse con el API Gateway (`:8088`)
 * e incluir automáticamente el token JWT en cada petición.
 */
export const apiClient = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de petición: adjunta `Authorization: Bearer <token>` si existe sesión válida
apiClient.interceptors.request.use(
  (config) => {
    const authHeaders = getAuthHeaders();
    if (authHeaders.Authorization) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = authHeaders.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: si el backend responde 401 (no autorizado/token inválido), limpia sesión
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      limpiarSesion();
    }
    return Promise.reject(error);
  }
);