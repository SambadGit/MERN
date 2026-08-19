import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useRefreshMutation } from './services/api';
import { useAppDispatch, useAppSelector } from './hooks';
import { setSession } from './features/auth/authSlice';

// Lazy loading keeps login and each major workspace screen in separate chunks. and Suspense provides a fallback UI while the lazy-loaded components are being fetched. This improves the initial load time and user experience, especially for larger applications with multiple routes. and it allows for code splitting, which means that the application can load only the necessary code for the current route, reducing the amount of JavaScript that needs to be downloaded and executed at once. This can lead to faster load times and a more responsive user interface.

const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((module) => ({ default: module.ProductsPage })));
const AddProductPage = lazy(() => import('./pages/AddProductPage').then((module) => ({ default: module.AddProductPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((module) => ({ default: module.UsersPage })));


// App restores a refresh-cookie session, then protects the application routes. and it uses React Router to define the application's routes, including public routes for login and registration, and protected routes for the main application layout and its child pages. The ProtectedRoute component checks if the user is authenticated before allowing access to the protected routes. If the user is not authenticated, they are redirected to the login page.
export default function App() {
  const hasSession = useAppSelector((state) => Boolean(state.auth.accessToken));
  const [refresh] = useRefreshMutation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!hasSession) refresh().unwrap().then((result) =>
      dispatch(setSession({ accessToken: result.data.accessToken, user: result.data.user }))).catch(() => undefined);
  },
    [hasSession, refresh, dispatch]);
  return <Suspense fallback={<div className="state">Loading workspace...</div>}><Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route element={<ProtectedRoute />}><Route element={<Layout />}><Route path="/" element={<DashboardPage />} /><Route path="/products" element={<ProductsPage />} /><Route path="/products/new" element={<AddProductPage />} /><Route path="/orders" element={<OrdersPage />} /><Route path="/users" element={<UsersPage />} /></Route></Route><Route path="*" element={<Navigate to={hasSession ? '/' : '/login'} replace />} /></Routes></Suspense>;
}
