import api from './axios';

export const getPatients = () => api.get('/logistics/patients');
export const createPatient = (data) => api.post('/logistics/patients', data);
export const getAppointments = () => api.get('/logistics/appointments');
export const createAppointment = (data) => api.post('/logistics/appointments', data);
export const admitPatient = (data) => api.post('/logistics/admit', data);
export const getAvailableBeds = () => api.get('/logistics/beds/available');
export const getDoctors = () => api.get('/logistics/doctors');
export const getNurses = () => api.get('/logistics/nurses');
export const getActiveVisits = () => api.get('/logistics/visits/active');
