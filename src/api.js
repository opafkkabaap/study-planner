// src/api.js
//
// Single Axios instance used by every component.
// Token is attached automatically via the request interceptor.
// A response interceptor logs 401s out automatically.

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// ── Attach JWT on every request ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token'); // "sp" = study-planner namespace
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-logout on 401 (expired / invalid token) ────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
