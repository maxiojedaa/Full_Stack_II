import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';
import { catalogoService, type ProductoDTO } from '../../services/catalogo_services';
import { limpiarSesion, obtenerSesion } from '../../services/authSession';
import { ToastAlerta, MENSAJE_AGREGADO_CARRITO, type TipoAlerta } from './AlertaAñadidoP';

/**
 * Interfaz que define la estructura de un producto guardado en favoritos.
 */
interface ProductoFavorito {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  descripcion?: string;
}

/**
 * Resuelve el ID numérico del usuario autenticado desde `localStorage`
 * o desde el payload del JWT; cae en `1` solo si no hay sesión válida.
 */
const obtenerUsuarioIdActual = (): number => {
  try {
    const idDirecto = Number(localStorage.getItem('usuarioId'));
    if (!Number.isNaN(idDirecto) && idDirecto > 0) {
      return idDirecto;
    }

    const raw =
      localStorage.getItem('usuario') ||
      localStorage.getItem('user') ||
      localStorage.getItem('authUser') ||
      localStorage.getItem('sesionUsuario');

    if (raw) {
      const parsed = JSON.parse(raw);
      const id = Number(parsed?.id ?? parsed?.usuario?.id ?? parsed?.user?.id);
      if (!Number.isNaN(id) && id > 0) {
        return id;
      }
    }

    const token = localStorage.getItem('token');
    if (token && token.split('.').length === 3) {
      const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = JSON.parse(atob(payloadBase64));
      const tokenId = Number(payloadJson?.id ?? payloadJson?.usuarioId ?? payloadJson?.sub);
      if (!Number.isNaN(tokenId) && tokenId > 0) {
        return tokenId;
      }
    }
  } catch (error) {
    console.error('Error al resolver usuarioId desde sesión:', error);
  }

  return 1;
};

/**
 * Vista de productos favoritos (`/favoritos`).
 * Lee y sincroniza `pixelToysFavoritos`, actualiza los datos del producto con
 * `catalogoService` cuando está disponible, usa el `usuarioId` de la sesión actual
 * para el carrito y exige sesión activa al abrir `/producto/:id`.
 */
