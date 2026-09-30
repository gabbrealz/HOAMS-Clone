import { apiClient, getBaseUrl } from './apiClient';

export const getClaimableUnits = async () => {
  return apiClient('/registrations/claimable-units/');
};

export const submitApplication = async (formData) => {
  return apiClient('/registrations/apply/', {
    method: 'POST',
    body: formData,
  });
};

export const listApplications = async (status) => {
  const url = status ? `/registrations/?status=${status}` : '/registrations/';
  return apiClient(url);
};

export const getApplication = async (id) => {
  return apiClient(`/registrations/${id}/`);
};

export const checkApplicationStatus = async (referenceNo) => {
  return apiClient(`/registrations/${encodeURIComponent(referenceNo)}/`);
};

export const getApplicationIdImage = (id) => {
  return getBaseUrl(`/registrations/${id}/id-document/`);
}

export const downloadIdDocument = async (id) => {
  return apiClient(`/registrations/${id}/id-document/`);
};

export const approveApplication = async (id) => {
  return apiClient(`/registrations/${id}/approve/`, {
    method: 'POST',
  });
};

export const rejectApplication = async (id, reason) => {
  return apiClient(`/registrations/${id}/reject/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
};
