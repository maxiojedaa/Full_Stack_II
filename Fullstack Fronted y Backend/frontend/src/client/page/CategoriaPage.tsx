import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';
import { catalogoService, type ProductoDTO } from '../../services/catalogo_services';
import { limpiarSesion, obtenerSesion } from '../../services/authSession';
import { ToastAlerta, MENSAJE_AGREGADO_CARRITO, type TipoAlerta } from './AlertaAñadidoP';

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

const CATEGORIAS_BASE: Record<string, { titulo: string; items: any[] }> = {
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

/**
 * Vista de productos por categoría (`/categoria/:tipo`).
 * Sincroniza datos con `catalogoService`, comparte `pixelToysFavoritos`
 * en `localStorage`, usa el `usuarioId` real de sesión para el carrito y exige
 * sesión activa al navegar a `/producto/:id`.
 */
export const CategoriaPage: React.FC = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();

  const claveCategoria = tipo && CATEGORIAS_BASE[tipo] ? tipo : 'educativos';
  const baseCategoria = CATEGORIAS_BASE[claveCategoria];

  const [itemsCategoria, setItemsCategoria] = useState<any[]>(baseCategoria.items);
  const [cantidadCarrito, setCantidadCarrito] = useState<number>(0);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState<boolean>(false);
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: TipoAlerta } | null>(null);

  // Favoritos persistidos en la clave compartida `pixelToysFavoritos`
  const [favoritos, setFavoritos] = useState<any[]>(() => {
    try {
      const guardados = localStorage.getItem('pixelToysFavoritos');
      const parsed = guardados ? JSON.parse(guardados) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

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
      console.error('Error al actualizar el contador del carrito:', error);
    }
  }, [usuarioId]);

  useEffect(() => {
    actualizarContadorCarrito();
  }, [actualizarContadorCarrito]);

  /**
   * Sincroniza los productos de la categoría con el microservicio de catálogo
   * o mantiene los ítems base de respaldo si el backend no responde.
   */
  useEffect(() => {
    let activo = true;
    const configBase = CATEGORIAS_BASE[claveCategoria];
    setItemsCategoria(configBase.items);

    catalogoService
      .obtenerProductos()
      .then((lista: ProductoDTO[]) => {
        if (!activo || !Array.isArray(lista) || lista.length === 0) return;

        const sincronizados = configBase.items.map((itemBase) => {
          const remoto = lista.find((p) => Number(p.id) === Number(itemBase.id));
          if (!remoto) return itemBase;

          return {
            ...itemBase,
            nombre: remoto.nombre || itemBase.nombre,
            descripcion: remoto.descripcion || itemBase.descripcion,
            precio: typeof remoto.precio === 'number' ? remoto.precio : itemBase.precio,
          };
        });

        setItemsCategoria(sincronizados);
      })
      .catch(() => {
        // Mantiene los ítems base si no hay respuesta del catálogo
      });

    return () => {
      activo = false;
    };
  }, [claveCategoria]);

  /**
   * Alterna un producto en `pixelToysFavoritos` y persiste en `localStorage`.
   */
  const toggleFavorito = (prod: any) => {
    setFavoritos((prev) => {
      const existe = prev.some((item) => Number(item.id) === Number(prod.id));
      const nuevaLista = existe
        ? prev.filter((item) => Number(item.id) !== Number(prod.id))
        : [
            ...prev,
            {
              id: prod.id,
              nombre: prod.nombre,
              precio: prod.precio,
              imagen: prod.imagen,
              descripcion: prod.descripcion,
            },
          ];

      localStorage.setItem('pixelToysFavoritos', JSON.stringify(nuevaLista));
      return nuevaLista;
    });
  };

  /**
   * Navega hacia `/producto/:id` si existe una sesión válida; de lo contrario va a `/login`.
   */
  const irAlDetalle = (prod: any) => {
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
   * Agrega el producto al carrito del usuario actual y refresca el contador.
   */
  const agregarAlCarrito = async (prod: any) => {
    try {
      const itemRequest = {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio,
      };

      await carritoService.agregarItem(usuarioId, itemRequest);
      await actualizarContadorCarrito();

      setAlerta({ mensaje: MENSAJE_AGREGADO_CARRITO, tipo: 'exito' });
    } catch (error) {
      console.error('Error al conectar con el servicio de carrito:', error);
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
      <ToastAlerta
        mensaje={alerta?.mensaje || null}
        tipo={alerta?.tipo || 'exito'}
        onClose={cerrarAlerta}
      />

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

      <div style={{ textAlign: 'center', padding: '40px 20px 30px 20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
          {baseCategoria.titulo}
        </h1>
      </div>

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
        {itemsCategoria.map((prod) => {
          const esFavorito = favoritos.some((fav) => Number(fav.id) === Number(prod.id));

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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(prod);
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
                    title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    {esFavorito ? '❤️' : '🤍'}
                  </button>
                </div>

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