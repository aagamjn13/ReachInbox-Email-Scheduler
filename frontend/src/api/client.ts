import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return early if there's no response
    if (!error.response) {
      return Promise.reject({ message: 'Network error, please check your connection.' });
    }
    
    return Promise.reject(error.response.data);
  }
);
