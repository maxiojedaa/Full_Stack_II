import { useCallback, useEffect, useState } from 'react';
import { catalogoService, type ProductoDTO } from '../../services/catalogo_services';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';
import { ToastAlerta, MENSAJE_AGREGADO_CARRITO, type TipoAlerta } from './AlertaAñadidoP';

/**
 * Componente `CatalogPage`:
 * Muestra el catálogo principal de juguetes, permite buscar, gestionar favoritos,
 * sincronizar el contador del carrito y agregar productos mostrando notificaciones
 * visuales en pantalla con `ToastAlerta`.
 */
export const CatalogPage = () => {
  // Productos oficiales iniciales de respaldo antes o en caso de fallo de sincronización API
  const [productos, setProductos] = useState<ProductoDTO[]>([
    { id: 101, nombre: 'Robot de Madera', descripcion: 'Robot de madera diseñado para estimular la creatividad.', precio: 15990 },
    { id: 103, nombre: 'Pinta tu Juguete', descripcion: 'Kit de manualidades didáctico y creativo.', precio: 12990 },
    { id: 104, nombre: 'kit de Dinosaurios para Armar', descripcion: 'Figuras de madera 3D en 1 kit educativo.', precio: 18990 },
    { id: 105, nombre: 'Tren de Madera Magnético', descripcion: 'Juego de vagones con conexión magnética segura.', precio: 21990 },
    { id: 106, nombre: 'Mini Laboratorio de Ciencias', descripcion: 'Experimentos divertidos y seguros para niños.', precio: 24990 }
  ]);

  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);

  // Datos de usuario almacenados en localStorage
  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario = localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');

  // Evalúa si el usuario actual posee permisos de administrador
  const esAdmin =
    emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    localStorage.getItem('usuarioRol') === 'ADMIN';

  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  // Estado del menú desplegable del usuario
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estado de notificaciones visuales (reemplaza window.alert)
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: TipoAlerta } | null>(null);

  const cerrarAlerta = useCallback(() => {
    setAlerta(null);
  }, []);

  // Favoritos sincronizados con localStorage
  const [favoritos, setFavoritos] = useState<any[]>(() => {
    const guardados = localStorage.getItem('pixelToysFavoritos');
    return guardados ? JSON.parse(guardados) : [];
  });

  const usuarioId = 1; // Usuario sincronizado con el flujo actual

  /**
   * Consulta el carrito del usuario y actualiza el contador de ítems en la barra superior.
   */
  const actualizarContadorCarrito = async () => {
    try {
      const carrito = await carritoService.obtenerCarritoPorUsuario(usuarioId);
      const itemsSeguros = Array.isArray(carrito?.items) ? carrito.items : [];
      const cantidad = itemsSeguros.reduce(
        (total, item) => total + item.cantidad,
        0
      );
      setCantidadCarrito(cantidad);
    } catch (error) {
      console.error('Error al actualizar el contador:', error);
    }
  };

  useEffect(() => {
    actualizarContadorCarrito();
  }, []);

  /**
   * Sincroniza la lista de productos desde el microservicio de catálogo en segundo plano.
   */
  useEffect(() => {
    catalogoService.obtenerProductos()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          console.log("Productos sincronizados desde la API:", data);
          setProductos(data);
        }
      })
      .catch(err => {
        console.warn("Usando catálogo local de respaldo:", err);
      });
  }, []);

  /**
   * Agrega o quita un producto de la lista de favoritos y persiste en localStorage.
   *
   * @param prod Producto seleccionado por el usuario
   */
  const toggleFavorito = (prod: any) => {
    setFavoritos((prev) => {
      const existe = prev.some((item) => item.id === prod.id);
      const nuevaLista = existe
        ? prev.filter((item) => item.id !== prod.id)
        : [...prev, { ...prod, imagen: obtenerImagenLocal(prod.id) }];

      localStorage.setItem('pixelToysFavoritos', JSON.stringify(nuevaLista));
      return nuevaLista;
    });
  };

  /**
   * Resuelve la ruta de imagen local asociada a un producto por ID o nombre.
   *
   * @param idOrNombre Identificador numérico o nombre comercial del producto
   * @returns Ruta pública de la imagen
   */
  const obtenerImagenLocal = (idOrNombre: any) => {
    const mapaImágenes: { [key: string]: string } = {
      '101': '/Img/Robot madera 1.jpe',
      '102': '/Img/Coleccion Creativa.jpe',
      '103': '/Img/Pinta_Juguete.jpe',
      '104': '/Img/Dino.png',
      '105': '/Img/Tren.png',
      '106': '/Img/Laboratorio.png',
      'robot de madera': '/Img/Robot madera 1.jpe',
      'coleccion creativa': '/Img/Coleccion Creativa.jpe',
      'pinta tu juguete': '/Img/Pinta tu juguete 1.jpe',
      'kit de dinosaurios para armar': '/Img/kit de dinosaurios para armar.png',
      'tren de madera magnético': '/Img/tren de madera magnetico.png',
      'mini laboratorio de ciencias': '/Img/Mini laboratorio de ciencias.png'
    };

    const clave = String(idOrNombre).trim().toLowerCase();
    return mapaImágenes[clave] || '/Img/LogoPixelToysIII.png';
  };

  /**
   * Envía el producto al microservicio de carrito, actualiza el contador y muestra
   * la notificación visual estandarizada.
   *
   * @param prod Producto a agregar al carrito
   */
  const agregarAlCarrito = async (prod: any) => {
    try {
      const itemRequest = {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio
      };

      console.log("Enviando al carrito:", itemRequest);
      await carritoService.agregarItem(usuarioId, itemRequest);
      await actualizarContadorCarrito();

      setAlerta({ mensaje: MENSAJE_AGREGADO_CARRITO, tipo: 'exito' });
    } catch (error) {
      console.error("Error al conectar con el servicio de carrito:", error);
      setAlerta({ mensaje: "Error de conexión con el carrito.", tipo: 'error' });
    }
  };

  // Garantiza un arreglo válido y filtra por término de búsqueda si el usuario escribe en el buscador
  const listaSeguraProductos = Array.isArray(productos) ? productos : [];
  const productosFiltrados = listaSeguraProductos.filter((prod) => {
    if (!busqueda.trim()) return true;
    const termino = busqueda.trim().toLowerCase();
    return (
      prod.nombre?.toLowerCase().includes(termino) ||
      prod.descripcion?.toLowerCase().includes(termino)
    );
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', color: '#1e293b', paddingBottom: '60px' }}>
      {/* Notificación visual flotante */}
      <ToastAlerta
        mensaje={alerta?.mensaje || null}
        tipo={alerta?.tipo || 'exito'}
        onClose={cerrarAlerta}
      />

      {/* --- NAVBAR SUPERIOR --- */}
      <header style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
          <img src="/Img/LogoPixelToysIII.png" alt="Pixel & Toys" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.05em', color: '#0f172a' }}>PIXEL&TOYS</span>
        </div>

        <nav style={{ display: 'flex', gap: '32px', fontSize: '0.875rem', fontWeight: '600', color: '#475569', alignItems: 'center' }}>
          {/* Contenedor de Categorías */}
          <div style={{ position: 'relative' }}>
            <span
              onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              CATEGORÍAS ▾
            </span>

            {menuCategoriasAbierto && (
              <div style={{
                position: 'absolute', top: '100%', left: '0', marginTop: '12px',
                backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0', minWidth: '200px', zIndex: 50, overflow: 'hidden'
              }}>
                <div onClick={() => { setMenuCategoriasAbierto(false); navigate('/categoria/educativos'); }} style={{ padding: '12px 16px', cursor: 'pointer', color: '#0f172a', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>
                  Juguetes educativos
                </div>
                <div onClick={() => { setMenuCategoriasAbierto(false); navigate('/categoria/creativos'); }} style={{ padding: '12px 16px', cursor: 'pointer', color: '#0f172a', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>
                  Juguetes creativos
                </div>
                <div onClick={() => { setMenuCategoriasAbierto(false); navigate('/catalogo'); }} style={{ padding: '12px 16px', cursor: 'pointer', color: '#0f172a', fontWeight: '600' }}>
                  Todos los productos
                </div>
              </div>
            )}
          </div>

          <span onClick={() => navigate('/novedades')} style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>
            NOVEDADES
          </span>
          <span onClick={() => navigate('/ofertas')} style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>
            OFERTAS
          </span>
          <span onClick={() => navigate('/noticias')} style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>
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
              style={{ backgroundColor: '#f1f5f9', fontSize: '0.875rem', borderRadius: '9999px', padding: '8px 16px 8px 36px', width: '256px', border: 'none', outline: 'none' }}
            />
          </div>

          {/* Botón de Favoritos en el Navbar */}
          <span
            onClick={() => navigate('/favoritos')}
            style={{ cursor: 'pointer', fontSize: '1.25rem' }}
            title="Ver mis favoritos"
          >
            ❤️
          </span>

          {/* --- MENÚ DE USUARIO --- */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', backgroundColor: menuAbierto ? '#f1f5f9' : 'transparent' }}
            >
              <span style={{ fontSize: '1.25rem' }}>👤</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
                {nombreUsuario}
              </span>
            </div>

            {menuAbierto && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', backgroundColor: '#ffffff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', borderRadius: '8px', width: '220px', padding: '8px 0', zIndex: 1000, border: '1px solid #e2e8f0'
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{nombreUsuario}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{emailUsuario}</p>
                </div>

                {esAdmin && (
                  <div
                    onClick={() => { setMenuAbierto(false); navigate('/admin'); }}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', color: '#0f172a', fontWeight: '500' }}
                  >
                    ⚙️ Panel de Administración
                  </div>
                )}

                <div
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', color: '#dc2626', fontWeight: '500' }}
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
            title="Ver carrito de compras"
            style={{
              backgroundColor: '#0f172a', color: '#ffffff', padding: '6px 14px', borderRadius: '9999px',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none'
            }}
          >
            <span>🛒</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#06b6d4', padding: '2px 6px', borderRadius: '9999px' }}>
              {cantidadCarrito}
            </span>
          </button>
        </div>
      </header>

      {/* --- BANNER PRINCIPAL --- */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
          <img
            src="/Img/Robot madera 1.jpe"
            alt="Banner principal"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>

          <div style={{ position: 'relative', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '32px', borderRadius: '16px', textAlign: 'center', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '400px', margin: '0 16px' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>Descubre nuestros favoritos</p>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '24px' }}>Robot de Madera</h1>
            <button style={{ backgroundColor: '#ffffff', color: '#020617', fontWeight: '600', padding: '8px 24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              Ver producto
            </button>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN PRODUCTOS DESTACADOS --- */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: '32px' }}>Productos Destacados</h2>

        {/* Grid de productos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
          {productosFiltrados.map((prod) => {
            const esFavorito = favoritos.some((fav) => fav.id === prod.id);

            return (
              <div key={prod.id || prod.nombre} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ height: '224px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      src={obtenerImagenLocal(prod.id)}
                      alt={prod.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Botón interactivo del Corazón */}
                    <button
                      onClick={() => toggleFavorito(prod)}
                      style={{
                        position: 'absolute', top: '12px', right: '12px',
                        backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
                        padding: '8px', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      {esFavorito ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.125rem', marginBottom: '4px' }}>{prod.nombre}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px', minHeight: '40px' }}>
                    {prod.descripcion || 'Juguete didáctico y creativo de alta calidad.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>${prod.precio?.toLocaleString('es-CL')}</span>
                  <button
                    onClick={() => agregarAlCarrito(prod)}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: '0.875rem', fontWeight: '600', padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
                  >
                    <span>🛒</span>
                    <span>Agregar al Carrito</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};