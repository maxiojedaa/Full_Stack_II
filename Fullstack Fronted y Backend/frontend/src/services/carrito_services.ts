import { apiClient } from './apiClient';

// Ruta relativa en el API Gateway (http://localhost:8088/api/carrito)
const API_URL = '/api/carrito';

/**
 * DTO para enviar la solicitud de agregar o actualizar un ítem en el carrito.
 */
export interface ItemCarritoRequestDTO {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

/**
 * DTO que representa la respuesta detallada de un ítem dentro del carrito.
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
 */
export interface CarritoResponseDTO {
  id: number;
  usuarioId: number;
  items: ItemCarritoResponseDTO[];
  total: number;
}

/**
 * Servicio encargado de gestionar las peticiones HTTP del carrito de compras
 * a través del API Gateway (`:8088`) con token JWT automático.
 */
export const carritoService = {
  /**
   * Obtiene el carrito de compras asociado a un usuario específico.
   */
  obtenerCarritoPorUsuario: async (usuarioId: number): Promise<CarritoResponseDTO> => {
    const respuesta = await apiClient.get<CarritoResponseDTO>(`${API_URL}/${usuarioId}`);
    return respuesta.data;
  },

  /**
   * Agrega un nuevo ítem o incrementa la cantidad de un producto existente en el carrito.
   */
  agregarItem: async (
    usuarioId: number,
    itemRequest: ItemCarritoRequestDTO
  ): Promise<CarritoResponseDTO> => {
    const respuesta = await apiClient.post<CarritoResponseDTO>(
      `${API_URL}/${usuarioId}/items`,
      itemRequest
    );
    return respuesta.data;
  },

  /**
   * Actualiza la cantidad exacta de un ítem existente en el carrito (requiere endpoint PUT en ms-carrito).
   */
  actualizarCantidadItem: async (
    usuarioId: number,
    itemId: number,
    itemRequest: ItemCarritoRequestDTO
  ): Promise<CarritoResponseDTO> => {
    const respuesta = await apiClient.put<CarritoResponseDTO>(
      `${API_URL}/${usuarioId}/items/${itemId}`,
      itemRequest
    );
    return respuesta.data;
  },

  /**
   * Elimina un producto específico del carrito utilizando su ID de ítem.
   */
  eliminarItem: async (usuarioId: number, itemId: number): Promise<CarritoResponseDTO> => {
    const respuesta = await apiClient.delete<CarritoResponseDTO>(
      `${API_URL}/${usuarioId}/items/${itemId}`
    );
    return respuesta.data;
  },

  /**
   * Vacía por completo el contenido del carrito de compras del usuario.
   */
  vaciarCarrito: async (usuarioId: number): Promise<CarritoResponseDTO> => {
    const respuesta = await apiClient.delete<CarritoResponseDTO>(`${API_URL}/${usuarioId}/vaciar`);
    return respuesta.data;
  },
};