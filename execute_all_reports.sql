-- Execute all reports and save results
-- Run this file to generate all report outputs

USE hospital_db;

-- ============================================
-- Report 1: Patient Visit Summary with Doctor Information
-- ============================================
SELECT 
    p.PatientID,
    CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
    p.DateOfBirth,
    v.VisitID,
    v.VisitType,
    v.AdmissionTime,
    CONCAT(s.FirstName, ' ', s.LastName) AS DoctorName,
    d.DepartmentName
FROM Patient p
INNER JOIN Visit v ON p.PatientID = v.PatientID
LEFT JOIN Diagnosis diag ON v.VisitID = diag.VisitID
LEFT JOIN Staff s ON diag.StaffID = s.StaffID
LEFT JOIN Department d ON s.DepartmentID = d.DepartmentID
WHERE v.AdmissionTime >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY v.AdmissionTime DESC;

-- ============================================
-- Report 2: Department-wise Staff Count and Average Attendance
-- ============================================
SELECT 
    d.DepartmentID,
    d.DepartmentName,
    COUNT(DISTINCT s.StaffID) AS TotalStaff,
    COUNT(a.AttendanceID) AS TotalAttendanceRecords,
    ROUND(AVG(TIMESTAMPDIFF(HOUR, a.ClockInTime, a.ClockOutTime)), 2) AS AvgHoursWorked
FROM Department d
LEFT JOIN Staff s ON d.DepartmentID = s.DepartmentID
LEFT JOIN Attendance a ON s.StaffID = a.StaffID
GROUP BY d.DepartmentID, d.DepartmentName
HAVING COUNT(DISTINCT s.StaffID) > 0
ORDER BY TotalStaff DESC;

-- ============================================
-- Report 3: Top 10 Most Prescribed Medicines
-- ============================================
SELECT 
    m.MedicineID,
    m.Name AS MedicineName,
    COUNT(pi.PrescriptionItemID) AS PrescriptionCount,
    SUM(i.Quantity) AS TotalQuantityInStock
FROM Medicine m
INNER JOIN Prescription_Item pi ON m.MedicineID = pi.MedicineID
LEFT JOIN Medicine_Batch mb ON m.MedicineID = mb.MedicineID
LEFT JOIN Inventory i ON mb.BatchID = i.BatchID
GROUP BY m.MedicineID, m.Name
ORDER BY PrescriptionCount DESC
LIMIT 10;

-- ============================================
-- Report 4: Patient Financial Summary with Outstanding Balances
-- ============================================
SELECT 
    p.PatientID,
    CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
    COUNT(DISTINCT i.InvoiceID) AS TotalInvoices,
    SUM(i.TotalAmount) AS TotalBilled,
    COALESCE(SUM(pay.AmountPaid), 0) AS TotalPaid,
    SUM(i.TotalAmount) - COALESCE(SUM(pay.AmountPaid), 0) AS OutstandingBalance,
    i.Status AS InvoiceStatus
FROM Patient p
INNER JOIN Visit v ON p.PatientID = v.PatientID
INNER JOIN Invoice i ON v.VisitID = i.VisitID
LEFT JOIN Payment pay ON i.InvoiceID = pay.InvoiceID
GROUP BY p.PatientID, p.FirstName, p.LastName, i.Status
HAVING OutstandingBalance > 0
ORDER BY OutstandingBalance DESC;

