import { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/axiosConfig';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efecto que se ejecuta al montar la app o al cambiar el token
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Decodificamos el token para intentar sacar el rol (o podemos usar el endpoint /me)
          const decoded = jwtDecode(token);
          console.log("Decoded JWT:", decoded);
          
          // Por seguridad o por diseño, hacemos fetch al perfil del usuario
          let isAdmin = false;
          const auths = decoded.authorities || decoded.role || "";
          
          if (Array.isArray(auths)) {
              isAdmin = auths.some(a => a.includes('SUPERADMIN') || a.includes('SUPER_ADMIN'));
          } else if (typeof auths === 'string') {
              isAdmin = auths.includes('SUPERADMIN') || auths.includes('SUPER_ADMIN');
          }
          
          let response;
          if (isAdmin) {
             response = await api.get('/backoffice/admin/saas/me', {
               headers: { Authorization: `Bearer ${token}` }
             });
          } else {
             response = await api.get('/talleres/usuarios/me', {
               headers: { Authorization: `Bearer ${token}` }
             });
          }
          const userData = response.data;
          
          setUserProfile(userData);
          // Si el backend devuelve el rol en userData.rol
          setRole(userData.rol || (decoded.authorities ? decoded.authorities[0] : null)); 
          
        } catch (error) {
          console.error("Error validando token o cargando perfil:", error);
          logout();
        }
      } else {
        setUserProfile(null);
        setRole(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserProfile(null);
    setRole(null);
  };

  const isSuperAdmin = () => {
    // Ajustar según como devuelva el rol el backend (puede ser 'ROLE_SUPER_ADMIN')
    if (!role) return false;
    return role.includes('SUPERADMIN') || role.includes('SUPER_ADMIN');
  };

  const isMecanico = () => {
    if (!role) return false;
    return role.includes('MECANICO');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      userProfile, 
      role, 
      login, 
      logout, 
      loading,
      isSuperAdmin,
      isMecanico
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
