# Software Engineering Methodology & System Design
**Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)**
*Final Year Project — EduPulse DIK (Student Performance Dashboard & College Management System)*

---

## 1. Development Methodology: Hybrid Engineering Model

In academic and enterprise software development, adopting a pure Agile approach often leads to incomplete documentation, while pure Waterfall lacks flexibility. For **EduPulse DIK**, we adopted an engineered **Hybrid Software Engineering Lifecycle Model**:

1. **Requirements & Architectural Specification (Waterfall Stage):** Complete upfront SRS (Software Requirements Specification), database entity-relationship modeling, and UX wireframing to establish the system scope and institutional policies.
2. **Implementation & Incremental Builds (Scrum Framework):** Divided into six 2-week sprints delivering testable increments (Sprint 1: Core Foundation & DB $\to$ Sprint 6: Deployment & Evaluation).
3. **Task & Flow Management (Kanban Board):** Continuous tracking through visual states: `Backlog` $\to$ `To Do` $\to$ `In Progress` $\to$ `Review/Test` $\to$ `Done`.
4. **Quality Assurance (V-Model Integration):** Every development artifact has a direct testing counterpart (Requirements $\leftrightarrow$ UAT, Architecture $\leftrightarrow$ System Tests, Module Design $\leftrightarrow$ Integration Tests, Code $\leftrightarrow$ Unit Tests).
5. **Delivery Mindset (CI/CD Ready):** Automated verification scripts, containerization, and single-command deployment routines.

---

## 2. Sprint Roadmap (6 Sprints)

| Sprint | Timeline | Objectives & Deliverables | Quality Gate |
|---|---|---|---|
| **Sprint 1** | Weeks 1-2 | Architecture setup, SQL schema, seed data, Auth/RBAC, DB abstraction layer | All tables indexed, JWT auth passes |
| **Sprint 2** | Weeks 3-4 | Core Entity CRUD (Students, Teachers, Departments, Classes, Subjects), global search | Full pagination, input validation active |
| **Sprint 3** | Weeks 5-6 | Marks entry, Gomal University GPA engine, Attendance register, DMC generation | 100% calculation accuracy against test cases |
| **Sprint 4** | Weeks 7-8 | Multi-Role Dashboards (Principal, HOD, Teacher, Student/Parent), Chart.js visual analytics | Cross-role data privacy, responsive layouts |
| **Sprint 5** | Weeks 9-10 | Fines Management (Pay, Unpay, Undo/Redo, Audit), Predictive At-Risk Heuristic Engine | Financial transaction audit trail verified |
| **Sprint 6** | Weeks 11-12 | Biometric import, Excel/CSV reporting, automated backup/restore, PWA, deployment | Production readiness, zero-downtime launch |

---

## 3. System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Presentation Layer (Client Browsers & Devices)"]
        UI_Web["Desktop Browsers (Chrome, Edge, Firefox, Safari)"]
        UI_Mobile["Mobile PWA (Service Worker & Cache API)"]
    end

    subgraph SecurityGate["Security & Middleware Pipeline"]
        MW_Helmet["Helmet Security Headers"]
        MW_RateLimit["Express Rate Limiter"]
        MW_CORS["CORS Policy Enforcement"]
        MW_JWT["JWT Authentication & RBAC Filter"]
        MW_Validate["Express Validator & Sanitizer"]
    end

    subgraph ServiceLayer["Application & Core Services Layer"]
        SVC_Auth["Auth & Session Service"]
        SVC_Grade["Grading & GPA Engine (HEC/Gomal Scale)"]
        SVC_Attend["Attendance & Eligibility Engine (75% Rule)"]
        SVC_Predict["Predictive Analytics & At-Risk Heuristics"]
        SVC_Fine["Fine & Fee Ledger Service (Pay/Unpay/Undo)"]
        SVC_Report["Reporting Engine (PDFKit, ExcelJS, Fast-CSV)"]
        SVC_Cron["Cron Scheduler (Daily Scans & Backups)"]
    end

    subgraph DataLayer["Persistence & Database Layer"]
        DB_Adapter["Database Abstraction Layer"]
        DB_MySQL["Primary: MySQL 8 / MariaDB (Enterprise)"]
        DB_SQLite["Fallback: SQLite (Zero-Setup Local)"]
        Storage_Disk["File Storage (Photos, DMCs, Backups)"]
    end

    UI_Web --> SecurityGate
    UI_Mobile --> SecurityGate
    SecurityGate --> ServiceLayer
    ServiceLayer --> DB_Adapter
    DB_Adapter --> DB_MySQL
    DB_Adapter --> DB_SQLite
    ServiceLayer --> Storage_Disk
