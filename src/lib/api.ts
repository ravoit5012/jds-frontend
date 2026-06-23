import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),

  verify2fa: (code: string) =>
    api.post('/auth/2fa/verify', { code }).then((r) => r.data),

  setup2fa: () => api.get('/auth/2fa/setup').then((r) => r.data),

  enable2fa: (code: string) =>
    api.post('/auth/2fa/enable', { code }).then((r) => r.data),

  disable2fa: (code: string) =>
    api.post('/auth/2fa/disable', { code }).then((r) => r.data),
};

export const jdsApi = {
  list: (params: Record<string, any>) =>
    api.get('/jds', { params }).then((r) => r.data),

  get: (id: string) => api.get(`/jds/${id}`).then((r) => r.data),

  stats: () => api.get('/jds/stats').then((r) => r.data),

  filters: () => api.get('/jds/filters').then((r) => r.data),
};

export const userApi = {
  me: () => api.get('/users/me').then((r) => r.data),

  savedJds: () => api.get('/users/saved-jds').then((r) => r.data),

  toggleSave: (jdId: string) =>
    api.post(`/users/saved-jds/${jdId}`).then((r) => r.data),

  all: () => api.get('/users').then((r) => r.data),

  toggleActive: (id: string) =>
    api.patch(`/users/${id}/toggle-active`).then((r) => r.data),

  approve: (id: string) =>
    api.patch(`/users/${id}/approve`).then((r) => r.data),

  reject: (id: string) =>
    api.patch(`/users/${id}/reject`).then((r) => r.data),
};
