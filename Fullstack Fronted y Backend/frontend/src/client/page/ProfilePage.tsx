import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // Recuperamos los datos del usuario actual desde el localStorage
  const usuarioLogueado = JSON.parse(localStorage.getItem('user') || '{}');
  const nombreUsuario = usuarioLogueado.nombre || usuarioLogueado.name || (usuarioLogueado.email ? usuarioLogueado.email.split('@')[0] : 'Usuario');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* --- BARRA SUPERIOR DE LA PÁGINA DE PERFIL --- */}
      <header style={{ backgroundColor: '#ffffff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
          <img src="/Img/LogoPixelToysIII.png" alt="Pixel & Toys" style={{ height: '36px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a' }}>PIXEL & TOYS</span>
        </div>
        <button 
          onClick={() => navigate('/catalogo')}
          style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          ← Volver al Catálogo
        </button>
      </header>

      {/* --- CONTENIDO PRINCIPAL DEL PERFIL --- */}
      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Tarjeta de Información Personal */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            👤 Perfil de Usuario
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1rem' }}>
            <p><strong>Nombre:</strong> {nombreUsuario}</p>
            <p><strong>Correo electrónico:</strong> {usuarioLogueado.email || 'No disponible'}</p>
            <p>
              <strong>Rol en el sistema:</strong>{' '}
              <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {usuarioLogueado.rol || usuarioLogueado.role || 'USUARIO'}
              </span>
            </p>
          </div>
        </div>

        {/* Tabla de Historial de Compras */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>📦 Mis Compras Realizadas</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px', fontSize: '0.9rem' }}>N° Pedido</th>
                <th style={{ padding: '12px', fontSize: '0.9rem' }}>Producto</th>
                <th style={{ padding: '12px', fontSize: '0.9rem' }}>Total Pagado</th>
                <th style={{ padding: '12px', fontSize: '0.9rem' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {/* Fila de ejemplo (puedes conectarla con tu microservicio de pedidos más adelante) */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>#1001</td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>Robot de Madera</td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>$15.990</td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#16a34a', fontWeight: 'bold', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                    Completado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};