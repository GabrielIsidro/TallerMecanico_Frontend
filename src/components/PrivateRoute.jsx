import ProtectedRoute from './ProtectedRoute';

// Alias de compatibilidad
const PrivateRoute = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default PrivateRoute;
