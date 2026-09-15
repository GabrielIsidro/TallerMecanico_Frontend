import api from '../../../lib/axiosConfig';

export const getClientes = async (page = 0, size = 10, search = '') => {
    return await api.get(`/talleres/clientes?page=${page}&size=${size}&search=${search}`);
};

export const createCliente = async (data) => {
    return await api.post('/talleres/clientes', data);
};

export const updateCliente = async (id, data) => {
    return await api.put(`/talleres/clientes/${id}`, data);
};

export const deleteCliente = async (id) => {
    return await api.delete(`/talleres/clientes/${id}`);
};

export const getVehiculos = async () => {
    return await api.get('/talleres/vehiculos');
};

export const createVehiculo = async (data) => {
    return await api.post('/talleres/vehiculos', data);
};

export const updateVehiculo = async (id, data) => {
    return await api.put(`/talleres/vehiculos/${id}`, data);
};

export const deleteVehiculo = async (id) => {
    return await api.delete(`/talleres/vehiculos/${id}`);
};

export const getServicios = async () => {
    return await api.get('/talleres/servicios');
};

export const createServicio = async (data) => {
    return await api.post('/talleres/servicios', data);
};

export const updateServicio = async (id, data) => {
    return await api.put(`/talleres/servicios/${id}`, data);
};

export const deleteServicio = async (id) => {
    return await api.delete(`/talleres/servicios/${id}`);
};

export const importServicios = async (formData) => {
    return await api.post('/talleres/servicios/importar', formData);
};

export const getOrdenes = async (page = 0, size = 10) => {
    return await api.get(`/talleres/ordenes?page=${page}&size=${size}`);
};

export const createOrden = async (data) => {
    return await api.post('/talleres/ordenes', data);
};

export const updateOrden = async (id, data) => {
    return await api.put(`/talleres/ordenes/${id}`, data);
};

export const updateEstadoOrden = async (id, estado) => {
    return await api.patch(`/talleres/ordenes/${id}/estado?estado=${estado}`);
};

export const updatePagoOrden = async (id, formaPago) => {
    return await api.patch(`/talleres/ordenes/${id}/pago?formaPago=${formaPago}`);
};

export const getOrdenPdf = async (id) => {
    return await api.get(`/talleres/ordenes/${id}/pdf`, { responseType: 'blob' });
};

export const getRepuestos = async () => {
    return await api.get('/talleres/repuestos');
};

export const createRepuesto = async (data) => {
    return await api.post('/talleres/repuestos', data);
};

export const updateRepuesto = async (id, data) => {
    return await api.put(`/talleres/repuestos/${id}`, data);
};

export const deleteRepuesto = async (id) => {
    return await api.delete(`/talleres/repuestos/${id}`);
};

export const getEquipo = async () => {
    return await api.get('/talleres/usuarios/equipo');
};

export const createMiembroEquipo = async (data) => {
    return await api.post('/talleres/usuarios/equipo', data);
};

export const deleteMiembroEquipo = async (id) => {
    return await api.delete(`/talleres/usuarios/equipo/${id}`);
};

export const getMiPerfil = async () => {
    return await api.get('/talleres/usuarios/me');
};

export const updateMiPerfil = async (data) => {
    return await api.post('/talleres/usuarios/actualizar-perfil', data);
};
