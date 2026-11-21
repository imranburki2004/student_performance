# 6-Sprint Project Plan & Agile Cadence
**EduPulse DIK — Govt. Degree College No. 1, Dera Ismail Khan**

---

### Sprint 1: System Foundation & Client Architecture (Weeks 1-2)
- Architecture initialization, client-side store, LocalStorage and CSV engine.
- 3NF Relational Database schema (MySQL 8 + SQLite fallback) with 25 tables.
- Realistic seed dataset for GDC No. 1 D.I. Khan (7 departments, faculty, 100+ students).
- Database abstraction layer supporting parameterized queries.
- JWT authentication, Bcrypt password hashing, and RBAC middleware.
- Comprehensive technical documentation (`SRS.md`, `TECH_STACK_EXPLAINED.md`, `METHODOLOGY.md`).

### Sprint 2: Core Academic Entity Management (Weeks 3-4)
- Student Registry module with Roll number, registration number, and profile management.
- Faculty directory and subject assignment mapping.
- Department and program configuration (BS 4-Year curricula).
- Server-side pagination, sorting, and multi-field global search engine.

### Sprint 3: Examination, Grading & Attendance Engines (Weeks 5-6)
- Standard HEC / Gomal University grading calculation engine (85%+ = 4.0, 50% pass).
- Teacher Gradebook for entering Sessional (20%), Midterm (30%), and Final (50%) scores.
- Interactive attendance register with single-click "Mark All Present".
- 75% attendance rule warning evaluator.
- Printable, A4-ready Detailed Marks Certificate (DMC) generator with QR verification code.

### Sprint 4: Multi-Role Dashboards & Interactive Visualizations (Weeks 7-8)
- Principal / Executive Dashboard with institutional KPI cards and department comparison charts.
- HOD Dashboard with semester progression metrics and faculty turnaround tracking.
- Teacher Dashboard with grade entry and attendance shortcuts.
- Student & Parent Portal with CGPA gauge, attendance meter, and subject breakdowns.
- Dark/light mode theme engine and responsive mobile layout.

### Sprint 5: Fines Management & Predictive Analytics (Weeks 9-10)
- Fine issuance, payment collection, and official receipt generator.
- Ledger reversal ("Unpay") and fine waiving with mandatory justification logging.
- Predictive At-Risk Student Heuristic Engine (multi-vector evaluation).
- Audit trail logging for all sensitive grade and financial changes.

### Sprint 6: Reporting, Backups, PWA & Final Deployment (Weeks 11-12)
- Excel / CSV bulk data export and biometric attendance log importer.
- Automated daily backups and manual backup/restore script (`scripts/backup.js`).
- Progressive Web App (PWA) manifest and service worker for mobile installation.
- Deployment guide for Render, VPS, and Cloudflare tunnel.
- Comprehensive FYP presentation guide and viva walkthrough.
