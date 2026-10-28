import api from './axios';

export const sparePartApi = {
  getAll: async (params = {}) => {
    const res = await api.get('/spare-parts/', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/spare-parts/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/spare-parts/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/spare-parts/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/spare-parts/${id}/`);
    return res.data;
  },
  adjustStock: async (id, delta, type = 'ADJUSTMENT', notes = '') => {
    const res = await api.post(`/spare-parts/${id}/adjust_stock/`, {
      delta,
      type,
      notes
    });
    return res.data;
  }
};