export const FavoritosPage: React.FC = () => {
  const navigate = useNavigate();

  // Carga inicial de favoritos desde localStorage
  const [favoritos, setFavoritos] = useState<ProductoFavorito[]>(() => {
    try {
      const guardados = localStorage.getItem('pixelToysFavoritos');
      const parsed = guardados ? JSON.parse(guardados) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Estados de navegación, carrito y alertas
  const [cantidadCarrito, setCantidadCarrito] = useState<number>(0);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState<boolean>(false);
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: TipoAlerta } | null>(null);

  const cerrarAlerta = useCallback(() => {
    setAlerta(null);
  }, []);

  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario =
    localStorage.getItem('usuarioNombre') ||
    (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
  const esAdmin =
    emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    localStorage.getItem('usuarioRol') === 'ADMIN';

  const usuarioId = obtenerUsuarioIdActual();

  /**
   * Consulta el carrito del usuario activo y actualiza el contador del navbar.
   */
  const actualizarContadorCarrito = useCallback(async () => {
    try {
      const carrito = await carritoService.obtenerCarritoPorUsuario(usuarioId);
      const itemsSeguros = Array.isArray(carrito?.items) ? carrito.items : [];
      const cantidad = itemsSeguros.reduce((total, item) => total + item.cantidad, 0);
      setCantidadCarrito(cantidad);
    } catch (error) {
      console.error('Error al actualizar contador del carrito:', error);
    }
  }, [usuarioId]);

  useEffect(() => {
    actualizarContadorCarrito();
  }, [actualizarContadorCarrito]);

  /**
   * Sincroniza nombre, precio y descripción de los favoritos con el backend de catálogo
   * sin sobrescribir la imagen local guardada.
   */
  useEffect(() => {
    let activo = true;

    catalogoService
      .obtenerProductos()
      .then((lista: ProductoDTO[]) => {
        if (!activo || !Array.isArray(lista) || lista.length === 0) return;

        setFavoritos((prev) => {
          const actualizados = prev.map((fav) => {
            const remoto = lista.find((p) => Number(p.id) === Number(fav.id));
            if (!remoto) return fav;

            return {
              ...fav,
              nombre: remoto.nombre || fav.nombre,
              descripcion: remoto.descripcion || fav.descripcion,
              precio: typeof remoto.precio === 'number' ? remoto.precio : fav.precio,
            };
          });

          localStorage.setItem('pixelToysFavoritos', JSON.stringify(actualizados));
          return actualizados;
        });
      })
      .catch(() => {
        // Conserva los favoritos guardados localmente si el servicio no responde
      });

    return () => {
      activo = false;
    };
  }, []);

  /**
   * Elimina un producto de favoritos y actualiza `localStorage`.
   */
  const quitarDeFavoritos = (id: number) => {
    const actualizados = favoritos.filter((prod) => prod.id !== id);
    setFavoritos(actualizados);
    localStorage.setItem('pixelToysFavoritos', JSON.stringify(actualizados));
    setAlerta({ mensaje: 'Producto quitado de favoritos.', tipo: 'info' });
  };

  /**
   * Navega al detalle del producto (`/producto/:id`) verificando sesión activa.
   */
  const irAlDetalle = (prod: ProductoFavorito) => {
    if (!prod?.id) return;

    const sesion = obtenerSesion();
    if (!sesion) {
      limpiarSesion();
      navigate('/login', { replace: true });
      return;
    }

    navigate(`/producto/${prod.id}`, {
      state: {
        producto: prod,
        imagen: prod.imagen,
      },
    });
  };

  /**
   * Agrega el producto favorito al carrito del usuario actual y refresca el contador.
   */
  const agregarAlCarrito = async (prod: ProductoFavorito) => {
    try {
      await carritoService.agregarItem(usuarioId, {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio,
      });
      await actualizarContadorCarrito();
      setAlerta({ mensaje: MENSAJE_AGREGADO_CARRITO, tipo: 'exito' });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      setAlerta({ mensaje: 'Error de conexión con el carrito.', tipo: 'error' });
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

      {/* --- NAVBAR SUPERIOR --- */}
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
          <span
            onClick={() => navigate('/favoritos')}
            style={{ cursor: 'pointer', fontSize: '1.25rem' }}
            title="Mis Favoritos"
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
                    limpiarSesion();
                    localStorage.removeItem('usuarioEmail');
                    localStorage.removeItem('usuarioNombre');
                    localStorage.removeItem('usuarioRol');
                    localStorage.removeItem('usuarioId');
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

      {/* --- CONTENIDO PRINCIPAL DE MIS FAVORITOS --- */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 0 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: '800',
              color: '#1e293b',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ color: '#e11d48' }}>❤️</span> Mis Favoritos
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Aquí encontrarás los productos que guardaste como favoritos.
          </p>
        </div>

        {favoritos.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤍</div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#0f172a',
                margin: '0 0 8px 0',
              }}
            >
              Aún no tienes productos favoritos
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Explora la tienda y presiona el corazón en los juguetes que más te gusten para
              guardarlos aquí.
            </p>
            <button
              type="button"
              onClick={() => navigate('/catalogo')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '32px',
            }}
          >
            {favoritos.map((prod) => (
              <div
                key={prod.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  onClick={() => irAlDetalle(prod)}
                  style={{
                    height: '220px',
                    backgroundColor: '#f1f5f9',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={prod.imagen || '/Img/LogoPixelToysIII.png'}
                    alt={prod.nombre}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/Img/LogoPixelToysIII.png';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ padding: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <h3
                      onClick={() => irAlDetalle(prod)}
                      style={{
                        fontWeight: 'bold',
                        color: '#0f172a',
                        fontSize: '1.15rem',
                        margin: 0,
                        cursor: 'pointer',
                      }}
                    >
                      {prod.nombre}
                    </h3>

                    <button
                      type="button"
                      onClick={() => quitarDeFavoritos(prod.id)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                      }}
                      title="Quitar de favoritos"
                    >
                      ❤️
                    </button>
                  </div>

                  <p
                    style={{
                      color: '#64748b',
                      fontSize: '1.05rem',
                      fontWeight: '600',
                      margin: '0 0 18px 0',
                    }}
                  >
                    ${Number(prod.precio).toLocaleString('es-CL')}
                  </p>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => irAlDetalle(prod)}
                      style={{
                        flex: 1,
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>👁️</span> Ver Producto
                    </button>

                    <button
                      type="button"
                      onClick={() => agregarAlCarrito(prod)}
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      title="Agregar al Carrito"
                    >
                      🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};