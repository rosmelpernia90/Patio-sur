import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-steel-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-3 text-sm text-steel-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
