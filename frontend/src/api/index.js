import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const getDashboardStats = () => {
  return request.get('/dashboard/stats').then(res => res.data);
};

export const getDashboardToday = () => {
  return request.get('/dashboard/today').then(res => res.data);
};

export const getDashboardTrend = (period = '14d') => {
  return request.get(`/dashboard/trend?period=${period}`).then(res => res.data);
};

export const getDashboardCities = () => {
  return request.get('/dashboard/cities').then(res => res.data);
};

export const getDashboardTodos = () => {
  return request.get('/dashboard/todos').then(res => res.data);
};

export const getAnnouncements = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request.get(`/announcements${qs ? `?${qs}` : ''}`).then(res => res.data);
};

export const createAnnouncement = (data) => {
  return request.post('/announcements', data).then(res => res.data);
};

export const updateAnnouncement = (id, data) => {
  return request.put(`/announcements/${id}`, data).then(res => res.data);
};

export const deleteAnnouncement = (id) => {
  return request.delete(`/announcements/${id}`).then(res => res.data);
};

export const getAnnouncementTypes = () => {
  return request.get('/announcements/types').then(res => res.data);
};
