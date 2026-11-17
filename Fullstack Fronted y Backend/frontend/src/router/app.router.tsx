import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../client/page/LoginPage';
import { AdminPage } from '../client/page/AdminPage';
import { CatalogPage } from '../client/page/CatalogoPage';
import { CarritoPage } from '../client/page/CarritoPage';
import { ProfilePage } from '../client/page/ProfilePage';
import { StockPage } from '../client/page/StockPage';
import { NovedadesPage } from '../client/page/NovedadesPage';
import { NoticiasPage } from '../client/page/NoticiasPage';
import { CategoriaPage } from '../client/page/CategoriaPage';
import { OfertasPage } from '../client/page/OfertasPage';
import { FavoritosPage } from '../client/page/FavoritosPage';

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

  { path: '/perfil', element: <ProfilePage /> },

  { path: 
    '/novedades', 
    element: <NovedadesPage />, 
  }, 
  
  { path: '/noticias',
    element: <NoticiasPage />, 
  },
  {
    path: '/categoria/:tipo',
    element: <CategoriaPage />,
  },
  {
    path: '/ofertas',
    element: <OfertasPage />,
  },
    {
    path: '/favoritos',
    element: <FavoritosPage />,
  },


]);


