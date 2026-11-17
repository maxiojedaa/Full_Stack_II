import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService, type CarritoResponseDTO } from '../../services/carrito_services';
import { PedidoService } from '../../services/pedido_services';
import { pagoService } from '../../services/pago_services';

/**
 * Componente CarritoPage: Gestiona la visualización del carrito, traduce los IDs
 * de los productos a sus nombres comerciales, permite vaciar, eliminar ítems,
 * procesar el pago a través del microservicio de pagos con formulario dinámico y registrar el pedido.
 */
export const CarritoPage: React.FC = () => {
  const [carrito, setCarrito] = useState<CarritoResponseDTO | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [procesandoPedido, setProcesandoPedido] = useState<boolean>(false);
  const [mostrarModalPago, setMostrarModalPago] = useState<boolean>(false);

const [compraExitosa, setCompraExitosa] = useState<{
  pedidoId: number | string;
  total: number;
} | null>(null);


  const navigate = useNavigate();
  const usuarioId = 1; // ID del usuario actual sincronizado con el backend

  /**
   * Diccionario local para traducir el 'productoId' (ej. 101) 
   * a su nombre comercial real en la tienda.
   */
  const nombresProductosMap: Record<number, string> = {
    101: 'Robot de Madera',
    102: 'Colección Creativa',
    103: 'Pinta tu Juguete',
    104: 'Kit de Dinosaurios para Armar',
    105: 'Tren de Madera Magnético',
    106: 'Mini Laboratorio de Ciencias'
  };

  /**
   * Obtiene el carrito del usuario desde el microservicio backend.
   */
  const cargarCarrito = async () => {
    try {
      setCargando(true);
      const data = await carritoService.obtenerCarritoPorUsuario(usuarioId);
      setCarrito(data);
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  /**
   * Elimina un ítem individual usando el ID del registro de la tabla items_carrito.
   */
  const handleEliminarItem = async (itemId: number) => {
    try {
      const carritoActualizado = await carritoService.eliminarItem(usuarioId, itemId);
      setCarrito(carritoActualizado);
    } catch (error) {
      console.error("Error al eliminar el ítem:", error);
      alert("No se pudo eliminar el producto.");
    }
  };

  /**
   * Vacía el carrito por completo usando el endpoint DELETE.
   */
  const handleVaciarCarrito = async () => {
    if (!confirm("¿Estás seguro de que deseas vaciar tu carrito?")) return;

    try {
      const carritoVacio = await carritoService.vaciarCarrito(usuarioId);
      setCarrito(carritoVacio);
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      alert("No se pudo vaciar el carrito.");
    }
  };

  /**
   * Abre el modal de pago antes de registrar el pedido.
   */
  const handleIniciarPago = () => {
    if (!carrito || !carrito.items || carrito.items.length === 0 || procesandoPedido) {
      return;
    }
    setMostrarModalPago(true);
  };

  /**
   * Ejecutado cuando el pago es exitoso desde el modal:
   * 1. Envía el pago a ms-sistema-pagos incluyendo usuarioId y un pedidoId único.
   * 2. Registra el pedido en ms-pedido.
   * 3. Vacía el carrito y redirige al catálogo.
   */
  const handlePagoExitoso = async (metodoSeleccionado: string) => {
    setMostrarModalPago(false);

    try {
      setProcesandoPedido(true);

      // PASO 1: Procesar el pago en el microservicio de pagos
      const datosPago = {
        usuarioId: usuarioId,
        pedidoId: Math.floor(Math.random() * 100000), // Genera un ID único automático para evitar duplicados
        monto: Number(carrito?.total || 0),
        metodoPago: String(metodoSeleccionado)
      };

      console.log("Enviando pago al microservicio:", datosPago);
      const respuestaPago = await pagoService.procesarPago(datosPago);
      console.log("Respuesta del microservicio de pagos:", respuestaPago);

      // PASO 2: Registrar el pedido en el microservicio de pedidos
      const datosPedido = {
        usuarioId: usuarioId,
        items: carrito!.items.map((item) => ({
          productoId: item.productoId,
          nombreProducto: nombresProductosMap[item.productoId] || `Juguete #${item.productoId}`,
          precioUnitario: item.precioUnitario,
          cantidad: item.cantidad
        }))
      };

      console.log("Enviando pedido al backend:", datosPedido);
      const pedidoCreado = await PedidoService.registrarPedido(datosPedido);

      // PASO 3: Vaciar el carrito en el backend
      await carritoService.vaciarCarrito(usuarioId);

      
setCompraExitosa({
  pedidoId: pedidoCreado?.id ?? 'OK',
  total: pedidoCreado?.total ?? carrito?.total ?? 0
});



    } catch (error: any) {
      console.error("Error detallado en la transacción:", error);
      alert(`No se pudo completar la compra.\nRevisa la consola del navegador (F12) para ver el detalle técnico.`);
    } finally {
      setProcesandoPedido(false);
    }
  };

  if (cargando) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Cargando carrito...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>

      {/* Tarjeta flotante principal del carrito */}
      <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '650px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '30px', position: 'relative' }}>

        {/* Cabecera y botón de cierre */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>Tu Carrito</h2>
          <button
            onClick={() => navigate('/catalogo')}
            style={{ background: 'none', border: 'none', fontSize: '22px', color: '#a0aec0', cursor: 'pointer', fontWeight: 'bold' }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Validar si el carrito está vacío */}
        {!carrito || !carrito.items || carrito.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#718096', fontSize: '16px', marginBottom: '20px' }}>Tu carrito está vacío.</p>
            <button
              onClick={() => navigate('/catalogo')}
              style={{ padding: '10px 20px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Volver a la Tienda
            </button>
          </div>
        ) : (
          <div>
            {/* Lista de productos con scroll vertical */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '380px', overflowY: 'auto', marginBottom: '25px', paddingRight: '5px' }}>
              {carrito.items.map((item) => {
                const nombreReal = nombresProductosMap[item.productoId] || `Juguete #${item.productoId}`;

                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '20px' }}>

                    {/* Información visual del producto */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '65px', height: '65px', backgroundColor: '#edf2f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid #e2e8f0' }}>
                        📦
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1a202c' }}>
                          {nombreReal}
                        </h4>
                        <p style={{ margin: 0, fontSize: '15px', color: '#718096', fontWeight: '500' }}>
                          ${item.precioUnitario?.toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>

                    {/* Cantidad y botón eliminar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '6px', overflow: 'hidden' }}>
                        <span style={{ padding: '5px 14px', fontSize: '14px', fontWeight: 'bold', color: '#1a202c', backgroundColor: '#fff' }}>{item.cantidad}</span>
                      </div>

                      <button
                        onClick={() => handleEliminarItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#e53e3e', padding: '5px' }}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Total acumulado calculado por el backend */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>Total:</span>
              <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#3182ce' }}>
                ${carrito.total?.toLocaleString('es-CL')}
              </span>
            </div>

            {/* Botones inferiores de acción */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleVaciarCarrito}
                style={{ padding: '10px 18px', backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #fc8181', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                🗑️ Vaciar Carrito
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => navigate('/catalogo')}
                  style={{ padding: '10px 18px', backgroundColor: '#718096', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                  Seguir Comprando
                </button>
                <button
                  onClick={handleIniciarPago}
                  disabled={procesandoPedido}
                  style={{ padding: '10px 24px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                >
                  {procesandoPedido ? 'Procesando...' : 'Proceder al Pago'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>


{/* Ventana de confirmación de compra exitosa */}
{compraExitosa && (
  <div style={{
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px'
  }}>
    <div role="dialog" aria-modal="true" aria-labelledby="compra-exitosa-titulo" style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '35px',
      width: '100%',
      maxWidth: '420px',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        width: '75px',
        height: '75px',
        borderRadius: '50%',
        backgroundColor: '#dcfce7',
        color: '#16a34a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '40px',
        margin: '0 auto 20px'
      }}>
        ✓
      </div>

      <h2 id="compra-exitosa-titulo" style={{ color: '#1e293b', marginBottom: '10px' }}>
        ¡Compra realizada!
      </h2>

      <p style={{ color: '#64748b', marginBottom: '25px' }}>
        Tu pedido ha sido registrado correctamente.
      </p>

      <div style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '25px'
      }}>
        <p style={{ color: '#475569' }}>
          Número de pedido: <strong>#{compraExitosa.pedidoId}</strong>
        </p>

        <p style={{
          color: '#16a34a',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: 0
        }}>
          ${compraExitosa.total.toLocaleString('es-CL')}
        </p>
      </div>

      <button
        onClick={() => {
          setCompraExitosa(null);
          navigate('/catalogo');
        }}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Continuar comprando
      </button>
    </div>
  </div>
)}

      {/* Modal de Pago Integrado con Formularios Dinámicos */}
      {mostrarModalPago && carrito && (
        <ModalPagoLocal
          total={carrito.total}
          onClose={() => setMostrarModalPago(false)}
          onPagoExitoso={handlePagoExitoso}
        />
      )}
    </div>
  );
};

/**
 * Interfaces y Subcomponente del Modal de Pago con campos dinámicos
 */
interface ModalPagoProps {
  total: number;
  onClose: () => void;
  onPagoExitoso: (metodoPago: string) => void;
}

const ModalPagoLocal: React.FC<ModalPagoProps> = ({ total, onClose, onPagoExitoso }) => {
  const [metodoPago, setMetodoPago] = useState('TARJETA');
  
  // Estados específicos para Tarjeta / WebPay
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [cvv, setCvv] = useState('');

  // Estados específicos para Transferencia Bancaria
  const [bancoSeleccionado, setBancoSeleccionado] = useState('Banco Estado');
  const [rutTransferencia, setRutTransferencia] = useState('');
  const [correoComprobante, setCorreoComprobante] = useState('');

  const [cargandoPago, setCargandoPago] = useState(false);

  const handleSubmitPago = (e: React.FormEvent) => {
    e.preventDefault();
    setCargandoPago(true);

    // Simula el tiempo de respuesta de la pasarela antes de enviar al microservicio
    setTimeout(() => {
      setCargandoPago(false);
      onPagoExitoso(metodoPago);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '450px', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>Pasarela de Pagos</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' }}>✕</button>
        </div>

        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>Total a pagar:</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>${total.toLocaleString('es-CL')}</p>
        </div>

        <form onSubmit={handleSubmitPago} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', backgroundColor: '#fff' }}
            >
              <option value="TARJETA">Tarjeta de Crédito / Débito</option>
              <option value="WEBPAY">WebPay Plus</option>
              <option value="TRANSFERENCIA">Transferencia Bancaria</option>
            </select>
          </div>

          {/* RENDERIZADO CONDICIONAL: Formulario para Tarjeta o WebPay */}
          {(metodoPago === 'TARJETA' || metodoPago === 'WEBPAY') && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Número de Tarjeta</label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Nombre del Titular</label>
                  <input
                    type="text"
                    placeholder=""
                    value={nombreTitular}
                    onChange={(e) => setNombreTitular(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* RENDERIZADO CONDICIONAL: Formulario para Transferencia Bancaria */}
          {metodoPago === 'TRANSFERENCIA' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Banco de Origen</label>
                <select
                  value={bancoSeleccionado}
                  onChange={(e) => setBancoSeleccionado(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', backgroundColor: '#fff' }}
                >
                  <option value="Banco Estado">Banco Estado</option>
                  <option value="Banco de Chile">Banco de Chile</option>
                  <option value="Santander">Santander</option>
                  <option value="BCI">BCI</option>
                  <option value="Itaú">Itaú</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>RUT del Titular</label>
                <input
                  type="text"
                  placeholder="12.345.678-9"
                  value={rutTransferencia}
                  onChange={(e) => setRutTransferencia(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Correo para Comprobante</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correoComprobante}
                  onChange={(e) => setCorreoComprobante(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={cargandoPago}
            style={{ marginTop: '10px', padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {cargandoPago ? 'Procesando pago...' : `Pagar $${total.toLocaleString('es-CL')}`}
          </button>
        </form>

      </div>
    </div>
  );
};