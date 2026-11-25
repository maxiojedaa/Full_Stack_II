import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente `NovedadesPage`:
 * Muestra los productos recién incorporados al catálogo y permite navegar
 * directamente a la vista de detalle (`/producto/:id`) de cada novedad.
 */
export const NovedadesPage: React.FC = () => {
  const navigate = useNavigate();

  // Datos de sesión del usuario actual almacenados en localStorage
  const emailUsuario = localStorage.getItem('usuarioEmail') || '';
  const nombreUsuario =
    localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
  const esAdmin =
    emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
    emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
    localStorage.getItem('usuarioRol') === 'ADMIN';

  // Estados de menús, búsqueda y contador del navbar
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [cantidadCarrito] = useState(0);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);

  // Datos simulados (mock) para mostrar las novedades sin base de datos
  const novedadesProductos = [
    {
      id: 1,
      categoria: 'MANUALIDADES',
      nombre: 'Kit Creativo "Pinta tu Juguete"',
      descripcion: 'Kit creativo para pintar y personalizar tu propio juguete.',
      precio: '$14.990',
      precioNumerico: 14990,
      rating: 5.0,
      imagen: '/Img/Pinta_Juguete.jpe',
    },
    {
      id: 2,
      categoria: 'ARTE Y DISEÑO',
      nombre: 'Maletín Arte "Colección Creativa"',
      descripcion: 'Set creativo con materiales para pintar, decorar y desarrollar habilidades.',
      precio: '$19.990',
      precioNumerico: 19990,
      rating: 4.5,
      imagen: '/Img/Coleccion Creativa.jpe',
    },
    {
      id: 3,
      categoria: 'ROBOT',
      nombre: 'Robot de madera',
      descripcion: 'Robot de madera diseñado para estimular la creatividad y coordinación.',
      precio: '$15.990',
      precioNumerico: 15990,
      rating: 4.0,
      imagen: '/Img/Robot madera 1.jpe',
    },
  ];

  /**
   * Navega hacia la vista de detalle del producto seleccionado, enviando
   * sus datos normalizados y su imagen local por state.
   *
   * @param prod Producto de novedades seleccionado
   */
  const irAlDetalle = (prod: (typeof novedadesProductos)[number]) => {
    if (!prod?.id) return;
    navigate(`/producto/${prod.id}`, {
      state: {
        producto: {
          id: prod.id,
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precioNumerico,
        },
        imagen: prod.imagen,
      },
    });
  };

  // Filtra las novedades si el usuario escribe en el buscador superior
  const novedadesFiltradas = novedadesProductos.filter((prod) => {
    if (!busqueda.trim()) return true;
    const termino = busqueda.trim().toLowerCase();
    return (
      prod.nombre.toLowerCase().includes(termino) ||
      prod.categoria.toLowerCase().includes(termino)
    );
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '40px' }}>
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

        <nav
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#475569',
          }}
        >
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
            <span style={{ position: 'absolute', left: '12px', top: '8px', color: '#94a3b8' }}></span>
          </div>

          <span
            onClick={() => navigate('/favoritos')}
            style={{ cursor: 'pointer', fontSize: '1.25rem' }}
            title="Ver mis favoritos"
          >
            ❤️
          </span>

          {/* --- MENÚ DESPLEGABLE DE USUARIO (DROPDOWN) --- */}
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
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  width: '220px',
                  padding: '8px 0',
                  zIndex: 1000,
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Cabecera del menú con el Nombre y Correo */}
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

                {/* Opción de Panel de Administración (Solo visible si es ADMIN) */}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    ⚙️ Panel de Administración
                  </div>
                )}

                {/* Opción para Ver Perfil */}
                <div
                  onClick={() => {
                    setMenuAbierto(false);
                    navigate('/perfil');
                  }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#dc2626',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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

      {/* Banner Superior de Novedades */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '40px',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#0f172a',
            margin: '0 0 10px 0',
          }}
        >
          ¡ÚLTIMAS NOVEDADES!
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>
          Explora los últimos juguetes y figuras recién llegados a nuestro catálogo.
        </p>
      </div>

      {/* Contenedor de Tarjetas */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          padding: '0 20px',
        }}
      >
        {novedadesFiltradas.map((prod) => (
          <div
            key={prod.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Etiqueta ¡NUEVO! */}
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
                borderRadius: '4px',
                zIndex: 2,
              }}
            >
              ¡NUEVO!
            </span>

            {/* Imagen del producto clickeable para abrir el detalle */}
            <div
              onClick={() => irAlDetalle(prod)}
              style={{
                width: '100%',
                height: '220px',
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <img
                src={prod.imagen}
                alt={prod.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Información */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#64748b',
                  marginBottom: '6px',
                }}
              >
                {prod.categoria}
              </span>
              <h3
                onClick={() => irAlDetalle(prod)}
                style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  margin: '0 0 10px 0',
                  cursor: 'pointer',
                }}
              >
                {prod.nombre}
              </h3>

              {/* Rating */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  color: '#eab308',
                }}
              >
                <span>★ Tasa {prod.rating}</span>
              </div>

              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '20px',
                }}
              >
                {prod.precio}
              </div>

              {/* Botón Ver Producto -> navega a /producto/:id */}
              <button
                type="button"
                onClick={() => irAlDetalle(prod)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid #0f172a',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#0f172a';
                }}
              >
                Ver Producto
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};