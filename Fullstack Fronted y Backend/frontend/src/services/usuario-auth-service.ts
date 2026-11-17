import axios from 'axios';

/**
 * Interfaz que define la estructura de los datos que se envían al servidor para iniciar sesión.
*/
export interface LoginRequestDTO{
    email: string;
    password: string;
}


/**
 * Interfaz que define la estructura de la respuesta que entrega el servidor cuando el inicio de sesión es exitoso.
*/

export interface LoginResponseDTO {
    token: string;
    tipoToken: string;
    expiraEnSegundos: number;
    usuario: {
        id: number;
        nombre: string;
        email: string;
        rol: string;
    };
}



/**
 * Interfaz que define los datos requeridos para registrar un nuevo usuario 
*/
export interface UsuarioRegistroDTO{
    nombre: string;
    email: string;
    password: string;
    rol?: 'ADMIN' | 'CLIENTE';
}


// URL base de tu API Gateway en Spring Boot. 
// Todas las peticiones de usuario pasan primero por este punto de entrada único.
const API_GATEWAY_URL = 'http://localhost:8081/api/usuarios';


/**
 * Objeto de servicio que agrupa todas las peticiones HTTP relacionadas con la autenticación y gestión de usuarios.
*/
export const usuarioAuthService = {
/**
   * Realiza la petición de inicio de sesión al microservicio.
   */
  login: async (credentials: LoginRequestDTO) => {
    try {
      const response = await axios.post<LoginResponseDTO>(`${API_GATEWAY_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Error al iniciar sesión en el microservicio de usuarios:', error);
      throw error;
    }
  },

  /**
   * Realiza la petición para registrar un nuevo usuario en el sistema.
   */
  registrar: async (userData: UsuarioRegistroDTO) => {
    try {
      const response = await axios.post(`${API_GATEWAY_URL}/registro`, userData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar un nuevo usuario:', error);
      throw error;
    }
  }
};