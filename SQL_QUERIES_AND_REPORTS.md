# R#4: SQL Queries and Reports Documentation
## Hospital Management System - Data Query Language (DQL) Reports

This document contains various SELECT queries demonstrating different SQL operations including:
- Aggregate functions
- Set operators
- Conditions and filtering
- Joins (INNER, LEFT, RIGHT)
- Subqueries
- GROUP BY and HAVING clauses

Each query includes:
1. SQL Query
2. Relational Algebra notation
3. Description and purpose
4. Expected output structure

---

## Report 1: Patient Visit Summary with Doctor Information

### SQL Query
```sql
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
```

### Relational Algebra
```
π PatientID, PatientName, DateOfBirth, VisitID, VisitType, AdmissionTime, DoctorName, DepartmentName (
    σ AdmissionTime >= (CURDATE - 30 days) (
        Patient ⋈ Patient.PatientID = Visit.PatientID Visit
        ⟕ Visit.VisitID = Diagnosis.VisitID Diagnosis
        ⟕ Diagnosis.StaffID = Staff.StaffID Staff
        ⟕ Staff.DepartmentID = Department.DepartmentID Department
    )
)
```

### Description
This report shows all patient visits from the last 30 days with associated doctor and department information. Uses INNER JOIN for patient-visit relationship and LEFT JOINs to include visits even without diagnosis.

### Expected Output Columns
- PatientID, PatientName, DateOfBirth, VisitID, VisitType, AdmissionTime, DoctorName, DepartmentName

---

## Report 2: Department-wise Staff Count and Average Attendance

### SQL Query
```sql
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
```

### Relational Algebra
```
π DepartmentID, DepartmentName, COUNT(StaffID), COUNT(AttendanceID), AVG(Hours) (
    σ COUNT(StaffID) > 0 (
        γ DepartmentID, DepartmentName; COUNT(StaffID), COUNT(AttendanceID), AVG(Hours) (
            Department ⟕ Department.DepartmentID = Staff.DepartmentID Staff
            ⟕ Staff.StaffID = Attendance.StaffID Attendance
        )
    )
)
```

### Description
Aggregates staff count and attendance metrics by department. Uses GROUP BY with aggregate functions (COUNT, AVG) and HAVING clause for filtering.

### Expected Output Columns
- DepartmentID, DepartmentName, TotalStaff, TotalAttendanceRecords, AvgHoursWorked

---

## Report 3: Top 10 Most Prescribed Medicines

### SQL Query
```sql
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
```

### Relational Algebra
```
τ PrescriptionCount DESC (
    LIMIT 10 (
        π MedicineID, MedicineName, COUNT(PrescriptionItemID), SUM(Quantity) (
            γ MedicineID, Name; COUNT(PrescriptionItemID), SUM(Quantity) (
                Medicine ⋈ Medicine.MedicineID = Prescription_Item.MedicineID Prescription_Item
                ⟕ Medicine.MedicineID = Medicine_Batch.MedicineID Medicine_Batch
                ⟕ Medicine_Batch.BatchID = Inventory.BatchID Inventory
            )
        )
    )
)
```

### Description
Identifies the most frequently prescribed medicines with current inventory levels. Uses aggregate functions and LIMIT clause.

### Expected Output Columns
- MedicineID, MedicineName, PrescriptionCount, TotalQuantityInStock

---

## Report 4: Patient Financial Summary with Outstanding Balances

### SQL Query
```sql
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
```

### Relational Algebra
```
τ OutstandingBalance DESC (
    σ OutstandingBalance > 0 (
        π PatientID, PatientName, COUNT(InvoiceID), SUM(TotalAmount), SUM(AmountPaid), OutstandingBalance, Status (
            γ PatientID, FirstName, LastName, Status; COUNT(InvoiceID), SUM(TotalAmount), SUM(AmountPaid) (
                Patient ⋈ Patient.PatientID = Visit.PatientID Visit
                ⋈ Visit.VisitID = Invoice.VisitID Invoice
                ⟕ Invoice.InvoiceID = Payment.InvoiceID Payment
            )
        )
    )
)
```

### Description
Financial report showing patients with outstanding balances. Uses aggregate functions, COALESCE for NULL handling, and HAVING clause.

### Expected Output Columns
- PatientID, PatientName, TotalInvoices, TotalBilled, TotalPaid, OutstandingBalance, InvoiceStatus

