import { apiClient } from './api';
import { alerts as mockAlerts } from '../data/mockData';

const USE_MOCK = true;

export const alertsService = {
  async getAll() {
    if (USE_MOCK) {
      return { data: mockAlerts, source: 'mock' };
    }
    const data = await apiClient.get('/alerts');
    return { data, source: 'api' };
  },

  async acknowledge(id) {
    if (USE_MOCK) {
      const alert = mockAlerts.find(a => a.alert_id === parseInt(id));
      if (alert) alert.status = 'acknowledged';
      return { success: true, source: 'mock' };
    }
    const data = await apiClient.patch(`/alerts/${id}/acknowledge`);
    return { success: true, data, source: 'api' };
  },

  async resolve(id) {
    if (USE_MOCK) {
      const alert = mockAlerts.find(a => a.alert_id === parseInt(id));
      if (alert) alert.status = 'resolved';
      return { success: true, source: 'mock' };
    }
    const data = await apiClient.patch(`/alerts/${id}/resolve`);
    return { success: true, data, source: 'api' };
  },
};
