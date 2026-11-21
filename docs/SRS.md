# Software Requirements Specification (SRS)
## EduPulse DIK — Student Performance Dashboard & College Analytics System
**Institution:** Govt. Degree College No. 1, Dera Ismail Khan (Khyber Pakhtunkhwa, Pakistan)  
**Academic Program:** BS Computer Science — Final Year Project (FYP)  
**Version:** 1.0 (Enterprise Edition)  
**Standard:** IEEE 830-1998 Compatible

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **EduPulse DIK**, an enterprise-grade multi-role college management and student performance analytics system designed for Government Degree College No. 1, Dera Ismail Khan. The system replaces obsolete manual registers and disjointed single-user spreadsheets with a centralized, secure relational database platform.

### 1.2 Scope
EduPulse DIK unifies academic records, marks entry, Gomal University / HEC standard GPA/CGPA grading calculations, daily attendance tracking with automated 75% examination eligibility warning flags, student penalty fine management with payment reversal and undo capabilities, predictive at-risk student heuristics, and official Detailed Marks Certificate (DMC) printing.

### 1.3 Target Stakeholders & User Roles
1. **System Administrator:** Server health, RBAC permissions, audit trail inspection, automated backups.
2. **Principal / Executive:** College-wide institutional KPIs, department benchmarking, retention metrics.
3. **Head of Department (HOD):** Faculty teaching assignments, semester progression, syllabus status.
4. **Faculty / Lecturer:** Sessional/midterm/final marks grading, interactive attendance register, at-risk flags.
5. **Accounts Clerk:** Fine creation, collection, receipt issuance, ledger reversal.
6. **Enrolled Students:** Personal academic transcripts, attendance progress gauge, fee status.
7. **Parents / Guardians:** Ward academic alerts, official circulars, attendance warnings.

---

## 2. Overall Description

### 2.1 Product Perspective & System Architecture
EduPulse DIK is a self-contained 3-tier web platform consisting of:
- **Presentation Tier:** Single Page Application (SPA) utilizing vanilla ECMAScript 2022 modules, CSS3 design tokens, responsive Tailwind CSS layouts, and dynamic Chart.js data visualizations.
- **Application Tier:** Node.js Express REST API (`/api/v1`) featuring JWT authentication, role-based access control (RBAC), and sanitization pipelines.
- **Data Tier:** Relational SQL persistence engine in 3rd Normal Form (3NF) supporting MySQL 8 / MariaDB as the primary enterprise target and SQLite 3 as a zero-configuration local fallback.

### 2.2 System Interfaces
- **Web Browser Client:** Cross-browser compatibility across Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari, and Opera.
- **Biometric Device Interface:** Formatted CSV/Excel parsing and direct ZKTeco time-attendance protocol integration.
- **Notification Services:** SMTP email dispatch via Nodemailer and SMS notification abstraction.

---

## 3. Specific Functional Requirements (Numbered)

### 3.1 Authentication & Security (R-001 - R-005)
- **R-001 (JWT Authentication):** The system shall authenticate users via cryptographically signed JSON Web Tokens (JWT) with automatic expiration and refresh token rotation.
- **R-002 (Password Security):** All user passwords shall be hashed using Bcrypt with a minimum salt work factor of 10.
- **R-003 (Role-Based Access Control):** Every API endpoint and frontend view shall enforce strict RBAC permissions based on defined user roles.
- **R-004 (Rate Limiting & Threat Protection):** The API shall rate-limit authentication endpoints to 20 requests per 15 minutes to thwart brute-force attacks.
- **R-005 (Comprehensive Audit Logging):** All financial actions (fines, payments, reversals) and grade alterations shall be permanently logged in the `audit_logs` table with IP address and timestamp.

### 3.2 Academic Performance & Grading Engine (R-010 - R-015)
- **R-010 (HEC / Gomal University Scale):** The system shall calculate letter grades and grade points according to the official Gomal University grading scale (85%+ = 4.0 A+, 80-84% = 3.7 A, 75-79% = 3.3 B+, etc.).
- **R-011 (Assessment Weightages):** Marks evaluation shall automatically combine Midterm (30%), Final Exam (50%), and Sessional/Quizzes (20%).
- **R-012 (Cumulative GPA):** Semester GPA and Cumulative CGPA shall be calculated dynamically as credit-hour-weighted averages: $\text{CGPA} = \frac{\sum (\text{GPA}_i \times \text{CH}_i)}{\sum \text{CH}_i}$.
- **R-013 (Detailed Marks Certificate):** The system shall generate printable, A4-formatted Detailed Marks Certificates (DMCs) with official college header, student details, QR verification code, and controller signature lines.

### 3.3 Attendance & Eligibility Tracking (R-020 - R-024)
- **R-020 (Daily Attendance Register):** Teachers shall be able to mark daily attendance with single-click Present, Absent, and Leave statuses.
- **R-021 (75% Minimum Threshold Rule):** The system shall continuously compute percentage attendance and flag students falling below 75% as "Ineligible for Final Examination".
- **R-022 (Bulk Biometric Import):** The system shall support bulk CSV/Excel import of biometric time-attendance records.

### 3.4 Fine & Financial Management (R-030 - R-034)
- **R-030 (Fine Issuance):** Accounts staff shall be able to issue penalty fines for attendance shortages, library overdue books, or disciplinary issues.
- **R-031 (Payment & Receipts):** The system shall record fine payments and generate official numbered receipts.
- **R-032 (Ledger Reversal & Undo):** Authorized staff shall have the ability to reverse erroneous payments or waive fines with mandatory justification remarks.

### 3.5 Predictive Analytics & Early Warning (R-040 - R-043)
- **R-040 (At-Risk Student Identification):** The heuristic analytics engine shall identify students at risk of academic failure based on a combined vector of low attendance (<75%), failing midterm score (<50%), or historical GPA drop.
- **R-041 (Visual Performance Radar):** The system shall render multi-axis radar charts comparing individual student competencies against class averages.

---

## 4. Non-Functional Requirements

- **Performance:** Database queries must execute within 150ms for datasets exceeding 5,000 records.
- **Portability:** The web application shall run on any Windows or Linux workstation and operate across modern desktop and mobile browsers.
- **Maintainability:** Modular architecture adhering to DRY and SOLID design principles with zero framework dependencies on the frontend.
- **Data Integrity:** Strict foreign key constraints with cascade behaviors and transactional integrity on financial operations.
