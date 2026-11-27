import React, { useState } from 'react';

interface PagoModalProps {
  total: number;
  onClose: () => void;
  onPagoExitoso: (metodoPago: string) => void;
}

/**
 * Valida que el número de tarjeta contenga entre 13 y 19 dígitos numéricos
 * (ignorando espacios separadores).
 */
const validarNumeroTarjeta = (valor: string): boolean => {
  const soloDigitos = valor.replace(/\s+/g, '');
  return /^\d{13,19}$/.test(soloDigitos);
};

/**
 * Valida que el nombre del titular contenga únicamente letras y espacios
 * (sin números ni caracteres especiales).
 */
const validarNombreTitular = (valor: string): boolean => {
  const limpio = valor.trim();
  return limpio.length >= 2 && /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(limpio);
};

/**
 * Valida que el CVV tenga 3 o 4 dígitos numéricos.
 */
const validarCvv = (valor: string): boolean => {
  return /^\d{3,4}$/.test(valor.trim());
};

/**
 * Valida formato y dígito verificador de un RUT chileno (ej. 12.345.678-9 o 12345678-K).
 */
const validarRutChileno = (rut: string): boolean => {
  const limpio = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);

  return dv === dvEsperado;
};

/**
 * Valida formato básico de correo electrónico.
 */
const validarCorreo = (correo: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
};

export const PagoModal: React.FC<PagoModalProps> = ({ total, onClose, onPagoExitoso }) => {
  const [metodoPago, setMetodoPago] = useState<'TARJETA' | 'WEBPAY' | 'TRANSFERENCIA'>('TARJETA');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [cvv, setCvv] = useState('');
  const [bancoSeleccionado, setBancoSeleccionado] = useState('Banco Estado');
  const [rutTransferencia, setRutTransferencia] = useState('');
  const [correoComprobante, setCorreoComprobante] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (metodoPago === 'TARJETA' || metodoPago === 'WEBPAY') {
      if (!validarNumeroTarjeta(numeroTarjeta)) {
        setErrorValidacion('El número de tarjeta debe contener entre 13 y 19 dígitos numéricos.');
        return;
      }

      if (!validarNombreTitular(nombreTitular)) {
        setErrorValidacion('El nombre del titular solo debe contener letras y espacios.');
        return;
      }

      if (!validarCvv(cvv)) {
        setErrorValidacion('El CVV debe contener 3 o 4 dígitos numéricos.');
        return;
      }
    }

    if (metodoPago === 'TRANSFERENCIA') {
      if (!validarRutChileno(rutTransferencia)) {
        setErrorValidacion('Ingresa un RUT válido (ej. 12.345.678-9).');
        return;
      }

      if (!validarCorreo(correoComprobante)) {
        setErrorValidacion('Ingresa un correo electrónico válido para el comprobante.');
        return;
      }
    }

    setProcesando(true);

    setTimeout(() => {
      setProcesando(false);
      onPagoExitoso(metodoPago);
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: '450px',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>
            Pasarela de Pagos
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#a0aec0',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            border: '1px solid #edf2f7',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>Total a pagar:</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>
            ${total.toLocaleString('es-CL')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '5px',
                color: '#2d3748',
              }}
            >
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => {
                setErrorValidacion(null);
                setMetodoPago(e.target.value as 'TARJETA' | 'WEBPAY' | 'TRANSFERENCIA');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e0',
                fontSize: '14px',
                backgroundColor: '#fff',
              }}
            >
              <option value="TARJETA">Tarjeta de Crédito / Débito</option>
              <option value="WEBPAY">WebPay Plus</option>
              <option value="TRANSFERENCIA">Transferencia Bancaria</option>
            </select>
          </div>

          {(metodoPago === 'TARJETA' || metodoPago === 'WEBPAY') && (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: '#2d3748',
                  }}
                >
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4000 1234 5678 9010"
                  maxLength={23}
                  value={numeroTarjeta}
                  onChange={(e) => {
                    const filtrado = e.target.value.replace(/[^\d\s]/g, '');
                    setNumeroTarjeta(filtrado);
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e0',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: '#2d3748',
                    }}
                  >
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={nombreTitular}
                    onChange={(e) => {
                      const filtrado = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, '');
                      setNombreTitular(filtrado);
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e0',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: '#2d3748',
                    }}
                  >
                    CVV
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => {
                      const filtrado = e.target.value.replace(/\D/g, '');
                      setCvv(filtrado);
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e0',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {metodoPago === 'TRANSFERENCIA' && (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: '#2d3748',
                  }}
                >
                  Banco de Origen
                </label>
                <select
                  value={bancoSeleccionado}
                  onChange={(e) => setBancoSeleccionado(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e0',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="Banco Estado">Banco Estado</option>
                  <option value="Banco de Chile">Banco de Chile</option>
                  <option value="Santander">Santander</option>
                  <option value="BCI">BCI</option>
                  <option value="Itaú">Itaú</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: '#2d3748',
                  }}
                >
                  RUT del Titular
                </label>
                <input
                  type="text"
                  placeholder="12.345.678-9"
                  value={rutTransferencia}
                  onChange={(e) => {
                    const filtrado = e.target.value.replace(/[^0-9kK.\-]/g, '');
                    setRutTransferencia(filtrado);
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e0',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: '#2d3748',
                  }}
                >
                  Correo para Comprobante
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correoComprobante}
                  onChange={(e) => setCorreoComprobante(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e0',
                    fontSize: '14px',
                  }}
                />
              </div>
            </>
          )}

          {errorValidacion && (
            <div
              style={{
                backgroundColor: '#fed7d7',
                color: '#9b2c2c',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              {errorValidacion}
            </div>
          )}

          <button
            type="submit"
            disabled={procesando}
            style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#3182ce',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {procesando ? 'Procesando pago...' : `Pagar $${total.toLocaleString('es-CL')}`}
          </button>
        </form>
      </div>
    </div>
  );
};