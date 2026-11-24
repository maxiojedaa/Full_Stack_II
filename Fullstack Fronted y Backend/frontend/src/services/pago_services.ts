import { apiClient } from './apiClient';

// Ruta relativa en el API Gateway (http://localhost:8088/api/pagos)
const API_URL_PAGOS = '/api/pagos';

export interface PagoRequest {
  pedidoId?: number;
  monto: number;
  metodoPago: string;
  estado?: string;
}

export const pagoService = {
  async procesarPago(datosPago: PagoRequest): Promise<any> {
    const response = await apiClient.post(API_URL_PAGOS, datosPago);
    return response.data;
  },
};