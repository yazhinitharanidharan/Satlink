import { apiClient } from './api';
import { satellites as mockSatellites } from '../data/mockData';

const USE_MOCK = true;

export const satellitesService = {
  async getAll() {
    if (USE_MOCK) {
      return { data: mockSatellites, source: 'mock' };
    }
    const data = await apiClient.get('/satellites');
    return { data, source: 'api' };
  },

  async getById(id) {
    if (USE_MOCK) {
      const sat = mockSatellites.find(s => s.sat_id === parseInt(id));
      return { data: sat, source: 'mock' };
    }
    const data = await apiClient.get(`/satellites/${id}`);
    return { data, source: 'api' };
  },

  async create(satellite) {
    if (USE_MOCK) {
      const newSat = { ...satellite, sat_id: Date.now() };
      mockSatellites.push(newSat);
      return { data: newSat, source: 'mock' };
    }
    const data = await apiClient.post('/satellites', satellite);
    return { data, source: 'api' };
  },

  async update(id, satellite) {
    if (USE_MOCK) {
      const index = mockSatellites.findIndex(s => s.sat_id === parseInt(id));
      if (index >= 0) {
        mockSatellites[index] = { ...mockSatellites[index], ...satellite };
        return { data: mockSatellites[index], source: 'mock' };
      }
      throw new Error('Satellite not found');
    }
    const data = await apiClient.put(`/satellites/${id}`, satellite);
    return { data, source: 'api' };
  },

  async delete(id) {
    if (USE_MOCK) {
      const index = mockSatellites.findIndex(s => s.sat_id === parseInt(id));
      if (index >= 0) {
        mockSatellites.splice(index, 1);
        return { success: true, source: 'mock' };
      }
      throw new Error('Satellite not found');
    }
    await apiClient.delete(`/satellites/${id}`);
    return { success: true, source: 'api' };
  },
};
