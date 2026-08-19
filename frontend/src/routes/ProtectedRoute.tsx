import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks';
export function ProtectedRoute() { return useAppSelector((state) => state.auth.accessToken) ? <Outlet /> : <Navigate to="/login" replace />; }
