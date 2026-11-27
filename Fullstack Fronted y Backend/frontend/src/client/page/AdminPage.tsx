import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogoService } from '../../services/catalogo_services';
import { PedidoService, type PedidoResponseDTO } from '../../services/pedido_services';
import { ToastAlerta, type TipoAlerta } from './AlertaAñadidoP';

/**
 * Representa un producto del catálogo administrable.
 */
interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
}

/**
 * Representa un usuario registrado consultado desde el backend.
 */
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol?: string;
}

/**
 * Representa un ítem dentro de un pedido.
 */
interface ItemPedido {
  productoId?: number;
  nombreProducto: string;
  precioUnitario?: number;
  cantidad: number;
}

/**
 * Representa un pedido registrado en el microservicio de pedidos.
 */
interface Pedido {
  id: number;
  usuarioId: number;
  total: number;
  estado: string;
  fechaCreacion?: string;
  items?: ItemPedido[];
}

/**
 * Estado para confirmaciones visuales integradas en React (evita `window.confirm`).
 */
type ConfirmacionAccion =
  | { tipo: 'pedido'; pedido: Pedido }
  | { tipo: 'usuario'; usuario: Usuario }
  | { tipo: 'producto'; id: number; nombre: string }
  | null;

/**
 * Valores de referencia para meses anteriores (índice 0 = enero .. 11 = diciembre).
 * El mes actual y los meses posteriores suman siempre las ventas reales desde `pedidos`.
 */
const VENTAS_HISTORICAS_BASE: Record<number, number> = {
  0: 145000, // Ene
  1: 182000, // Feb
  2: 215000, // Mar
  3: 198000, // Abr
  4: 264000, // May
  5: 249000, // Jun
  6: 310000, // Jul
  7: 288000, // Ago
  8: 335000, // Sep
  9: 372000, // Oct
  10: 0, // Nov (se nutre en tiempo real de los pedidos)
  11: 0, // Dic (se nutre en tiempo real de los pedidos)
};

const COLORES_DONUT = ['#2563eb', '#16a34a', '#7c3aed', '#d97706', '#0d9488', '#e11d48'];

/**
 * Componente `AdminPage`:
 * Panel administrativo con vistas de Dashboard (con gráfico de ventas mensuales en vivo
 * y gráfico circular del producto más comprado del último mes), Productos (CRUD),
 * Usuarios (historial de pedidos por usuario y eliminación de cuenta) y Pedidos en tiempo real.
 */
