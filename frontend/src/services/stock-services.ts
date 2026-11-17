import axios from 'axios';


// URL base del microservicio Stock (puerto 8086).
// Si más adelante se usa el API Gateway, basta con cambiar 8086 por 8088.
const API_URL_PRODUCTOS = 'http://localhost:8086/api/productos';
const API_URL_VENTAS = 'http://localhost:8086/api/ventas';


/**
 * DTO que representa el stock de un producto.
 * Mapea directamente con la entidad ProductoStock.java del backend.
 */
export interface ProductoStockDTO {
  productoId: number;
  nombre: string;
  stock: number;
  minStock: number;
}

/**
 * DTO que representa una venta registrada.
 * Mapea directamente con la entidad Venta.java del backend.
 */
export interface VentaDTO {
  ventaId: number;
  productoId: number;
  cantidad: number;
  fecha: string;
}

/**
 * Servicio encargado de gestionar las peticiones HTTP del inventario
 * conectando con los endpoints de ProductoStockController y VentaController.
 *
 * IMPORTANTE: el backend de Stock recibe los datos como parámetros en la URL
 * (@RequestParam), no como JSON en el body. Por eso se usa "params" en axios.
 */
export const stockService = {

  /**
   * Crea un producto nuevo en el inventario.
   * Llama a crearProducto(nombre, stock, minStock) en el backend.
   */
  crearProducto: async (nombre: string, stock: number, minStock: number) => {
    const respuesta = await axios.post<ProductoStockDTO>(API_URL_PRODUCTOS, null, {
      params: { nombre, stock, minStock }
    });
    return respuesta.data;
  },

  /**
   * Actualiza la cantidad de stock de un producto existente.
   * Llama a actualizarStock(productoId, stock) en el backend.
   */
  actualizarStock: async (productoId: number, stock: number) => {
    const respuesta = await axios.put<ProductoStockDTO>(
      `${API_URL_PRODUCTOS}/${productoId}/stock`,
      null,
      { params: { stock } }
    );
    return respuesta.data;
  },

  /**
   * Obtiene los productos que tienen stock bajo.
   * Llama a verificarStockBajo() en el backend.
   */
  verificarStockBajo: async () => {
    const respuesta = await axios.get<ProductoStockDTO[]>(`${API_URL_PRODUCTOS}/stock-bajo`);
    return respuesta.data;
  },

  /**
   * Registra una venta y descuenta la cantidad vendida del stock.
   * Llama a registrarVenta(productoId, cantidad) en el backend.
   */
  registrarVenta: async (productoId: number, cantidad: number) => {
    const respuesta = await axios.post<VentaDTO>(API_URL_VENTAS, null, {
      params: { productoId, cantidad }
    });
    return respuesta.data;
  }
};
