import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';
import { ToastAlerta, MENSAJE_AGREGADO_CARRITO, type TipoAlerta } from './AlertaAñadidoP';

/**
 * Componente `OfertasPage`:
 * Muestra la sección de ofertas especiales con descuento visual (precio de venta
 * destacado junto al precio original tachado), permite navegar al detalle de cada
 * producto y agregar productos al carrito mostrando notificaciones visuales en pantalla
 * con `ToastAlerta`.
 */
export const OfertasPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados locales de navegación, carrito, favoritos y alertas
  const [cantidadCarrito, setCantidadCarrito] = useState<number>(0);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState<boolean>(false);
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: TipoAlerta } | null>(null);

  const cerrarAlerta = useCallback(() => {
    setAlerta(null);
  }, []);

  // Datos de sesión del usuario actual desde localStorage
  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario =
    localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
  const esAdmin =
    emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    localStorage.getItem('usuarioRol') === 'ADMIN';

  const usuarioId = 1; // ID de usuario sincronizado con el flujo actual

  /**
   * Consulta el carrito del usuario y actualiza el contador mostrado en la barra superior.
   */
  const actualizarContadorCarrito = async () => {
    try {
      const carrito = await carritoService.obtenerCarritoPorUsuario(usuarioId);
      const cantidad = carrito.items.reduce((total, item) => total + item.cantidad, 0);
      setCantidadCarrito(cantidad);
    } catch (error) {
      console.error('Error al actualizar el contador del carrito:', error);
    }
  };

  useEffect(() => {
    actualizarContadorCarrito();
  }, []);

  /**
   * Lista de productos en oferta:
   * - `precio`: precio real de venta enviado al microservicio de carrito.
   * - `precioOriginal`: valor referencial tachado para mostrar el descuento.
   */
  const productosEnOferta = [
    {
      id: 102,
      nombre: 'Colección Creativa',
      descripcion: 'Set creativo con materiales para pintar y decorar.',
      precio: 19990,
      precioOriginal: 24990,
      descuento: '20% OFF',
      imagen: '/Img/Coleccion Creativa.jpe',
    },
    {
      id: 104,
      nombre: 'Kit de Dinosaurios para Armar',
      descripcion: 'Figuras de madera 3D en 1 kit educativo.',
      precio: 18990,
      precioOriginal: 23990,
      descuento: '20% OFF',
      imagen: '/Img/Dino.png',
    },
    {
      id: 105,
      nombre: 'Tren de Madera Magnético',
      descripcion: 'Juego de vagones con conexión magnética segura.',
      precio: 21990,
      precioOriginal: 27990,
      descuento: '20% OFF',
      imagen: '/Img/Tren.png',
    },
  ];

  /**
   * Navega hacia la vista de detalle del producto en oferta seleccionado,
   * enviando el producto (con su precio de oferta) y su imagen por state.
   *
   * @param prod Producto en oferta seleccionado
   */
  const irAlDetalle = (prod: (typeof productosEnOferta)[number]) => {
    if (!prod?.id) return;
    navigate(`/producto/${prod.id}`, {
      state: {
        producto: prod,
        imagen: prod.imagen,
      },
    });
  };

  /**
   * Envía el producto en oferta al microservicio de carrito con su precio real,
   * actualiza el contador y muestra el mensaje estandarizado con `ToastAlerta`.
   *
   * @param prod Producto en oferta seleccionado
   */
  const agregarAlCarrito = async (prod: any) => {
    try {
      const itemRequest = {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio,
      };

      console.log('Enviando oferta al carrito:', itemRequest);

      await carritoService.agregarItem(usuarioId, itemRequest);
      await actualizarContadorCarrito();

      setAlerta({ mensaje: MENSAJE_AGREGADO_CARRITO, tipo: 'exito' });
    } catch (error) {
      console.error('Error al conectar con el servicio de carrito:', error);
      setAlerta({ mensaje: 'Error de conexión con el carrito.', tipo: 'error' });
    }
  };

  /**
   * Alterna un producto en la lista local de favoritos.
   *
   * @param id Identificador del producto
   */
  const toggleFavorito = (id: number) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

      {/* --- NAVBAR SUPERIOR UNIFICADO --- */}
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
          {/* Menú Desplegable de Categorías */}
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
            style={{ cursor: 'pointer', fontWeight: '800', color: '#2563eb' }}
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
          <span
            onClick={() => navigate('/favoritos')}
            style={{ cursor: 'pointer', fontSize: '1.25rem' }}
            title="Ver mis favoritos"
          >
            ❤️
          </span>

          {/* Menú de Usuario */}
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
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
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

          {/* Botón Carrito */}
          <button
            type="button"
            onClick={() => navigate('/carrito')}
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

      {/* --- CABECERA DE OFERTAS ESPECIALES --- */}
      <div style={{ textAlign: 'center', padding: '40px 20px 20px 20px' }}>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <span>🔥</span> Ofertas Especiales
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
          Aprovecha hasta un 20% de descuento en productos seleccionados
        </p>
      </div>

      {/* --- GRILLA DE PRODUCTOS EN OFERTA --- */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '20px auto 0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px',
          padding: '0 24px',
        }}
      >
        {productosEnOferta.map((prod) => {
          const esFavorito = favoritos.includes(prod.id);

          return (
            <div
              key={prod.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Contenedor de la imagen clickeable para abrir el detalle del producto */}
                <div
                  onClick={() => irAlDetalle(prod)}
                  style={{
                    height: '224px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      zIndex: 10,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {prod.descuento}
                  </span>

                  <img
                    src={prod.imagen}
                    alt={prod.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Botón de favoritos (detiene propagación para no navegar al detalle) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(prod.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                    }}
                  >
                    {esFavorito ? '❤️' : '🤍'}
                  </button>
                </div>

                {/* Título clickeable para ir al detalle */}
                <h3
                  onClick={() => irAlDetalle(prod)}
                  style={{
                    fontWeight: 'bold',
                    color: '#0f172a',
                    fontSize: '1.125rem',
                    marginBottom: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {prod.nombre}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px', minHeight: '40px' }}>
                  {prod.descripcion}
                </p>
              </div>

              {/* Precios y Botón de compra */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#dc2626' }}>
                    ${prod.precio.toLocaleString('es-CL')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                    }}
                  >
                    ${prod.precioOriginal.toLocaleString('es-CL')}
                  </span>
                </div>

                {/* Botón agregar al carrito (detiene propagación para no navegar al detalle) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    agregarAlCarrito(prod);
                  }}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  <span>🛒</span>
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};