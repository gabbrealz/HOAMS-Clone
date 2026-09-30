import { apiClient } from './apiClient';

// Create a new staff account
export const createStaffAccount = async (data) => {
  return apiClient('/users/staff/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// User login
export const login = async (data) => {
  return apiClient('/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
};

// User logout
export const logout = async () => {
  return apiClient('/users/logout/', { method: 'POST' });
};

// List users with optional role/status filters
export const listUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/users/?${query}` : '/users/';
  return apiClient(url);
};

// Get the authenticated user
export const getAuthenticatedUser = async (id) => {
  return apiClient(`/users/me/`);
};

// Get a single user
export const getUser = async (id) => {
  return apiClient(`/users/${id}/`);
};

// Update a user (PATCH)
export const updateUser = async (id, data) => {
  return apiClient(`/users/${id}/edit/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// Update a user's role
export const updateRole = async (id, roles) => {
  return apiClient(`/users/${id}/role/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles }),
  });
};

// Delete a user
export const deleteUser = async (id) => {
  return apiClient(`/users/${id}/delete/`, { method: 'DELETE' });
};