---

## Report 5: Lab Test Completion Rate by Test Type

### SQL Query
```sql
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
```

### Relational Algebra
```
τ CompletionRate DESC (
    σ COUNT(TestID) > 0 (
        π TestTypeID, TestName, COUNT(TestID), CompletedTests, PendingTests, CancelledTests, CompletionRate (
            γ TestTypeID, TestName; COUNT(TestID), SUM(CASE...), CompletionRate (
                Test_Type ⟕ Test_Type.TestTypeID = Lab_Test.TestTypeID Lab_Test
            )
        )
    )
)
```

### Description
Analyzes lab test completion rates using CASE statements for conditional aggregation.

### Expected Output Columns
- TestTypeID, TestName, TotalTests, CompletedTests, PendingTests, CancelledTests, CompletionRate

---

## Report 6: Bed Occupancy and Utilization Report

### SQL Query
```sql
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
```

### Relational Algebra
```
τ RoomNumber (
    π BedID, RoomNumber, IsAvailable, COUNT(BedAssignID), MAX(StartTime), CurrentStatus (
        γ BedID, RoomNumber, IsAvailable, PatientID; COUNT(BedAssignID), MAX(StartTime) (
            Bed ⟕ Bed.BedID = Bed_Assignment.BedID Bed_Assignment
        )
    )
)
```

### Description
Shows bed availability and usage history with conditional status display.

### Expected Output Columns
- BedID, RoomNumber, IsAvailable, TotalAssignments, LastAssignmentDate, CurrentStatus

---

## Report 7: Doctor Performance - Patients Treated and Procedures

### SQL Query
```sql
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
```

### Relational Algebra
```
τ PatientsTreated DESC (
    π StaffID, DoctorName, DepartmentName, COUNT(VisitID), COUNT(PlanID), COUNT(RequestID), COUNT(OrderID) (
        σ Role = 'Doctor' (
            γ StaffID, FirstName, LastName, DepartmentName; COUNT(VisitID), COUNT(PlanID), COUNT(RequestID), COUNT(OrderID) (
                Staff ⋈ Staff.UserID = User.UserID User
                ⋈ Staff.DepartmentID = Department.DepartmentID Department
                ⟕ Staff.StaffID = Diagnosis.StaffID Diagnosis
                ⟕ Staff.StaffID = Treatment_Plan.StaffID Treatment_Plan
                ⟕ Staff.StaffID = Surgery_Request.RequestingStaffID Surgery_Request
                ⟕ Staff.StaffID = Lab_Order.RequestingStaffID Lab_Order
            )
        )
    )
)
```

### Description
Comprehensive doctor performance metrics using multiple LEFT JOINs and DISTINCT counts.

### Expected Output Columns
- StaffID, DoctorName, DepartmentName, PatientsTreated, TreatmentPlansCreated, SurgeriesRequested, LabOrdersPlaced

---

## Report 8: Insurance Claims Status Summary

### SQL Query
```sql
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
```

### Relational Algebra
```
τ TotalClaimAmount DESC (
    π ProviderID, ProviderName, COUNT(ClaimID), SUM(ClaimAmount), Status, COUNT(InvoiceID) (
        γ ProviderID, ProviderName, Status; COUNT(ClaimID), SUM(ClaimAmount), COUNT(InvoiceID) (
            Insurance_Provider ⋈ Insurance_Provider.ProviderID = Insurance_Claim.ProviderID Insurance_Claim
            ⟕ Insurance_Claim.ClaimID = Claim_Status.ClaimID Claim_Status
        )
    )
)
```

### Description
Summarizes insurance claims by provider with status breakdown.

### Expected Output Columns
- ProviderID, ProviderName, TotalClaims, TotalClaimAmount, CurrentStatus, UniqueInvoices

---

## Report 9: Nurse Task Completion Rate by Shift

### SQL Query
```sql
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
```

### Relational Algebra
```
τ CompletionRate DESC (
    σ COUNT(TaskID) > 0 (
        π ShiftID, ShiftName, COUNT(TaskID), CompletedTasks, PendingTasks, CompletionRate, COUNT(StaffID) (
            γ ShiftID, ShiftName; COUNT(TaskID), SUM(CASE...), COUNT(StaffID) (
                Shift ⟕ Shift.ShiftID = Attendance.ShiftID Attendance
                ⟕ Attendance.StaffID = Nurse_Task.AssignedStaffID Nurse_Task
            )
        )
    )
)
```

