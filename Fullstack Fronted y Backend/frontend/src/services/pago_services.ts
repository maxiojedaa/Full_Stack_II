const API_URL_PAGOS = 'http://localhost:8085/api/pagos'; // Ajusta el puerto según corresponda

export interface PagoRequest {
  pedidoId?: number;
  monto: number;
  metodoPago: string;
  estado?: string;
}

export const pagoService = {
  async procesarPago(datosPago: PagoRequest): Promise<any> {
    const response = await fetch(API_URL_PAGOS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosPago),
    });

    if (!response.ok) {
      throw new Error('Error al procesar el pago en el servidor');
    }

    return response.json();
  }
};