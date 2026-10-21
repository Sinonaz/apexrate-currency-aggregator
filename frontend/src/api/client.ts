import axios, { type AxiosInstance, type AxiosError } from 'axios';

// Centralized Axios instance with environment variable support
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor for centralized error logging/formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    let errorMessage = 'An unexpected network error occurred';

    if (error.response) {
      const responseData = error.response.data;
      if (responseData?.message) {
        errorMessage = Array.isArray(responseData.message)
          ? responseData.message.join(', ')
          : responseData.message;
      } else {
        errorMessage = `Server Error (${error.response.status}): ${error.response.statusText}`;
      }
    } else if (error.request) {
      errorMessage = 'Could not reach the server at ' + (import.meta.env.VITE_API_URL || 'http://localhost:3000/api') + '. Is the NestJS backend running?';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);
