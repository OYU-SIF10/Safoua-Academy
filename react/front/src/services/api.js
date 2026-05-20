import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// ─── Injecter le token automatiquement dans chaque requête ─────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Gérer les erreurs 401 globalement ────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const register = (formData) => API.post('/users/register', formData);
export const login = (data) => API.post('/users/login', data);
export const getMe = () => API.get('/users/me');

// ─── Cours ────────────────────────────────────────────────────────────────
export const getCourses = (params) => API.get('/courses', { params });
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const getMyCourses = () => API.get('/courses/my-courses');
export const createCourse = (formData) => API.post('/courses', formData);
export const updateCourse = (id, formData) => API.put(`/courses/${id}`, formData);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const togglePublish = (id) => API.patch(`/courses/${id}/publish`);

// ─── Leçons ───────────────────────────────────────────────────────────────
export const getLessons = (courseId) => API.get(`/courses/${courseId}/lessons`);
export const getLessonById = (courseId, lessonId) =>
  API.get(`/courses/${courseId}/lessons/${lessonId}`);
export const createLesson = (courseId, formData) =>
  API.post(`/courses/${courseId}/lessons`, formData);

// ─── Inscriptions ─────────────────────────────────────────────────────────
export const enrollCourse = (courseId) => API.post(`/enrollments/${courseId}`);
export const getMyEnrollments = () => API.get('/enrollments/my-courses');
export const getCourseProgress = (courseId) =>
  API.get(`/enrollments/${courseId}/progress`);
export const completeLesson = (courseId, lessonId, data) =>
  API.patch(`/enrollments/${courseId}/lessons/${lessonId}/complete`, data);

// ─── Performance ──────────────────────────────────────────────────────────
export const getMyRapport = (courseId) =>
  API.get(`/performance/${courseId}/rapport`);

// ─── Paiements ────────────────────────────────────────────────────────────
export const createCheckoutSession = (courseId) =>
  API.post('/payments/create-checkout-session', { courseId });

export default API;