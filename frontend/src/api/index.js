import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const getDashboardStats = () => {
  return request.get('/dashboard/stats').then(res => res.data);
};