```

---

## 4. UML Use-Case Diagram

```mermaid
flowchart LR
    Principal((Principal / Executive))
    HOD((Head of Department))
    Teacher((Teacher / Faculty))
    Clerk((Accounts Clerk))
    Student((Student / Parent))
    Admin((System Admin))

    subgraph EduPulseSystem["EduPulse DIK - College Management System"]
        UC_Exec["View College KPIs & Department Benchmarks"]
        UC_Dept["Manage Department Courses & Faculty Workload"]
        UC_Attend["Mark & Import Daily Attendance"]
        UC_Marks["Enter Mid/Final/Sessional Marks"]
        UC_AtRisk["Review At-Risk Student Warnings"]
        UC_Fine["Issue, Collect & Reverse Fines"]
        UC_DMC["View Transcript & Detailed Marks Certificate"]
        UC_Backup["Execute DB Backup & System Restore"]
        UC_Users["Manage Users, Roles & Permissions"]
    end

    Principal --> UC_Exec
    Principal --> UC_AtRisk
    HOD --> UC_Dept
    HOD --> UC_AtRisk
    Teacher --> UC_Attend
    Teacher --> UC_Marks
    Teacher --> UC_AtRisk
    Clerk --> UC_Fine
    Student --> UC_DMC
    Admin --> UC_Users
    Admin --> UC_Backup
```

---

## 5. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : has
    ROLES ||--o{ USERS : assigns
    ROLES ||--o{ ROLE_PERMISSIONS : contains
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : defines
    
    DEPARTMENTS ||--o{ PROGRAMS : offers
    DEPARTMENTS ||--o{ TEACHERS : employs
    PROGRAMS ||--o{ CLASSES : structures
    CLASSES ||--o{ STUDENTS : contains
    
    TEACHERS ||--o{ TEACHER_SUBJECTS : instructs
    SUBJECTS ||--o{ TEACHER_SUBJECTS : taught_in
    CLASSES ||--o{ TEACHER_SUBJECTS : attends
    
    STUDENTS ||--o{ ENROLLMENTS : registers
    SUBJECTS ||--o{ ENROLLMENTS : included_in
    
    STUDENTS ||--o{ ATTENDANCE : logs
    SUBJECTS ||--o{ ATTENDANCE : records
    
    STUDENTS ||--o{ MARKS : achieves
    SUBJECTS ||--o{ MARKS : evaluated_in
    EXAMS ||--o{ MARKS : categorizes
    
    STUDENTS ||--o{ RESULTS : earns
    STUDENTS ||--o{ FINES : owes
    FINES ||--o{ FINE_PAYMENTS : settles
    
    USERS ||--o{ AUDIT_LOGS : triggers
```

---

## 6. Data Flow Diagram (DFD)

### Level 0 — Context Diagram
```mermaid
flowchart TD
    User["College Stakeholders (Principal, Faculty, Accounts, Students)"]
    System[["EduPulse DIK System"]]
    DB[("Central SQL Database")]
    NotificationGate["Notification Gateways (SMTP / SMS)"]

    User -- "Credentials, Marks, Attendance, Payments" --> System
    System -- "DMCs, Reports, Analytics, Audit Trail" --> User
    System <--> DB
    System -- "Attendance Alerts, Fine Receipts" --> NotificationGate
```

