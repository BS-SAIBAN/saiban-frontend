import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// ── Families ──────────────────────────────────────────
export const familiesAPI = {
  list: (params?: Record<string, string>) => api.get('/families', { params }),
  get: (id: string) => api.get(`/families/${id}`),
  create: (data: Record<string, unknown>) => api.post('/families', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/families/${id}`, data),
  delete: (id: string) => api.delete(`/families/${id}`),
};

// ── Individuals ───────────────────────────────────────
export const individualsAPI = {
  list: (familyId?: string) => api.get('/individuals', { params: familyId ? { family_id: familyId } : {} }),
  create: (data: Record<string, unknown>) => api.post('/individuals', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/individuals/${id}`, data),
  delete: (id: string) => api.delete(`/individuals/${id}`),
};

// ── Orphans ───────────────────────────────────────────
export const orphansAPI = {
  list: (familyId?: string) => api.get('/orphans', { params: familyId ? { family_id: familyId } : {} }),
  get: (id: string) => api.get(`/orphans/${id}`),
  create: (data: Record<string, unknown>) => api.post('/orphans', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/orphans/${id}`, data),
};

// ── Assessments ───────────────────────────────────────
export const assessmentsAPI = {
  list: (params?: Record<string, string>) => api.get('/assessments', { params }),
  get: (id: string) => api.get(`/assessments/${id}`),
  create: (data: Record<string, unknown>) => api.post('/assessments', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/assessments/${id}`, data),
  submit: (id: string) => api.post(`/assessments/${id}/submit`),
};

// ── Scoring ───────────────────────────────────────────
export const scoringAPI = {
  getResult: (assessmentId: string) => api.get(`/scoring/${assessmentId}`),
  listCriteria: () => api.get('/scoring/criteria'),
  override: (assessmentId: string, data: Record<string, unknown>) =>
    api.post(`/scoring/${assessmentId}/override`, data),
};

// ── Approvals ─────────────────────────────────────────
export const approvalsAPI = {
  list: (params?: Record<string, string>) => api.get('/approvals', { params }),
  get: (id: string) => api.get(`/approvals/${id}`),
  decide: (assessmentId: string, data: Record<string, unknown>) =>
    api.post(`/approvals/assessments/${assessmentId}/decide`, data),
};

// ── Donors ────────────────────────────────────────────
export const donorsAPI = {
  list: (params?: Record<string, string>) => api.get('/donors', { params }),
  get: (id: string) => api.get(`/donors/${id}`),
  create: (data: Record<string, unknown>) => api.post('/donors', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/donors/${id}`, data),
  analytics: () => api.get('/donors/analytics'),
};

// ── Sponsorships ──────────────────────────────────────
export const sponsorshipsAPI = {
  list: (params?: Record<string, string>) => api.get('/sponsorships', { params }),
  create: (data: Record<string, unknown>) => api.post('/sponsorships', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/sponsorships/${id}`, data),
  expiring: (days: number) => api.get(`/sponsorships/expiring?days=${days}`),
};

// ── Payments ──────────────────────────────────────────
export const paymentsAPI = {
  list: (params?: Record<string, string>) => api.get('/payments', { params }),
  create: (data: Record<string, unknown>) => api.post('/payments', data),
  receipt: (id: string) => api.post(`/payments/${id}/receipt`),
  analytics: () => api.get('/payments/analytics'),
};

// ── Reports ───────────────────────────────────────────
export const reportsAPI = {
  list: (params?: Record<string, string>) => api.get('/reports', { params }),
  create: (data: Record<string, unknown>) => api.post('/reports', data),
  analytics: () => api.get('/reports/analytics'),
};

// ── Alerts ────────────────────────────────────────────
export const alertsAPI = {
  list: (params?: Record<string, string>) => api.get('/alerts', { params }),
  create: (data: Record<string, unknown>) => api.post('/alerts', data),
  resolve: (id: string) => api.put(`/alerts/${id}/resolve`),
  autoGenerate: () => api.post('/alerts/auto-generate'),
  analytics: () => api.get('/alerts/analytics'),
};

// ── Users ─────────────────────────────────────────────
export const usersAPI = {
  list: () => api.get('/users'),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
};