-- ============================================
-- Report 5: Lab Test Completion Rate by Test Type
-- ============================================
SELECT 
    tt.TestTypeID,
    tt.TestName,
    COUNT(lt.TestID) AS TotalTests,
    SUM(CASE WHEN lt.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedTests,
    SUM(CASE WHEN lt.Status = 'Pending' THEN 1 ELSE 0 END) AS PendingTests,
    SUM(CASE WHEN lt.Status = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledTests,
    ROUND((SUM(CASE WHEN lt.Status = 'Completed' THEN 1 ELSE 0 END) / COUNT(lt.TestID)) * 100, 2) AS CompletionRate
FROM Test_Type tt
LEFT JOIN Lab_Test lt ON tt.TestTypeID = lt.TestTypeID
GROUP BY tt.TestTypeID, tt.TestName
HAVING COUNT(lt.TestID) > 0
ORDER BY CompletionRate DESC;

-- ============================================
-- Report 6: Bed Occupancy and Utilization Report
-- ============================================
SELECT 
    b.BedID,
    b.RoomNumber,
    b.IsAvailable,
    COUNT(ba.BedAssignID) AS TotalAssignments,
    MAX(ba.StartTime) AS LastAssignmentDate,
    CASE 
        WHEN b.IsAvailable = 1 THEN 'Available'
        ELSE CONCAT('Occupied by Patient ', ba.PatientID)
    END AS CurrentStatus
FROM Bed b
LEFT JOIN Bed_Assignment ba ON b.BedID = ba.BedID
GROUP BY b.BedID, b.RoomNumber, b.IsAvailable, ba.PatientID
ORDER BY b.RoomNumber;

-- ============================================
-- Report 7: Doctor Performance - Patients Treated and Procedures
-- ============================================
SELECT 
    s.StaffID,
    CONCAT(s.FirstName, ' ', s.LastName) AS DoctorName,
    d.DepartmentName,
    COUNT(DISTINCT diag.VisitID) AS PatientsTreated,
    COUNT(DISTINCT tp.PlanID) AS TreatmentPlansCreated,
    COUNT(DISTINCT sr.RequestID) AS SurgeriesRequested,
    COUNT(DISTINCT lo.OrderID) AS LabOrdersPlaced
FROM Staff s
INNER JOIN User u ON s.UserID = u.UserID
INNER JOIN Department d ON s.DepartmentID = d.DepartmentID
LEFT JOIN Diagnosis diag ON s.StaffID = diag.StaffID
LEFT JOIN Treatment_Plan tp ON s.StaffID = tp.StaffID
LEFT JOIN Surgery_Request sr ON s.StaffID = sr.RequestingStaffID
LEFT JOIN Lab_Order lo ON s.StaffID = lo.RequestingStaffID
WHERE u.Role = 'Doctor'
GROUP BY s.StaffID, s.FirstName, s.LastName, d.DepartmentName
ORDER BY PatientsTreated DESC;

-- ============================================
-- Report 8: Insurance Claims Status Summary
-- ============================================
SELECT 
    ip.ProviderID,
    ip.ProviderName,
    COUNT(ic.ClaimID) AS TotalClaims,
    SUM(ic.ClaimAmount) AS TotalClaimAmount,
    cs.Status AS CurrentStatus,
    COUNT(DISTINCT ic.InvoiceID) AS UniqueInvoices
FROM Insurance_Provider ip
INNER JOIN Insurance_Claim ic ON ip.ProviderID = ic.ProviderID
LEFT JOIN Claim_Status cs ON ic.ClaimID = cs.ClaimID
GROUP BY ip.ProviderID, ip.ProviderName, cs.Status
ORDER BY TotalClaimAmount DESC;

-- ============================================
-- Report 9: Nurse Task Completion Rate by Shift
-- ============================================
SELECT 
    sh.ShiftID,
    sh.ShiftName,
    COUNT(nt.TaskID) AS TotalTasks,
    SUM(CASE WHEN nt.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedTasks,
    SUM(CASE WHEN nt.Status = 'Pending' THEN 1 ELSE 0 END) AS PendingTasks,
    ROUND((SUM(CASE WHEN nt.Status = 'Completed' THEN 1 ELSE 0 END) / COUNT(nt.TaskID)) * 100, 2) AS CompletionRate,
    COUNT(DISTINCT a.StaffID) AS NursesOnShift
FROM Shift sh
LEFT JOIN Attendance a ON sh.ShiftID = a.ShiftID
LEFT JOIN Nurse_Task nt ON a.StaffID = nt.AssignedStaffID
GROUP BY sh.ShiftID, sh.ShiftName
HAVING COUNT(nt.TaskID) > 0
ORDER BY CompletionRate DESC;

-- ============================================
-- Report 10: Medicine Expiry Alert Report
-- ============================================
SELECT 
    m.MedicineID,
    m.Name AS MedicineName,
    mb.BatchID,
    mb.ExpiryDate,
    i.Quantity AS CurrentStock,
    DATEDIFF(mb.ExpiryDate, CURDATE()) AS DaysUntilExpiry,
    CASE 
        WHEN DATEDIFF(mb.ExpiryDate, CURDATE()) < 0 THEN 'Expired'
        WHEN DATEDIFF(mb.ExpiryDate, CURDATE()) <= 30 THEN 'Critical'
        WHEN DATEDIFF(mb.ExpiryDate, CURDATE()) <= 90 THEN 'Warning'
        ELSE 'Safe'
    END AS ExpiryStatus
FROM Medicine m
INNER JOIN Medicine_Batch mb ON m.MedicineID = mb.MedicineID
INNER JOIN Inventory i ON mb.BatchID = i.BatchID
WHERE i.Quantity > 0
ORDER BY DaysUntilExpiry ASC;

-- ============================================
-- Report 11: Surgery Schedule and Team Assignment
-- ============================================
SELECT 
    sr.RequestID,
    p.PatientID,
    CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
    sr.ScheduledTime,
    sr.Status AS SurgeryStatus,
    CONCAT(surgeon.FirstName, ' ', surgeon.LastName) AS SurgeonName,
    opr.RoomName AS OperationRoom,
    GROUP_CONCAT(CONCAT(team.FirstName, ' ', team.LastName, ' (', oa.Role, ')') SEPARATOR ', ') AS TeamMembers
FROM Surgery_Request sr
INNER JOIN Visit v ON sr.VisitID = v.VisitID
INNER JOIN Patient p ON v.PatientID = p.PatientID
LEFT JOIN Staff surgeon ON sr.SurgeonStaffID = surgeon.StaffID
LEFT JOIN Operation_Room opr ON sr.OpRoomID = opr.OpRoomID
LEFT JOIN Operation_Assignment oa ON sr.RequestID = oa.RequestID
LEFT JOIN Staff team ON oa.StaffID = team.StaffID
WHERE sr.ScheduledTime >= CURDATE()
GROUP BY sr.RequestID, p.PatientID, p.FirstName, p.LastName, sr.ScheduledTime, sr.Status, surgeon.FirstName, surgeon.LastName, opr.RoomName
ORDER BY sr.ScheduledTime ASC;

-- ============================================
-- Report 12: Patient Visit Type Distribution
-- ============================================
SELECT 
    'Inpatient' AS VisitType,
    COUNT(*) AS VisitCount,
    ROUND(AVG(DATEDIFF(IFNULL(ba.EndTime, CURDATE()), v.AdmissionTime)), 2) AS AvgStayDays
FROM Visit v
LEFT JOIN Bed_Assignment ba ON v.VisitID = ba.VisitID
WHERE v.VisitType = 'Inpatient'

UNION ALL

SELECT 
    'Emergency' AS VisitType,
    COUNT(*) AS VisitCount,
    0 AS AvgStayDays
FROM Visit v
WHERE v.VisitType = 'Emergency'

UNION ALL

SELECT 
    'Outpatient' AS VisitType,
    COUNT(*) AS VisitCount,
    0 AS AvgStayDays
FROM Visit v
WHERE v.VisitType = 'Outpatient'

ORDER BY VisitCount DESC;

-- ============================================
-- Report 13: Comprehensive Patient Medical Record
-- ============================================
SELECT 
    p.PatientID,
    CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
    p.DateOfBirth,
    v.VisitID,
    v.VisitType,
    v.AdmissionTime,
    diag.DiagnosisNotes,
    tp.PlanDetails AS TreatmentPlan,
    GROUP_CONCAT(DISTINCT CONCAT(m.Name, ' - ', pi.Dosage) SEPARATOR '; ') AS Prescriptions,
    GROUP_CONCAT(DISTINCT tt.TestName SEPARATOR ', ') AS LabTests,
    i.TotalAmount AS BillAmount,
    i.Status AS PaymentStatus
FROM Patient p
INNER JOIN Visit v ON p.PatientID = v.PatientID
LEFT JOIN Diagnosis diag ON v.VisitID = diag.VisitID
LEFT JOIN Treatment_Plan tp ON v.VisitID = tp.VisitID
LEFT JOIN Prescription pr ON v.VisitID = pr.VisitID
LEFT JOIN Prescription_Item pi ON pr.PrescriptionID = pi.PrescriptionID
LEFT JOIN Medicine m ON pi.MedicineID = m.MedicineID
LEFT JOIN Lab_Order lo ON v.VisitID = lo.VisitID
LEFT JOIN Lab_Test lt ON lo.OrderID = lt.OrderID
LEFT JOIN Test_Type tt ON lt.TestTypeID = tt.TestTypeID
LEFT JOIN Invoice i ON v.VisitID = i.VisitID
GROUP BY p.PatientID, p.FirstName, p.LastName, p.DateOfBirth, v.VisitID, v.VisitType, v.AdmissionTime, diag.DiagnosisNotes, tp.PlanDetails, i.TotalAmount, i.Status
ORDER BY v.AdmissionTime DESC
LIMIT 20;

-- ============================================
-- Report 14: Revenue Analysis by Department and Payment Method
-- ============================================
SELECT 
    d.DepartmentName,
    pay.PaymentMethod,
    COUNT(DISTINCT pay.PaymentID) AS TransactionCount,
    SUM(pay.AmountPaid) AS TotalRevenue,
    AVG(pay.AmountPaid) AS AvgTransactionAmount,
    MIN(pay.PaymentDate) AS FirstPayment,
    MAX(pay.PaymentDate) AS LastPayment
FROM Department d
INNER JOIN Staff s ON d.DepartmentID = s.DepartmentID
INNER JOIN Diagnosis diag ON s.StaffID = diag.StaffID
INNER JOIN Visit v ON diag.VisitID = v.VisitID
INNER JOIN Invoice i ON v.VisitID = i.VisitID
INNER JOIN Payment pay ON i.InvoiceID = pay.InvoiceID
GROUP BY d.DepartmentName, pay.PaymentMethod
ORDER BY TotalRevenue DESC;

-- ============================================
-- Report 15: Active Patients with Pending Tasks
-- ============================================
SELECT 
    p.PatientID,
    CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
    v.VisitID,
    v.VisitType,
    b.RoomNumber AS CurrentBed,
    COUNT(nt.TaskID) AS PendingTasks,
    GROUP_CONCAT(nt.Description SEPARATOR ' | ') AS TaskDescriptions,
    CONCAT(nurse.FirstName, ' ', nurse.LastName) AS AssignedNurse
FROM Patient p
INNER JOIN Visit v ON p.PatientID = v.PatientID
INNER JOIN Bed_Assignment ba ON v.VisitID = ba.VisitID
INNER JOIN Bed b ON ba.BedID = b.BedID
LEFT JOIN Nurse_Task nt ON v.VisitID = nt.VisitID AND nt.Status = 'Pending'
LEFT JOIN Staff nurse ON nt.AssignedStaffID = nurse.StaffID
WHERE ba.EndTime IS NULL
GROUP BY p.PatientID, p.FirstName, p.LastName, v.VisitID, v.VisitType, b.RoomNumber, nurse.FirstName, nurse.LastName
HAVING COUNT(nt.TaskID) > 0
ORDER BY PendingTasks DESC;
