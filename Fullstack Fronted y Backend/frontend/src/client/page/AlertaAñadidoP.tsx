import React, { useEffect } from 'react';

/**
 * Tipos visuales disponibles para la notificación en pantalla.
 */
export type TipoAlerta = 'exito' | 'error' | 'info';

/**
 * Propiedades del componente `ToastAlerta`.
 */
interface ToastAlertaProps {
  /** Texto que se mostrará dentro de la alerta visual */
  mensaje: string | null;
  /** Tipo visual que define el color del banner */
  tipo?: TipoAlerta;
  /** Función que limpia o cierra la alerta */
  onClose: () => void;
  /** Duración en milisegundos antes de ocultarse automáticamente */
  duracionMs?: number;
}

/**
 * Mensaje único estandarizado para cuando se agrega un producto al carrito
 * desde catálogo, categorías u ofertas.
 */
export const MENSAJE_AGREGADO_CARRITO = 'Producto agregado al carrito con éxito.';

/**
 * Componente `ToastAlerta`:
 * Muestra una notificación flotante estilizada en la esquina superior derecha
 * en reemplazo de `window.alert(...)`, con cierre automático opcional.
 */
export const ToastAlerta: React.FC<ToastAlertaProps> = ({
  mensaje,
  tipo = 'exito',
  onClose,
  duracionMs = 2500,
}) => {
  useEffect(() => {
    if (!mensaje) return;

    const timer = setTimeout(() => {
      onClose();
    }, duracionMs);

    return () => clearTimeout(timer);
  }, [mensaje, duracionMs, onClose]);

  if (!mensaje) return null;

  // Colores según el tipo de notificación
  const estilosPorTipo: Record<TipoAlerta, { bg: string; border: string; icono: string }> = {
    exito: { bg: '#16a34a', border: '#15803d', icono: '✓' },
    error: { bg: '#dc2626', border: '#b91c1c', icono: '✕' },
    info: { bg: '#2563eb', border: '#1d4ed8', icono: 'ℹ' },
  };

  const estilo = estilosPorTipo[tipo];

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        backgroundColor: estilo.bg,
        color: '#ffffff',
        border: `1px solid ${estilo.border}`,
        borderRadius: '10px',
        padding: '14px 18px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '420px',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{estilo.icono}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{mensaje}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar alerta"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '0 4px',
          fontWeight: 'bold',
        }}
      >
        ✕
      </button>
    </div>
  );
};