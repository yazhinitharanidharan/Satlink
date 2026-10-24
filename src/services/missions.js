import { apiClient } from './api';
import { missions as mockMissions } from '../data/mockData';

const USE_MOCK = true; // Set to false when backend is available

export const missionsService = {
  async getAll() {
    if (USE_MOCK) {
      return { data: mockMissions, source: 'mock' };
    }
    try {
      const data = await apiClient.get('/missions');
      return { data, source: 'api' };
    } catch (error) {
      console.error('Failed to fetch missions:', error);
      throw error;
    }
  },

  async getById(id) {
    if (USE_MOCK) {
      const mission = mockMissions.find(m => m.mission_id === parseInt(id));
      return { data: mission, source: 'mock' };
    }
    const data = await apiClient.get(`/missions/${id}`);
    return { data, source: 'api' };
  },

  async create(mission) {
    if (USE_MOCK) {
      const newMission = { ...mission, mission_id: Date.now() };
      mockMissions.push(newMission);
      return { data: newMission, source: 'mock' };
    }
    const data = await apiClient.post('/missions', mission);
    return { data, source: 'api' };
  },

  async update(id, mission) {
    if (USE_MOCK) {
      const index = mockMissions.findIndex(m => m.mission_id === parseInt(id));
      if (index >= 0) {
        mockMissions[index] = { ...mockMissions[index], ...mission };
        return { data: mockMissions[index], source: 'mock' };
      }
      throw new Error('Mission not found');
    }
    const data = await apiClient.put(`/missions/${id}`, mission);
    return { data, source: 'api' };
  },

  async delete(id) {
    if (USE_MOCK) {
      const index = mockMissions.findIndex(m => m.mission_id === parseInt(id));
      if (index >= 0) {
        mockMissions.splice(index, 1);
        return { success: true, source: 'mock' };
      }
      throw new Error('Mission not found');
    }
    await apiClient.delete(`/missions/${id}`);
    return { success: true, source: 'api' };
  },
};
