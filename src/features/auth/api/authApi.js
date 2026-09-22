import api from '../../../lib/axiosConfig';

export const loginAdmin = async (email, password) => {
    return await api.post('/backoffice/auth/login', { email, password });
};

export const loginTaller = async (email, password) => {
    return await api.post('/talleres/auth/login', { email, password });
};

export const solicitarCodigoRecuperacion = async (email) => {
    return await api.post('/talleres/auth/recuperar-password/solicitar', { email });
};

export const confirmarRecuperacionPassword = async (payload) => {
    return await api.post('/talleres/auth/recuperar-password/confirmar', payload);
};

export const forgotPassword = async (email) => {
    return await solicitarCodigoRecuperacion(email);
};
