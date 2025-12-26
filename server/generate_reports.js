const db = require('./db');
const fs = require('fs');
const path = require('path');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
}

// Report definitions
const reports = [
    {
        id: 1,
        title: 'Patient Visit Summary with Doctor Information',
        description: 'Shows all patient visits from the last 30 days with associated doctor and department information',
        query: `
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
            ORDER BY v.AdmissionTime DESC
            LIMIT 50;
        `
    },
    {
        id: 2,
        title: 'Department-wise Staff Count and Average Attendance',
        description: 'Aggregates staff count and attendance metrics by department',
        query: `
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
        `
    },
    {
        id: 3,
        title: 'Top 10 Most Prescribed Medicines',
        description: 'Identifies the most frequently prescribed medicines with current inventory levels',
        query: `
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
        `
    },
    {
        id: 4,
        title: 'Patient Financial Summary with Outstanding Balances',
        description: 'Financial report showing patients with outstanding balances',
        query: `
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
            ORDER BY OutstandingBalance DESC
            LIMIT 20;
        `
    },
    {
        id: 5,
        title: 'Lab Test Completion Rate by Test Type',
        description: 'Analyzes lab test completion rates using conditional aggregation',
        query: `
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
        `
    },
    {
        id: 6,
        title: 'Bed Occupancy and Utilization Report',
        description: 'Shows bed availability and usage history with conditional status display',
        query: `
            SELECT 
                b.BedID,
                b.RoomNumber,
                b.IsAvailable,
                COUNT(ba.BedAssignID) AS TotalAssignments,
                MAX(ba.StartTime) AS LastAssignmentDate
            FROM Bed b
            LEFT JOIN Bed_Assignment ba ON b.BedID = ba.BedID
            GROUP BY b.BedID, b.RoomNumber, b.IsAvailable
            ORDER BY b.RoomNumber
            LIMIT 50;
        `
    },
    {
        id: 7,
        title: 'Doctor Performance - Patients Treated and Procedures',
        description: 'Comprehensive doctor performance metrics using multiple LEFT JOINs',
        query: `
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
        `
    },
    {
        id: 8,
        title: 'Insurance Claims Status Summary',
        description: 'Summarizes insurance claims by provider with status breakdown',
        query: `
            SELECT 
                ip.ProviderID,
                ip.ProviderName,
                COUNT(ic.ClaimID) AS TotalClaims,
                SUM(ic.ClaimAmount) AS TotalClaimAmount,
                COUNT(DISTINCT ic.InvoiceID) AS UniqueInvoices
            FROM Insurance_Provider ip
            INNER JOIN Insurance_Claim ic ON ip.ProviderID = ic.ProviderID
            GROUP BY ip.ProviderID, ip.ProviderName
            ORDER BY TotalClaimAmount DESC;
        `
    },
    {
        id: 9,
        title: 'Nurse Task Completion Rate by Shift',
        description: 'Analyzes nurse task completion by shift with conditional aggregation',
        query: `
            SELECT 
                sh.ShiftID,
                sh.ShiftName,
                COUNT(nt.TaskID) AS TotalTasks,
                SUM(CASE WHEN nt.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedTasks,
                SUM(CASE WHEN nt.Status = 'Pending' THEN 1 ELSE 0 END) AS PendingTasks,
                ROUND((SUM(CASE WHEN nt.Status = 'Completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(nt.TaskID), 0)) * 100, 2) AS CompletionRate,
                COUNT(DISTINCT a.StaffID) AS NursesOnShift
            FROM Shift sh
            LEFT JOIN Attendance a ON sh.ShiftID = a.ShiftID
            LEFT JOIN Nurse_Task nt ON a.StaffID = nt.AssignedStaffID
            GROUP BY sh.ShiftID, sh.ShiftName
            HAVING COUNT(nt.TaskID) > 0
            ORDER BY CompletionRate DESC;
        `
    },
    {
        id: 10,
        title: 'Medicine Expiry Alert Report',
        description: 'Identifies medicines nearing expiry with categorized alert levels',
        query: `
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
            ORDER BY DaysUntilExpiry ASC
            LIMIT 30;
        `
    },
    {
        id: 11,
        title: 'Visit Type Distribution',
        description: 'Uses UNION ALL to combine visit statistics by type',
        query: `
            SELECT 
                'Inpatient' AS VisitType,
                COUNT(*) AS VisitCount
            FROM Visit v
            WHERE v.VisitType = 'Inpatient'
            
            UNION ALL
            
            SELECT 
                'Emergency' AS VisitType,
                COUNT(*) AS VisitCount
            FROM Visit v
            WHERE v.VisitType = 'Emergency'
            
            UNION ALL
            
            SELECT 
                'Outpatient' AS VisitType,
                COUNT(*) AS VisitCount
            FROM Visit v
            WHERE v.VisitType = 'Outpatient'
            
            ORDER BY VisitCount DESC;
        `
    },
    {
        id: 12,
        title: 'Revenue Analysis by Payment Method',
        description: 'Financial analysis showing revenue distribution by payment method',
        query: `
            SELECT 
                pay.PaymentMethod,
                COUNT(DISTINCT pay.PaymentID) AS TransactionCount,
                SUM(pay.AmountPaid) AS TotalRevenue,
                ROUND(AVG(pay.AmountPaid), 2) AS AvgTransactionAmount,
                MIN(pay.PaymentDate) AS FirstPayment,
                MAX(pay.PaymentDate) AS LastPayment
            FROM Payment pay
            GROUP BY pay.PaymentMethod
            ORDER BY TotalRevenue DESC;
        `
    }
];

