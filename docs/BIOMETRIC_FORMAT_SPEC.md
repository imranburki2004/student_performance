# Biometric Time-Attendance CSV/Excel Format Specification
Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
Bachelor of Science in Computer Science (Session 2022–2026)

---

## 1. Specification Overview
This document specifies the institutional standard CSV format for importing automated biometric time-attendance punch logs (fingerprint, facial recognition, RFID card) into the **Student Performance & Attendance Analytics Dashboard**.

## 2. Standard CSV Column Schema

| Column Name | Data Type | Required | Description | Example |
|---|---|:---:|---|---|
| `device_user_id` | Integer | Yes | Unique numerical user ID registered in the biometric hardware. | `101` |
| `student_id` | String | Yes | Institutional roll number (mapped to college student record). | `CS-2201` |
| `timestamp` | Datetime (ISO/Standard) | Yes | Date and time of punch log (`YYYY-MM-DD HH:MM:SS`). | `2026-10-25 08:24:12` |
| `device_id` | String | Yes | Identifier of terminal (e.g. gate or lab terminal). | `BIO-DEV-01` |
| `punch_type` | String | Yes | Direction of punch (`IN` / `OUT`). | `IN` |
| `status` | String | Optional | Inferred or device status (`Present`, `Late`, `Absent`). | `Present` |

## 3. Pre-Import Validation Rules
1. **Duplicate Detection:** Multiple punches by the same `device_user_id` within a 15-minute window are flagged as duplicate scans and consolidated.
2. **Student ID Mapping:** The `student_id` must match an active enrolled student in `data/students.csv`. Unmapped IDs are quarantined in an error report.
3. **Threshold Rules:**
   - Punch before 08:45 AM $\to$ `Present` (On time).
   - Punch between 08:45 AM and 09:30 AM $\to$ `Late`.
   - No punch recorded $\to$ `Absent`.
   - Approved leave slip $\to$ `Excused`.

## 4. Hardware Adapter Architecture
- **Local File Adapter (`CSVFileAdapter`):** Fully operational offline parser reading CSV/Excel exports from ZKTeco, Anviz, or Realtime devices.
- **Hardware HTTP Adapter (`HTTPDeviceAdapter`):** Network endpoint stub for push SDKs/ADMS. Configuration: `DEVICE_ENDPOINT`, `DEVICE_PORT`, `API_KEY`. Marked as *Requires Device Credentials*.
