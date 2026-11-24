/**
 * Interfaz que representa los datos básicos del usuario autenticado en sesión.
 */
export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

/**
 * Interfaz que agrupa el token JWT activo y los datos del usuario autenticado.
 */
export interface SesionActiva {
  token: string;
  usuario: UsuarioSesion;
}

const TOKEN_KEY = 'token';
const USUARIO_ID_KEY = 'usuarioId';
const USUARIO_NOMBRE_KEY = 'usuarioNombre';
const USUARIO_EMAIL_KEY = 'usuarioEmail';
const USUARIO_ROL_KEY = 'usuarioRol';

/**
 * Decodifica el payload de un token JWT en formato Base64Url.
 * No valida la firma criptográfica (eso lo hace el backend), pero permite leer claims como `exp`.
 *
 * @param token Cadena JWT con estructura header.payload.signature
 * @returns Objeto con los claims decodificados o `null` si el formato es inválido
 */
export function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Comprueba si el token existe y no ha superado su fecha de expiración (`exp` en segundos).
 *
 * @param token Token JWT almacenado o `null`
 * @returns `true` si es utilizable, `false` si está vacío, corrupto o expirado
 */
export function isTokenValid(token: string | null): boolean {
  if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
    return false;
  }

  const payload = parseJwtPayload(token);
  if (payload && typeof payload.exp === 'number') {
    const ahoraSegundos = Math.floor(Date.now() / 1000);
    if (payload.exp <= ahoraSegundos) {
      return false;
    }
  }

  return true;
}

/**
 * Persiste el token JWT y los datos del usuario en `localStorage`.
 *
 * @param token Token JWT entregado por el backend
 * @param usuario Datos del usuario autenticado
 */
export function guardarSesion(token: string, usuario: UsuarioSesion): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USUARIO_ID_KEY, String(usuario.id));
  localStorage.setItem(USUARIO_NOMBRE_KEY, usuario.nombre);
  localStorage.setItem(USUARIO_EMAIL_KEY, usuario.email);
  localStorage.setItem(USUARIO_ROL_KEY, usuario.rol);
}

/**
 * Elimina toda la información de sesión almacenada en `localStorage`.
 */
export function limpiarSesion(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_ID_KEY);
  localStorage.removeItem(USUARIO_NOMBRE_KEY);
  localStorage.removeItem(USUARIO_EMAIL_KEY);
  localStorage.removeItem(USUARIO_ROL_KEY);
}

/**
 * Recupera la sesión actual si existe un token válido y datos completos de usuario.
 *
 * @returns `SesionActiva` si la sesión es válida o `null` en caso contrario
 */
export function obtenerSesion(): SesionActiva | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!isTokenValid(token)) {
    return null;
  }

  const idRaw = localStorage.getItem(USUARIO_ID_KEY);
  const nombre = localStorage.getItem(USUARIO_NOMBRE_KEY);
  const email = localStorage.getItem(USUARIO_EMAIL_KEY);
  const rol = localStorage.getItem(USUARIO_ROL_KEY);

  const id = Number(idRaw);
  if (!token || !idRaw || Number.isNaN(id) || !rol) {
    return null;
  }

  return {
    token,
    usuario: {
      id,
      nombre: nombre || '',
      email: email || '',
      rol,
    },
  };
}

/**
 * Construye la cabecera `Authorization: Bearer <token>` para adjuntar en peticiones HTTP.
 *
 * @returns Objeto con cabecera `Authorization` o `{}` si no hay sesión activa
 */
export function getAuthHeaders(): Record<string, string> {
  const sesion = obtenerSesion();
  if (!sesion) return {};
  return {
    Authorization: `Bearer ${sesion.token}`,
  };
}