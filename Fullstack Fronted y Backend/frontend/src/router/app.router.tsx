import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../client/page/LoginPage';
import { AdminPage } from '../client/page/AdminPage';
import { CatalogPage } from '../client/page/CatalogoPage';
import { ProductoDetallePage } from '../client/page/ProductoDetallePage';
import { CarritoPage } from '../client/page/CarritoPage';
import { ProfilePage } from '../client/page/ProfilePage';
import { StockPage } from '../client/page/StockPage';
import { NovedadesPage } from '../client/page/NovedadesPage';
import { NoticiasPage } from '../client/page/NoticiasPage';
import { CategoriaPage } from '../client/page/CategoriaPage';
import { OfertasPage } from '../client/page/OfertasPage';
import { FavoritosPage } from '../client/page/FavoritosPage';

/**
 * Definición centralizada de rutas de la aplicación.
 * Las rutas privadas requieren sesión válida mediante `ProtectedRoute`
 * y las administrativas exigen rol `ADMIN`.
 */
export const rootRouter = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/catalogo',
    element: (
      <ProtectedRoute>
        <CatalogPage />
      </ProtectedRoute>
    ),
  },
  // Ruta protegida para el detalle individual de cada producto (/producto/:id)
  {
    path: '/producto/:id',
    element: (
      <ProtectedRoute>
        <ProductoDetallePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/carrito',
    element: (
      <ProtectedRoute>
        <CarritoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/stock',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <StockPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/novedades',
    element: (
      <ProtectedRoute>
        <NovedadesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/noticias',
    element: (
      <ProtectedRoute>
        <NoticiasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/categoria/:tipo',
    element: (
      <ProtectedRoute>
        <CategoriaPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ofertas',
    element: (
      <ProtectedRoute>
        <OfertasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/favoritos',
    element: (
      <ProtectedRoute>
        <FavoritosPage />
      </ProtectedRoute>
    ),
  },
  // Cualquier ruta desconocida redirige al login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);