// HTML template for reports
function generateHTML(reportData) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report ${reportData.id}: ${reportData.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header .report-id {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 500;
        }
        
        .description {
            background: #f8f9fa;
            padding: 20px 30px;
            border-left: 4px solid #667eea;
            margin: 20px 30px;
        }
        
        .query-section {
            margin: 20px 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .query-section h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .query-section pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.6;
        }
        
        .results-section {
            margin: 20px 30px 30px;
        }
        
        .results-section h3 {
            color: #2d3748;
            margin-bottom: 15px;
        }
        
        .stats {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            flex: 1;
            min-width: 150px;
        }
        
        .stat-card .label {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        
        tbody tr:hover {
            background: #f7fafc;
        }
        
        tbody tr:last-child td {
            border-bottom: none;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #718096;
            font-style: italic;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
            margin-top: 20px;
        }
        
        .timestamp {
            color: #a0aec0;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="report-id">Report #${reportData.id}</div>
            <h1>${reportData.title}</h1>
        </div>
        
        <div class="description">
            <p>${reportData.description}</p>
        </div>
        
        <div class="query-section">
            <h3>SQL Query</h3>
            <pre>${reportData.query.trim()}</pre>
        </div>
        
        <div class="results-section">
            <h3>Query Results</h3>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="label">Total Rows</div>
                    <div class="value">${reportData.rowCount}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Columns</div>
                    <div class="value">${reportData.columnCount}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Execution Time</div>
                    <div class="value">${reportData.executionTime}ms</div>
                </div>
            </div>
            
            ${reportData.tableHTML}
        </div>
        
        <div class="footer">
            <p>Hospital Management System - Database Reports</p>
            <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Generate table HTML from results
function generateTableHTML(results) {
    if (!results || results.length === 0) {
        return '<div class="no-data">No data available for this report</div>';
    }

    const columns = Object.keys(results[0]);

    let html = '<table><thead><tr>';
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    results.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            let value = row[col];
            if (value === null) value = 'NULL';
            if (value instanceof Date) value = value.toLocaleString();
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

// Execute all reports
async function generateAllReports() {
    console.log('🚀 Starting report generation...\n');

    for (const report of reports) {
        try {
            console.log(`📊 Generating Report ${report.id}: ${report.title}`);

            const startTime = Date.now();
            const [results] = await db.query(report.query);
            const executionTime = Date.now() - startTime;

            const reportData = {
                ...report,
                rowCount: results.length,
                columnCount: results.length > 0 ? Object.keys(results[0]).length : 0,
                executionTime,
                tableHTML: generateTableHTML(results)
            };

            const html = generateHTML(reportData);
            const filename = `Report_${String(report.id).padStart(2, '0')}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
            const filepath = path.join(reportsDir, filename);

            fs.writeFileSync(filepath, html);

            console.log(`   ✅ Generated: ${filename}`);
            console.log(`   📈 Rows: ${results.length} | Columns: ${reportData.columnCount} | Time: ${executionTime}ms\n`);

        } catch (error) {
            console.error(`   ❌ Error generating Report ${report.id}:`, error.message, '\n');
        }
    }

    // Generate index file
    generateIndexFile();

    console.log('✨ Report generation complete!');
    console.log(`📁 Reports saved in: ${reportsDir}\n`);

    process.exit(0);
}

// Generate index.html with links to all reports
function generateIndexFile() {
    const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Management System - Reports Index</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            padding: 40px;
        }
        
        .report-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .report-card:hover {
            border-color: #667eea;
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
        }
        
        .report-number {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .report-description {
            font-size: 14px;
            color: #718096;
            line-height: 1.5;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Hospital Management System</h1>
            <p>Database Reports & Analytics</p>
        </div>
        
        <div class="reports-grid">
            ${reports.map(report => `
                <a href="Report_${String(report.id).padStart(2, '0')}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.html" class="report-card">
                    <div class="report-number">Report #${report.id}</div>
                    <div class="report-title">${report.title}</div>
                    <div class="report-description">${report.description}</div>
                </a>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(path.join(reportsDir, 'index.html'), indexHTML);
    console.log('📑 Generated index.html\n');
}

// Run the generator
generateAllReports().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