### Description
Analyzes nurse task completion by shift with conditional aggregation.

### Expected Output Columns
- ShiftID, ShiftName, TotalTasks, CompletedTasks, PendingTasks, CompletionRate, NursesOnShift

---

## Report 10: Medicine Expiry Alert Report

### SQL Query
```sql
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
```

### Relational Algebra
```
τ DaysUntilExpiry ASC (
    σ Quantity > 0 (
        π MedicineID, MedicineName, BatchID, ExpiryDate, Quantity, DaysUntilExpiry, ExpiryStatus (
            Medicine ⋈ Medicine.MedicineID = Medicine_Batch.MedicineID Medicine_Batch
            ⋈ Medicine_Batch.BatchID = Inventory.BatchID Inventory
        )
    )
)
```

### Description
Identifies medicines nearing expiry with categorized alert levels using CASE statements.

### Expected Output Columns
- MedicineID, MedicineName, BatchID, ExpiryDate, CurrentStock, DaysUntilExpiry, ExpiryStatus

---

## Report 11: Surgery Schedule and Team Assignment

### SQL Query
```sql
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
```

### Relational Algebra
```
τ ScheduledTime ASC (
    σ ScheduledTime >= CURDATE (
        π RequestID, PatientID, PatientName, ScheduledTime, Status, SurgeonName, RoomName, TeamMembers (
            γ RequestID, PatientID, FirstName, LastName, ScheduledTime, Status, SurgeonName, RoomName; GROUP_CONCAT(TeamMembers) (
                Surgery_Request ⋈ Surgery_Request.VisitID = Visit.VisitID Visit
                ⋈ Visit.PatientID = Patient.PatientID Patient
                ⟕ Surgery_Request.SurgeonStaffID = Staff.StaffID Staff
                ⟕ Surgery_Request.OpRoomID = Operation_Room.OpRoomID Operation_Room
                ⟕ Surgery_Request.RequestID = Operation_Assignment.RequestID Operation_Assignment
                ⟕ Operation_Assignment.StaffID = Staff.StaffID Staff
            )
        )
    )
)
```

### Description
Comprehensive surgery schedule with team composition using GROUP_CONCAT for team member aggregation.

### Expected Output Columns
- RequestID, PatientID, PatientName, ScheduledTime, SurgeryStatus, SurgeonName, OperationRoom, TeamMembers

---

## Report 12: Patient Visit Type Distribution (Set Operators)

### SQL Query
```sql
-- Inpatient visits
SELECT 
    'Inpatient' AS VisitType,
    COUNT(*) AS VisitCount,
    ROUND(AVG(DATEDIFF(IFNULL(ba.EndTime, CURDATE()), v.AdmissionTime)), 2) AS AvgStayDays
FROM Visit v
LEFT JOIN Bed_Assignment ba ON v.VisitID = ba.VisitID
WHERE v.VisitType = 'Inpatient'

UNION ALL

-- Emergency visits
SELECT 
    'Emergency' AS VisitType,
    COUNT(*) AS VisitCount,
    0 AS AvgStayDays
FROM Visit v
WHERE v.VisitType = 'Emergency'

UNION ALL

-- Outpatient visits
SELECT 
    'Outpatient' AS VisitType,
    COUNT(*) AS VisitCount,
    0 AS AvgStayDays
FROM Visit v
WHERE v.VisitType = 'Outpatient'

ORDER BY VisitCount DESC;
```

### Relational Algebra
```
τ VisitCount DESC (
    (π 'Inpatient', COUNT(*), AVG(Days) (σ VisitType = 'Inpatient' (Visit ⟕ Bed_Assignment)))
    ∪
    (π 'Emergency', COUNT(*), 0 (σ VisitType = 'Emergency' (Visit)))
    ∪
    (π 'Outpatient', COUNT(*), 0 (σ VisitType = 'Outpatient' (Visit)))
)
```

### Description
Uses UNION ALL set operator to combine visit statistics by type.

### Expected Output Columns
- VisitType, VisitCount, AvgStayDays

---

## Report 13: Comprehensive Patient Medical Record

### SQL Query
```sql
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
ORDER BY v.AdmissionTime DESC;
```

