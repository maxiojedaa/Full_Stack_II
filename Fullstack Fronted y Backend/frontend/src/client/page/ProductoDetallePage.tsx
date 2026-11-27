import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';
import { catalogoService, type ProductoDTO } from '../../services/catalogo_services';
import { obtenerSesion } from '../../services/authSession';
import { ToastAlerta, MENSAJE_AGREGADO_CARRITO, type TipoAlerta } from './AlertaAñadidoP';

/**
 * Datos que pueden llegar por state de navegación desde el catálogo u otra vista.
 */
interface LocationStateDetalle {
  producto?: ProductoDTO;
  imagen?: string;
}

/**
 * Catálogo base de respaldo por ID para garantizar información visible
 * aun cuando el backend no responda o el producto venga sin detalle completo.
 */
const PRODUCTOS_BASE: Record<
  string,
  { nombre: string; precio: number; descripcion: string; imagen: string }
> = {
  '101': {
    nombre: 'Robot de Madera',
    precio: 15990,
    descripcion: 'Robot de madera diseñado para estimular la creatividad, imaginación y coordinación.',
    imagen: '/Img/Robot madera 1.jpe',
  },
  '102': {
    nombre: 'Colección Creativa',
    precio: 19990,
    descripcion: 'Set creativo con materiales para pintar, decorar y desarrollar habilidades artísticas.',
    imagen: '/Img/Coleccion Creativa.jpe',
  },
  '103': {
    nombre: 'Pinta tu Juguete',
    precio: 12990,
    descripcion: 'Kit de manualidades didáctico y creativo para pintar y personalizar.',
    imagen: '/Img/Pinta_Juguete.jpe',
  },
  '104': {
    nombre: 'kit de Dinosaurios para Armar',
    precio: 18990,
    descripcion: 'Figuras de madera 3D en 1 kit educativo para armar y explorar.',
    imagen: '/Img/Dino.png',
  },
  '105': {
    nombre: 'Tren de Madera Magnético',
    precio: 21990,
    descripcion: 'Juego de vagones con conexión magnética segura para armar recorridos.',
    imagen: '/Img/Tren.png',
  },
  '106': {
    nombre: 'Mini Laboratorio de Ciencias',
    precio: 24990,
    descripcion: 'Experimentos divertidos y seguros para niños.',
    imagen: '/Img/Laboratorio.png',
  },
};

/**
 * Página de detalle de producto.
 * Mantiene la barra superior de PIXEL&TOYS, muestra el producto en formato amplio
 * con su descripción y precio, y permite agregarlo al carrito.
 */
