import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { limpiarSesion, obtenerSesion } from '../services/authSession';

/**
 * Propiedades del componente `ProtectedRoute`.
 */
interface ProtectedRouteProps {
  /** Componente o vista a renderizar si el usuario cumple los requisitos de acceso */
  children: React.ReactNode;
  /** Lista opcional de roles permitidos (ej. `['ADMIN']`). Si se omite, basta con estar autenticado */
  allowedRoles?: string[];
}

/**
 * Guardia de rutas para React Router:
 * - Redirige a `/login` si no hay sesión o el token JWT expiró.
 * - Redirige a `/catalogo` si el usuario tiene sesión pero su rol no está autorizado para la ruta.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const sesion = obtenerSesion();

  if (!sesion) {
    limpiarSesion();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const rolUsuario = sesion.usuario.rol.toUpperCase();
    const rolesPermitidos = allowedRoles.map((r) => r.toUpperCase());

    if (!rolesPermitidos.includes(rolUsuario)) {
      return <Navigate to="/catalogo" replace />;
    }
  }

  return <>{children}</>;
};