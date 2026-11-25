import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';
import { ToastAlerta, MENSAJE_AGREGADO_CARRITO, type TipoAlerta } from './AlertaAñadidoP';

/**
 * Componente `CategoriaPage`:
 * Renderiza dinámicamente los productos filtrados por categoría según el parámetro
 * de ruta (`educativos` o `creativos`), permite navegar al detalle de cada producto
 * y agregar ítems al carrito con notificaciones visuales en pantalla.
 */
export const CategoriaPage: React.FC = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();

  // Estados locales de UI y carrito
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [cantidadCarrito, setCantidadCarrito] = useState<number>(0);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState<boolean>(false);
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: TipoAlerta } | null>(null);

  const cerrarAlerta = useCallback(() => {
    setAlerta(null);
  }, []);

  // Datos de sesión desde localStorage
  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario =
    localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
  const esAdmin =
    emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    localStorage.getItem('usuarioRol') === 'ADMIN';

  const usuarioId = 1; // ID de usuario sincronizado con el flujo actual

  /**
   * Consulta el carrito del usuario y actualiza el contador mostrado en el navbar.
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

  // Catálogo local agrupado por categoría con IDs sincronizados con el backend
  const productosPorCategoria: Record<string, { titulo: string; items: any[] }> = {
    educativos: {
      titulo: 'Juguetes Educativos',
      items: [
        {
          id: 101,
          nombre: 'Robot de Madera',
          precio: 15990,
          descripcion: 'Robot de madera diseñado para estimular la creatividad.',
          imagen: '/Img/Robot madera 1.jpe',
        },
        {
          id: 104,
          nombre: 'Kit de Dinosaurios para Armar',
          precio: 18990,
          descripcion: 'Figuras de madera 3D en 1 kit educativo.',
          imagen: '/Img/Dino.png',
        },
        {
          id: 105,
          nombre: 'Tren de Madera Magnético',
          precio: 21990,
          descripcion: 'Juego de vagones con conexión magnética segura.',
          imagen: '/Img/Tren.png',
        },
        {
          id: 106,
          nombre: 'Mini Laboratorio de Ciencias',
          precio: 24990,
          descripcion: 'Experimentos divertidos y seguros para niños.',
          imagen: '/Img/Laboratorio.png',
        },
      ],
    },
    creativos: {
      titulo: 'Juguetes Creativos',
      items: [
        {
          id: 103,
          nombre: 'Pinta tu Juguete',
          precio: 12990,
          descripcion: 'Kit de manualidades didáctico y creativo.',
          imagen: '/Img/Pinta_Juguete.jpe',
        },
        {
          id: 102,
          nombre: 'Colección Creativa',
          precio: 19990,
          descripcion: 'Set creativo con materiales para pintar y decorar.',
          imagen: '/Img/Coleccion Creativa.jpe',
        },
      ],
    },
  };

  const categoriaActual =
    productosPorCategoria[tipo || 'educativos'] || productosPorCategoria.educativos;

  /**
   * Navega hacia la vista de detalle del producto seleccionado, enviando
   * sus datos y su imagen local por state.
   *
   * @param prod Producto seleccionado en la categoría
   */
  const irAlDetalle = (prod: any) => {
    if (!prod?.id) return;
    navigate(`/producto/${prod.id}`, {
      state: {
        producto: prod,
        imagen: prod.imagen,
      },
    });
  };

  /**
   * Agrega un producto al microservicio de carrito, refresca el contador y muestra
   * la alerta visual estandarizada.
   *
   * @param prod Producto seleccionado en la categoría
   */
  const agregarAlCarrito = async (prod: any) => {
    try {
      const itemRequest = {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio,
      };

      console.log('Enviando al carrito desde Categorías:', itemRequest);
      await carritoService.agregarItem(usuarioId, itemRequest);
      await actualizarContadorCarrito();

      setAlerta({ mensaje: MENSAJE_AGREGADO_CARRITO, tipo: 'exito' });
    } catch (error) {
      console.error('Error al conectar con el servicio de carrito:', error);
      setAlerta({ mensaje: 'Error de conexión con el carrito.', tipo: 'error' });
    }
  };

  /**
   * Alterna el estado de favorito local para el ID de producto indicado.
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
          {/* Desplegable de Categorías */}
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

          {/* Botón Carrito con contador sincronizado */}
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

      {/* --- TÍTULO DE LA CATEGORÍA --- */}
      <div style={{ textAlign: 'center', padding: '40px 20px 30px 20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
          {categoriaActual.titulo}
        </h1>
      </div>

      {/* --- GRILLA DE PRODUCTOS --- */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '32px',
          padding: '0 24px',
        }}
      >
        {categoriaActual.items.map((prod) => {
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
                {/* Contenedor de imagen clickeable para abrir el detalle del producto */}
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
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    marginBottom: '16px',
                    minHeight: '40px',
                  }}
                >
                  {prod.descripcion}
                </p>
              </div>

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
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                  ${prod.precio?.toLocaleString('es-CL')}
                </span>
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