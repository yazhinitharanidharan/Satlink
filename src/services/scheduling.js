import { apiClient } from './api';
import { communicationSessions as mockSessions, schedulingRecommendations as mockRecs } from '../data/mockData';

const USE_MOCK = true;

export const schedulingService = {
  async getSessions() {
    if (USE_MOCK) {
      return { data: mockSessions, source: 'mock' };
    }
    const data = await apiClient.get('/sessions');
    return { data, source: 'api' };
  },

  async createSession(session) {
    if (USE_MOCK) {
      const newSession = { ...session, session_id: `CS-2025-${String(mockSessions.length + 1).padStart(3, '0')}` };
      mockSessions.push(newSession);
      return { data: newSession, source: 'mock', success: true };
    }
    const data = await apiClient.post('/sessions', session);
    return { data, source: 'api', success: true };
  },

  async getRecommendations() {
    if (USE_MOCK) {
      return { data: mockRecs, source: 'mock' };
    }
    const data = await apiClient.get('/recommendations');
    return { data, source: 'api' };
  },

  async acceptRecommendation(id) {
    if (USE_MOCK) {
      const rec = mockRecs.find(r => r.rec_id === parseInt(id));
      if (rec) rec.status = 'accepted';
      return { success: true, source: 'mock' };
    }
    const data = await apiClient.post(`/recommendations/${id}/accept`);
    return { success: true, data, source: 'api' };
  },

  async rejectRecommendation(id) {
    if (USE_MOCK) {
      const rec = mockRecs.find(r => r.rec_id === parseInt(id));
      if (rec) rec.status = 'rejected';
      return { success: true, source: 'mock' };
    }
    const data = await apiClient.post(`/recommendations/${id}/reject`);
    return { success: true, data, source: 'api' };
  },
};
