import api from './axios';

export const workOrderApi = {
  getAll: async (params = {}) => {
    const res = await api.get('/work-orders/', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/work-orders/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/work-orders/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/work-orders/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/work-orders/${id}/`);
    return res.data;
  },
  addTask: async (orderId, description) => {
    const res = await api.post(`/work-orders/${orderId}/add_task/`, { description });
    return res.data;
  },
  toggleTask: async (orderId, taskId) => {
    const res = await api.post(`/work-orders/${orderId}/toggle_task/`, { task_id: taskId });
    return res.data;
  },
  usePart: async (orderId, partId, quantity, notes) => {
    const res = await api.post(`/work-orders/${orderId}/use_part/`, {
      part_id: partId,
      quantity,
      notes
    });
    return res.data;
  },
  markComplete: async (orderId) => {
    const res = await api.post(`/work-orders/${orderId}/mark_complete/`);
    return res.data;
  }
};
