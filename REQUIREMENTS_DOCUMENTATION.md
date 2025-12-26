# Hospital Management System - Requirements Documentation

## R#1: Business and System Requirements Specification

### 1. Project Overview
**Project Name:** Hospital Management System  
**Database:** MySQL  
**Technology Stack:** Node.js, Express.js, React, MySQL  
**Purpose:** Comprehensive hospital management system to manage patients, staff, clinical operations, pharmacy, laboratory, and financial operations.

---

## 2. Stakeholder Identification and Requirements

### 2.1 Primary Stakeholders

#### **Stakeholder 1: Hospital Administrators**
**Role:** System oversight and management  
**Requirements:**
- Access to all system modules and data
- User and role management capabilities
- Audit log viewing and system monitoring
- Department management
- Staff assignment and oversight
- Financial reporting and analytics
- System configuration and settings

**Key Use Cases:**
- Create and manage user accounts
- Assign roles and permissions
- View system audit logs
- Generate comprehensive reports
- Monitor hospital operations
- Manage departments and staff assignments

---

#### **Stakeholder 2: Doctors**
**Role:** Clinical care providers  
**Requirements:**
- Patient medical record access (EMR)
- Diagnosis creation and management
- Treatment plan development
- Prescription writing
- Lab test ordering
- Surgery request submission
- Doctor notes documentation
- Patient visit history viewing

**Key Use Cases:**
- View patient medical history
- Create diagnoses for patient visits
- Develop and update treatment plans
- Write prescriptions
- Order laboratory tests
- Request surgeries
- Add clinical notes
- Review lab results

---

#### **Stakeholder 3: Nurses**
**Role:** Patient care and task execution  
**Requirements:**
- Patient assignment viewing
- Task management (view, update, complete)
- Shift and attendance tracking
- Bed assignment management
- Treatment plan execution
- Vital signs recording
- Surgery assistance coordination

**Key Use Cases:**
- View assigned patients
- Complete assigned tasks
- Clock in/out for shifts
- Assign patients to beds
- Update task status
- Assist in surgeries
- Monitor patient care plans

---

#### **Stakeholder 4: Patients**
**Role:** Healthcare recipients  
**Requirements:**
- Personal medical record access
- Appointment scheduling
- Prescription viewing
- Lab result access
- Invoice and payment viewing
- Insurance claim status tracking
- Visit history viewing

**Key Use Cases:**
- Schedule appointments
- View medical history
- Access lab results
- View prescriptions
- Make payments
- Check insurance claims
- View invoices

---

#### **Stakeholder 5: Lab Technicians**
**Role:** Laboratory test processing  
**Requirements:**
- Lab order viewing
- Test result entry
- Lab device management
- Test type management
- Result file upload
- Test status updates

**Key Use Cases:**
- View pending lab orders
- Enter test results
- Upload result files
- Update test status
- Manage lab devices
- Process test requests

---

#### **Stakeholder 6: Pharmacists**
**Role:** Medication management  
**Requirements:**
- Prescription viewing and fulfillment
- Medicine inventory management
- Batch and expiry tracking
- Stock level monitoring
- Medicine dispensing

**Key Use Cases:**
- View prescriptions
- Dispense medications
- Manage inventory
- Track medicine batches
- Monitor expiry dates
- Update stock levels

---

#### **Stakeholder 7: Receptionists/Staff**
**Role:** Patient registration and administrative support  
**Requirements:**
- Patient registration
- Appointment scheduling
- Visit creation
- Bed availability checking
- Basic patient information management

**Key Use Cases:**
- Register new patients
- Schedule appointments
- Create patient visits
- Check bed availability
- Update patient information

---

#### **Stakeholder 8: Finance Department**
**Role:** Financial operations management  
**Requirements:**
- Invoice generation and management
- Payment processing
- Insurance claim processing
- Financial reporting
- Payment method tracking
- Revenue analytics

**Key Use Cases:**
- Generate invoices
- Process payments
- Submit insurance claims
- Track claim status
- Generate financial reports
- Monitor revenue

---

### 2.2 Secondary Stakeholders

#### **IT Support Staff**
**Requirements:**
- System maintenance access
- Database backup and recovery
- User support and troubleshooting
- System performance monitoring

#### **Hospital Management**
**Requirements:**
- Executive dashboards
- Performance metrics
- Resource utilization reports
- Strategic planning data

---

## 3. System Modules and Functional Requirements

### Module 1: Security & Administration
**Tables:** User, Role, Permission, Role_Permission, Department, Staff, Audit_Log

**Functional Requirements:**
- FR-1.1: User authentication and authorization
- FR-1.2: Role-based access control (RBAC)
- FR-1.3: Permission management
- FR-1.4: Department management
- FR-1.5: Staff profile management
- FR-1.6: Audit logging for all critical operations
- FR-1.7: Password encryption and security

---

### Module 2: Patient & Logistics
**Tables:** Patient, Visit, Appointment, Bed, Bed_Assignment, Operation_Room

**Functional Requirements:**
- FR-2.1: Patient registration and profile management
- FR-2.2: Visit tracking (Inpatient, Outpatient, Emergency)
- FR-2.3: Appointment scheduling and management
- FR-2.4: Bed availability tracking
- FR-2.5: Bed assignment to patients
- FR-2.6: Operation room management
- FR-2.7: Patient admission and discharge

