import axios from 'axios';

const resolveBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured && configured.trim()) return configured.trim();
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${window.location.hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
};

const BASE_URL = resolveBaseUrl();
type QueryValue = string | number | boolean;
type QueryParams = Record<string, QueryValue>;
const isValidEntityId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value !== 'undefined' && value !== 'null';
const encodeStorageKey = (fileKey: string) =>
  fileKey.split('/').map(encodeURIComponent).join('/');

const storagePublicUrl = (fileKey: string) =>
  `${BASE_URL.replace(/\/+$/, '')}/storage/public/${encodeStorageKey(fileKey)}`;

const extractR2FileKey = (url: string) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('.r2.cloudflarestorage.com')) return null;
    const parts = parsed.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join('/') : null;
  } catch {
    return null;
  }
};

// Pull the underlying file key out of any URL that points at our storage
// proxy, regardless of which host the URL was originally generated against
// (localhost during dev, a LAN IP, an old deploy host, etc.). This is what
// allows the same DB row to render correctly on any device.
const extractStorageKeyFromUrl = (url: string): string | null => {
  const m = url.match(/\/(?:api\/v1\/)?storage\/public\/(.+)$/);
  if (!m || !m[1]) return null;
  try {
    return m[1].split('/').map(decodeURIComponent).join('/');
  } catch {
    return m[1];
  }
};

/**
 * Resolve any stored file reference to a URL that works on the current device.
 *
 * Accepts:
 *   - bare file keys           "families/abc/photos/xyz.jpg"
 *   - relative API paths       "/api/v1/storage/public/<key>"
 *   - absolute proxy URLs      "http://localhost:8000/api/v1/storage/public/<key>"
 *                              "http://192.168.1.10:8000/api/v1/storage/public/<key>"
 *                              "https://saiban-backend.example.com/api/v1/storage/public/<key>"
 *   - direct R2 URLs           "https://<acct>.r2.cloudflarestorage.com/<bucket>/<key>"
 *   - data: / blob: URLs       passed through unchanged
 *
 * Always re-points proxy URLs at the CURRENT BASE_URL so a photo uploaded on
 * one device is viewable on every device.
 */
export const normalizeStorageUrl = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return '';

  if (/^(blob:|data:)/i.test(trimmed)) return trimmed;

  const r2Key = extractR2FileKey(trimmed);
  if (r2Key) return storagePublicUrl(r2Key);

  const proxyKey = extractStorageKeyFromUrl(trimmed);
  if (proxyKey) return storagePublicUrl(proxyKey);

  if (!/^https?:/i.test(trimmed)) {
    const key = trimmed.replace(/^\/+/, '');
    return storagePublicUrl(key);
  }

  return trimmed;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshRequest: Promise<string | null> | null = null;

const isBrowser = () => typeof window !== 'undefined';

const clearAuthStorage = () => {
  if (!isBrowser()) return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

const redirectToLogin = () => {
  if (!isBrowser()) return;
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!isBrowser()) return null;
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const nextAccessToken = response.data?.access_token as string | undefined;
    const nextRefreshToken = response.data?.refresh_token as string | undefined;

    if (!nextAccessToken) return null;

    localStorage.setItem('access_token', nextAccessToken);
    if (nextRefreshToken) {
      localStorage.setItem('refresh_token', nextRefreshToken);
    }
    return nextAccessToken;
  } catch {
    return null;
  }
};

