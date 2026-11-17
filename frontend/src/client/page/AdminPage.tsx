import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Interfaz que define la estructura de un producto
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // Estado inicial con los productos de ejemplo
  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, nombre: 'Pinta tu Juguete', precio: 12990, imagen: 'Pinta tu Juguete' },
    { id: 2, nombre: 'Robot de Madera', precio: 15990, imagen: 'Robot de Madera' },
    { id: 3, nombre: 'Colección Creativa', precio: 19990, imagen: 'Colección Creativa' },
    { id: 4, nombre: 'Kit de Dinosaurios para Armar', precio: 18990, imagen: 'Kit de Dinosaurios para Armar' },
    { id: 5, nombre: 'Tren de Madera Magnético', precio: 21990, imagen: 'Tren de Madera Magnético' },
    { id: 6, nombre: 'Mini Laboratorio de Ciencias', precio: 24990, imagen: 'Mini Laboratorio de Ciencias' },
  ]);

  // Estados para el formulario de agregar producto
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState('');

  // Estado para controlar la pestaña activa del panel de administración
  const [seccionActiva, setSeccionActiva] = useState<'dashboard' | 'productos' | 'usuarios' | 'pedidos'>('dashboard');

  // Función para manejar el envío del formulario y agregar un nuevo producto
  const handleAgregarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return;

    const nuevoProducto: Producto = {
      id: Date.now(),
      nombre,
      precio: Number(precio),
      imagen: imagen || 'Producto.jpg',
    };

    setProductos([...productos, nuevoProducto]);
    setNombre('');
    setPrecio('');
    setImagen('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif' }}>
      
      {/* --- BARRA SUPERIOR DEL PANEL --- */}
      <header style={{ backgroundColor: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px' }}>
            <span>🤖</span> <span>PIXEL & TOYS</span>
          </div>
          <span style={{ backgroundColor: '#1a202c', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
            Panel de Administración
          </span>
        </div>

        {/* Botón para regresar a la tienda */}
        <button
          onClick={() => navigate('/catalogo')}
          style={{ backgroundColor: '#eef2f5', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          🏠 Volver a la Tienda
        </button>
      </header>

      {/* --- CONTENIDO PRINCIPAL CON MENÚ LATERAL Y VISTAS --- */}
      <div style={{ display: 'flex', padding: '30px', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* --- MENÚ LATERAL DE NAVEGACIÓN ENTRE PESTAÑAS --- */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setSeccionActiva('dashboard')}
            style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'dashboard' ? '#e2e8f0' : '#fff' }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setSeccionActiva('productos')}
            style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'productos' ? '#e2e8f0' : '#fff' }}
          >
            📦 Productos
          </button>
          <button
            onClick={() => setSeccionActiva('usuarios')}
            style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'usuarios' ? '#e2e8f0' : '#fff' }}
          >
            👥 Usuarios
          </button>
          <button
            onClick={() => setSeccionActiva('pedidos')}
            style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'pedidos' ? '#e2e8f0' : '#fff' }}
          >
            🛒 Pedidos
          </button>
        </div>

        {/* --- PANEL DINÁMICO SEGÚN LA SECCIÓN SELECCIONADA --- */}
        <div style={{ flex: 1 }}>

          {/* 1. VISTA DASHBOARD */}
          {seccionActiva === 'dashboard' && (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2>Panel de Control General</h2>
              <p style={{ color: '#64748b', marginTop: '10px' }}>Bienvenido al sistema de administración de Pixel & Toys.</p>
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4>Total Productos</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{productos.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. VISTA PRODUCTOS (Formulario + Tabla de inventario) */}
          {seccionActiva === 'productos' && (
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              
              {/* Formulario Agregar Producto */}
              <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: '350px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: 'bold', color: '#1a202c' }}>Agregar Producto</h2>
                <form onSubmit={handleAgregarProducto}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#4a5568', fontWeight: '500' }}>Nombre del producto</label>
                    <input
                      type="text"
                      placeholder="Ej: Robot de Madera"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#4a5568', fontWeight: '500' }}>Precio ($)</label>
                    <input
                      type="number"
                      placeholder="Ej: 15990"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#4a5568', fontWeight: '500' }}>Nombre de imagen (en Img/)</label>
                    <input
                      type="text"
                      placeholder="Ej: RobotMadera.jpg"
                      value={imagen}
                      onChange={(e) => setImagen(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ width: '100%', padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Guardar Producto
                  </button>
                </form>
              </div>

              {/* Tabla Inventario de Productos */}
              <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: 'bold', color: '#1a202c' }}>Inventario de Productos</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                      <th style={{ padding: '12px', fontSize: '14px', borderTopLeftRadius: '6px' }}>Imagen</th>
                      <th style={{ padding: '12px', fontSize: '14px' }}>Nombre</th>
                      <th style={{ padding: '12px', fontSize: '14px' }}>Precio</th>
                      <th style={{ padding: '12px', fontSize: '14px', borderTopRightRadius: '6px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{prod.imagen}</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>{prod.nombre}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#2d3748' }}>${prod.precio.toLocaleString('es-CL')}</td>
                        <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                          <button style={{ backgroundColor: '#ecc94b', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Editar</button>
                          <button style={{ backgroundColor: '#e53e3e', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* 3. VISTA USUARIOS */}
          {seccionActiva === 'usuarios' && (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2>Gestión de Usuarios</h2>
              <p style={{ color: '#64748b', marginTop: '10px' }}>Aquí puedes visualizar los usuarios registrados en el sistema.</p>
            </div>
          )}

          {/* 4. VISTA PEDIDOS */}
          {seccionActiva === 'pedidos' && (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2>Gestión de Pedidos</h2>
              <p style={{ color: '#64748b', marginTop: '10px' }}>Aquí puedes revisar y filtrar los pedidos recientes realizados en la tienda.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};