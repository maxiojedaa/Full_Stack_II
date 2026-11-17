import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogoService } from '../../services/catalogo_services';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol?: string;
}

interface Pedido {
  id: number;
  usuarioId: number;
  total: number;
  estado: string;
  fechaCreacion?: string;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // Puertos corregidos según tus application.properties
  const API_CATALOGO = 'http://localhost:8083/api/catalogo';
  const API_PEDIDOS = 'http://localhost:8084/api/pedidos';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [errorUsuarios, setErrorUsuarios] = useState('');

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  // Formulario producto
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState('');

  const [seccionActiva, setSeccionActiva] = useState<'dashboard' | 'productos' | 'usuarios' | 'pedidos'>('dashboard');

  const cargarProductos = async () => {
    try {
      const data = await catalogoService.obtenerProductos();
      if (data) {
        setProductos(data.flatMap((producto) =>
          producto.id === undefined ? [] : [{ ...producto, id: producto.id }]
        ));
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    }
  };

  

const cargarUsuarios = async () => {
  try {
    setErrorUsuarios('');

    const token = localStorage.getItem('token');

    if (!token) {
      setErrorUsuarios(
        'Debes iniciar sesión como administrador para visualizar los usuarios registrados.'
      );
      setUsuarios([]);
      return;
    }

    const respuesta = await fetch('http://localhost:8081/api/usuarios', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        setErrorUsuarios(
          'Tu sesión ha vencido o no es válida. Inicia sesión nuevamente.'
        );
      } else if (respuesta.status === 403) {
        setErrorUsuarios(
          'No tienes permisos de administrador para consultar los usuarios.'
        );
      } else {
        setErrorUsuarios(
          'No se pudieron cargar los usuarios. Intenta nuevamente.'
        );
        console.error('Error HTTP al cargar usuarios:', respuesta.status);
      }

      setUsuarios([]);
      return;
    }

    const datos: Usuario[] = await respuesta.json();
    setUsuarios(datos);

  } catch (error) {
    console.error('No se pudieron cargar los usuarios:', error);
    setErrorUsuarios('No se pudo conectar con el servidor de usuarios.');
    setUsuarios([]);
  }
};



