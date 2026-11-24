import { apiClient } from './apiClient';

// Ruta relativa del microservicio de catálogo en el API Gateway (:8088)
const API_URL = '/api/catalogo';

// Interfaz TypeScript idéntica al ProductoResponseDTO de Java
export interface ProductoDTO {
    id?: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock?: number;
    categoria?: string;
    imagen?: string;
}

/**
 * Extrae de forma segura un arreglo de productos desde la respuesta del backend
 * o API Gateway para evitar errores cuando la respuesta viene paginada o envuelta.
 */
function normalizarProductos(data: unknown): ProductoDTO[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.content)) return obj.content as ProductoDTO[];
        if (Array.isArray(obj.productos)) return obj.productos as ProductoDTO[];
        if (Array.isArray(obj.data)) return obj.data as ProductoDTO[];
    }
    return [];
}

/**
 * Servicio del catálogo conectado al API Gateway (`:8088`) con inyección JWT automática.
 */
export const catalogoService = {
    obtenerProductos: async (): Promise<ProductoDTO[]> => {
        const respuesta = await apiClient.get(API_URL);
        return normalizarProductos(respuesta.data);
    },
    obtenerProductoPorId: async (id: number): Promise<ProductoDTO> => {
        const respuesta = await apiClient.get<ProductoDTO>(`${API_URL}/${id}`);
        return respuesta.data;
    },
    crearProducto: async (producto: ProductoDTO): Promise<ProductoDTO> => {
        const respuesta = await apiClient.post<ProductoDTO>(API_URL, producto);
        return respuesta.data;
    },
    eliminarProducto: async (id: number): Promise<unknown> => {
        const respuesta = await apiClient.delete(`${API_URL}/${id}`);
        return respuesta.data;
    }
};