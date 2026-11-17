import { useEffect, useState } from 'react';
import { catalogoService, type ProductoDTO } from '../../services/catalogo_services';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';

export const CatalogPage = () => {
  // Inicializamos directamente con los 6 productos oficiales de la base de datos para garantizar que se muestren
  const [productos, setProductos] = useState<ProductoDTO[]>([
    { id: 101, nombre: 'Robot de Madera', descripcion: 'Robot de madera diseñado para estimular la creatividad.', precio: 15990 },
    { id: 103, nombre: 'Pinta tu Juguete', descripcion: 'Kit de manualidades didáctico y creativo.', precio: 12990 },
    { id: 104, nombre: 'kit de Dinosaurios para Armar', descripcion: 'Figuras de madera 3D en 1 kit educativo.', precio: 18990 },
    { id: 105, nombre: 'Tren de Madera Magnético', descripcion: 'Juego de vagones con conexión magnética segura.', precio: 21990 },
    { id: 106, nombre: 'Mini Laboratorio de Ciencias', descripcion: 'Experimentos divertidos y seguros para niños.', precio: 24990 }
  ]);

  // 1. Leemos los datos de manera unificada y segura desde el localStorage
  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario = localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');

  // 2. Definimos el rol de forma robusta (si guardaste 'usuarioRol' o si es el correo de Carlos o Lopez)
  const rolUsuario = localStorage.getItem('usuarioRol') ||
    (emailUsuario === 'carlos@gmail.com' || emailUsuario === 'lopez@gmail.com' ? 'ADMIN' : 'USUARIO');

  // 3. Evaluamos esAdmin utilizando la variable calculada
  // FORZAMOS de manera directa si es admin basándonos en el correo electrónico actual
  const esAdmin = emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    localStorage.getItem('usuarioRol') === 'ADMIN';

    
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  // Estado para controlar la apertura y cierre del menú desplegable del usuario
  const [menuAbierto, setMenuAbierto] = useState(false);

  const usuarioId = 1; // Usuario de prueba temporal

  const actualizarContadorCarrito = async () => {
    try {
      const carrito = await carritoService.obtenerCarritoPorUsuario(usuarioId);

      const cantidad = carrito.items.reduce(
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

  // Intentamos actualizar con el microservicio en segundo plano si está disponible
  useEffect(() => {
    catalogoService.obtenerProductos()
      .then(data => {
        if (data && data.length > 0) {
          console.log("Productos sincronizados desde la API:", data);
          setProductos(data);
        }
      })
      .catch(err => {
        console.warn("Usando catálogo local de respaldo:", err);
      });
  }, []);

  // Función de mapeo de imágenes corregida para aceptar singular y plural
  const obtenerImagenLocal = (idOrNombre: any) => {
    const mapaImágenes: { [key: string]: string } = {
      '101': '/Img/Robot madera 1.jpe',
      '102': '/Img/Coleccion Creativa.jpe',
      '103': '/Img/Pinta tu juguete 1.jpe',
      '104': '/Img/Dino.png', // Mapeo directo por ID
      '105': '/Img/tren de madera magnetico.png',
      '106': '/Img/Mini laboratorio de ciencias.png',
      // Respaldo por texto por si acaso
      'robot de madera': '/Img/Robot madera 1.jpe',
      'Coleccion Creativa': '/Img/Coleccion Creativa.jpe',
      'pinta tu juguete': '/Img/Pinta tu juguete 1.jpe',
      'kit de dinosaurios para armar': '/Img/kit de dinosaurios para armar.png',
      'tren de madera magnético': '/Img/tren de madera magnetico.png',
      'mini laboratorio de ciencias': '/Img/Mini laboratorio de ciencias.png'
    };

    const clave = String(idOrNombre).trim().toLowerCase();
    return mapaImágenes[clave] || '/Img/LogoPixelToysIII.png';
  };

  //Logica para agregar un producto al carrito
  const agregarAlCarrito = async (prod: any) => {
    try {
      const usuarioId = 1; // ID del usuario actual o activo

      const itemRequest = {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio
      };

      console.log("Enviando al carrito:", itemRequest);

      // Llamamos al servicio estructurado que apunta a /api/carrito/1/items
      await carritoService.agregarItem(usuarioId, itemRequest);

      await actualizarContadorCarrito();

      alert(`¡"${prod.nombre}" se agregó al carrito con éxito!`);
    } catch (error) {
      console.error("Error al conectar con el servicio de carrito:", error);
      alert("Error de conexión con el carrito.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', color: '#1e293b', paddingBottom: '60px' }}>
      {/* --- NAVBAR SUPERIOR --- */}
      <header style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
          <img src="/Img/LogoPixelToysIII.png" alt="Pixel & Toys" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.05em', color: '#0f172a' }}>PIXEL&TOYS</span>
        </div>

        <nav style={{ display: 'flex', gap: '32px', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
          <span style={{ cursor: 'pointer' }}>CATEGORÍAS ▾</span>
          <span style={{ cursor: 'pointer' }}>NOVEDADES</span>
          <span style={{ cursor: 'pointer' }}>OFERTAS</span>
          <span style={{ cursor: 'pointer' }}>NOTICIAS</span>
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
            <span style={{ position: 'absolute', left: '12px', top: '8px', color: '#94a3b8' }}></span>
          </div>

          <span style={{ cursor: 'pointer', fontSize: '1.25rem' }}>🤍</span>

          {/* --- MENÚ DESPLEGABLE DE USUARIO (DROPDOWN) --- */}
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
                position: 'absolute',
                right: 0,
                top: '110%',
                backgroundColor: '#ffffff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                width: '220px',
                padding: '8px 0',
                zIndex: 1000,
                border: '1px solid #e2e8f0'
              }}>
                {/* Cabecera del menú con el Nombre y Correo */}
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{nombreUsuario}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{emailUsuario}</p>
                </div>

                {/* Opción de Panel de Administración (Solo visible si es ADMIN) */}
                {esAdmin && (
                  <div
                    onClick={() => { setMenuAbierto(false); navigate('/admin'); }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ⚙️ Panel de Administración
                  </div>
                )}

                {/* Opción para Ver Perfil */}
                <div
                  onClick={() => { setMenuAbierto(false); navigate('/perfil'); }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', color: '#0f172a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  👤 Ver Perfil
                </div>

                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }}></div>

                {/* Opción de Cerrar Sesión */}
                <div
                  onClick={() => {
                    localStorage.clear(); // Limpia toda la sesión
                    navigate('/login');
                  }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', color: '#dc2626', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              border: 'none'
            }}
          >
            <span>🛒</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: '#06b6d4',
                padding: '2px 6px',
                borderRadius: '9999px'
              }}
            >
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
          {productos.map((prod) => (
            <div key={prod.id || prod.nombre} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* --- AQUÍ ESTÁ LA TARJETA DEL PRODUCTO Y SU IMAGEN --- */}
                <div style={{ height: '224px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <img
                    src={obtenerImagenLocal(prod.id)}
                    alt={prod.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                    🤍
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
          ))}
        </div>
      </main>
    </div>
  );
};