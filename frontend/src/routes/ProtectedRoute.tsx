import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks';
// Client-side protection improves navigation UX; the API enforces permissions too.
export function ProtectedRoute() { return useAppSelector((state) => state.auth.accessToken) ? <Outlet /> : <Navigate to="/login" replace />; }
