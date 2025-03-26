import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const logError = async (error: Error, errorInfo: any) => {
  try {
    await axios.post(`${API_URL}/errors/log`, {
      message: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  } catch (err) {
    console.error('Failed to log error to backend:', err);
  }
};