import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const getDashboardTodos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request.get(`/dashboard/todos${qs ? `?${qs}` : ''}`).then(res => res.data);
};

export const getCityList = () => {
  return request.get('/dashboard/cities/list').then(res => res.data);
};

export const getStoreList = (cityCode) => {
  const qs = cityCode ? `?cityCode=${cityCode}` : '';
  return request.get(`/dashboard/stores${qs}`).then(res => res.data);
};

export const getDashboardStats = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request.get(`/dashboard/stats${qs ? `?${qs}` : ''}`).then(res => res.data);
};

export const getDashboardToday = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request.get(`/dashboard/today${qs ? `?${qs}` : ''}`).then(res => res.data);
};

export const getDashboardTrend = (periodOrParams) => {
  let params = {};
  if (typeof periodOrParams === 'string') {
    params.period = periodOrParams;
  } else if (typeof periodOrParams === 'object') {
    params = periodOrParams;
  }
  const qs = new URLSearchParams(params).toString();
  return request.get(`/dashboard/trend${qs ? `?${qs}` : ''}`).then(res => res.data);
};

export const getDashboardCities = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request.get(`/dashboard/cities${qs ? `?${qs}` : ''}`).then(res => res.data);
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
