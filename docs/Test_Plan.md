# Quality Assurance & Test Plan
**EduPulse DIK — Govt. Degree College No. 1, Dera Ismail Khan**

---

## 1. Testing Strategy (V-Model Alignment)
- **Unit Testing:** Individual mathematical functions (HEC GPA engine, weighted marks calculator, attendance percentage calculator).
- **Integration Testing:** API route authentication, RBAC middleware filters, database transaction atomicity.
- **System Testing:** End-to-end multi-role workflows from login to DMC printing.
- **User Acceptance Testing (UAT):** Real-world college operational scenarios tested against user stories.

---

## 2. Test Cases Specification

### Suite 1: Academic Grading & GPA Engine
| Test Case ID | Test Scenario | Inputs | Expected Output | Status |
|---|---|---|---|---|
| **TC-GR-01** | Grade determination for 88% | Percentage: 88.0% | Grade: `A+`, GP: `4.00`, Status: `Pass` | **PASSED ✅** |
| **TC-GR-02** | Grade determination for 72% | Percentage: 72.0% | Grade: `B`, GP: `3.00`, Status: `Pass` | **PASSED ✅** |
| **TC-GR-03** | Marginal pass test for 51% | Percentage: 51.0% | Grade: `D`, GP: `1.70`, Status: `Pass` | **PASSED ✅** |
| **TC-GR-04** | Failing threshold for 48% | Percentage: 48.0% | Grade: `F`, GP: `0.00`, Status: `Fail` | **PASSED ✅** |
| **TC-GR-05** | Weighted marks composition | Sessional: 18/20, Mid: 26/30, Final: 42/50 | Total: `86.0/100`, Grade: `A+`, GPA: `4.00` | **PASSED ✅** |

### Suite 2: Attendance & Exam Eligibility
| Test Case ID | Test Scenario | Inputs | Expected Output | Status |
|---|---|---|---|---|
| **TC-AT-01** | Student attendance >= 75% | Present: 27, Total: 30 (90%) | Exam Status: `Eligible` | **PASSED ✅** |
| **TC-AT-02** | Student attendance < 75% | Present: 20, Total: 30 (66.6%) | Exam Status: `Ineligible (<75%)` | **PASSED ✅** |
| **TC-AT-03** | Batch "Mark All Present" | 10 students marked | All punch states set to `P` | **PASSED ✅** |

### Suite 3: Fines & Ledger Reversal
| Test Case ID | Test Scenario | Inputs | Expected Output | Status |
|---|---|---|---|---|
| **TC-FN-01** | Record fine payment | Fine: FN-2026-001, Amount: Rs. 500 | Status: `PAID`, Receipt generated | **PASSED ✅** |
| **TC-FN-02** | Reverse payment without remark | Reversal remark: `null` | Operation Blocked: `Remark required` | **PASSED ✅** |
| **TC-FN-03** | Reverse payment with remark | Remark: `Bank deposit duplicate` | Status: `REVERSED`, Logged in audit | **PASSED ✅** |
