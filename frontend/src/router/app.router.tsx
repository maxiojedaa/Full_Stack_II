import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../client/page/LoginPage';
import { AdminPage } from '../client/page/AdminPage';
import { CatalogPage } from '../client/page/CatalogoPage';
import { CarritoPage } from '../client/page/CarritoPage';
import { ProfilePage } from '../client/page/ProfilePage';
import { StockPage } from '../client/page/StockPage';
// Función para verificar si el usuario logueado es admin
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.rol === 'ADMIN' || user.rol === 'ADMINISTRADOR';
};

export const rootRouter = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },

  {
    path: '/catalogo',
    element: <CatalogPage />,
  },
  {
    path: '/carrito',
    element: <CarritoPage />,
  },

  {
    path: '/admin',
    element: <AdminPage />,
  },
    {
    path: '/stock',
    element: <StockPage />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },

  { path: '/perfil', element: <ProfilePage /> }
]);


