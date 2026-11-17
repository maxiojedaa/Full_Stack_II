import axios from 'axios';


// URL base del API Gateway 
const API_URL = 'http://localhost:8082/api/carrito'; //[cite: 14]


/**
 * DTO para enviar la solicitud de agregar o actualizar un ítem en el carrito.
 * Mapea directamente con ItemCarritoRequestDTO.java del backend.
 */
export interface ItemCarritoRequestDTO {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}


/**
 * DTO que representa la respuesta detallada de un ítem dentro del carrito.
 * Mapea directamente con ItemCarritoResponseDTO.java del backend.
 */
export interface ItemCarritoResponseDTO {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/**
 * DTO que encapsula la respuesta completa del carrito de compras de un usuario.
 * Mapea directamente con CarritoResponseDTO.java del backend.
 */
export interface CarritoResponseDTO {
  id: number;
  usuarioId: number;
  items: ItemCarritoResponseDTO[];
  total: number;
}

/**
 * Servicio encargador de gestionar las peticiones HTTP del carrito de compras
 * conectando con los endpoints expuestos por CarritoService.java en Spring Boot.
 */
export const carritoService = {

  /**
   * Obtiene el carrito de compras asociado a un usuario específico.
   * Llama a obtenerCarritoPorUsuario(usuarioId) en el backend.
   */
  obtenerCarritoPorUsuario: async (usuarioId: number) => {
    const respuesta = await axios.get<CarritoResponseDTO>(`${API_URL}/${usuarioId}`);
    return respuesta.data;
  },

  /**
   * Agrega un nuevo ítem o incrementa la cantidad de un producto existente en el carrito.
   * Llama a agregarItem(usuarioId, request) en el backend.
   */
  agregarItem: async (usuarioId: number, itemRequest: ItemCarritoRequestDTO) => {
    const respuesta = await axios.post<CarritoResponseDTO>(
      `${API_URL}/${usuarioId}/items`,
      itemRequest
    );
    return respuesta.data;
  },

  /**
   * Elimina un producto específico del carrito utilizando su ID de ítem.
   * Llama a eliminarItem(usuarioId, itemId) en el backend.
   */
  eliminarItem: async (usuarioId: number, itemId: number) => {
    const respuesta = await axios.delete<CarritoResponseDTO>(
      `${API_URL}/${usuarioId}/items/${itemId}`
    );
    return respuesta.data;
  },

  /**
   * Vacía por completo el contenido del carrito de compras del usuario.
   * Llama a vaciarCarrito(usuarioId) en el backend.
   */
  vaciarCarrito: async (usuarioId: number) => {
    const respuesta = await axios.delete<CarritoResponseDTO>(
      `${API_URL}/${usuarioId}`
    );
    return respuesta.data;
  }
};