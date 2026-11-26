import { apiClient } from './apiClient';

// Ruta relativa en el API Gateway (http://localhost:8088/api/pedidos)
const API_URL = '/api/pedidos';

// Datos de un producto incluido en un pedido
export interface ItemPedidoRequestDTO {
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
}

// Datos necesarios para crear un pedido
export interface PedidoRequestDTO {
  usuarioId: number;
  items: ItemPedidoRequestDTO[];
}

// Datos que devuelve el backend
export interface PedidoResponseDTO {
  id: number;
  usuarioId: number;
  total: number;
  estado: string;
  fechaCreacion: string;
  items: ItemPedidoRequestDTO[];
}

// Servicio encargado de comunicarse con ms-pedido a través del Gateway
export const PedidoService = {
  // Registrar un nuevo pedido
  registrarPedido: async (datos: PedidoRequestDTO): Promise<PedidoResponseDTO> => {
    const respuesta = await apiClient.post<PedidoResponseDTO>(API_URL, datos);
    return respuesta.data;
  },

  // Obtener todos los pedidos de un usuario
  obtenerPedidosPorUsuario: async (usuarioId: number): Promise<PedidoResponseDTO[]> => {
    const respuesta = await apiClient.get<PedidoResponseDTO[]>(`${API_URL}/usuario/${usuarioId}`);
    return respuesta.data;
  },

  // Obtener los pedidos pendientes
  obtenerPedidosPendientes: async (): Promise<PedidoResponseDTO[]> => {
    const respuesta = await apiClient.get<PedidoResponseDTO[]>(`${API_URL}/pendientes`);
    return respuesta.data;
  },

  // Obtener todos los pedidos registrados en el sistema
  obtenerTodosLosPedidos: async (): Promise<PedidoResponseDTO[]> => {
    const respuesta = await apiClient.get<PedidoResponseDTO[]>(API_URL);
    return respuesta.data;
  },

  // Cambiar el estado de un pedido (ej. PENDIENTE -> CANCELADO)
  cambiarEstadoPedido: async (
    pedidoId: number,
    estado: 'PENDIENTE' | 'CANCELADO'
  ): Promise<PedidoResponseDTO> => {
    const respuesta = await apiClient.patch<PedidoResponseDTO>(
      `${API_URL}/${pedidoId}/estado`,
      { estado }
    );
    return respuesta.data;
  },

  eliminarPedido: async (pedidoId: number): Promise<void> => {
    await apiClient.delete(`${API_URL}/${pedidoId}`);
  },
};