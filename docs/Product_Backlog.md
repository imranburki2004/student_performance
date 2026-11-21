# Product Backlog & User Stories (MoSCoW Prioritized)
**EduPulse DIK — Govt. Degree College No. 1, Dera Ismail Khan**

---

| ID | User Story | Acceptance Criteria | Priority | Sprint |
|---|---|---|---|---|
| **US-01** | As an Admin, I want to authenticate using my credentials so that I can access administrative controls. | Login with username/password returns JWT token; invalid attempts increment lock counter. | **Must Have** | Sprint 1 |
| **US-02** | As an Evaluator, I want the system to run locally in the browser with zero database setup so that I can evaluate it instantly. | Application runs directly via browser LocalStorage with zero database configuration needed. | **Must Have** | Sprint 1 |
| **US-03** | As a Principal, I want to view college-wide KPIs (total enrollment, pass rate, attendance average) so that I have executive oversight. | Executive dashboard displays real-time KPI cards and departmental comparison chart. | **Must Have** | Sprint 4 |
| **US-04** | As an HOD, I want to inspect semester progression and subject pass rates so that I can monitor curriculum delivery. | HOD dashboard displays 1st-8th semester metrics with subject pass/fail ratios. | **Must Have** | Sprint 4 |
| **US-05** | As a Teacher, I want to enter and edit mid/final/sessional marks for my assigned classes so that results are computed. | Gradebook interface allows input of marks out of 100 with real-time GPA and grade calculation. | **Must Have** | Sprint 3 |
| **US-06** | As a Teacher, I want an interactive attendance register with "Mark All Present" so that I can record daily attendance quickly. | Quick status toggle for Present/Absent/Leave; automatically calculates student attendance percentage. | **Must Have** | Sprint 3 |
| **US-07** | As a Faculty member, I want to see an At-Risk alert for students falling below 75% attendance or failing tests so that I can intervene. | Visual warning badges appear next to at-risk students with specific risk factors listed. | **Should Have**| Sprint 5 |
| **US-08** | As an Accounts Clerk, I want to issue fines and record payments with printable receipts so that college dues are audited. | Fines table supports Pay, Unpay, and Waive with receipt number generation and audit logging. | **Must Have** | Sprint 5 |
| **US-09** | As a Student, I want to view my semester GPA, CGPA, and detailed subject marks so that I know my academic standing. | Student portal shows GPA progress graph, subject breakdown, and attendance meter. | **Must Have** | Sprint 4 |
| **US-10** | As a Student or Controller, I want to print an official Detailed Marks Certificate (DMC) with QR code and college seal. | Formatted A4 printable DMC with GDC No. 1 D.I. Khan header, grades, GPA, and signature blocks. | **Must Have** | Sprint 3 |
| **US-11** | As an Admin, I want to create manual or automated database backups so that college records are never lost. | "Backup Now" creates compressed SQL dump in `database/backups` with one-click restore. | **Should Have**| Sprint 6 |
| **US-12** | As a User, I want to install the application as a PWA on my mobile phone so that I can access it like a native app. | Web App Manifest and Service Worker enable "Add to Home Screen" and offline caching. | **Could Have** | Sprint 6 |
