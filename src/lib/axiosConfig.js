import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
});

// Interceptor para peticiones: inyecta Bearer Token si existe en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respuestas: gestión de seguridad (401 y 403)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // 401: Token vencido o credenciales inválidas en sesión activa
      if (status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          toast.error("Sesión expirada. Por favor, ingresa nuevamente.", { id: 'session-expired' });
          window.location.href = '/login';
        }
      }

      // 403: Violación multi-tenant o falta de permisos por roles (RBAC)
      if (status === 403) {
        toast.error(
          "Acceso denegado: No posees permisos para realizar esta acción o pertenecer a otro taller.",
          { id: 'forbidden-access', duration: 5000 }
        );
      }

      // 402: Suscripción vencida o suspendida (Payment Required)
      if (status === 402) {
        const mensaje = error.response.data?.message || "Tu suscripción ha vencido. Por favor regularizá tu plan para continuar.";
        toast.error(mensaje, { id: 'payment-required', duration: 5000 });
        if (window.location.pathname !== '/suscripcion') {
          setTimeout(() => {
            window.location.href = '/suscripcion';
          }, 1200);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
