import { apiClient } from './api';
import { telemetryLogs as mockTelemetry, telemetryTrendData } from '../data/mockData';

const USE_MOCK = true;

export const telemetryService = {
  async getAll() {
    if (USE_MOCK) {
      return { data: mockTelemetry, source: 'mock' };
    }
    const data = await apiClient.get('/telemetry');
    return { data, source: 'api' };
  },

  async getTrend() {
    if (USE_MOCK) {
      return { data: telemetryTrendData, source: 'mock' };
    }
    const data = await apiClient.get('/telemetry/trend');
    return { data, source: 'api' };
  },
};
