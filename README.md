# 🎓 Student Performance and Attendance Analytical Dashboard
### Government Degree College No. 1, Dera Ismail Khan (D.I. Khan)
**Bachelor of Science in Computer Science (BSCS 2022-26)**  
*Department of Computer Science*

| Detail | Information |
|---|---|
| **Project Title** | Student Performance and Attendance Analytical Dashboard |
| **Submitted By** | **Imran** (Roll No: **CS-2210** / 2210) |
| **Supervised By** | **Prof. Abdur Rehman** |
| **Institution** | Government Degree College No. 1, Dera Ismail Khan |
| **Operating System** | Windows / Web Browser Based Environment |
| **Development Platform** | Visual Studio Code, Google Chrome or Microsoft Edge |
| **Core Technologies** | HTML5, CSS3, Vanilla JavaScript, Chart.js, LocalStorage, CSV Import/Export |
| **Storage Architecture** | Browser LocalStorage & CSV (**Zero Database Required — 100% Client-Side**) |
| **Execution Environment** | Any Modern Web Browser (Chrome, Edge, Firefox) & Visual Studio Code |
| **Future Work (Chapter 9)**| Advanced Innovation Suite (`future_work/`: AI/ML, SMS/WhatsApp, IoT, Mobile, Payments, Blockchain) |

---

## 📌 Project Overview
The **Student Performance and Attendance Analytical Dashboard** is a web-based application designed to manage student academic records and convert raw data into useful visual analytics for academic decision-making. 

Instead of relying on manual registers or scattered spreadsheet documents, the system provides:
1. **Interactive Dashboard Cards & KPIs:** Total students, at-risk count, average attendance percentage, average CGPA, and performance categories (High Performers, Medium Performers, At-Risk / Danger).
2. **Attendance Danger & Fine Management:** Automatic calculation of **Rs. 1,000 fine** for each short attendance subject (< 75%), tracking unpaid and paid fine amounts, with an interactive "Pay Fine" action.
3. **Structured Student Directory Groups:** Students organized by academic departments (Botany, Chemistry, Computer Science, English, HPE, Islamiat, Mathematics, Physics) and sessions.
4. **Student Detail Analytics:** Individual profile card, semester GPA progression bar chart (scale 0.0 - 4.0), overall attendance ratio donut chart, subject evaluation table (out of 60 marks total: Sessional 6, Mid 18, Terminal 36), and printable Detailed Marks Certificate (DMC).
5. **Full CRUD Academic Records Management:**
   - **Add New Data (Create):** Register new students with dynamic subject evaluations (out of 60 marks: Sessional max 6, Mid max 18, Terminal max 36).
   - **View Analytics (Read):** Deep-dive into semester GPA progression and attendance ratio donut charts.
   - **Update Student (Edit):** Dedicated edit modal to update names, father names, departments, semesters, subject marks, and attendance %.
   - **Delete Record (Delete):** Remove records with instant cascading recalculations across all dashboard KPIs.
6. **CSV Backup Support:** Single-click CSV export and import for full data portability without any database installation.

---

## 🖥️ Screen Layouts (Matching Thesis Chapter 8)

### 1. Dashboard Section (Chapter 8.1.1, Figure 8.1)
- Dark navy summary banner: Total Students (100), At-Risk (40), Avg Attendance (79.4%), Average CGPA (2.61).
- 4 Performance Category KPI Cards:
  - Total Students: 100 (*Database Enrollments*)
  - High Performers: 40 (*40.0% of Total*) [CGPA ≥ 3.0]
  - Medium Performers: 40 (*40.0% of Total*) [CGPA 2.0 - 2.9]
  - At Risk / Danger: 40 (*40.0% of Total*) [Attendance < 75% or CGPA < 2.0]
- Financial Analytics (Attendance Fines):
  - Total Unpaid Fines: Rs. 189,000 (*Pending Collection*)
  - Total Collected Fines: Rs. 0 (*Successfully Paid*)
- Department-wise Fine Collection Breakdown.
- Academic Performance Distribution Chart (Chart.js).

### 2. Student Directory Section (Chapter 8.1.2, Figure 8.2)
- Header: *Student Directory Groups — Viewing and Affiliation by Department and Session*.
- Actions: `[ Import CSV Data ]` and `[ Export CSV Data ]`.
- Department Groups: Botany, Chemistry, Computer Science, English, HPE, Islamiat, Mathematics, Physics.
- Search bar across all students by Name, Roll Number, or Department.
- Actions: *View Analytics* and *Delete Record*.

### 3. Student Detail Analytics Section (Chapter 8.1.3, Figure 8.3)
- Navigation: `← Back to Student List`.
- Student Profile Banner: Student Name, Father's Name, Department, Overall CGPA, Overall Percentage, Overall Grade, Total Unpaid Fine, Total Paid Fine, Risk Status.
- Visual Charts:
  - *Semester GPA Progression* (Bar Chart across semesters 1 to 4).
  - *Overall Attendance Ratio* (Donut Ring Chart: Avg Attendance vs Avg Absence).
- Semesters Directory Table (Out of 60 Marks Total):
  - Subject Name, Teacher Name, Sessional (out of 6), Mid (out of 18), Terminal (out of 36), Total (out of 60), Subject GPA, Subject Grade.