### Relational Algebra
```
τ AdmissionTime DESC (
    π PatientID, PatientName, DateOfBirth, VisitID, VisitType, AdmissionTime, DiagnosisNotes, TreatmentPlan, Prescriptions, LabTests, BillAmount, PaymentStatus (
        γ PatientID, FirstName, LastName, DateOfBirth, VisitID, VisitType, AdmissionTime, DiagnosisNotes, PlanDetails, TotalAmount, Status; 
          GROUP_CONCAT(Prescriptions), GROUP_CONCAT(LabTests) (
            Patient ⋈ Visit ⟕ Diagnosis ⟕ Treatment_Plan ⟕ Prescription ⟕ Prescription_Item ⟕ Medicine ⟕ Lab_Order ⟕ Lab_Test ⟕ Test_Type ⟕ Invoice
        )
    )
)
```

### Description
Complete patient medical record with all related information using multiple JOINs and GROUP_CONCAT.

### Expected Output Columns
- PatientID, PatientName, DateOfBirth, VisitID, VisitType, AdmissionTime, DiagnosisNotes, TreatmentPlan, Prescriptions, LabTests, BillAmount, PaymentStatus

---

## Report 14: Revenue Analysis by Department and Payment Method

### SQL Query
```sql
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
```

### Relational Algebra
```
τ TotalRevenue DESC (
    π DepartmentName, PaymentMethod, COUNT(PaymentID), SUM(AmountPaid), AVG(AmountPaid), MIN(PaymentDate), MAX(PaymentDate) (
        γ DepartmentName, PaymentMethod; COUNT(PaymentID), SUM(AmountPaid), AVG(AmountPaid), MIN(PaymentDate), MAX(PaymentDate) (
            Department ⋈ Staff ⋈ Diagnosis ⋈ Visit ⋈ Invoice ⋈ Payment
        )
    )
)
```

### Description
Financial analysis showing revenue distribution by department and payment method.

### Expected Output Columns
- DepartmentName, PaymentMethod, TransactionCount, TotalRevenue, AvgTransactionAmount, FirstPayment, LastPayment

---

## Report 15: Active Patients with Pending Tasks

### SQL Query
```sql
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
```

### Relational Algebra
```
τ PendingTasks DESC (
    σ COUNT(TaskID) > 0 (
        π PatientID, PatientName, VisitID, VisitType, RoomNumber, COUNT(TaskID), TaskDescriptions, AssignedNurse (
            σ EndTime IS NULL AND Status = 'Pending' (
                γ PatientID, FirstName, LastName, VisitID, VisitType, RoomNumber, NurseName; COUNT(TaskID), GROUP_CONCAT(Description) (
                    Patient ⋈ Visit ⋈ Bed_Assignment ⋈ Bed ⟕ Nurse_Task ⟕ Staff
                )
            )
        )
    )
)
```

### Description
Identifies currently admitted patients with pending nursing tasks.

### Expected Output Columns
- PatientID, PatientName, VisitID, VisitType, CurrentBed, PendingTasks, TaskDescriptions, AssignedNurse

---

## Summary of SQL Concepts Used

### 1. **Aggregate Functions**
- COUNT(), SUM(), AVG(), MIN(), MAX()
- GROUP_CONCAT() for string aggregation

### 2. **Join Types**
- INNER JOIN (equi-join)
- LEFT JOIN (left outer join)
- Multiple table joins (3+ tables)

### 3. **Set Operators**
- UNION ALL for combining result sets

### 4. **Conditions and Filtering**
- WHERE clause with comparison operators
- HAVING clause for aggregate filtering
- CASE statements for conditional logic
- Date functions (CURDATE(), DATE_SUB(), DATEDIFF())

### 5. **Grouping and Sorting**
- GROUP BY for aggregation
- ORDER BY for result ordering
- LIMIT for result restriction

### 6. **Subqueries**
- Correlated subqueries in SELECT
- Subqueries in WHERE clause

### 7. **String Functions**
- CONCAT() for string concatenation
- COALESCE() for NULL handling

### 8. **Date/Time Functions**
- TIMESTAMPDIFF() for time calculations
- Date comparison and arithmetic

---

## Instructions for Execution

1. Ensure the database schema is created using `schema.sql`
2. Populate with sample data using seed scripts
3. Execute each query individually
4. Take screenshots of query results
5. Document output in a separate report

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Total Reports:** 15 comprehensive queries
