import api from '../../../lib/axiosConfig';

export const getPlanes = async () => {
    return await api.get('/backoffice/planes');
};

export const updatePrecioPlan = async (id, precio) => {
    return await api.put(`/backoffice/planes/admin/${id}`, { precio });
};

export const updateEstadoPlan = async (id, activo) => {
    return await api.put(`/backoffice/planes/admin/${id}`, { activo });
};

export const getTalleres = async () => {
    return await api.get('/backoffice/admin/saas/talleres');
};

export const createTaller = async (nuevoTaller) => {
    return await api.post('/backoffice/admin/saas/talleres', nuevoTaller);
};

export const updateSuscripcionTaller = async (id, nuevoEstado) => {
    return await api.put(`/backoffice/admin/saas/talleres/${id}/suscripcion?estado=${nuevoEstado}`);
};

export const deleteTaller = async (id) => {
    return await api.delete(`/backoffice/admin/saas/talleres/${id}`);
};

export const createCheckoutSession = async (planId) => {
    return await api.post('/backoffice/suscripciones/checkout', { planId });
};

export const simulateWebhook = async (planId) => {
    return await api.post('/backoffice/suscripciones/webhook', { data: { id: 'simulado' }, planId: planId });
};
