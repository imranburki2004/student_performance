# Security Architecture & Policies — Student Performance & Attendance Analytics Dashboard
Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
BS Computer Science (Session 2022–2026)

---

## 1. Security Overview & Philosophy
The **Student Performance & Attendance Analytics Dashboard** is designed for educational institutional deployment with a zero-database CSV architecture and client-side isolation enforcement. Security principles adhere to IEEE 830-1998 standards, OWASP Top 10 guidelines, and strict role-based access control (RBAC).

---

## 2. Authentication & Credential Storage

### 2.1 Password Hashing
- Passwords are never stored in plaintext anywhere in the application or filesystem.
- All stored credentials in `data/users.csv` are cryptographically hashed using **Bcrypt** with an adaptive work factor (cost) of 10 (`$2a$10$...`).
- Salt values are generated per-user using secure pseudorandom number generators (CSPRNG), thwarting rainbow-table attacks.

### 2.2 Seed Demo Accounts & Credentials (Documented for Grading & Viva)
| Role | Username | Institutional Email | Demo Password | Default Scope |
|---|---|---|---|---|
| **Administrator** | `admin` | `admin@gdc1.edu.pk` | `Admin@123` | Full College System Control, User Creation, CSV Read/Write |
| **Teacher / Faculty** | `rehman_faculty` | `rehman@gdc1.edu.pk` | `Teacher@123` | Scoped to Computer Science classes, Marks & Attendance Entry |
| **Student (Merit)** | `ali_cs2201` | `ali@gdc1.edu.pk` | `Student@123` | Strictly Isolated to Self Profile (Roll No: `CS-2201`) |
| **Student (At-Risk)** | `hassan_cs2204` | `hassan@gdc1.edu.pk` | `Student@123` | Strictly Isolated to Self Profile (Roll No: `CS-2204`) |

---

## 3. Role-Based Access Control (RBAC) Matrix
A single central permissions authority ([`js/permissions.js`](file:///c:/Users/WAQAS%20COMPUTER/OneDrive/Documents/student%20perormance%20dasboard/js/permissions.js)) enforces route and resource access across both frontend and backend layers.

| Permission Key | Administrator | Teacher | Student | Parent |
|---|:---:|:---:|:---:|:---:|
| `view_all_students` | ✅ Yes | ✅ Dept Only | ❌ No | ❌ No |
| `view_own_student` | ✅ Yes | ✅ Yes | ✅ Self Only | ✅ Child Only |
| `create_student` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `edit_student` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `delete_student` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `mark_attendance` | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| `enter_results` | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| `collect_fine` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `manage_users` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `view_audit_logs` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `export_csv` | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| `reset_baseline` | ✅ Yes | ❌ No | ❌ No | ❌ No |

---

## 4. Student Data Isolation Policy
- **Isolation Rule:** When a user logs in with the `student` role (e.g. `ali_cs2201` or `hassan_cs2204`), the application strictly binds their session to their designated institutional roll number (`student_id`).
- **Enforcement Mechanism:**
  1. The student directory list is filtered to hide all peers.
  2. Any programmatic or DOM-based attempt to invoke `openStudentDetail(targetId)` for an unlinked student ID is intercepted by `verifyStudentAccess()`.
  3. The request is immediately rejected with a **`403 Forbidden`** security violation toast, preventing unauthorized viewing of peer grades, percentages, or disciplinary fines.

---

## 5. Brute-Force & Rate Limiting Guardrails
- **Threshold:** Maximum of **5 failed login attempts** per username within a 5-minute rolling window.
- **Lockout Mechanism:** Once 5 failed attempts are reached, the account is placed on a **60-second cooldown lock**.
- All subsequent login requests during the cooldown are rejected immediately with the remaining seconds displayed to the user (`Security Lockout: Too many failed login attempts`).
- Successful authentication clears the failed attempt counter.

---

## 6. Threat Modeling & Mitigation Summary

| Threat / Attack Vector | Mitigation Strategy | Implementation |
|---|---|---|
| **SQL Injection** | Zero SQL database runtime. CSV storage eliminates SQL parse trees. | Data Layer (`data/*.csv`) |
| **Cross-Site Scripting (XSS)** | Dynamic values bound via `innerText` and sanitized inputs. Script tags in CSV cells stripped. | `thesisApp.js`, `auth.js` |
| **Credential Stuffing** | Rate limiter locks accounts after 5 failures. Bcrypt work factor slows offline cracking. | `js/auth.js:100` |
| **Privilege Escalation** | Admin navigation elements hidden and function interceptors reject unprivileged callers. | `js/permissions.js` |
| **Cross-Site Request Forgery (CSRF)** | Simulated token validation (`jwt_offline_*`) and state validation on all sensitive operations. | `js/auth.js` |

---
