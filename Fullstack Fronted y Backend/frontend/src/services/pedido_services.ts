import axios from 'axios';

// URL base del microservicio de pedidos
const API_URL = 'http://localhost:8084/api/pedidos';

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

// Servicio encargado de comunicarse con ms-pedido
export const PedidoService = {

  // Registrar un nuevo pedido
  registrarPedido: async (
    datos: PedidoRequestDTO
  ): Promise<PedidoResponseDTO> => {
    const respuesta = await axios.post<PedidoResponseDTO>(
      API_URL,
      datos
    );
    return respuesta.data;
  },

  // Obtener todos los pedidos de un usuario
  obtenerPedidosPorUsuario: async (
    usuarioId: number
  ): Promise<PedidoResponseDTO[]> => {
    const respuesta = await axios.get<PedidoResponseDTO[]>(
      `${API_URL}/usuario/${usuarioId}`
    );
    return respuesta.data;
  },

  // Obtener los pedidos pendientes
  obtenerPedidosPendientes: async (): Promise<PedidoResponseDTO[]> => {
    const respuesta = await axios.get<PedidoResponseDTO[]>(
      `${API_URL}/pendientes`
    );
    return respuesta.data;
  }

};
