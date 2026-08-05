import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Ajusta según tu configuración
});

// Interceptor para peticiones
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

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // El token venció o es inválido
      localStorage.removeItem('token');
      // Redirigir al login si no estamos ya allí, usando window.location para forzar recarga
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
