import api from './axios';

// Lab & Orders
export const createLabOrder = (data) => api.post('/orders/lab/order', data);
export const getLabOrdersByVisit = (visitId) => api.get(`/orders/lab/orders/${visitId}`);
export const addLabResult = (formData) => api.post('/orders/lab/result', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getTestTypes = () => api.get('/orders/lab/test-types');
export const getPendingLabTests = () => api.get('/orders/lab/tests/pending');
export const getLabDevices = () => api.get('/orders/lab/devices');
export const createPrescription = (data) => api.post('/orders/prescription', data);

// Nursing
export const assignNurse = (data) => api.post('/nursing/assign', data);
export const createNurseTask = (data) => api.post('/nursing/task', data);
export const getNurseTasks = () => api.get('/nursing/tasks');
export const getNurseAssignments = () => api.get('/nursing/assignments');
export const completeNurseTask = (taskId) => api.put(`/nursing/task/${taskId}/complete`);
export const getShifts = () => api.get('/nursing/shifts');
export const getMyAttendance = () => api.get('/nursing/attendance');
export const clockIn = (data) => api.post('/nursing/clock-in', data);
export const clockOut = (attendanceId) => api.put(`/nursing/clock-out/${attendanceId}`);

// Finance
export const generateInvoice = (visitId) => api.post(`/finance/invoice/generate/${visitId}`);
export const getInvoice = (invoiceId) => api.get(`/finance/invoice/${invoiceId}`);
export const getVisitInvoices = (visitId) => api.get(`/finance/invoices/visit/${visitId}`);
export const getAllInvoices = () => api.get('/finance/invoices/all');
export const processPayment = (data) => api.post('/finance/payment', data);

// Pharmacy
export const getMedicine = () => api.get('/pharmacy/medicine');
export const getInventory = () => api.get('/pharmacy/inventory');
export const getInventoryWithWarnings = () => api.get('/pharmacy/inventory/warnings');
export const getLowStockMedicines = () => api.get('/pharmacy/low-stock');
export const getExpiringMedicines = () => api.get('/pharmacy/expiring');
export const addMedicine = (data) => api.post('/pharmacy/medicine', data);
export const addBatch = (data) => api.post('/pharmacy/batch', data);
export const updateInventory = (inventoryId, data) => api.put(`/pharmacy/inventory/${inventoryId}`, data);
export const dispenseMedicine = (data) => api.post('/pharmacy/dispense', data);

// Surgery
export const requestSurgery = (data) => api.post('/surgery/request', data);
export const assignSurgeon = (requestId, data) => api.put(`/surgery/assign/${requestId}`, data);
export const scheduleSurgery = (requestId, data) => api.put(`/surgery/schedule/${requestId}`, data);
export const completeSurgery = (requestId, data) => api.put(`/surgery/complete/${requestId}`, data);
export const getSurgeryRequestsByVisit = (visitId) => api.get(`/surgery/by-visit/${visitId}`);
export const getAvailableOpRooms = () => api.get('/surgery/rooms/available');
export const getAssignedSurgeries = () => api.get('/surgery/assigned');
export const getPendingSurgeryRequests = () => api.get('/surgery/pending');
