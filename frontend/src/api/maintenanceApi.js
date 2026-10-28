import api from './axios';

export const maintenanceApi = {
  getAll: async (params = {}) => {
    const res = await api.get('/maintenance/', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/maintenance/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/maintenance/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/maintenance/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/maintenance/${id}/`);
    return res.data;
  }
};
