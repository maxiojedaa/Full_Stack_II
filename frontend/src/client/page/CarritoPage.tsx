import React, { useEffect, useState } from 'react';
import { carritoService, type CarritoResponseDTO } from '../../services/carrito_services';
import { PedidoService } from '../../services/pedido_services';

export const CarritoPage: React.FC = () => {
  const [carrito, setCarrito] = useState<CarritoResponseDTO | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [procesandoPedido, setProcesandoPedido] = useState(false);

  // ID de usuario simulado
  const usuarioId = 1;

  // Cargar el carrito del usuario al montar el componente[cite: 17]
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

  // Eliminar un ítem individual[cite: 18]
  const handleEliminarItem = async (itemId: number) => {
    try {
      const carritoActualizado = await carritoService.eliminarItem(usuarioId, itemId);
      setCarrito(carritoActualizado);
    } catch (error) {
      console.error("Error al eliminar el ítem:", error);
      alert("No se pudo eliminar el producto.");
    }
  };

  // Vaciar todo el carrito
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
  
  // Registrar un pedido desde el carrito
  const handleRegistrarPedido = async () => {
    if (!carrito || carrito.items.length === 0 || procesandoPedido) {
      return;
    }

    try {
      setProcesandoPedido(true);

      const datosPedido = {
        usuarioId: usuarioId,
        items: carrito.items.map((item) => ({
          productoId: item.productoId,
          nombreProducto: `Juguete #${item.productoId}`,
          precioUnitario: item.precioUnitario,
          cantidad: item.cantidad
        }))
      };

      const pedidoCreado = await PedidoService.registrarPedido(datosPedido);

      alert(
        `¡Pedido registrado correctamente!\n` +
        `Número de pedido: ${pedidoCreado.id}\n` +
        `Total: $${pedidoCreado.total.toLocaleString('es-CL')}\n` +
        `Estado: ${pedidoCreado.estado}`
      );

      // No vaciamos el carrito todavía.
      // Primero verificaremos la integración y el flujo de pago.

    } catch (error) {
      console.error("Error al registrar el pedido:", error);
      alert("No se pudo confirmar el registro del pedido. Revisa Swagger antes de volver a intentarlo.");
    } finally {
      setProcesandoPedido(false);
    }
  };


  if (cargando) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Cargando carrito...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      {/* Contenedor principal tipo Modal / Tarjeta Central */}
      <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '650px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '30px', position: 'relative' }}>
        
        {/* Cabecera "Tu Carrito" y botón cerrar (X) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>Tu Carrito</h2>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ background: 'none', border: 'none', fontSize: '22px', color: '#a0aec0', cursor: 'pointer', fontWeight: 'bold' }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Lista de productos o estado vacío */}
        {!carrito || carrito.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#718096', fontSize: '16px', marginBottom: '20px' }}>Tu carrito está vacío.</p>
            <button 
              onClick={() => window.location.href = '/'} 
              style={{ padding: '10px 20px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Volver a la Tienda
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '380px', overflowY: 'auto', marginBottom: '25px', paddingRight: '5px' }}>
              {carrito.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '20px' }}>
                  
                  {/* Imagen y Detalles del Producto */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '65px', height: '65px', backgroundColor: '#edf2f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid #e2e8f0' }}>
                      📦
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1a202c' }}>
                        Juguete #{item.productoId}
                      </h4>
                      <p style={{ margin: 0, fontSize: '15px', color: '#718096', fontWeight: '500' }}>
                        ${item.precioUnitario.toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>

                  {/* Controles de Cantidad y Tacho de Basura */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '6px', overflow: 'hidden' }}>
                      <button style={{ background: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', color: '#4a5568', fontWeight: 'bold' }}>-</button>
                      <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 'bold', color: '#1a202c' }}>{item.cantidad}</span>
                      <button style={{ background: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', color: '#4a5568', fontWeight: 'bold' }}>+</button>
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
              ))}
            </div>

            {/* Separador y Monto Total */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>Total:</span>
              <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#3182ce' }}>
                ${carrito.total.toLocaleString('es-CL')}
              </span>
            </div>

            {/* Botones inferiores (Vaciar Carrito, Seguir Comprando, Pagar) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={handleVaciarCarrito}
                style={{ padding: '10px 18px', backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #fc8181', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                🗑️ Vaciar Carrito
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{ padding: '10px 18px', backgroundColor: '#718096', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                  Seguir Comprando
                </button>
                <button 
                  onClick={handleRegistrarPedido}
disabled={procesandoPedido}
                  style={{ padding: '10px 24px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
               >
  {procesandoPedido ? 'Registrando...' : 'Registrar pedido'}
</button> 
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};