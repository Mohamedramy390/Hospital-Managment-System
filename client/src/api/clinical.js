import api from './axios';

export const addDiagnosis = (data) => api.post('/clinical/diagnosis', data);
export const getPatientHistory = (id) => api.get(`/clinical/history/${id}`);
export const getActiveVisit = (id) => api.get(`/clinical/visit/active/${id}`);
export const getMyPatients = () => api.get('/clinical/my-patients');

// New combined operations
export const addDiagnosisWithNotes = (data) => api.post('/clinical/diagnosis-with-notes', data);
export const addTreatmentPlanWithTasks = (data) => api.post('/clinical/treatment-plans-with-tasks', data);

// Doctor notes
export const addDoctorNote = (data) => api.post('/clinical/notes', data);
export const getDoctorNotesByVisit = (visitId) => api.get(`/clinical/notes/visit/${visitId}`);
export const getDoctorNotesByPatient = (patientId) => api.get(`/clinical/notes/patient/${patientId}`);

// Treatment plans
export const addTreatmentPlan = (data) => api.post('/clinical/treatment-plans', data);
export const getTreatmentPlansByVisit = (visitId) => api.get(`/clinical/treatment-plans/visit/${visitId}`);
export const getTreatmentPlansByPatient = (patientId) => api.get(`/clinical/treatment-plans/patient/${patientId}`);