export const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // Endpoints de microservicios
  const API_CATALOGO = 'http://localhost:8088/api/catalogo';
  const API_USUARIOS = 'http://localhost:8081/api/usuarios';

  // Estados de datos y carga
  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [errorUsuarios, setErrorUsuarios] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  // Estados para gestión de pedidos en tiempo real, cancelación y eliminación
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [eliminandoPedidoId, setEliminandoPedidoId] = useState<number | null>(null);
  const [tiempoRealPedidos, setTiempoRealPedidos] = useState<boolean>(true);
  const [modoGrafico, setModoGrafico] = useState<'mensual' | 'diario'>('mensual');

  // Estados para historial de pedidos por usuario y eliminación de cuenta
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [pedidosUsuario, setPedidosUsuario] = useState<PedidoResponseDTO[]>([]);
  const [cargandoPedidosUsuario, setCargandoPedidosUsuario] = useState<boolean>(false);
  const [eliminandoUsuarioId, setEliminandoUsuarioId] = useState<number | null>(null);

  // Modal de confirmación integrado en la interfaz
  const [confirmacion, setConfirmacion] = useState<ConfirmacionAccion>(null);
  const [ejecutandoConfirmacion, setEjecutandoConfirmacion] = useState<boolean>(false);

  // Estado de alertas visuales en pantalla
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: TipoAlerta } | null>(null);

  const cerrarAlerta = useCallback(() => {
    setAlerta(null);
  }, []);

  // Estados del formulario de creación / edición de producto
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState('');

  // Pestaña activa del menú lateral
  const [seccionActiva, setSeccionActiva] = useState<
    'dashboard' | 'productos' | 'usuarios' | 'pedidos'
  >('dashboard');

  /**
   * Carga el inventario de productos desde el servicio de catálogo.
   */
  const cargarProductos = async () => {
    try {
      const data = await catalogoService.obtenerProductos();
      if (data) {
        setProductos(
          data.flatMap((producto) =>
            producto.id === undefined ? [] : [{ ...producto, id: producto.id }]
          )
        );
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    }
  };

  /**
   * Consulta el listado de usuarios autenticándose con el token JWT almacenado.
   */
  const cargarUsuarios = async () => {
    try {
      setErrorUsuarios('');

      const token = localStorage.getItem('token');

      if (!token) {
        setErrorUsuarios(
          'Debes iniciar sesión como administrador para visualizar los usuarios registrados.'
        );
        setUsuarios([]);
        return;
      }

      const respuesta = await fetch(API_USUARIOS, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          setErrorUsuarios('Tu sesión ha vencido o no es válida. Inicia sesión nuevamente.');
        } else if (respuesta.status === 403) {
          setErrorUsuarios('No tienes permisos de administrador para consultar los usuarios.');
        } else {
          setErrorUsuarios('No se pudieron cargar los usuarios. Intenta nuevamente.');
          console.error('Error HTTP al cargar usuarios:', respuesta.status);
        }

        setUsuarios([]);
        return;
      }

      const datos: Usuario[] = await respuesta.json();
      setUsuarios(datos);
    } catch (error) {
      console.error('No se pudieron cargar los usuarios:', error);
      setErrorUsuarios('No se pudo conectar con el servidor de usuarios.');
      setUsuarios([]);
    }
  };

  /**
   * Carga todos los pedidos desde ms-pedido (a través del Gateway) y los ordena del más reciente al más antiguo.
   */
  const cargarPedidos = useCallback(async () => {
    try {
      const data = await PedidoService.obtenerTodosLosPedidos();
      if (Array.isArray(data)) {
        const ordenados = [...data].sort((a, b) => b.id - a.id);
        setPedidos(ordenados);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  }, []);

  useEffect(() => {
    setCargando(true);
    Promise.all([cargarProductos(), cargarUsuarios(), cargarPedidos()]).finally(() =>
      setCargando(false)
    );
  }, [cargarPedidos]);

  // Polling en tiempo real cada 5 segundos mientras el panel esté activo para reflejar cada venta
  useEffect(() => {
    if (!tiempoRealPedidos) return;

    const intervalo = window.setInterval(() => {
      cargarPedidos();
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, [cargarPedidos, tiempoRealPedidos]);

  /**
   * Cambia el estado de un pedido de PENDIENTE a CANCELADO y refresca la tabla.
   */
  const handleCancelarPedido = async (pedidoId: number) => {
    try {
      setCancelandoId(pedidoId);
      await PedidoService.cambiarEstadoPedido(pedidoId, 'CANCELADO');

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, estado: 'CANCELADO' } : p))
      );

      setAlerta({
        mensaje: `Pedido #${pedidoId} actualizado a CANCELADO.`,
        tipo: 'exito',
      });

      await cargarPedidos();
    } catch (error) {
      console.error('Error al cancelar el pedido:', error);
      setAlerta({
        mensaje: `No se pudo cambiar el estado del pedido #${pedidoId} a CANCELADO.`,
        tipo: 'error',
      });
    } finally {
      setCancelandoId(null);
    }
  };

  /**
   * Abre el modal de confirmación para eliminar un pedido.
   */
  const solicitarEliminarPedido = (pedido: Pedido) => {
    setConfirmacion({ tipo: 'pedido', pedido });
  };

  /**
   * Elimina permanentemente un pedido desde ms-pedido.
   */
  const ejecutarEliminarPedido = async (pedido: Pedido) => {
    try {
      setEliminandoPedidoId(pedido.id);
      setEjecutandoConfirmacion(true);
      await PedidoService.eliminarPedido(pedido.id);

      setPedidos((prev) => prev.filter((item) => item.id !== pedido.id));
      setPedidosUsuario((prev) => prev.filter((item) => item.id !== pedido.id));

      setAlerta({
        mensaje: `Pedido #${pedido.id} eliminado correctamente.`,
        tipo: 'exito',
      });
    } catch (error) {
      console.error('Error al eliminar el pedido:', error);
      setAlerta({
        mensaje: `No se pudo eliminar el pedido #${pedido.id}. Verifica que ms-pedido tenga el endpoint DELETE /api/pedidos/${pedido.id}.`,
        tipo: 'error',
      });
    } finally {
      setEliminandoPedidoId(null);
      setEjecutandoConfirmacion(false);
      setConfirmacion(null);
    }
  };

  /**
   * Consulta el historial de compras/pedidos de un usuario en específico.
   */
  const handleVerHistorialPedidos = async (usuario: Usuario) => {
    try {
      setUsuarioSeleccionado(usuario);
      setCargandoPedidosUsuario(true);
      setPedidosUsuario([]);

      const historial = await PedidoService.obtenerPedidosPorUsuario(usuario.id);
      const ordenados = Array.isArray(historial)
        ? [...historial].sort((a, b) => b.id - a.id)
        : [];
      setPedidosUsuario(ordenados);
    } catch (error) {
      console.error('Error al obtener historial del usuario:', error);
      setAlerta({
        mensaje: `No se pudo cargar el historial de pedidos de ${usuario.nombre}.`,
        tipo: 'error',
      });
    } finally {
      setCargandoPedidosUsuario(false);
    }
  };

  /**
   * Abre el modal de confirmación para eliminar una cuenta de usuario.
   */
  const solicitarEliminarUsuario = (usuario: Usuario) => {
    setConfirmacion({ tipo: 'usuario', usuario });
  };

  /**
   * Elimina una cuenta de usuario desde ms-usuario (requiere rol ADMIN y token JWT).
   */
  const ejecutarEliminarUsuario = async (usuario: Usuario) => {
    try {
      setEliminandoUsuarioId(usuario.id);
      setEjecutandoConfirmacion(true);
      const token = localStorage.getItem('token');

      const respuesta = await fetch(`${API_USUARIOS}/${usuario.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
        },
      });

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      setUsuarios((prev) => prev.filter((item) => item.id !== usuario.id));
      if (usuarioSeleccionado?.id === usuario.id) {
        setUsuarioSeleccionado(null);
        setPedidosUsuario([]);
      }

      setAlerta({
        mensaje: `Cuenta de ${usuario.nombre} eliminada correctamente.`,
        tipo: 'exito',
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setAlerta({
        mensaje: `No se pudo eliminar la cuenta de ${usuario.nombre}. Verifica permisos ADMIN y el endpoint DELETE.`,
        tipo: 'error',
      });
    } finally {
      setEliminandoUsuarioId(null);
      setEjecutandoConfirmacion(false);
      setConfirmacion(null);
    }
  };

  /**
   * Prepara el formulario con los datos de un producto existente para editarlo.
   */
  const iniciarEdicion = (prod: Producto) => {
    setEditandoId(prod.id);
    setNombre(prod.nombre);
    setDescripcion(prod.descripcion || '');
    setPrecio(String(prod.precio));
    setImagen(prod.imagen || '');
  };

  /**
   * Limpia el formulario y sale del modo edición.
   */
  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setImagen('');
  };

  /**
   * Crea un nuevo producto (`POST`) o actualiza uno existente (`PUT`) en el catálogo
   * y muestra una notificación visual con `ToastAlerta`.
   */
  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return;

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const payload = {
      nombre,
      descripcion: descripcion || 'Juguete didáctico y creativo',
      precio: Number(precio),
      imagen: imagen || 'LogoPixelToysIII.png',
    };

    try {
      if (editandoId !== null) {
        const resp = await fetch(`${API_CATALOGO}/${editandoId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new Error('Error al actualizar');
        setAlerta({
          mensaje: '¡Precio y producto actualizados en la base de datos!',
          tipo: 'exito',
        });
      } else {
        const resp = await fetch(API_CATALOGO, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new Error('Error al crear');
        setAlerta({ mensaje: '¡Producto guardado en la base de datos!', tipo: 'exito' });
      }

      cancelarEdicion();
      await cargarProductos();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje:
          'No se pudo guardar en el servidor. Verifica que ProductoController tenga los métodos POST y PUT.',
        tipo: 'error',
      });
    }
  };

  /**
   * Abre el modal de confirmación para eliminar un producto del catálogo.
   */
  const solicitarEliminarProducto = (id: number, nombreProd: string) => {
    setConfirmacion({ tipo: 'producto', id, nombre: nombreProd });
  };

  /**
   * Elimina un producto del catálogo mediante `DELETE` y notifica el resultado.
   */
  const ejecutarEliminarProducto = async (id: number) => {
    try {
      setEjecutandoConfirmacion(true);
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_CATALOGO}/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) throw new Error('Error al eliminar');

      setProductos((prev) => prev.filter((p) => p.id !== id));
      setAlerta({
        mensaje: 'Producto eliminado correctamente de la base de datos.',
        tipo: 'exito',
      });

      
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje:
          'No se pudo eliminar. Asegúrate de que ProductoController tenga el método DELETE.',
        tipo: 'error',
      });
    } finally {
      setEjecutandoConfirmacion(false);
      setConfirmacion(null);
    }
  };

  const handleConfirmarAccion = async () => {
    if (!confirmacion || ejecutandoConfirmacion) return;

    if (confirmacion.tipo === 'pedido') {
      await ejecutarEliminarPedido(confirmacion.pedido);
    } else if (confirmacion.tipo === 'usuario') {
      await ejecutarEliminarUsuario(confirmacion.usuario);
    } else if (confirmacion.tipo === 'producto') {
      await ejecutarEliminarProducto(confirmacion.id);
    }
  };

  const pedidosActivos = pedidos.filter((ped) => ped.estado?.toUpperCase() !== 'CANCELADO');
  const ingresosTotales = pedidosActivos.reduce((acc, ped) => acc + (ped.total || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif' }}>
      {/* Notificación visual flotante */}
      <ToastAlerta
        mensaje={alerta?.mensaje || null}
        tipo={alerta?.tipo || 'exito'}
        onClose={cerrarAlerta}
      />

      {/* Modal de confirmación integrado en la app (reemplaza window.confirm) */}
      {confirmacion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1500,
            padding: '20px',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '18px' }}>
              Confirmar eliminación
            </h3>

            {confirmacion.tipo === 'pedido' && (
              <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
                ¿Eliminar el pedido <strong>#{confirmacion.pedido.id}</strong> (Usuario #
                {confirmacion.pedido.usuarioId}, $
                {confirmacion.pedido.total?.toLocaleString('es-CL')})? Esta acción no se puede
                deshacer.
              </p>
            )}

            {confirmacion.tipo === 'usuario' && (
              <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
                ¿Eliminar la cuenta de <strong>"{confirmacion.usuario.nombre}"</strong> (
                {confirmacion.usuario.email})? Esta acción no se puede deshacer.
              </p>
            )}

            {confirmacion.tipo === 'producto' && (
              <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
                ¿Eliminar <strong>"{confirmacion.nombre}"</strong> de la base de datos?
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={ejecutandoConfirmacion}
                onClick={() => setConfirmacion(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#fff',
                  color: '#334155',
                  fontWeight: 600,
                  cursor: ejecutandoConfirmacion ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={ejecutandoConfirmacion}
                onClick={handleConfirmarAccion}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: ejecutandoConfirmacion ? '#fca5a5' : '#dc2626',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: ejecutandoConfirmacion ? 'not-allowed' : 'pointer',
                }}
              >
                {ejecutandoConfirmacion ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        style={{
          backgroundColor: '#fff',
          padding: '15px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>🤖 PIXEL & TOYS</span>
          <span
            style={{
              backgroundColor: '#1a202c',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Panel de Administración
          </span>
        </div>
        <button
          onClick={() => navigate('/catalogo')}
          style={{
            backgroundColor: '#eef2f5',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          🏠 Volver a la Tienda
        </button>
      </header>

      <div
        style={{
          display: 'flex',
          padding: '30px',
          gap: '30px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setSeccionActiva('dashboard')}
            style={{
              padding: '12px 18px',
              textAlign: 'left',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: seccionActiva === 'dashboard' ? '#e2e8f0' : '#fff',
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setSeccionActiva('productos')}
            style={{
              padding: '12px 18px',
              textAlign: 'left',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: seccionActiva === 'productos' ? '#e2e8f0' : '#fff',
            }}
          >
            📦 Productos
          </button>
          <button
            onClick={() => setSeccionActiva('usuarios')}
            style={{
              padding: '12px 18px',
              textAlign: 'left',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: seccionActiva === 'usuarios' ? '#e2e8f0' : '#fff',
            }}
          >
            👥 Usuarios
          </button>
          <button
            onClick={() => setSeccionActiva('pedidos')}
            style={{
              padding: '12px 18px',
              textAlign: 'left',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: seccionActiva === 'pedidos' ? '#e2e8f0' : '#fff',
            }}
          >
            🛒 Pedidos
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {cargando && <p style={{ color: '#64748b' }}>Sincronizando con bases de datos...</p>}

          {seccionActiva === 'dashboard' && (() => {
            const ahora = new Date();
            const mesActual = ahora.getMonth();
            const anioActual = ahora.getFullYear();

            // Ventas reales agrupadas por mes (0..11) del año en curso
            const ventasRealesPorMes = Array.from({ length: 12 }, () => ({
              total: 0,
              cantidadPedidos: 0,
            }));

            pedidosActivos.forEach((ped) => {
              const fecha = ped.fechaCreacion ? new Date(ped.fechaCreacion) : ahora;
              if (Number.isNaN(fecha.getTime())) return;

              if (fecha.getFullYear() === anioActual) {
                const mesIdx = fecha.getMonth();
                ventasRealesPorMes[mesIdx].total += ped.total || 0;
                ventasRealesPorMes[mesIdx].cantidadPedidos += 1;
              }
            });

            const serieMensual = Array.from({ length: 12 }, (_, mesIdx) => {
              const nombreCorto = new Date(anioActual, mesIdx, 1).toLocaleDateString('es-CL', {
                month: 'short',
              });
              const esMesAnterior = mesIdx < mesActual;
              const baseHistorica = esMesAnterior ? (VENTAS_HISTORICAS_BASE[mesIdx] ?? 0) : 0;
              const realMes = ventasRealesPorMes[mesIdx].total;
              const cantidadPedidos = ventasRealesPorMes[mesIdx].cantidadPedidos;

              return {
                mesIdx,
                etiqueta: nombreCorto.replace('.', ''),
                baseHistorica,
                realMes,
                total: baseHistorica + realMes,
                cantidadPedidos,
                esMesAnterior,
                esMesActual: mesIdx === mesActual,
              };
            });

            // Serie diaria para el mes actual
            const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
            const ventasPorDia = new Map<number, { total: number; cantidadPedidos: number }>();
            for (let dia = 1; dia <= diasEnMes; dia++) {
              ventasPorDia.set(dia, { total: 0, cantidadPedidos: 0 });
            }

            pedidosActivos.forEach((ped) => {
              const fecha = ped.fechaCreacion ? new Date(ped.fechaCreacion) : ahora;
              if (Number.isNaN(fecha.getTime())) return;

              if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
                const dia = fecha.getDate();
                const actual = ventasPorDia.get(dia) || { total: 0, cantidadPedidos: 0 };
                ventasPorDia.set(dia, {
                  total: actual.total + (ped.total || 0),
                  cantidadPedidos: actual.cantidadPedidos + 1,
                });
              }
            });

            const serieDiaria = Array.from(ventasPorDia.entries()).map(([dia, info]) => ({
              dia,
              etiqueta: String(dia).padStart(2, '0'),
              total: info.total,
              cantidadPedidos: info.cantidadPedidos,
            }));

            // Cálculo del producto más comprado en el último mes (mes actual o anterior si aún no hay pedidos en el actual)
            const pedidosMesActual = pedidosActivos.filter((ped) => {
              const f = ped.fechaCreacion ? new Date(ped.fechaCreacion) : ahora;
              return !Number.isNaN(f.getTime()) && f.getMonth() === mesActual && f.getFullYear() === anioActual;
            });

            const mesReferenciaTop =
              pedidosMesActual.length > 0
                ? mesActual
                : mesActual === 0
                  ? 11
                  : mesActual - 1;
            const anioReferenciaTop =
              pedidosMesActual.length > 0
                ? anioActual
                : mesActual === 0
                  ? anioActual - 1
                  : anioActual;

            const pedidosUltimoMes = pedidosActivos.filter((ped) => {
              const f = ped.fechaCreacion ? new Date(ped.fechaCreacion) : ahora;
              return (
                !Number.isNaN(f.getTime()) &&
                f.getMonth() === mesReferenciaTop &&
                f.getFullYear() === anioReferenciaTop
              );
            });

            const conteoProductos = new Map<string, number>();
            pedidosUltimoMes.forEach((ped) => {
              if (Array.isArray(ped.items)) {
                ped.items.forEach((it) => {
                  const nombreProd = it.nombreProducto || `Producto #${it.productoId ?? ''}`;
                  conteoProductos.set(
                    nombreProd,
                    (conteoProductos.get(nombreProd) || 0) + (it.cantidad || 1)
                  );
                });
              }
            });

            const rankingProductos = Array.from(conteoProductos.entries())
              .map(([nombreProd, unidades]) => ({ nombre: nombreProd, unidades }))
              .sort((a, b) => b.unidades - a.unidades);

            const totalUnidadesUltimoMes = rankingProductos.reduce((acc, p) => acc + p.unidades, 0);
            const productoTop = rankingProductos[0] ?? null;
            const nombreMesReferencia = new Date(anioReferenciaTop, mesReferenciaTop, 1).toLocaleDateString(
              'es-CL',
              { month: 'long' }
            );

            // Segmentos para gráfico circular SVG
            const radio = 68;
            const circunferencia = 2 * Math.PI * radio;
            let acumuladoOffset = 0;

            const segmentosDonut = rankingProductos.slice(0, 6).map((item, idx) => {
              const fraccion = totalUnidadesUltimoMes > 0 ? item.unidades / totalUnidadesUltimoMes : 0;
              const longitudTrazo = fraccion * circunferencia;
              const dashOffset = -acumuladoOffset;
              acumuladoOffset += longitudTrazo;

              return {
                ...item,
                color: COLORES_DONUT[idx % COLORES_DONUT.length],
                porcentaje: Math.round(fraccion * 100),
                longitudTrazo,
                dashOffset,
              };
            });

            const acumuladoAnual = serieMensual.reduce((acc, m) => acc + m.total, 0);
            const ventasMesActual = serieMensual[mesActual]?.total ?? 0;
            const maxMensual = Math.max(...serieMensual.map((m) => m.total), 1);
            const maxDiario = Math.max(...serieDiaria.map((d) => d.total), 1);
            const nombreMesActual = ahora.toLocaleDateString('es-CL', {
              month: 'long',
              year: 'numeric',
            });

            return (
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '30px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <h2 style={{ margin: 0 }}>Panel de Control General</h2>

                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginTop: '20px',
                  }}
                >
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h4>Total Productos</h4>
                    <p
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#2563eb',
                        margin: '8px 0 0 0',
                      }}
                    >
                      {productos.length}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h4>Usuarios</h4>
                    <p
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#0d9488',
                        margin: '8px 0 0 0',
                      }}
                    >
                      {usuarios.length}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h4>Pedidos</h4>
                    <p
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#7c3aed',
                        margin: '8px 0 0 0',
                      }}
                    >
                      {pedidos.length}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h4>Ventas Reales</h4>
                    <p
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#16a34a',
                        margin: '8px 0 0 0',
                      }}
                    >
                      ${ingresosTotales.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>

                {/* Gráfico de ventas con histórico en meses anteriores y tiempo real desde el mes actual */}
                <div
                  style={{
                    marginTop: '28px',
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, color: '#0f172a', textTransform: 'capitalize' }}>
                        {modoGrafico === 'mensual'
                          ? `Evolución de Ventas ${anioActual} (Mes a Mes)`
                          : `Detalle Diario — ${nombreMesActual}`}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                        {modoGrafico === 'mensual'
                          ? 'Meses anteriores con base histórica; mes actual y posteriores en tiempo real'
                          : 'Pedidos activos del mes actual sincronizados en tiempo real'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setModoGrafico('mensual')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: modoGrafico === 'mensual' ? '#0f172a' : '#fff',
                            color: modoGrafico === 'mensual' ? '#fff' : '#334155',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Por mes
                        </button>
                        <button
                          type="button"
                          onClick={() => setModoGrafico('diario')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: modoGrafico === 'diario' ? '#0f172a' : '#fff',
                            color: modoGrafico === 'diario' ? '#fff' : '#334155',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mes actual (días)
                        </button>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                          {modoGrafico === 'mensual' ? 'Total anual proyectado' : 'Acumulado mes actual'}
                        </span>
                        <strong style={{ fontSize: '20px', color: '#16a34a' }}>
                          $
                          {(modoGrafico === 'mensual' ? acumuladoAnual : ventasMesActual).toLocaleString(
                            'es-CL'
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {modoGrafico === 'mensual' ? (
                    <>
                      <div
                        style={{
                          height: '230px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: '10px',
                          padding: '20px 14px 10px 14px',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {serieMensual.map((item) => {
                          const alturaPct =
                            item.total > 0 ? Math.max((item.total / maxMensual) * 100, 8) : 0;
                          const colorBarra = item.esMesActual
                            ? '#16a34a'
                            : item.esMesAnterior
                              ? '#2563eb'
                              : '#0ea5e9';

                          return (
                            <div
                              key={item.mesIdx}
                              title={`${item.etiqueta.toUpperCase()}: $${item.total.toLocaleString('es-CL')} (${item.cantidadPedidos} pedido(s) reales)`}
                              style={{
                                flex: 1,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              {item.total > 0 && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  ${Math.round(item.total / 1000)}k
                                </span>
                              )}
                              <div
                                style={{
                                  width: '100%',
                                  maxWidth: '38px',
                                  height: `${alturaPct}%`,
                                  backgroundColor: item.total > 0 ? colorBarra : '#f1f5f9',
                                  borderRadius: '6px 6px 0 0',
                                  transition: 'height 0.35s ease',
                                }}
                              />
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: item.esMesActual ? 700 : 500,
                                  color: item.esMesActual ? '#15803d' : '#475569',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {item.etiqueta}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '18px',
                          flexWrap: 'wrap',
                          marginTop: '12px',
                          fontSize: '12px',
                          color: '#475569',
                        }}
                      >

                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        height: '220px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '4px',
                        padding: '16px 10px 8px 10px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {serieDiaria.map((item) => {
                        const alturaPct =
                          item.total > 0 ? Math.max((item.total / maxDiario) * 100, 8) : 0;
                        const esHoy = item.dia === ahora.getDate();

                        return (
                          <div
                            key={item.dia}
                            title={`Día ${item.etiqueta}: $${item.total.toLocaleString('es-CL')} (${item.cantidadPedidos} pedido(s))`}
                            style={{
                              flex: 1,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {item.total > 0 && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  color: '#1e40af',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ${Math.round(item.total / 1000)}k
                              </span>
                            )}
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '24px',
                                height: `${alturaPct}%`,
                                backgroundColor: item.total > 0 ? '#2563eb' : '#f1f5f9',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.35s ease',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: esHoy ? 700 : 500,
                                color: esHoy ? '#0f172a' : '#94a3b8',
                              }}
                            >
                              {item.dia % 2 === 1 || item.dia === diasEnMes ? item.etiqueta : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Gráfico circular del producto más comprado del último mes */}
                <div
                  style={{
                    marginTop: '28px',
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, color: '#0f172a', textTransform: 'capitalize' }}>
                        Producto Más Comprado — {nombreMesReferencia}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                        Distribución de unidades vendidas en pedidos activos del último mes
                      </p>
                    </div>

                    {productoTop && (
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          fontWeight: 700,
                          fontSize: '13px',
                        }}
                      >
                      </span>
                    )}
                  </div>

                  {segmentosDonut.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: '#fff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '14px',
                      }}
                    >
                      Aún no hay ítems de compras registradas en este mes para calcular el gráfico circular.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '32px',
                        flexWrap: 'wrap',
                        backgroundColor: '#fff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                        <svg width="180" height="180" viewBox="0 0 180 180">
                          <circle
                            cx="90"
                            cy="90"
                            r={radio}
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="24"
                          />
                          {segmentosDonut.map((seg) => (
                            <circle
                              key={seg.nombre}
                              cx="90"
                              cy="90"
                              r={radio}
                              fill="none"
                              stroke={seg.color}
                              strokeWidth="24"
                              strokeDasharray={`${seg.longitudTrazo} ${circunferencia}`}
                              strokeDashoffset={seg.dashOffset}
                              transform="rotate(-90 90 90)"
                              style={{ transition: 'stroke-dasharray 0.35s ease' }}
                            >
                              <title>
                                {seg.nombre}: {seg.unidades} unidades ({seg.porcentaje}%)
                              </title>
                            </circle>
                          ))}
                        </svg>
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'none',
                            textAlign: 'center',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            Total ud.
                          </span>
                          <strong style={{ fontSize: '20px', color: '#0f172a' }}>
                            {totalUnidadesUltimoMes}
                          </strong>
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {segmentosDonut.map((seg, idx) => (
                          <div
                            key={seg.nombre}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: idx === 0 ? '#f8fafc' : 'transparent',
                              border: idx === 0 ? '1px solid #e2e8f0' : '1px solid transparent',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: seg.color,
                                  display: 'inline-block',
                                }}
                              />
                              <span style={{ fontWeight: idx === 0 ? 700 : 500, color: '#0f172a', fontSize: '14px' }}>
                                {seg.nombre}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                              {seg.unidades} ud. · {seg.porcentaje}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {seccionActiva === 'productos' && (
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '25px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  width: '350px',
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {editandoId !== null ? `Editar Producto #${editandoId}` : 'Agregar Producto'}
                </h3>
                <form onSubmit={handleGuardarProducto}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500' }}>Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500' }}>Precio ($)</label>
                    <input
                      type="number"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: editandoId !== null ? '#d69e2e' : '#3182ce',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {editandoId !== null ? 'Actualizar Precio/Producto' : 'Guardar Producto'}
                  </button>
                  {editandoId !== null && (
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '6px',
                        backgroundColor: '#e2e8f0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </form>
              </div>

              <div
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  padding: '25px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <h3>Inventario de Productos</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Nombre</th>
                      <th style={{ padding: '10px' }}>Precio</th>
                      <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px' }}>#{prod.id}</td>
                        <td style={{ padding: '10px' }}>{prod.nombre}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>
                          ${prod.precio?.toLocaleString('es-CL')}
                        </td>
                        <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => iniciarEdicion(prod)}
                            style={{
                              backgroundColor: '#ecc94b',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => solicitarEliminarProducto(prod.id, prod.nombre)}
                            style={{
                              backgroundColor: '#e53e3e',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {seccionActiva === 'usuarios' && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <h2>Gestión de Usuarios</h2>

              {errorUsuarios && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '8px',
                    padding: '15px',
                    marginTop: '15px',
                    color: '#9a3412',
                    fontSize: '14px',
                  }}
                >
                  🔒 {errorUsuarios}
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Nombre</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Rol</th>
                    <th style={{ padding: '10px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const estaEliminando = eliminandoUsuarioId === u.id;
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px' }}>#{u.id}</td>
                        <td style={{ padding: '10px' }}>{u.nombre}</td>
                        <td style={{ padding: '10px' }}>{u.email}</td>
                        <td style={{ padding: '10px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              borderRadius: '99px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {u.rol}
                          </span>
                        </td>
                        <td style={{ padding: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleVerHistorialPedidos(u)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            🧾 Ver pedidos
                          </button>
                          <button
                            type="button"
                            disabled={estaEliminando}
                            onClick={() => solicitarEliminarUsuario(u)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: estaEliminando ? '#fca5a5' : '#dc2626',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: estaEliminando ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {estaEliminando ? 'Eliminando...' : '🗑️ Eliminar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Historial de compras/pedidos del usuario seleccionado */}
              {usuarioSeleccionado && (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>
                      Historial de pedidos — {usuarioSeleccionado.nombre} (#{usuarioSeleccionado.id})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setUsuarioSeleccionado(null);
                        setPedidosUsuario([]);
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Cerrar
                    </button>
                  </div>

                  {cargandoPedidosUsuario ? (
                    <p style={{ color: '#64748b', marginTop: '12px' }}>
                      Cargando pedidos del usuario...
                    </p>
                  ) : pedidosUsuario.length === 0 ? (
                    <p style={{ color: '#64748b', marginTop: '12px' }}>
                      Este usuario aún no tiene pedidos registrados.
                    </p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#334155', color: '#fff', textAlign: 'left' }}>
                          <th style={{ padding: '8px 10px' }}>N° Pedido</th>
                          <th style={{ padding: '8px 10px' }}>Estado</th>
                          <th style={{ padding: '8px 10px' }}>Total</th>
                          <th style={{ padding: '8px 10px' }}>Ítems</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosUsuario.map((ped) => (
                          <tr key={ped.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>#{ped.id}</td>
                            <td style={{ padding: '8px 10px' }}>{ped.estado}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#2563eb' }}>
                              ${ped.total?.toLocaleString('es-CL')}
                            </td>
                            <td style={{ padding: '8px 10px', fontSize: '13px' }}>
                              {ped.items?.length
                                ? ped.items
                                    .map((it) => `${it.nombreProducto} (x${it.cantidad})`)
                                    .join(', ')
                                : 'Sin detalle'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {seccionActiva === 'pedidos' && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <h2 style={{ margin: 0 }}>Gestión de Pedidos</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>N° Pedido</th>
                    <th style={{ padding: '10px' }}>Usuario ID</th>
                    <th style={{ padding: '10px' }}>Total</th>
                    <th style={{ padding: '10px' }}>Estado</th>
                    <th style={{ padding: '10px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => {
                    const esPendiente = p.estado?.toUpperCase() === 'PENDIENTE';
                    const estaCancelando = cancelandoId === p.id;
                    const estaEliminando = eliminandoPedidoId === p.id;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                        <td style={{ padding: '10px' }}>Usuario #{p.usuarioId}</td>
                        <td style={{ padding: '10px', color: '#2563eb', fontWeight: 'bold' }}>
                          ${p.total?.toLocaleString('es-CL')}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              backgroundColor: esPendiente ? '#fef3c7' : '#fee2e2',
                              color: esPendiente ? '#b45309' : '#b91c1c',
                              borderRadius: '99px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {p.estado}
                          </span>
                        </td>
                        <td style={{ padding: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {esPendiente && (
                            <button
                              type="button"
                              disabled={estaCancelando || estaEliminando}
                              onClick={() => handleCancelarPedido(p.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: estaCancelando ? '#fca5a5' : '#d97706',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: estaCancelando ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {estaCancelando ? 'Cancelando...' : 'Cancelar pedido'}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={estaEliminando || estaCancelando}
                            onClick={() => solicitarEliminarPedido(p)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: estaEliminando ? '#fca5a5' : '#dc2626',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: estaEliminando ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {estaEliminando ? 'Eliminando...' : '🗑️ Eliminar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};