// Attach token on every request
api.interceptors.request.use((config) => {
  if (isBrowser()) {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as {
      _retry?: boolean;
      url?: string;
      headers?: Record<string, string>;
    };
    const requestUrl = originalRequest?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

    if (status === 401 && isBrowser() && !isAuthRoute && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (!refreshRequest) {
        refreshRequest = refreshAccessToken().finally(() => {
          refreshRequest = null;
        });
      }

      const newAccessToken = await refreshRequest;
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }

      clearAuthStorage();
      redirectToLogin();
    } else if (status === 401 && isBrowser() && isAuthRoute) {
      clearAuthStorage();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  me: () => api.get('/auth/me'),
};

// ── Families ──────────────────────────────────────────
export const familiesAPI = {
  list: (params?: QueryParams) => api.get('/families', { params }),
  get: (id: string) => isValidEntityId(id)
    ? api.get(`/families/${id}`)
    : Promise.reject(new Error('Invalid family ID')),
  create: (data: Record<string, unknown>) => api.post('/families', data),
  update: (id: string, data: Record<string, unknown>) => isValidEntityId(id)
    ? api.put(`/families/${id}`, data)
    : Promise.reject(new Error('Invalid family ID')),
  delete: (id: string, options?: { force?: boolean }) => isValidEntityId(id)
    ? api.delete(`/families/${id}`, { params: { force: Boolean(options?.force) } })
    : Promise.reject(new Error('Invalid family ID')),
};

// ── Individuals ───────────────────────────────────────
export const individualsAPI = {
  list: (familyOrParams?: string | QueryParams) => {
    if (isValidEntityId(familyOrParams)) {
      return api.get('/individuals', { params: { family_id: familyOrParams } });
    }
    if (familyOrParams && typeof familyOrParams === 'object') {
      return api.get('/individuals', { params: familyOrParams });
    }
    return api.get('/individuals');
  },
  get: (id: string) => isValidEntityId(id)
    ? api.get(`/individuals/${id}`)
    : Promise.reject(new Error('Invalid individual ID')),
  search: (query: string) => api.get('/individuals/search', { params: { q: query } }),
  create: (data: Record<string, unknown>) => api.post('/individuals', data),
  update: (id: string, data: Record<string, unknown>) => isValidEntityId(id)
    ? api.put(`/individuals/${id}`, data)
    : Promise.reject(new Error('Invalid individual ID')),
  delete: (id: string) => isValidEntityId(id)
    ? api.delete(`/individuals/${id}`)
    : Promise.reject(new Error('Invalid individual ID')),
};

// ── Orphans ───────────────────────────────────────────
export const orphansAPI = {
  list: (params?: QueryParams) => api.get('/orphans', { params }),
  search: (query: string) => api.get('/orphans/search', { params: { q: query } }),
  get: (id: string) => isValidEntityId(id)
    ? api.get(`/orphans/${id}`)
    : Promise.reject(new Error('Invalid orphan profile ID')),
  create: (data: Record<string, unknown>) => api.post('/orphans', data),
  update: (id: string, data: Record<string, unknown>) => isValidEntityId(id)
    ? api.put(`/orphans/${id}`, data)
    : Promise.reject(new Error('Invalid orphan profile ID')),
  delete: (id: string) => isValidEntityId(id)
    ? api.delete(`/orphans/${id}`)
    : Promise.reject(new Error('Invalid orphan profile ID')),
};

// ── Assessments ───────────────────────────────────────
export const assessmentsAPI = {
  list: (params?: QueryParams) => api.get('/assessments', { params }),
  get: (id: string) => api.get(`/assessments/${id}`),
  create: (data: Record<string, unknown>) => api.post('/assessments', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/assessments/${id}`, data),
  delete: (id: string) => api.delete(`/assessments/${id}`),
  submit: (id: string) => api.post(`/assessments/${id}/submit`),
  uploadDocument: (assessmentId: string, payload: { document_type: string; file: File; individual_id?: string }) => {
    if (!isValidEntityId(assessmentId)) {
      return Promise.reject(new Error('Invalid assessment ID'));
    }
    const formData = new FormData();
    formData.append('document_type', payload.document_type);
    formData.append('file', payload.file);
    if (isValidEntityId(payload.individual_id)) {
      formData.append('individual_id', payload.individual_id);
    }
    return api.post(`/assessments/${assessmentId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listDocuments: (assessmentId: string, individualId?: string) => {
    if (!isValidEntityId(assessmentId)) {
      return Promise.reject(new Error('Invalid assessment ID'));
    }
    const params = isValidEntityId(individualId) ? { individual_id: individualId } : {};
    return api.get(`/assessments/${assessmentId}/documents`, { params });
  },
};

// ── Scoring ───────────────────────────────────────────
export const scoringAPI = {
  calculate: (assessmentId: string, recalculate = false) =>
    api.post('/scoring/calculate', { assessment_id: assessmentId, recalculate }),
  listCriteria: () => api.get('/scoring/criteria'),
  createCriteria: (data: {
    name: string;
    weight: number;
    category_applicable: string;
    description?: string;
    min_score?: number;
    max_score?: number;
    scoring_rules?: Record<string, unknown>;
  }) => api.post('/scoring/criteria', data),
  listResults: (params?: QueryParams) => api.get('/scoring/results', { params }),
  getResult: (resultId: string) => api.get(`/scoring/results/${resultId}`),
  override: (resultId: string, data: Record<string, unknown>) =>
    api.put(`/scoring/results/${resultId}/override`, data),
};

// ── Approvals ─────────────────────────────────────────
export const approvalsAPI = {
  list: (params?: QueryParams) => api.get('/approvals', { params }),
  queue: (params?: QueryParams) => api.get('/approvals/queue', { params }),
  get: (id: string) => api.get(`/approvals/${id}`),
  decide: (assessmentId: string, data: { decision: string; remarks?: string }) =>
    api.post('/approvals/workflow', { assessment_id: assessmentId, ...data }),
};

// ── Donors ────────────────────────────────────────────
export const donorsAPI = {
  list: (params?: QueryParams) => api.get('/donors', { params }),
  get: (id: string) => api.get(`/donors/${id}`),
  create: (data: Record<string, unknown>) => api.post('/donors', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/donors/${id}`, data),
  analytics: () => api.get('/donors/analytics'),
};

// ── Sponsorships ──────────────────────────────────────
export const sponsorshipsAPI = {
  list: (params?: QueryParams) => api.get('/sponsorships', { params }),
  create: (data: Record<string, unknown>) => api.post('/sponsorships', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/sponsorships/${id}`, data),
  expiring: (days: number) => api.get(`/sponsorships/expiring?days=${days}`),
};

// ── Payments ──────────────────────────────────────────
export const paymentsAPI = {
  list: (params?: QueryParams) => api.get('/payments', { params }),
  create: (data: Record<string, unknown>) => api.post('/payments', data),
  receipt: (id: string) => api.post(`/payments/${id}/receipt`),
  analytics: () => api.get('/payments/analytics'),
};

// ── Reports ───────────────────────────────────────────
export const reportsAPI = {
  list: (params?: QueryParams) => api.get('/reports', { params }),
  listByFamily: (familyId: string, params?: QueryParams) =>
    api.get(`/reports/family/${familyId}/reports`, { params }),
  create: (data: Record<string, unknown>) => api.post('/reports', data),
  analytics: () => api.get('/reports/analytics'),
};

// ── Alerts ────────────────────────────────────────────
export const alertsAPI = {
  list: (params?: QueryParams) => api.get('/alerts', { params }),
  create: (data: Record<string, unknown>) => api.post('/alerts', data),
  resolve: (id: string, resolutionNotes = 'Resolved from the dashboard') =>
    api.post(`/alerts/${id}/resolve`, { alert_id: id, resolution_notes: resolutionNotes }),
  autoGenerate: () => api.post('/alerts/auto-generate'),
  analytics: () => api.get('/alerts/analytics'),
};

// ── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
};

// ── Users ─────────────────────────────────────────────
export const usersAPI = {
  list: () => api.get('/users'),
  create: (data: Record<string, unknown>) => api.post('/users/', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
};

// ── Storage (R2) ───────────────────────────────────────
export const storageAPI = {
  publicFileUrl: storagePublicUrl,
  uploadMemberPhoto: (familyId: string, file: File) => {
    if (!isValidEntityId(familyId)) {
      return Promise.reject(new Error('Invalid family ID'));
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('family_id', familyId);
    formData.append('document_type', 'photo');
    return api.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