- Attendance Danger & Fine Management Table:
  - Attendance (%), Attendance Danger (Safe / Danger), Fine Paid, Unpaid Fine (Rs. 1,000 per short subject), Paid Fine.
  - Interactive `[ Pay Fine ]` button that updates LocalStorage and dashboard statistics immediately!
- `[ 🖨️ Print DMC ]` button for the official A4 printable Detailed Marks Certificate.

### 4. Add Student Section (Chapter 8.1.4, Figure 8.4)
- Form: *Student Academic Entry Form*.
- Personal Profile: Student Name, Father's Name, Department dropdown, Session Start (2024), Session End (2028).
- Semester Allocation: Semester 1 - 8.
- Subjects & Evaluation (Out of 60 Marks Total):
  - Dynamic rows with `+ Add Subject`.
  - Sessional Marks (max 6), Mid Marks (max 18), Terminal Marks (max 36), Attendance %.
  - Real-time form validation preventing marks from exceeding limits.
  - Automatic calculation of CGPA, GPA, and Rs. 1,000 fine for any subject with attendance < 75%.
  - `Save Student Record` button.

---

## 🚀 How to Run the Project

### Method 1: 1-Click Desktop Launcher (Recommended)
Simply double-click:
`START_DASHBOARD.bat`
This instantly launches the dashboard in your default browser (Google Chrome, Microsoft Edge, etc.) without requiring any terminal commands or software installation!

### Method 2: Instant Direct Browser Execution (Zero Setup)
Simply double-click:
`public/index.html` (or `index.html` in root)
It opens directly in your browser with complete LocalStorage functionality, offline Chart.js visualizations, fine payments, DMC printing, and CSV import/export!

### Method 3: Running in Visual Studio Code
1. Open the project folder in **VS Code**.
2. Right click `public/index.html` and choose **"Open with Live Server"** or **"Open with Default Browser"**.
3. (Optional if Node is installed): Run `node server.js` and open `http://localhost:3000`.

---

## 📁 Project Structure (100% Zero-Database Architecture)
```
student-performance-dashboard/
├── START_DASHBOARD.bat        # 1-Click launcher to open dashboard directly in browser
├── index.html                 # Main dashboard UI (Figures 8.1, 8.2, 8.3, 8.4)
├── README.md                  # Complete project documentation matching thesis
├── css/
│   ├── thesis.css             # Main stylesheet replicating Chapter 8 figures
│   └── print.css              # Official A4 Detailed Marks Certificate (DMC) stylesheet
├── js/
│   ├── chart.min.js           # Bundled Chart.js v4.4.1 (100% offline support)
│   ├── initialData.js         # Default 100-student seed dataset matching Figure 8.1
│   └── thesisApp.js           # Core analytics, LocalStorage engine & CSV exporter
├── sample_data/               # Sample data files for live viva presentation
│   └── gdc1_students_sample.csv # Ready-to-import CSV demo file
├── public/                    # Mirror directory for web servers
├── docs/                      # Thesis Documentation & UML Diagrams
└── future_work/               # Chapter 9 Innovation Suite (All Future Work Modules)
    ├── START_FUTURE_WORK.bat  # 1-Click launcher for Future Work live interactive hub
    ├── index.html             # Future Work interactive simulators and outputs
    ├── CHAPTER_9_FUTURE_WORK.md # Complete thesis Chapter 9 ready for printing
    ├── README_FUTURE_WORK.md  # Detailed future work portfolio guide
    ├── ai_prediction/         # 9.2 Machine Learning Student Risk Predictor (Python)
    ├── sms_gateway/           # 9.3 Automated SMS & WhatsApp Parent Alert Gateway
    ├── iot_rfid/              # 9.4 IoT Biometric & RFID Attendance Terminal (Arduino)
    ├── mobile_app/            # 9.5 Cross-Platform Student & Parent Mobile App (React Native)
    ├── digital_payments/      # 9.6 Digital Payment Gateway (JazzCash / EasyPaisa)
    ├── blockchain_verification/# 9.7 Blockchain Anti-Forgery DMC Verifier (SHA-256)
    └── database/              # 9.8 Future centralized multi-campus SQL schemas
```

---

## 🎓 Viva & Evaluation Tips for Imran

1. **Thesis Compliance:** When the examiners ask about database technology, refer to **Chapter 5.6** and **Chapter 8**:
   > *"The project is intentionally engineered as a lightweight, browser-based system using LocalStorage and CSV Import/Export so that academic staff can use it on standard college PCs without complex database servers."*
2. **Future Work Demonstration:** If the examiners ask *"What if the college wants a centralized MySQL database across multiple campuses in the future?"*, show them **Chapter 9.1** and the `future_work/database/` folder:
   > *"Sir, this is documented in Chapter 9.1 Future Work, and I have already designed the complete MySQL migration schema and seed scripts in the `future_work/` directory for future expansion!"*
3. **Interactive Demo:**
   - Show the **Dashboard** with the 4 performance KPI cards and financial fine collection (Rs. 189,000 unpaid fines).
   - Show the **Student Directory Groups** by department.
   - Click a student (e.g. *Ali Raza* or *Zeeshan Khan*) to show **Student Detail Analytics** with the GPA progression bar chart and attendance ratio donut chart.
   - Click **Pay Fine (Rs. 1,000)** on a student with short attendance; show the examiners how the fine status changes to Paid and the dashboard financial counters update automatically!
   - Click **Export CSV Data** to show that data can be exported to Excel anytime.
   - Click **Print DMC** to show the official formatted transcript.