  const cargarPedidos = async () => {
    try {
      // Usamos el endpoint de pendientes o general de pedidos (puerto 8084)
      const resp = await fetch(`${API_PEDIDOS}/pendientes`);
      if (resp.ok) {
        const data = await resp.json();
        setPedidos(data);
      } else {
        // Respaldo al endpoint general si /pendientes no responde
        const respGeneral = await fetch(API_PEDIDOS);
        if (respGeneral.ok) {
          const dataGeneral = await respGeneral.json();
          setPedidos(dataGeneral);
        }
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  useEffect(() => {
    setCargando(true);
    Promise.all([cargarProductos(), cargarUsuarios(), cargarPedidos()])
      .finally(() => setCargando(false));
  }, []);

  const iniciarEdicion = (prod: Producto) => {
    setEditandoId(prod.id);
    setNombre(prod.nombre);
    setDescripcion(prod.descripcion || '');
    setPrecio(String(prod.precio));
    setImagen(prod.imagen || '');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setImagen('');
  };

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return;

    const payload = {
      nombre,
      descripcion: descripcion || 'Juguete didáctico y creativo',
      precio: Number(precio),
      imagen: imagen || 'LogoPixelToysIII.png'
    };

    try {
      if (editandoId !== null) {
        // Actualizar precio/datos (PUT)
        const resp = await fetch(`${API_CATALOGO}/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error('Error al actualizar');
        alert('¡Precio y producto actualizados en la base de datos!');
      } else {
        // Crear producto (POST)
        const resp = await fetch(API_CATALOGO, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error('Error al crear');
        alert('¡Producto guardado en la base de datos!');
      }

      cancelarEdicion();
      await cargarProductos();
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar en el servidor. Verifica que ProductoController tenga los métodos POST y PUT.');
    }
  };

  const handleEliminarProducto = async (id: number, nombreProd: string) => {
    if (!confirm(`¿Eliminar "${nombreProd}" de la base de datos?`)) return;

    try {
      const resp = await fetch(`${API_CATALOGO}/${id}`, {
        method: 'DELETE'
      });
      if (!resp.ok) throw new Error('Error al eliminar');

      setProductos(prev => prev.filter(p => p.id !== id));
      alert('Producto eliminado correctamente de la base de datos.');
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar. Asegúrate de que ProductoController tenga el método DELETE.');
    }
  };

  const ingresosTotales = pedidos.reduce((acc, ped) => acc + (ped.total || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>🤖 PIXEL & TOYS</span>
          <span style={{ backgroundColor: '#1a202c', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
            Panel de Administración
          </span>
        </div>
        <button onClick={() => navigate('/catalogo')} style={{ backgroundColor: '#eef2f5', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
          🏠 Volver a la Tienda
        </button>
      </header>

      <div style={{ display: 'flex', padding: '30px', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setSeccionActiva('dashboard')} style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'dashboard' ? '#e2e8f0' : '#fff' }}>📊 Dashboard</button>
          <button onClick={() => setSeccionActiva('productos')} style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'productos' ? '#e2e8f0' : '#fff' }}>📦 Productos</button>
          <button onClick={() => setSeccionActiva('usuarios')} style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'usuarios' ? '#e2e8f0' : '#fff' }}>👥 Usuarios</button>
          <button onClick={() => setSeccionActiva('pedidos')} style={{ padding: '12px 18px', textAlign: 'left', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: seccionActiva === 'pedidos' ? '#e2e8f0' : '#fff' }}>🛒 Pedidos</button>
        </div>

        <div style={{ flex: 1 }}>
          {cargando && <p style={{ color: '#64748b' }}>Sincronizando con bases de datos...</p>}

          {seccionActiva === 'dashboard' && (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2>Panel de Control General</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4>Total Productos</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{productos.length}</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4>Usuarios</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d9488' }}>{usuarios.length}</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4>Pedidos</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>{pedidos.length}</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4>Ventas Totales</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>${ingresosTotales.toLocaleString('es-CL')}</p>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'productos' && (
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: '350px' }}>
                <h3 style={{ marginTop: 0 }}>{editandoId !== null ? `Editar Producto #${editandoId}` : 'Agregar Producto'}</h3>
                <form onSubmit={handleGuardarProducto}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500' }}>Nombre</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500' }}>Precio ($)</label>
                    <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: editandoId !== null ? '#d69e2e' : '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {editandoId !== null ? 'Actualizar Precio/Producto' : 'Guardar Producto'}
                  </button>
                  {editandoId !== null && (
                    <button type="button" onClick={cancelarEdicion} style={{ width: '100%', padding: '8px', marginTop: '6px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  )}
                </form>
              </div>

              <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h3>Inventario de Productos</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Nombre</th>
                      <th style={{ padding: '10px' }}>Precio</th>
                      <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(prod => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px' }}>#{prod.id}</td>
                        <td style={{ padding: '10px' }}>{prod.nombre}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>${prod.precio?.toLocaleString('es-CL')}</td>
                        <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                          <button onClick={() => iniciarEdicion(prod)} style={{ backgroundColor: '#ecc94b', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                          <button onClick={() => handleEliminarProducto(prod.id, prod.nombre)} style={{ backgroundColor: '#e53e3e', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {seccionActiva === 'usuarios' && (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2>Gestión de Usuarios</h2>

{errorUsuarios && (
  <div role="alert" style={{
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '15px',
    color: '#9a3412',
    fontSize: '14px'
  }}>
    🔒 {errorUsuarios}
  </div>
)}

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Nombre</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px' }}>#{u.id}</td>
                      <td style={{ padding: '10px' }}>{u.nombre}</td>
                      <td style={{ padding: '10px' }}>{u.email}</td>
                      <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>{u.rol}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {seccionActiva === 'pedidos' && (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2>Gestión de Pedidos</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>N° Pedido</th>
                    <th style={{ padding: '10px' }}>Usuario ID</th>
                    <th style={{ padding: '10px' }}>Total</th>
                    <th style={{ padding: '10px' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                      <td style={{ padding: '10px' }}>Usuario #{p.usuarioId}</td>
                      <td style={{ padding: '10px', color: '#2563eb', fontWeight: 'bold' }}>${p.total?.toLocaleString('es-CL')}</td>
                      <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>{p.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};