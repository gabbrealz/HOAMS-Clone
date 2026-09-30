const API_BASE_URL =  import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Inline helper to read cookie values from document.cookie
const getCookie = (name) => {
  if (typeof document === 'undefined' || !document.cookie) return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
};

export const getBaseUrl = (endpoint) => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`
}

export const apiClient = async (endpoint, options = {}) => {
  const csrfToken = getCookie('csrftoken');
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(csrfToken && { 'X-CSRFToken': csrfToken }), // Only attach header if token exists
  };

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Sends HttpOnly auth cookie on every request
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }

  return response.json();
};