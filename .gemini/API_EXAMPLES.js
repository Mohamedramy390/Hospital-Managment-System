/**
 * API Testing Examples for New Features
 * 
 * Use these examples with tools like Postman, Insomnia, or curl
 * Replace {{BASE_URL}} with your actual server URL (e.g., http://localhost:5000)
 * Replace {{TOKEN}} with your actual JWT token from login
 */

// ============================================
// 1. INSURANCE PAYMENT PROCESSING
// ============================================

/**
 * Process an approved insurance claim
 * This will automatically reduce the patient's billing cost
 */
const processInsuranceClaim = {
    method: 'POST',
    url: '{{BASE_URL}}/api/insurance/claims/process-approved',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}',
        'Content-Type': 'application/json'
    },
    body: {
        claimId: 1,
        approvedAmount: 500.00,
        notes: 'Claim approved by Blue Cross Insurance'
    }
};

/**
 * Example Response:
 * {
 *   "message": "Insurance claim processed successfully",
 *   "success": true,
 *   "totalPaid": 500.00,
 *   "remainingBalance": 0.00
 * }
 */

// ============================================
// 2. DOCTOR NOTES
// ============================================

/**
 * Add a doctor note to a patient visit
 */
const addDoctorNote = {
    method: 'POST',
    url: '{{BASE_URL}}/api/clinical/notes',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}',
        'Content-Type': 'application/json'
    },
    body: {
        visitId: 1,
        noteText: 'Patient shows significant improvement after treatment. Continue current medication regimen.'
    }
};

/**
 * Get all doctor notes for a specific visit
 */
const getDoctorNotesByVisit = {
    method: 'GET',
    url: '{{BASE_URL}}/api/clinical/notes/visit/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Get all doctor notes for a specific patient
 */
const getDoctorNotesByPatient = {
    method: 'GET',
    url: '{{BASE_URL}}/api/clinical/notes/patient/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Update a doctor note
 */
const updateDoctorNote = {
    method: 'PUT',
    url: '{{BASE_URL}}/api/clinical/notes/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}',
        'Content-Type': 'application/json'
    },
    body: {
        noteText: 'Updated note: Patient condition has stabilized. Ready for discharge.'
    }
};

/**
 * Delete a doctor note
 */
const deleteDoctorNote = {
    method: 'DELETE',
    url: '{{BASE_URL}}/api/clinical/notes/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

// ============================================
// 3. TREATMENT PLANS
// ============================================

/**
 * Add a treatment plan
 */
const addTreatmentPlan = {
    method: 'POST',
    url: '{{BASE_URL}}/api/clinical/treatment-plans',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}',
        'Content-Type': 'application/json'
    },
    body: {
        visitId: 1,
        details: 'Continue antibiotics for 7 days. Schedule follow-up in 2 weeks. Monitor blood pressure daily.'
    }
};

/**
 * Get treatment plans by visit
 */
