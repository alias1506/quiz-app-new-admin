import axios from 'axios';

// Create axios instance with base configuration
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  checkAuth: () => api.get('/auth/check'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  delete: (id) => api.delete(`/users/${id}`),
  bulkDelete: (ids) => api.post('/users/bulk-delete', { ids }),
  create: (data) => api.post('/users', data),
  getStats: () => api.get('/users/stats/summary'),
};

// Questions API
export const questionsAPI = {
  getAll: () => api.get('/questions'),
  getBySet: (setId, includeInactive = false) =>
    api.get(`/questions/by-set/${setId}`, { params: { includeInactive } }),
  create: (question) => api.post('/questions', question),
  update: (id, question) => api.put(`/questions/${id}`, question),
  delete: (id) => api.delete(`/questions/${id}`),
  bulkDelete: (ids) => api.post('/questions/bulk-delete', { ids }),
  generateAI: (data) => api.post('/questions/generate-ai', data),
  saveGenerated: (questions) => api.post('/questions/save-generated', { questions }),
};

// Sets API
export const setsAPI = {
  getAll: () => api.get('/sets'),
  getById: (id) => api.get(`/sets/${id}`),
  create: (set) => api.post('/sets', set),
  update: (id, set) => api.put(`/sets/${id}`, set),
  delete: (id) => api.delete(`/sets/${id}`),
  bulkDelete: (ids) => api.post('/sets/bulk-delete', { ids }),
  toggleActive: (id) => api.put(`/sets/${id}/toggle-active`),
};

// Rounds API
export const roundsAPI = {
  getAll: () => api.get('/rounds'),
  getById: (id) => api.get(`/rounds/${id}`),
  create: (round) => api.post('/rounds', round),
  update: (id, round) => api.put(`/rounds/${id}`, round),
  delete: (id) => api.delete(`/rounds/${id}`),
  publish: (id) => api.put(`/rounds/${id}/publish`),
  getByQuiz: (quizId) => api.get(`/rounds/by-quiz/${quizId}`),
  generateDescription: (roundName) => api.post('/rounds/generate-description', { roundName }),
};

// Quizzes API
export const quizzesAPI = {
  getAll: () => api.get('/quizzes'),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (quiz) => api.post('/quizzes', quiz),
  update: (id, quiz) => api.put(`/quizzes/${id}`, quiz),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

export default api;
