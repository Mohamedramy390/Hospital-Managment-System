import api from './axios';

export const getInsuranceProviders = () => api.get('/insurance/providers');
export const addInsuranceProvider = (data) => api.post('/insurance/providers', data);

export const getAllClaims = () => api.get('/insurance/claims');
export const getPendingClaims = () => api.get('/insurance/claims/pending');
export const getClaimDetails = (claimId) => api.get(`/insurance/claims/${claimId}`);
export const getClaimHistory = (claimId) => api.get(`/insurance/claims/${claimId}/history`);

export const createClaim = (data) => api.post('/insurance/claims', data);
export const updateClaimStatus = (data) => api.post('/insurance/claims/status', data);
export const processApprovedClaim = (data) => api.post('/insurance/claims/process-approved', data);
