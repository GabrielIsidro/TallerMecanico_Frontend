import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Guarda de navegación RBAC (Role-Based Access Control)
 * @param {Array<string>} allowedRoles - Lista de roles permitidos (ej: ['ADMIN_TALLER', 'MECANICO'])
 * @param {React.ReactNode} children - Componente a renderizar
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { token, loading, role } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <Loader2 size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const cleanUserRole = (role || '').replace('ROLE_', '').toUpperCase();

    const hasPermission = allowedRoles.some(r => {
      const cleanAllowed = r.replace('ROLE_', '').toUpperCase();
      if (cleanAllowed === 'SUPER_ADMIN' || cleanAllowed === 'SUPERADMIN') {
        return cleanUserRole === 'SUPERADMIN' || cleanUserRole === 'SUPER_ADMIN';
      }
      return cleanUserRole === cleanAllowed;
    });

    if (!hasPermission) {
      toast.warning("No posees permisos suficientes para acceder a esta sección.", {
        id: 'rbac-denied',
        duration: 4000
      });
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
