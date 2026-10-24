import { apiClient } from './api';
import { groundStations as mockGS } from '../data/mockData';

const USE_MOCK = true;

export const groundStationsService = {
  async getAll() {
    if (USE_MOCK) {
      return { data: mockGS, source: 'mock' };
    }
    const data = await apiClient.get('/ground-stations');
    return { data, source: 'api' };
  },
};
