import axios from 'axios';


const API_URL = 'http://localhost:8083/api/catalogo'; // O la ruta de tu catálogo

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


export const catalogoService = {
    obtenerProductos: async () => {
        const respuesta = await axios.get<ProductoDTO[]>(API_URL);
        return respuesta.data;
    },
    obtenerProductoPorId: async (id: number) => {
        const respuesta = await axios.get<ProductoDTO>(`${API_URL}/${id}`);
        return respuesta.data;
    },
    crearProducto: async (producto: ProductoDTO) => {
        const respuesta = await axios.post<ProductoDTO>(API_URL, producto);
        return respuesta.data;
    },
    eliminarProducto: async (id: number) => {
        const respuesta = await axios.delete(`${API_URL}/${id}`);
        return respuesta.data;
    }
};