---

### Module 3: Doctor & EMR (Electronic Medical Records)
**Tables:** Diagnosis, Treatment_Plan, Surgery_Request, Surgery_Report, Doctor_Notes

**Functional Requirements:**
- FR-3.1: Diagnosis creation and documentation
- FR-3.2: Treatment plan development
- FR-3.3: Surgery request submission
- FR-3.4: Surgery report documentation
- FR-3.5: Doctor notes management
- FR-3.6: Patient medical history access
- FR-3.7: Clinical decision support

---

### Module 4: Nurse & Staffing
**Tables:** Shift, Attendance, Nurse_Assignment, Nurse_Task, Operation_Assignment

**Functional Requirements:**
- FR-4.1: Shift scheduling and management
- FR-4.2: Attendance tracking (clock in/out)
- FR-4.3: Nurse-to-patient assignment
- FR-4.4: Task assignment and tracking
- FR-4.5: Surgery team assignment
- FR-4.6: Task completion monitoring

---

### Module 5: Lab & Prescriptions
**Tables:** Test_Type, Lab_Order, Lab_Test, Lab_Device, Lab_Result, Lab_Result_File, Prescription

**Functional Requirements:**
- FR-5.1: Lab test ordering
- FR-5.2: Test type management
- FR-5.3: Lab result entry and management
- FR-5.4: Result file attachment
- FR-5.5: Prescription creation
- FR-5.6: Lab device tracking
- FR-5.7: Test status tracking

---

### Module 6: Pharmacy & Finance
**Tables:** Medicine, Medicine_Batch, Inventory, Prescription_Item, Invoice, Invoice_Item, Payment, Insurance_Provider, Insurance_Claim, Claim_Status

**Functional Requirements:**
- FR-6.1: Medicine inventory management
- FR-6.2: Batch and expiry tracking
- FR-6.3: Prescription fulfillment
- FR-6.4: Invoice generation
- FR-6.5: Payment processing (Cash, Card, Insurance)
- FR-6.6: Insurance claim management
- FR-6.7: Financial reporting

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- NFR-1.1: System shall support concurrent access by 100+ users
- NFR-1.2: Database queries shall execute within 2 seconds
- NFR-1.3: Page load time shall not exceed 3 seconds

### 4.2 Security Requirements
- NFR-2.1: All passwords must be hashed using bcrypt
- NFR-2.2: JWT-based authentication for API access
- NFR-2.3: Role-based access control for all modules
- NFR-2.4: Audit logging for all data modifications
- NFR-2.5: HTTPS encryption for data transmission

### 4.3 Reliability Requirements
- NFR-3.1: System uptime of 99.5%
- NFR-3.2: Automated database backups daily
- NFR-3.3: Data integrity through foreign key constraints

### 4.4 Usability Requirements
- NFR-4.1: Intuitive user interface for all user roles
- NFR-4.2: Responsive design for mobile and desktop
- NFR-4.3: Clear error messages and validation

### 4.5 Scalability Requirements
- NFR-5.1: Database design supports horizontal scaling
- NFR-5.2: Modular architecture for feature expansion

---

## 5. Database Design

### 5.1 Entity Relationship Overview
The system consists of 35+ tables organized into 6 main modules:
1. Security & Admin (7 tables)
2. Patient & Logistics (6 tables)
3. Doctor & EMR (5 tables)
4. Nurse & Staffing (5 tables)
5. Lab & Prescriptions (8 tables)
6. Pharmacy & Finance (10 tables)

### 5.2 Key Relationships
- **User → Staff**: One-to-One (UserID)
- **User → Patient**: One-to-One (UserID)
- **Patient → Visit**: One-to-Many
- **Visit → Diagnosis**: One-to-Many
- **Visit → Treatment_Plan**: One-to-Many
- **Visit → Lab_Order**: One-to-Many
- **Visit → Prescription**: One-to-Many
- **Visit → Invoice**: One-to-One
- **Invoice → Payment**: One-to-Many
- **Invoice → Insurance_Claim**: One-to-Many

---

## 6. User Roles and Permissions

### Role Definitions
1. **Admin**: Full system access
2. **Doctor**: Clinical operations, EMR, prescriptions, lab orders
3. **Nurse**: Patient care, task management, bed assignments
4. **Patient**: Personal records, appointments, payments
5. **Lab Technician**: Lab orders, test results
6. **Receptionist**: Patient registration, appointments
7. **Staff**: General hospital operations

---

## 7. System Constraints

### 7.1 Technical Constraints
- MySQL database required
- Node.js backend
- React frontend
- RESTful API architecture

### 7.2 Business Constraints
- HIPAA compliance for patient data
- Audit trail for all medical records
- Data retention policies
- User authentication required for all operations

---

## 8. Success Criteria

1. All stakeholder requirements implemented
2. All 6 modules fully functional
3. Role-based access control operational
4. Database normalized to 3NF
5. Comprehensive audit logging
6. Secure authentication and authorization
7. Responsive user interface
8. Complete CRUD operations for all entities

---

## 9. Future Enhancements

1. Telemedicine integration
2. Mobile application
3. AI-powered diagnosis assistance
4. Advanced analytics and reporting
5. Integration with external lab systems
6. Electronic prescription transmission
7. Patient portal enhancements
8. Real-time notifications

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Prepared By:** Database Project Team
