import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function ProtectedRoute() {
  const { token, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <RouteLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function RouteLoader() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
    </main>
  );
}
