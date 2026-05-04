import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function PublicRoute() {
  const { token, initializing } = useAuth();

  if (initializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </main>
    );
  }

  if (token) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
