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