### Level 1 — Sub-System Decomposition
```mermaid
flowchart TD
    U["Authenticated User"]
    P1["1.0 Authentication & Session Management"]
    P2["2.0 Student & Academic Registry"]
    P3["3.0 Attendance Tracking (Manual & Biometric)"]
    P4["4.0 Examination & GPA Calculation"]
    P5["5.0 Fee & Fine Financial Ledger"]
    P6["6.0 Predictive Early-Warning Analytics"]
    P7["7.0 Reporting & Transcript Generation"]

    D_Users[("Users & Roles")]
    D_Academic[("Courses, Classes, Enrollments")]
    D_Attendance[("Attendance Logs")]
    D_Marks[("Marks & Results")]
    D_Fines[("Fines & Payments Ledger")]

    U --> P1
    P1 <--> D_Users
    U --> P2
    P2 <--> D_Academic
    U --> P3
    P3 <--> D_Attendance
    U --> P4
    P4 <--> D_Marks
    U --> P5
    P5 <--> D_Fines
    D_Attendance & D_Marks --> P6
    P6 --> U
    D_Marks & D_Academic --> P7
    P7 --> U
```

---

## 7. Sequence Diagrams

### 7.1 Authentication & RBAC Authorization Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as User (Teacher/HOD/Principal)
    participant UI as Web Client (SPA)
    participant API as Express API (/auth/login)
    participant DB as SQL Database
    
    User->>UI: Enter Username & Password
    UI->>API: POST /api/v1/auth/login { username, password }
    API->>DB: SELECT * FROM users WHERE username = ?
    DB-->>API: User Record with Password Hash & Role
    API->>API: bcrypt.compare(password, password_hash)
    alt Password Invalid
        API->>DB: UPDATE users SET failed_attempts = failed_attempts + 1
        API-->>UI: 401 Unauthorized (Invalid credentials)
    else Password Valid
        API->>API: Generate JWT Access Token + Refresh Token
        API->>DB: INSERT INTO refresh_tokens ...
        API-->>UI: 200 OK { token, user: { id, name, role, permissions } }
        UI->>UI: Store Token in Session & Navigate to Dashboard
    end
```

### 7.2 Fine Payment & Instant Ledger Reversal Flow
```mermaid
sequenceDiagram
    autonumber
    actor Clerk as Accounts Clerk
    participant UI as Accounts Dashboard
    participant API as Express API (/fines)
    participant DB as SQL Database
    participant Audit as Audit Logger

    Clerk->>UI: Click "Pay Fine" (Receipt # FN-2026-081)
    UI->>API: POST /api/v1/fines/:id/pay { amount, payment_method }
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE fines SET status = 'paid', paid_at = NOW() WHERE id = ?
    API->>DB: INSERT INTO fine_payments (fine_id, amount, received_by)
    API->>Audit: Log Payment Action in audit_logs
    API->>DB: COMMIT TRANSACTION
    API-->>UI: 200 OK { success: true, receipt_no: "REC-9021" }
    UI->>UI: Update Ledger & Display Green "Paid" Badge
```

---

## 8. Deployment Architecture Diagram

```mermaid
flowchart LR
    Client["Client Browsers (Edge / Chrome / Mobile)"]
    Cloudflare["Cloudflare (SSL / CDN / DDoS Shield)"]
    Nginx["Nginx Reverse Proxy (:80 / :443)"]
    PM2["Node.js Application Cluster (PM2 - :3000)"]
    MySQL["MySQL 8 Enterprise Database (:3306)"]
    Storage["Local / S3 Secure File Store"]

    Client --> Cloudflare
    Cloudflare --> Nginx
    Nginx --> PM2
    PM2 --> MySQL
    PM2 --> Storage
```
