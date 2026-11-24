import React, { useState } from 'react';

interface PagoModalProps {
  total: number;
  onClose: () => void;
  onPagoExitoso: (metodoPago: string) => void;
}

export const PagoModal: React.FC<PagoModalProps> = ({ total, onClose, onPagoExitoso }) => {
  const [metodoPago, setMetodoPago] = useState('TARJETA');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    
    // Simulamos un pequeño retraso de procesamiento de la pasarela
    setTimeout(() => {
      setProcesando(false);
      onPagoExitoso(metodoPago);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '450px', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>Pasarela de Pagos</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' }}>✕</button>
        </div>

        {/* Resumen del Monto */}
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>Total a cancelar:</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>${total.toLocaleString('es-CL')}</p>
        </div>

        {/* Formulario de Pago */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Método de Pago</label>
            <select 
              value={metodoPago} 
              onChange={(e) => setMetodoPago(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
            >
              <option value="TARJETA">Tarjeta de Crédito / Débito</option>
              <option value="TRANSFERENCIA">Transferencia Bancaria</option>
              <option value="WEBPAY">WebPay Plus</option>
            </select>
          </div>

          {metodoPago === 'TARJETA' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Número de Tarjeta</label>
                <input 
                  type="text" 
                  placeholder="4000 1234 5678 9010" 
                  maxLength={19}
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#2d3748' }}>Nombre del Titular</label>
                <input 
                  type="text" 
                  placeholder="" 
                  value={nombreTitular}
                  onChange={(e) => setNombreTitular(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={procesando}
            style={{ marginTop: '10px', padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {procesando ? 'Procesando transacción...' : `Confirmar y Pagar $${total.toLocaleString('es-CL')}`}
          </button>
        </form>

      </div>
    </div>
  );
};