export const ProductoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationStateDetalle | null) ?? null;

  const claveId = String(id || '').trim();
  const base = PRODUCTOS_BASE[claveId];

  // Datos principales del producto
  const [nombre, setNombre] = useState<string>(
    state?.producto?.nombre || base?.nombre || 'Producto'
  );
  const [precio, setPrecio] = useState<number>(
    Number(state?.producto?.precio ?? base?.precio ?? 0)
  );
  const [descripcion, setDescripcion] = useState<string>(
    state?.producto?.descripcion ||
      base?.descripcion ||
      'Juguete didáctico y creativo de alta calidad.'
  );
  const [imagen, setImagen] = useState<string>(
    state?.imagen || base?.imagen || '/Img/LogoPixelToysIII.png'
  );

  // Estados de menús, búsqueda, carrito y notificaciones
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [agregando, setAgregando] = useState(false);
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: TipoAlerta } | null>(null);

  // Datos de sesión del usuario activo
  const sesion = obtenerSesion();
  const emailUsuario = sesion?.usuario.email || localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario =
    sesion?.usuario.nombre ||
    localStorage.getItem('usuarioNombre') ||
    (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
  const rolUsuario = sesion?.usuario.rol || localStorage.getItem('usuarioRol') || '';
  const esAdmin =
    emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    rolUsuario.toUpperCase() === 'ADMIN';

  // Usa el ID del usuario en sesión si existe; de lo contrario cae en 1 como respaldo
  const usuarioId = sesion?.usuario.id || Number(localStorage.getItem('usuarioId')) || 1;

  const cerrarAlerta = useCallback(() => {
    setAlerta(null);
  }, []);

  /**
   * Consulta el carrito del usuario y actualiza el contador mostrado en el navbar.
   */
  const actualizarContadorCarrito = useCallback(async () => {
    try {
      const carrito = await carritoService.obtenerCarritoPorUsuario(usuarioId);
      const itemsSeguros = Array.isArray(carrito?.items) ? carrito.items : [];
      const total = itemsSeguros.reduce((acc, item) => acc + item.cantidad, 0);
      setCantidadCarrito(total);
    } catch (error) {
      console.error('Error al actualizar el contador del carrito:', error);
    }
  }, [usuarioId]);

  useEffect(() => {
    actualizarContadorCarrito();
  }, [actualizarContadorCarrito]);

  /**
   * Sincroniza los datos del producto desde el microservicio de catálogo
   * manteniendo los datos base si el backend no responde o no tiene el ítem.
   */
  useEffect(() => {
    let activo = true;

    catalogoService
      .obtenerProductos()
      .then((lista) => {
        if (!activo || !Array.isArray(lista)) return;
        const encontrado = lista.find((item) => String(item.id) === claveId);
        if (encontrado) {
          if (encontrado.nombre) setNombre(encontrado.nombre);
          if (typeof encontrado.precio === 'number') setPrecio(encontrado.precio);
          if (encontrado.descripcion) setDescripcion(encontrado.descripcion);
          if (encontrado.imagen && !state?.imagen) {
            setImagen(
              encontrado.imagen.startsWith('/') || encontrado.imagen.startsWith('http')
                ? encontrado.imagen
                : `/Img/${encontrado.imagen}`
            );
          }
        }
      })
      .catch(() => {
        // Conserva los valores iniciales/base si el servicio no está disponible
      });

    return () => {
      activo = false;
    };
  }, [claveId, state?.imagen]);

  /**
   * Agrega una unidad del producto actual al carrito y refresca el contador.
   */
  const handleAgregarAlCarrito = async () => {
    const productoIdNumerico = Number(state?.producto?.id ?? claveId) || 101;

    try {
      setAgregando(true);
      await carritoService.agregarItem(usuarioId, {
        productoId: productoIdNumerico,
        cantidad: 1,
        precioUnitario: precio,
      });
      await actualizarContadorCarrito();
      setAlerta({ mensaje: MENSAJE_AGREGADO_CARRITO, tipo: 'exito' });
    } catch (error) {
      console.error('Error al agregar el producto al carrito:', error);
      setAlerta({ mensaje: 'Error de conexión con el carrito.', tipo: 'error' });
    } finally {
      setAgregando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'sans-serif',
        color: '#1e293b',
        paddingBottom: '60px',
      }}
    >
      {/* Notificación visual flotante */}
      <ToastAlerta
        mensaje={alerta?.mensaje || null}
        tipo={alerta?.tipo || 'exito'}
        onClose={cerrarAlerta}
      />

      {/* --- NAVBAR SUPERIOR (barra blanca de PIXEL&TOYS) --- */}
      <header
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => navigate('/catalogo')}
        >
          <img
            src="/Img/LogoPixelToysIII.png"
            alt="Pixel & Toys"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              letterSpacing: '0.05em',
              color: '#0f172a',
            }}
          >
            PIXEL&TOYS
          </span>
        </div>

        <nav
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#475569',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <span
              onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              CATEGORÍAS ▾
            </span>

            {menuCategoriasAbierto && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  marginTop: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  minWidth: '200px',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => {
                    setMenuCategoriasAbierto(false);
                    navigate('/categoria/educativos');
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: '#0f172a',
                    fontWeight: '500',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  Juguetes educativos
                </div>
                <div
                  onClick={() => {
                    setMenuCategoriasAbierto(false);
                    navigate('/categoria/creativos');
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: '#0f172a',
                    fontWeight: '500',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  Juguetes creativos
                </div>
                <div
                  onClick={() => {
                    setMenuCategoriasAbierto(false);
                    navigate('/catalogo');
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: '#0f172a',
                    fontWeight: '600',
                  }}
                >
                  Todos los productos
                </div>
              </div>
            )}
          </div>

          <span
            onClick={() => navigate('/novedades')}
            style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}
          >
            NOVEDADES
          </span>
          <span
            onClick={() => navigate('/ofertas')}
            style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}
          >
            OFERTAS
          </span>
          <span
            onClick={() => navigate('/noticias')}
            style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}
          >
            NOTICIAS
          </span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/catalogo');
                }
              }}
              style={{
                backgroundColor: '#f1f5f9',
                fontSize: '0.875rem',
                borderRadius: '9999px',
                padding: '8px 16px 8px 36px',
                width: '256px',
                border: 'none',
                outline: 'none',
              }}
            />
          </div>

          <span
            onClick={() => navigate('/favoritos')}
            style={{ cursor: 'pointer', fontSize: '1.25rem' }}
            title="Ver mis favoritos"
          >
            ❤️
          </span>

          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: menuAbierto ? '#f1f5f9' : 'transparent',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>👤</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
                {nombreUsuario}
              </span>
            </div>

            {menuAbierto && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  width: '220px',
                  padding: '8px 0',
                  zIndex: 1000,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    marginBottom: '4px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      margin: 0,
                    }}
                  >
                    {nombreUsuario}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      margin: 0,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {emailUsuario}
                  </p>
                </div>

                {esAdmin && (
                  <div
                    onClick={() => {
                      setMenuAbierto(false);
                      navigate('/admin');
                    }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      fontWeight: '500',
                    }}
                  >
                    ⚙️ Panel de Administración
                  </div>
                )}

                <div
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#dc2626',
                    fontWeight: '500',
                  }}
                >
                  🚪 Cerrar Sesión
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/carrito')}
            title="Ver carrito de compras"
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span>🛒</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: '#06b6d4',
                padding: '2px 6px',
                borderRadius: '9999px',
              }}
            >
              {cantidadCarrito}
            </span>
          </button>
        </div>
      </header>

      {/* --- CONTENEDOR AMPLIO DEL PRODUCTO --- */}
      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '36px 24px' }}>
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '36px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Imagen amplia del producto */}
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              height: '420px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
            }}
          >
            <img
              src={imagen}
              alt={nombre}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/Img/LogoPixelToysIII.png';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Información del producto y botón Agregar al Carrito */}
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#2563eb',
                marginBottom: '10px',
              }}
            >
              Descripción del producto
            </span>

            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 14px 0',
                lineHeight: 1.2,
              }}
            >
              {nombre}
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.65,
                color: '#475569',
                margin: '0 0 24px 0',
                paddingBottom: '20px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {descripcion}
            </p>

            <p
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 24px 0',
              }}
            >
              ${Number(precio).toLocaleString('es-CL')}
            </p>

            <button
              type="button"
              disabled={agregando}
              onClick={handleAgregarAlCarrito}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                backgroundColor: agregando ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                cursor: agregando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
              }}
            >
              <span>🛒</span>
              <span>{agregando ? 'Agregando...' : 'Agregar al Carrito'}</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};