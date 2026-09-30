import { apiClient } from './apiClient';

export const listResidents = async () => {
  return apiClient('/residents/');
};

export const getResident = async (id) => {
  return apiClient(`/residents/${id}/`);
};
