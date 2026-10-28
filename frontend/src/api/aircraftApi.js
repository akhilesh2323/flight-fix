import api from './axios';

export const aircraftApi = {
  getAll: async () => {
    const res = await api.get('/aircraft/');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/aircraft/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/aircraft/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/aircraft/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/aircraft/${id}/`);
    return res.data;
  },
  getComponents: async (id) => {
    const res = await api.get(`/aircraft/${id}/components/`);
    return res.data;
  },
  getMaintenanceHistory: async (id) => {
    const res = await api.get(`/aircraft/${id}/maintenance_history/`);
    return res.data;
  },
  updateComponent: async (componentId, data) => {
    const res = await api.patch(`/components/${componentId}/`, data);
    return res.data;
  }
};
