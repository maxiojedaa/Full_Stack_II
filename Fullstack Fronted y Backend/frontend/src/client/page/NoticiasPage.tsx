import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export const NoticiasPage: React.FC = () => {
    const navigate = useNavigate();


    // 1. Copia exactamente estas líneas desde tu CatalogPage.tsx:
    const emailUsuario = localStorage.getItem('usuarioEmail') || '';
    const nombreUsuario = localStorage.getItem('usuarioNombre') || (emailUsuario ? emailUsuario.split('@')[0] : 'Usuario');
    const esAdmin = emailUsuario.toLowerCase() === 'carlos@gmail.com' ||
        emailUsuario.toLowerCase() === 'lopez@gmail.com' ||
        localStorage.getItem('usuarioRol') === 'ADMIN';

    // 2. Copia también los estados que usa tu barra en CatalogPage.tsx:
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [cantidadCarrito] = useState(0);


    const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);



    // Datos estáticos de las noticias mostradas en el diseño
    const listaNoticias = [
        {
            id: 1,
            etiqueta: 'Evento',
            colorEtiqueta: '#00b4d8', // Celeste
            colorTextoEtiqueta: '#ffffff',
            titulo: 'Gran Taller: "Pinta tu Juguete"',
            descripcion: 'Este sábado tendrán una jornada especial de pintura y creatividad para los más pequeños en nuestra tienda principal.',
            fecha: 'Publicado el 12 de Septiembre, 2026',
            imagen: '/Img/Pinta_Juguete.jpe', // Reemplazar con tu ruta local si la tienes
            esLogoTexto: false
        },
        {
            id: 2,
            etiqueta: 'Lanzamiento',
            colorEtiqueta: '#00b4d8', // Celeste
            colorTextoEtiqueta: '#ffffff',
            titulo: 'Llegan los nuevos sets de construcción',
            descripcion: 'Incorporamos a nuestro catálogo la línea completa de bloques educativos para todas las edades.',
            fecha: 'Publicado el 05 de Septiembre, 2026',
            imagen: '/Img/Laboratorio.png',
            esLogoTexto: false
        },
        {
            id: 3,
            etiqueta: 'Colaboracion',
            colorEtiqueta: '#eab308', // Amarillo / Dorado
            colorTextoEtiqueta: '#1e293b',
            titulo: 'Gracias a Tamashii Nations S.H.Figuarts ya llega pronto a Pixel y Toys',
            descripcion: 'Esten atentos porque en menos de 1 mes ya tendremos productos oficiales de S.H.Figuarts.',
            fecha: 'Publicado el 28 de Agosto, 2026',
            imagen: '/Img/Tamashi.png', // En la imagen se muestra el texto S.H.Figuarts sobre fondo blanco
            esLogoTexto: true
        }
    ];


    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f8fb', paddingBottom: '60px', fontFamily: 'sans-serif' }}>

            {/* Barra de Navegación Superior (Igual a la segunda captura) */}
            <header style={{
                backgroundColor: '#ffffff',
                padding: '16px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
                    <img src="/Img/LogoPixelToysIII.png" alt="Pixel & Toys" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.05em', color: '#0f172a' }}>PIXEL&TOYS</span>
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
                        <div style={{
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
                            overflow: 'hidden'
                        }}>
                            <div
                                onClick={() => { setMenuCategoriasAbierto(false); navigate('/categoria/educativos'); }}
                                style={{ padding: '12px 16px', cursor: 'pointer', color: '#0f172a', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}
                            >
                                Juguetes educativos
                            </div>
                            <div
                                onClick={() => { setMenuCategoriasAbierto(false); navigate('/categoria/creativos'); }}
                                style={{ padding: '12px 16px', cursor: 'pointer', color: '#0f172a', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}
                            >
                                Juguetes creativos
                            </div>
                            <div
                                onClick={() => { setMenuCategoriasAbierto(false); navigate('/catalogo'); }}
                                style={{ padding: '12px 16px', cursor: 'pointer', color: '#0f172a', fontWeight: '600' }}
                            >
                                Todos los productos
                            </div>
                        </div>
                    )}
                </div>


                <nav style={{ display: 'flex', gap: '32px', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
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
                            style={{ backgroundColor: '#f1f5f9', fontSize: '0.875rem', borderRadius: '9999px', padding: '8px 16px 8px 36px', width: '256px', border: 'none', outline: 'none' }}
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


            {/* Cabecera / Título de la Sección */}
            <div style={{ textAlign: 'center', padding: '50px 20px 40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
                    NOTICIAS Y EVENTOS
                </h1>
                <p style={{ fontSize: '1rem', color: '#475569', margin: 0 }}>
                    Entérate de las últimas novedades, talleres y lanzamientos del mundo del juguete.
                </p>
            </div>


            {/* Grilla de Tarjetas de Noticias */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '28px',
                padding: '0 24px'
            }}>
                {listaNoticias.map((noticia) => (
                    <div
                        key={noticia.id}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid #f1f5f9'
                        }}
                    >
                        {/* Contenedor Superior (Imagen o Logo S.H.Figuarts) */}
                        <div style={{
                            width: '100%',
                            height: '220px',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid #f1f5f9',
                            overflow: 'hidden'
                        }}>
                            {noticia.esLogoTexto ? (
                                <span style={{ fontSize: '2rem', fontWeight: '800', fontStyle: 'italic', color: '#0f172a', letterSpacing: '-0.5px' }}>
                                    S.H.Figuarts
                                </span>
                            ) : (
                                <img
                                    src={noticia.imagen}
                                    alt={noticia.titulo}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}
                        </div>


                        {/* Cuerpo de la Tarjeta */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

                            {/* Etiqueta (Evento, Lanzamiento, Colaboración) */}
                            <div style={{ marginBottom: '14px' }}>
                                <span style={{
                                    backgroundColor: noticia.colorEtiqueta,
                                    color: noticia.colorTextoEtiqueta,
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    padding: '5px 14px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                }}>
                                    {noticia.etiqueta}
                                </span>
                            </div>


                            {/* Título */}
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', lineHeight: '1.35' }}>
                                {noticia.titulo}
                            </h3>


                            {/* Descripción */}
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5', flexGrow: 1 }}>
                                {noticia.descripcion}
                            </p>


                            {/* Fecha de publicación al pie */}
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
                                {noticia.fecha}
                            </div>


                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};
