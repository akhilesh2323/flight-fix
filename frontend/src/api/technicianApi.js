import api from './axios';

export const technicianApi = {
  getAll: async () => {
    const res = await api.get('/technicians/');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/technicians/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/technicians/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/technicians/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/technicians/${id}/`);
    return res.data;
  }
};
