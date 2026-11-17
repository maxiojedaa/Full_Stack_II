import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';

/**
 * Componente OfertasPage: Muestra una sección de ofertas especiales aplicando
 * un efecto visual de descuento (precio original inflado tachado y precio real de venta).
 * Conectado directamente al microservicio de carrito.
 */
export const OfertasPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados locales para interactividad
  const [cantidadCarrito, setCantidadCarrito] = useState<number>(0);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState<boolean>(false);
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  // Datos de sesión del usuario actual
  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario = localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
  const esAdmin = emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    localStorage.getItem('usuarioRol') === 'ADMIN';

  const usuarioId = 1; // ID de usuario simulado actual

  /**
   * Sincroniza y actualiza la burbuja del carrito consultando al microservicio.
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
   * Lista de productos seleccionados en oferta.
   * El 'precio' es el valor real de tu BD y el 'precioOriginal' es uno mayor
   * para dar el efecto visual de descuento tal como lo pediste.
   */
  const productosEnOferta = [
    {
      id: 102,
      nombre: 'Colección Creativa',
      descripcion: 'Set creativo con materiales para pintar y decorar.',
      precio: 19990,                  // Precio real de venta
      precioOriginal: 24990,          // Precio tachado más alto
      descuento: '20% OFF',
      imagen: '/Img/Coleccion Creativa.jpe'
    },
    {
      id: 104,
      nombre: 'Kit de Dinosaurios para Armar',
      descripcion: 'Figuras de madera 3D en 1 kit educativo.',
      precio: 18990,                  // Precio real de venta
      precioOriginal: 23990,          // Precio tachado más alto
      descuento: '20% OFF',
      imagen: '/Img/Dino.png'
    },
    {
      id: 105,
      nombre: 'Tren de Madera Magnético',
      descripcion: 'Juego de vagones con conexión magnética segura.',
      precio: 21990,                  // Precio real de venta
      precioOriginal: 27990,          // Precio tachado más alto
      descuento: '20% OFF',
      imagen: '/Img/Tren.png'
    }
  ];

  /**
   * Envía el producto seleccionado al microservicio de carrito usando su precio real.
   */
  const agregarAlCarrito = async (prod: any) => {
    try {
      const itemRequest = {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio // Se cobra el precio real de venta
      };

      console.log("Enviando oferta al carrito:", itemRequest);

      await carritoService.agregarItem(usuarioId, itemRequest);
      await actualizarContadorCarrito();

      alert(`¡"${prod.nombre}" se agregó al carrito con precio de oferta!`);
    } catch (error) {
      console.error("Error al conectar con el servicio de carrito:", error);
      alert("Error de conexión con el carrito.");
    }
  };

  const toggleFavorito = (id: number) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', color: '#1e293b', paddingBottom: '60px' }}>

      {/* --- NAVBAR SUPERIOR UNIFICADO --- */}
      <header style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
          <img src="/Img/LogoPixelToysIII.png" alt="Pixel & Toys" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.05em', color: '#0f172a' }}>PIXEL&TOYS</span>
        </div>

        <nav style={{ display: 'flex', gap: '32px', fontSize: '0.875rem', fontWeight: '600', color: '#475569', alignItems: 'center' }}>

          {/* Menú Desplegable de Categorías */}
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
          <span onClick={() => navigate('/ofertas')} style={{ cursor: 'pointer', fontWeight: '800', color: '#2563eb' }}>
            OFERTAS
          </span>
          <span onClick={() => navigate('/noticias')} style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>
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
            <div onClick={() => setMenuAbierto(!menuAbierto)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>👤</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>{nombreUsuario}</span>
            </div>

            {menuAbierto && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', backgroundColor: '#ffffff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', borderRadius: '8px', width: '220px', padding: '8px 0', zIndex: 1000, border: '1px solid #e2e8f0'
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{nombreUsuario}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{emailUsuario}</p>
                </div>
                {esAdmin && (
                  <div onClick={() => { setMenuAbierto(false); navigate('/admin'); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', color: '#0f172a', fontWeight: '500' }}>
                    ⚙️ Panel de Administración
                  </div>
                )}
                <div onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', color: '#dc2626', fontWeight: '500' }}>
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

      {/* --- CABECERA DE OFERTAS ESPECIALES --- */}
      <div style={{ textAlign: 'center', padding: '40px 20px 20px 20px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span>🔥</span> Ofertas Especiales
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
          Aprovecha hasta un 20% de descuento en productos seleccionados
        </p>
      </div>

      {/* --- GRILLA DE PRODUCTOS EN OFERTA --- */}
      <div style={{
        maxWidth: '1200px',
        margin: '20px auto 0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '32px',
        padding: '0 24px'
      }}>
        {productosEnOferta.map((prod) => {
          const esFavorito = favoritos.includes(prod.id);

          return (
            <div
              key={prod.id}
              style={{
                backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Contenedor de la imagen con la etiqueta de descuento */}
                <div style={{ height: '224px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                  {/* Etiqueta roja de Descuento */}
                  <span style={{
                    position: 'absolute', top: '12px', left: '12px',
                    backgroundColor: '#dc2626', color: '#ffffff',
                    fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px',
                    borderRadius: '9999px', zIndex: 10, letterSpacing: '0.05em'
                  }}>
                    {prod.descuento}
                  </span>

                  <img
                    src={prod.imagen}
                    alt={prod.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  <button
                    onClick={() => toggleFavorito(prod.id)}
                    style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
                  >
                    {esFavorito ? '❤️' : '🤍'}
                  </button>
                </div>

                <h3 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.125rem', marginBottom: '4px' }}>
                  {prod.nombre}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px', minHeight: '40px' }}>
                  {prod.descripcion}
                </p>
              </div>

              {/* Precios y Botón de compra */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>

                {/* Sección de Precios (Real + Tachado) */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#dc2626' }}>
                    ${prod.precio.toLocaleString('es-CL')}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8', textDecoration: 'line-through' }}>
                    ${prod.precioOriginal.toLocaleString('es-CL')}
                  </span>
                </div>

                {/* Botón conectado al microservicio de carrito */}
                <button
                  onClick={() => agregarAlCarrito(prod)}
                  style={{
                    backgroundColor: '#2563eb', color: '#ffffff', fontSize: '0.875rem', fontWeight: '600',
                    padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
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