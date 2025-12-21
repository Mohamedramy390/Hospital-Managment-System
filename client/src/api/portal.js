import api from './axios';

export const getMyVisits = () => api.get('/portal/visits');
export const getMyResults = () => api.get('/portal/results');
export const getMyInvoices = () => api.get('/portal/invoices');
export const getMyAppointments = () => api.get('/portal/appointments');
export const getMyPrescriptions = () => api.get('/portal/prescriptions');
export const getMyDiagnoses = () => api.get('/portal/diagnoses');
export const getMyInsuranceClaims = () => api.get('/insurance/my-claims');
export const portalPayPayment = (data) => api.post('/portal/pay', data);
