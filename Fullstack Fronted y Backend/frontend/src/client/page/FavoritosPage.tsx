import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carrito_services';

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
 * Componente FavoritosPage: Muestra los productos marcados con el corazón
 * almacenados en localStorage, permitiendo quitarlos de favoritos o agregarlos al carrito.
 */
export const FavoritosPage: React.FC = () => {
  const navigate = useNavigate();

  // Estado que carga los productos favoritos desde localStorage
  const [favoritos, setFavoritos] = useState<ProductoFavorito[]>(() => {
    const guardados = localStorage.getItem('pixelToysFavoritos');
    return guardados ? JSON.parse(guardados) : [];
  });

  // Estados para el Navbar
  const [cantidadCarrito, setCantidadCarrito] = useState<number>(0);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState<boolean>(false);
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);

  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario = localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
  const esAdmin = emailUsuario.toLowerCase() === 'carlos@gmail.com' || 
                  emailUsuario.toLowerCase() === 'lopez@gmail.com' || 
                  localStorage.getItem('usuarioRol') === 'ADMIN';
  const usuarioId = 1;

  /**
   * Sincroniza la burbuja del carrito con el microservicio.
   */
  const actualizarContadorCarrito = async () => {
    try {
      const carrito = await carritoService.obtenerCarritoPorUsuario(usuarioId);
      const cantidad = carrito.items.reduce((total, item) => total + item.cantidad, 0);
      setCantidadCarrito(cantidad);
    } catch (error) {
      console.error('Error al actualizar contador del carrito:', error);
    }
  };

  useEffect(() => {
    actualizarContadorCarrito();
  }, []);

  /**
   * Elimina un producto de la lista de favoritos y actualiza localStorage.
   */
  const quitarDeFavoritos = (id: number) => {
    const actualizados = favoritos.filter((prod) => prod.id !== id);
    setFavoritos(actualizados);
    localStorage.setItem('pixelToysFavoritos', JSON.stringify(actualizados));
  };

  /**
   * Agrega el producto favorito directamente al microservicio de carrito.
   */
  const agregarAlCarrito = async (prod: ProductoFavorito) => {
    try {
      await carritoService.agregarItem(usuarioId, {
        productoId: prod.id,
        cantidad: 1,
        precioUnitario: prod.precio
      });
      await actualizarContadorCarrito();
      alert(`¡"${prod.nombre}" se agregó al carrito!`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('No se pudo conectar con el servicio de carrito.');
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

        <nav style={{ display: 'flex', gap: '32px', fontSize: '0.875rem', fontWeight: '600', color: '#475569', alignItems: 'center' }}>
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

          <span onClick={() => navigate('/novedades')} style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>NOVEDADES</span>
          <span onClick={() => navigate('/ofertas')} style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>OFERTAS</span>
          <span onClick={() => navigate('/noticias')} style={{ cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>NOTICIAS</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Icono activo de Favoritos */}
          <span onClick={() => navigate('/favoritos')} style={{ cursor: 'pointer', fontSize: '1.25rem' }} title="Mis Favoritos">
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

      {/* --- CONTENIDO PRINCIPAL DE MIS FAVORITOS --- */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 0 24px' }}>
        
        {/* Encabezado idéntico al diseño de referencia */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#e11d48' }}>❤️</span> Mis Favoritos
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Aquí encontrarás los productos que guardaste como favoritos.
          </p>
        </div>

        {/* Estado vacío vs Grilla de tarjetas */}
        {favoritos.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
              Aún no tienes productos favoritos
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Explora la tienda y presiona el corazón en los juguetes que más te gusten para guardarlos aquí.
            </p>
            <button
              onClick={() => navigate('/catalogo')}
              style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {favoritos.map((prod) => (
              <div 
                key={prod.id} 
                style={{ 
                  backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', 
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between' 
                }}
              >
                {/* Imagen del producto */}
                <div style={{ height: '220px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                  <img 
                    src={prod.imagen} 
                    alt={prod.nombre} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                {/* Cuerpo de la tarjeta con título, botón circular de corazón y precio */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.15rem', margin: 0 }}>
                      {prod.nombre}
                    </h3>

                    {/* Botón circular blanco con corazón rojo para quitar de favoritos */}
                    <button
                      onClick={() => quitarDeFavoritos(prod.id)}
                      style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                      }}
                      title="Quitar de favoritos"
                    >
                      ❤️
                    </button>
                  </div>

                  <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '600', margin: '0 0 18px 0' }}>
                    ${prod.precio.toLocaleString('es-CL')}
                  </p>

                  {/* Botón inferior de acción */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => navigate('/catalogo')}
                      style={{
                        flex: 1, backgroundColor: '#2563eb', color: '#ffffff',
                        fontSize: '0.875rem', fontWeight: '600', padding: '10px 14px',
                        borderRadius: '10px', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <span>👁️</span> Ver Producto
                    </button>

                    <button
                      onClick={() => agregarAlCarrito(prod)}
                      style={{
                        backgroundColor: '#0f172a', color: '#ffffff',
                        fontSize: '0.875rem', fontWeight: '600', padding: '10px 14px',
                        borderRadius: '10px', border: 'none', cursor: 'pointer'
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