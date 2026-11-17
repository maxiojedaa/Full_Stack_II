import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockService, type ProductoStockDTO } from '../../services/stock-services';

// Mensaje que se muestra arriba de la página (éxito o error)
type Mensaje = { tipo: 'exito' | 'error'; texto: string } | null;

// Estilos reutilizados en los formularios
const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '25px',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '6px',
  color: '#4a5568',
  fontWeight: '500'
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e0',
  boxSizing: 'border-box'
};
const botonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#3182ce',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

// Valida que el texto sea un número entero mayor o igual al mínimo indicado
const esEnteroValido = (valor: string, minimo: number) =>
  valor.trim() !== '' && Number.isInteger(Number(valor)) && Number(valor) >= minimo;

export const StockPage: React.FC = () => {
  const navigate = useNavigate();

  const [productosBajos, setProductosBajos] = useState<ProductoStockDTO[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [mensaje, setMensaje] = useState<Mensaje>(null);

  // Estados del formulario "Crear producto"
  const [nombre, setNombre] = useState('');
  const [stockInicial, setStockInicial] = useState('');
  const [minStock, setMinStock] = useState('');

  // Estados del formulario "Actualizar stock"
  const [idActualizar, setIdActualizar] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');

  // Estados del formulario "Registrar venta"
  const [idVenta, setIdVenta] = useState('');
  const [cantidadVenta, setCantidadVenta] = useState('');

  // Cargar los productos con stock bajo
  const cargarStockBajo = async () => {
    try {
      setCargando(true);
      const data = await stockService.verificarStockBajo();
      setProductosBajos(data);
    } catch (error) {
      console.error('Error al obtener el stock bajo:', error);
      setMensaje({
        tipo: 'error',
        texto: 'No se pudo conectar con el microservicio Stock (puerto 8086). Verifica que esté corriendo.'
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarStockBajo();
  }, []);

  // Crear un producto nuevo en el inventario
  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!nombre.trim() || !esEnteroValido(stockInicial, 0) || !esEnteroValido(minStock, 0)) {
      setMensaje({ tipo: 'error', texto: 'Revisa los datos: el nombre es obligatorio y el stock y el mínimo deben ser números enteros desde 0.' });
      return;
    }

    try {
      const creado = await stockService.crearProducto(nombre.trim(), Number(stockInicial), Number(minStock));
      setMensaje({ tipo: 'exito', texto: `Producto "${creado.nombre}" creado con ID ${creado.productoId}.` });
      setNombre('');
      setStockInicial('');
      setMinStock('');
      await cargarStockBajo();
    } catch (error) {
      console.error('Error al crear el producto:', error);
      setMensaje({ tipo: 'error', texto: 'No se pudo crear el producto.' });
    }
  };

  // Actualizar el stock de un producto existente
  const handleActualizarStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!esEnteroValido(idActualizar, 1) || !esEnteroValido(nuevoStock, 0)) {
      setMensaje({ tipo: 'error', texto: 'Revisa los datos: el ID debe ser un entero válido y el stock un entero desde 0.' });
      return;
    }

    try {
      const actualizado = await stockService.actualizarStock(Number(idActualizar), Number(nuevoStock));
      setMensaje({ tipo: 'exito', texto: `Stock de "${actualizado.nombre}" actualizado a ${actualizado.stock}.` });
      setIdActualizar('');
      setNuevoStock('');
      await cargarStockBajo();
    } catch (error) {
      console.error('Error al actualizar el stock:', error);
      setMensaje({ tipo: 'error', texto: 'No se pudo actualizar el stock. Revisa que el producto exista.' });
    }
  };

  // Registrar una venta (descuenta el stock automáticamente)
  const handleRegistrarVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!esEnteroValido(idVenta, 1) || !esEnteroValido(cantidadVenta, 1)) {
      setMensaje({ tipo: 'error', texto: 'Revisa los datos: el ID y la cantidad deben ser enteros mayores a 0.' });
      return;
    }

    try {
      const venta = await stockService.registrarVenta(Number(idVenta), Number(cantidadVenta));
      setMensaje({ tipo: 'exito', texto: `Venta N° ${venta.ventaId} registrada: ${venta.cantidad} unidad(es) del producto ${venta.productoId}.` });
      setIdVenta('');
      setCantidadVenta('');
      await cargarStockBajo();
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      setMensaje({ tipo: 'error', texto: 'No se pudo registrar la venta. Revisa que el producto exista y que haya stock suficiente.' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif' }}>

      {/* --- BARRA SUPERIOR --- */}
      <header style={{ backgroundColor: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px' }}>
            <span>🤖</span> <span>PIXEL & TOYS</span>
          </div>
          <span style={{ backgroundColor: '#1a202c', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
            Gestión de Stock
          </span>
        </div>

        <button
          onClick={() => navigate('/catalogo')}
          style={{ backgroundColor: '#eef2f5', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          🏠 Volver a la Tienda
        </button>
      </header>

      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* --- MENSAJE DE ÉXITO O ERROR --- */}
        {mensaje && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: mensaje.tipo === 'exito' ? '#dcfce7' : '#fee2e2',
              color: mensaje.tipo === 'exito' ? '#166534' : '#991b1b'
            }}
          >
            {mensaje.texto}
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>

          {/* --- COLUMNA IZQUIERDA: FORMULARIOS --- */}
          <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Crear producto */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', color: '#1a202c' }}>Crear Producto</h2>
              <form onSubmit={handleCrearProducto}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>Nombre del producto</label>
                  <input
                    type="text"
                    placeholder="Ej: Robot de Madera"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>Stock inicial</label>
                  <input
                    type="number"
                    placeholder="Ej: 20"
                    value={stockInicial}
                    onChange={(e) => setStockInicial(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Stock mínimo</label>
                  <input
                    type="number"
                    placeholder="Ej: 5"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button type="submit" style={botonStyle}>Guardar Producto</button>
              </form>
            </div>

            {/* Actualizar stock */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', color: '#1a202c' }}>Actualizar Stock</h2>
              <form onSubmit={handleActualizarStock}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>ID del producto</label>
                  <input
                    type="number"
                    placeholder="Ej: 101"
                    value={idActualizar}
                    onChange={(e) => setIdActualizar(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Nuevo stock</label>
                  <input
                    type="number"
                    placeholder="Ej: 25"
                    value={nuevoStock}
                    onChange={(e) => setNuevoStock(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button type="submit" style={botonStyle}>Actualizar Stock</button>
              </form>
            </div>

            {/* Registrar venta */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', color: '#1a202c' }}>Registrar Venta</h2>
              <form onSubmit={handleRegistrarVenta}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>ID del producto</label>
                  <input
                    type="number"
                    placeholder="Ej: 101"
                    value={idVenta}
                    onChange={(e) => setIdVenta(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Cantidad vendida</label>
                  <input
                    type="number"
                    placeholder="Ej: 2"
                    value={cantidadVenta}
                    onChange={(e) => setCantidadVenta(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button type="submit" style={botonStyle}>Registrar Venta</button>
              </form>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: TABLA DE STOCK BAJO --- */}
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>Productos con Stock Bajo</h2>
              <button
                onClick={cargarStockBajo}
                style={{ backgroundColor: '#eef2f5', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                🔄 Actualizar
              </button>
            </div>

            {cargando ? (
              <p style={{ color: '#64748b' }}>Cargando stock...</p>
            ) : productosBajos.length === 0 ? (
              <p style={{ color: '#64748b' }}>No hay productos con stock bajo.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a202c', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '14px', borderTopLeftRadius: '6px' }}>ID</th>
                    <th style={{ padding: '12px', fontSize: '14px' }}>Nombre</th>
                    <th style={{ padding: '12px', fontSize: '14px' }}>Stock</th>
                    <th style={{ padding: '12px', fontSize: '14px', borderTopRightRadius: '6px' }}>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {productosBajos.map((prod) => (
                    <tr key={prod.productoId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#2d3748' }}>{prod.productoId}</td>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>{prod.nombre}</td>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#e53e3e' }}>{prod.stock}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#2d3748' }}>{prod.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
              Solo se listan los productos con stock bajo, porque el backend de Stock no tiene un endpoint para listar todos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
