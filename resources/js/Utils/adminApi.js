import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin',
  withCredentials: true,
});

export default api;
