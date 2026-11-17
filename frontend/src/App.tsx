import { RouterProvider } from 'react-router-dom';
import { rootRouter } from './router/app.router';

function App() {
  return <RouterProvider router={rootRouter} />;
}

export default App;