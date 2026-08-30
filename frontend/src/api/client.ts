import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error intercepted:', error);
    // Return early if there's no response
    if (!error.response) {
      return Promise.reject({ message: 'Network error, please check your connection.' });
    }
    
    return Promise.reject(error.response.data);
  }
);
