import api from '../../../lib/axiosConfig';

export const loginAdmin = async (email, password) => {
    return await api.post('/backoffice/auth/login', { email, password });
};

export const loginTaller = async (email, password) => {
    return await api.post('/talleres/auth/login', { email, password });
};

export const forgotPassword = async (email) => {
    return await api.post('/talleres/auth/forgot-password', { email }); // Updated to /talleres as backend probably expects it
};
