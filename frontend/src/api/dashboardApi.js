import api from './axios';

export const dashboardApi = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats/');
    return res.data;
  },
};

export const reportApi = {
  getReportsData: async () => {
    const res = await api.get('/reports/data/');
    return res.data;
  },
};