const getTreatmentPlansByVisit = {
    method: 'GET',
    url: '{{BASE_URL}}/api/clinical/treatment-plans/visit/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Get treatment plans by patient
 */
const getTreatmentPlansByPatient = {
    method: 'GET',
    url: '{{BASE_URL}}/api/clinical/treatment-plans/patient/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

// ============================================
// 4. SURGERY REPORTS
// ============================================

/**
 * Get a specific surgery report
 */
const getSurgeryReport = {
    method: 'GET',
    url: '{{BASE_URL}}/api/surgery/reports/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Get all surgery reports
 */
const getAllSurgeryReports = {
    method: 'GET',
    url: '{{BASE_URL}}/api/surgery/reports',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Update a surgery report
 */
const updateSurgeryReport = {
    method: 'PUT',
    url: '{{BASE_URL}}/api/surgery/reports/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}',
        'Content-Type': 'application/json'
    },
    body: {
        reportText: 'Updated surgery report: Procedure completed successfully. Patient stable post-op. No complications observed.'
    }
};

/**
 * Get surgery reports by patient
 */
const getSurgeryReportsByPatient = {
    method: 'GET',
    url: '{{BASE_URL}}/api/surgery/reports/patient/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

// ============================================
// 5. NURSE TASKS
// ============================================

/**
 * Create a nurse task
 */
const createNurseTask = {
    method: 'POST',
    url: '{{BASE_URL}}/api/nursing/task',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}',
        'Content-Type': 'application/json'
    },
    body: {
        visitId: 1,
        assignedStaffId: 3,
        description: 'Check vital signs every 2 hours. Monitor temperature and blood pressure.'
    }
};

/**
 * Get all tasks (system-wide)
 */
const getAllNurseTasks = {
    method: 'GET',
    url: '{{BASE_URL}}/api/nursing/tasks/all',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Get tasks by visit
 */
const getTasksByVisit = {
    method: 'GET',
    url: '{{BASE_URL}}/api/nursing/tasks/visit/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Get a specific task by ID
 */
const getTaskById = {
    method: 'GET',
    url: '{{BASE_URL}}/api/nursing/tasks/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

/**
 * Update a task (description and/or status)
 */
const updateNurseTask = {
    method: 'PUT',
    url: '{{BASE_URL}}/api/nursing/tasks/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}',
        'Content-Type': 'application/json'
    },
    body: {
        description: 'Updated task: Check vital signs every hour',
        status: 'Completed'
    }
};

/**
 * Delete a task
 */
const deleteNurseTask = {
    method: 'DELETE',
    url: '{{BASE_URL}}/api/nursing/tasks/1',
    headers: {
        'Authorization': 'Bearer {{TOKEN}}'
    }
};

// ============================================
// CURL EXAMPLES
// ============================================

/**
 * Process Insurance Claim (curl)
 */
const curlProcessClaim = `
curl -X POST http://localhost:5000/api/insurance/claims/process-approved \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claimId": 1,
    "approvedAmount": 500.00,
    "notes": "Claim approved"
  }'
`;

/**
 * Add Doctor Note (curl)
 */
const curlAddNote = `
curl -X POST http://localhost:5000/api/clinical/notes \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "visitId": 1,
    "noteText": "Patient shows improvement"
  }'
`;

/**
 * Get All Nurse Tasks (curl)
 */
const curlGetTasks = `
curl -X GET http://localhost:5000/api/nursing/tasks/all \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * Update Surgery Report (curl)
 */
const curlUpdateReport = `
curl -X PUT http://localhost:5000/api/surgery/reports/1 \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reportText": "Updated surgery report text"
  }'
`;

// ============================================
// WORKFLOW EXAMPLES
// ============================================

/**
 * Complete Workflow: Patient Visit with Insurance
 * 
 * 1. Patient checks in (create visit)
 * 2. Doctor adds diagnosis and notes
 * 3. Doctor creates treatment plan
 * 4. Nurse creates tasks for patient care
 * 5. Generate invoice for visit
 * 6. Create insurance claim
 * 7. Process approved claim (reduces patient cost)
 * 8. Patient pays remaining balance (if any)
 */

/**
 * Complete Workflow: Surgery Process
 * 
 * 1. Doctor requests surgery
 * 2. Admin assigns surgeon
 * 3. Surgeon schedules surgery
 * 4. Nurse tasks created for pre-op care
 * 5. Surgery performed
 * 6. Surgeon completes surgery with report
 * 7. Nurse tasks created for post-op care
 * 8. Surgery report can be viewed/updated
 */

module.exports = {
    processInsuranceClaim,
    addDoctorNote,
    getDoctorNotesByVisit,
    getDoctorNotesByPatient,
    updateDoctorNote,
    deleteDoctorNote,
    addTreatmentPlan,
    getTreatmentPlansByVisit,
    getTreatmentPlansByPatient,
    getSurgeryReport,
    getAllSurgeryReports,
    updateSurgeryReport,
    getSurgeryReportsByPatient,
    createNurseTask,
    getAllNurseTasks,
    getTasksByVisit,
    getTaskById,
    updateNurseTask,
    deleteNurseTask
};
