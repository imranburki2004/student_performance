/**
 * STUDENT ANALYTICS EXPLORER & DRILL-DOWN ENGINE
 * Student Performance & Attendance Analytics Platform
 * Govt. Degree College No. 1, D.I. Khan
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 *
 * Implements:
 * 1. Power BI-style "STUDENT ANALYTICS EXPLORER" on Main Dashboard
 * 2. Academic Department Directory (21 Faculties) with full CRUD (Add/Edit/Deactivate)
 * 3. Dashboard Interactive Split-Console: Department -> Session/Batch -> Student Analytics Card
 * 4. Department -> Academic Sessions Drill-Down (Batch 25, Batch 26, Batch 27, Batch 28)
 * 5. Session -> Complete Student Directory (All High, Medium, and At-Risk students)
 * 6. 14-Column Directory with Search, Sort, Filter, and Pagination
 * 7. 360-Degree Individual Student Analytics with Performance & Attendance Charts
 * 8. Multi-Level Reverse Navigation (Breadcrumbs & Back buttons)
 *
 * Zero-SQL Architecture: Browser LocalStorage + CSV Fallback. 100% Offline Capable.
 * 100% Clean ASCII Encoding: Standard HTML entities used throughout.
 */

(function () {
  'use strict';

  const DEPT_STORAGE_KEY = 'app_academic_departments';
  const SECTION_PAGE_SIZE = 15;

  // Standard 4-Year BS Academic Sessions (Cohorts)
  const STANDARD_SESSIONS = [
    { id: '2022-2026', batch: 'Batch 26', name: 'Session 2022-2026', label: 'Batch 26 (Current 4th/5th Sem)', years: '2022-2026', sem: 'Semester 4' },
    { id: '2021-2025', batch: 'Batch 25', name: 'Session 2021-2025', label: 'Batch 25 (Final Year / 8th Sem)', years: '2021-2025', sem: 'Semester 8' },
    { id: '2023-2027', batch: 'Batch 27', name: 'Session 2023-2027', label: 'Batch 27 (2nd Year / 2nd Sem)', years: '2023-2027', sem: 'Semester 2' },
    { id: '2024-2028', batch: 'Batch 28', name: 'Session 2024-2028', label: 'Batch 28 (Freshmen / 1st Sem)', years: '2024-2028', sem: 'Semester 1' }
  ];

  // State
  let currentExplorerDeptId = 'CS';
  let currentExplorerSessionId = '2022-2026';
  let currentDashboardDeptId = 'CS';
  let currentDashboardSessionId = '2022-2026';
  let currentDashboardStudentId = 2; // Default to Imran Burki (CS-2210)
  let dashboardRosterSearchQuery = '';
  let dashboardRosterFilter = 'ALL';

  let directorySearchQuery = '';
  let directoryFilterCategory = 'ALL';
  let directorySortField = 'cgpa';
  let directorySortOrder = 'desc';
  let directoryCurrentPage = 1;

  // Chart References for safe destruction
  let explorerCharts = {
    deptOutcome: null,
    deptSectionComp: null,
    sectionHist: null,
    sectionProg: null,
    studentCgpa: null,
    studentSubjects: null,
    studentAttendance: null
  };

  function safeDestroyChart(key) {
    if (explorerCharts[key] && typeof explorerCharts[key].destroy === 'function') {
      explorerCharts[key].destroy();
      explorerCharts[key] = null;
    }
  }

  // ========================================================
  // 1. DEFAULT ACADEMIC DEPARTMENTS & SESSIONS SEED
  // ========================================================
  const DEFAULT_DEPARTMENTS = [
    {
      id: 'CS',
      code: 'CS',
      name: 'Computer Science',
      head: 'Prof. Abdur Rehman',
      color: '#2563eb',
      icon: 'CS',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'CS-A', name: 'CS-A', session: '2022-2026', semester: 'Semester 4', room: 'IT Lab 1', shift: 'Morning' },
        { id: 'CS-B', name: 'CS-B', session: '2022-2026', semester: 'Semester 4', room: 'IT Lab 2', shift: 'Morning' }
      ]
    },
    {
      id: 'SE',
      code: 'SE',
      name: 'Software Engineering',
      head: 'Dr. Sajid Khan',
      color: '#0284c7',
      icon: 'SE',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'SE-A', name: 'SE-A', session: '2022-2026', semester: 'Semester 4', room: 'SE Lab 1', shift: 'Morning' },
        { id: 'SE-B', name: 'SE-B', session: '2022-2026', semester: 'Semester 4', room: 'SE Lab 2', shift: 'Morning' }
      ]
    },
    {
      id: 'IT',
      code: 'IT',
      name: 'Information Technology',
      head: 'Engr. Waqas Ahmad',
      color: '#0d9488',
      icon: 'IT',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'IT-A', name: 'IT-A', session: '2022-2026', semester: 'Semester 4', room: 'Network Lab 1', shift: 'Morning' },
        { id: 'IT-B', name: 'IT-B', session: '2022-2026', semester: 'Semester 4', room: 'Network Lab 2', shift: 'Morning' }
      ]
    },
    {
      id: 'AI',
      code: 'AI',
      name: 'Artificial Intelligence',
      head: 'Dr. Irfan Ullah',
      color: '#7c3aed',
      icon: 'AI',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'AI-A', name: 'AI-A', session: '2022-2026', semester: 'Semester 4', room: 'Robotics Lab', shift: 'Morning' },
        { id: 'AI-B', name: 'AI-B', session: '2022-2026', semester: 'Semester 4', room: 'AI Research Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'DS',
      code: 'DS',
      name: 'Data Science',
      head: 'Prof. Tariq Bilal',
      color: '#4f46e5',
      icon: 'DS',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'DS-A', name: 'DS-A', session: '2022-2026', semester: 'Semester 4', room: 'Data Lab 1', shift: 'Morning' },
        { id: 'DS-B', name: 'DS-B', session: '2022-2026', semester: 'Semester 4', room: 'Data Lab 2', shift: 'Evening' }
      ]
    },
    {
      id: 'CYS',
      code: 'CYS',
      name: 'Cyber Security',
      head: 'Prof. Nisar Ahmad',
      color: '#dc2626',
      icon: 'CYS',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'CYS-A', name: 'CYS-A', session: '2022-2026', semester: 'Semester 4', room: 'SecOps Lab 1', shift: 'Morning' },
        { id: 'CYS-B', name: 'CYS-B', session: '2022-2026', semester: 'Semester 4', room: 'SecOps Lab 2', shift: 'Evening' }
      ]
    },
    {
      id: 'EE',
      code: 'EE',
      name: 'Electrical Engineering',
      head: 'Engr. Farooq Khan',
      color: '#ea580c',
      icon: 'EE',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'EE-A', name: 'EE-A', session: '2022-2026', semester: 'Semester 4', room: 'Circuits Lab', shift: 'Morning' },
        { id: 'EE-B', name: 'EE-B', session: '2022-2026', semester: 'Semester 4', room: 'Power Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'CE',
      code: 'CE',
      name: 'Civil Engineering',
      head: 'Engr. Khalid Mehmood',
      color: '#b45309',
      icon: 'CE',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'CE-A', name: 'CE-A', session: '2022-2026', semester: 'Semester 4', room: 'Structures Lab', shift: 'Morning' },
        { id: 'CE-B', name: 'CE-B', session: '2022-2026', semester: 'Semester 4', room: 'Hydraulics Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'ME',
      code: 'ME',
      name: 'Mechanical Engineering',
      head: 'Engr. Zafar Iqbal',
      color: '#475569',
      icon: 'ME',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'ME-A', name: 'ME-A', session: '2022-2026', semester: 'Semester 4', room: 'Auto Lab', shift: 'Morning' },
        { id: 'ME-B', name: 'ME-B', session: '2022-2026', semester: 'Semester 4', room: 'Thermal Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'BBA',
      code: 'BBA',
      name: 'Business Administration',
      head: 'Prof. Aslam Niazi',
      color: '#16a34a',
      icon: 'BBA',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'BBA-A', name: 'BBA-A', session: '2022-2026', semester: 'Semester 4', room: 'BBA Hall 1', shift: 'Morning' },
        { id: 'BBA-B', name: 'BBA-B', session: '2022-2026', semester: 'Semester 4', room: 'BBA Hall 2', shift: 'Evening' }
      ]
    },
    {
      id: 'AF',
      code: 'AF',
      name: 'Accounting and Finance',
      head: 'Prof. Bashir Ahmad',
      color: '#059669',
      icon: 'AF',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'AF-A', name: 'AF-A', session: '2022-2026', semester: 'Semester 4', room: 'Finance Rm 1', shift: 'Morning' },
        { id: 'AF-B', name: 'AF-B', session: '2022-2026', semester: 'Semester 4', room: 'Finance Rm 2', shift: 'Evening' }
      ]
    },
    {
      id: 'MATH',
      code: 'MATH',
      name: 'Mathematics',
      head: 'Prof. Qasim Ali',
      color: '#0891b2',
      icon: 'MATH',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'MATH-A', name: 'MATH-A', session: '2022-2026', semester: 'Semester 4', room: 'Block C Rm 4', shift: 'Morning' },
        { id: 'MATH-B', name: 'MATH-B', session: '2022-2026', semester: 'Semester 4', room: 'Block C Rm 5', shift: 'Evening' }
      ]
    },
    {
      id: 'PHYS',
      code: 'PHYS',
      name: 'Physics',
      head: 'Dr. Muhammad Aslam',
      color: '#9333ea',
      icon: 'PHYS',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'PHYS-A', name: 'PHYS-A', session: '2022-2026', semester: 'Semester 4', room: 'Science Block Rm 12', shift: 'Morning' },
        { id: 'PHYS-B', name: 'PHYS-B', session: '2022-2026', semester: 'Semester 4', room: 'Optics Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'CHEM',
      code: 'CHM',
      name: 'Chemistry',
      head: 'Dr. Qaiser Abbas',
      color: '#c026d3',
      icon: 'CHEM',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'CHM-A', name: 'CHM-A', session: '2022-2026', semester: 'Semester 4', room: 'Chemistry Lab 1', shift: 'Morning' },
        { id: 'CHM-B', name: 'CHM-B', session: '2022-2026', semester: 'Semester 4', room: 'Organic Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'BOT',
      code: 'BOT',
      name: 'Botany',
      head: 'Dr. Farhat Ullah',
      color: '#15803d',
      icon: 'BOT',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'BOT-A', name: 'BOT-A', session: '2022-2026', semester: 'Semester 4', room: 'Botany Lab 1', shift: 'Morning' },
        { id: 'BOT-B', name: 'BOT-B', session: '2022-2026', semester: 'Semester 4', room: 'Herbaria Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'ENG',
      code: 'ENG',
      name: 'English',
      head: 'Prof. Naimatullah',
      color: '#e11d48',
      icon: 'ENG',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'ENG-A', name: 'ENG-A', session: '2022-2026', semester: 'Semester 4', room: 'Humanities Rm 8', shift: 'Morning' },
        { id: 'ENG-B', name: 'ENG-B', session: '2022-2026', semester: 'Semester 4', room: 'Language Lab', shift: 'Evening' }
      ]
    },
    {
      id: 'ISL',
      code: 'ISL',
      name: 'Islamiat',
      head: 'Dr. Hafizullah Khan',
      color: '#047857',
      icon: 'ISL',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'ISL-A', name: 'ISL-A', session: '2022-2026', semester: 'Semester 4', room: 'Islamic Hall 1', shift: 'Morning' },
        { id: 'ISL-B', name: 'ISL-B', session: '2022-2026', semester: 'Semester 4', room: 'Seminar Rm', shift: 'Evening' }
      ]
    },
    {
      id: 'HPE',
      code: 'HPE',
      name: 'Health and Physical Education',
      head: 'Prof. Akhtar Mehmood',
      color: '#b91c1c',
      icon: 'HPE',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'HPE-A', name: 'HPE-A', session: '2022-2026', semester: 'Semester 4', room: 'Gymnasium Hall', shift: 'Morning' },
        { id: 'HPE-B', name: 'HPE-B', session: '2022-2026', semester: 'Semester 4', room: 'Sports Complex', shift: 'Evening' }
      ]
    },
    {
      id: 'ECON',
      code: 'ECON',
      name: 'Economics',
      head: 'Prof. Zahid Khan',
      color: '#65a30d',
      icon: 'ECON',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'ECON-A', name: 'ECON-A', session: '2022-2026', semester: 'Semester 4', room: 'Econ Rm 2', shift: 'Morning' },
        { id: 'ECON-B', name: 'ECON-B', session: '2022-2026', semester: 'Semester 4', room: 'Econ Rm 3', shift: 'Evening' }
      ]
    },
    {
      id: 'STAT',
      code: 'STAT',
      name: 'Statistics',
      head: 'Prof. Munir Ahmad',
      color: '#4338ca',
      icon: 'STAT',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'STAT-A', name: 'STAT-A', session: '2022-2026', semester: 'Semester 4', room: 'Stats Lab', shift: 'Morning' },
        { id: 'STAT-B', name: 'STAT-B', session: '2022-2026', semester: 'Semester 4', room: 'Computing Rm', shift: 'Evening' }
      ]
    },
    {
      id: 'EDU',
      code: 'EDU',
      name: 'Education',
      head: 'Dr. Amina Bibi',
      color: '#d97706',
      icon: 'EDU',
      active: true,
      sessions: STANDARD_SESSIONS,
      sections: [
        { id: 'EDU-A', name: 'EDU-A', session: '2022-2026', semester: 'Semester 4', room: 'Education Hall 1', shift: 'Morning' },
        { id: 'EDU-B', name: 'EDU-B', session: '2022-2026', semester: 'Semester 4', room: 'Education Hall 2', shift: 'Evening' }
      ]
    }
  ];

  // Load departments registry
  function getDepartments() {
    const raw = localStorage.getItem(DEPT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEPT_STORAGE_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
      return DEFAULT_DEPARTMENTS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= DEFAULT_DEPARTMENTS.length) {
        return parsed;
      }
      localStorage.setItem(DEPT_STORAGE_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
      return DEFAULT_DEPARTMENTS;
    } catch (e) {
      return DEFAULT_DEPARTMENTS;
    }
  }

  function saveDepartments(depts) {
    localStorage.setItem(DEPT_STORAGE_KEY, JSON.stringify(depts));
  }

  // ========================================================
  // 2. DATA UNIFICATION & STUDENT NORMALIZATION
  // ========================================================
  function getActiveStudents() {
    if (typeof window.studentsData !== 'undefined' && Array.isArray(window.studentsData) && window.studentsData.length > 0) {
      return window.studentsData;
    }
    if (typeof window.generateFullStudentList === 'function') {
      window.studentsData = window.generateFullStudentList();
      return window.studentsData;
    }
    return [];
  }

  // Normalize student with department and session
  function normalizeStudent(student, index) {
    const depts = getDepartments();
    let deptName = student.department || 'Computer Science';
    let dept = depts.find(d => 
      d.name.toLowerCase() === deptName.toLowerCase() || 
      d.id === deptName || 
      d.code === deptName ||
      (student.deptCode && (d.id === student.deptCode || d.code === student.deptCode))
    );
    if (!dept) {
      dept = depts.find(d => deptName.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(deptName.toLowerCase())) || depts[0];
    }

    const sessionStr = student.session || `${student.sessionStart || 2022}-${student.sessionEnd || 2026}`;
    const batchYear = sessionStr.split('-')[1] || '2026';
    const batchStr = student.batch || `Batch ${batchYear.slice(-2)}`;

    let sectionId = student.section || `${dept.code || dept.id}-A`;

    // Determine performance category
    const cgpa = Number(student.cgpa || 0);
    const avgAttendance = Number(student.overallAttendance || student.attendance || computeStudentAvgAttendance(student));
    let category = 'Medium Performance';
    if (cgpa >= 3.50) {
      category = 'High Performance';
    } else if (cgpa < 2.50 || avgAttendance < 75) {
      category = 'At-Risk';
    }

    const avgMarks = student.percentage ? Number(student.percentage) : (cgpa / 4.0 * 100);

    return {
      id: student.id,
      studentId: student.studentId || ('STU-' + student.id),
      name: student.name || 'Student ' + student.id,
      fatherName: student.fatherName || 'Guardian',
      contact: student.contact || student.phone || '0300-1234567',
      department: dept.name,
      deptId: dept.id,
      deptCode: dept.code,
      section: sectionId,
      session: sessionStr,
      batch: batchStr,
      semester: student.semester || 'Semester 4',
      cgpa: Number(cgpa.toFixed(2)),
      avgMarks: Number(avgMarks.toFixed(1)),
      attendance: Number(avgAttendance.toFixed(1)),
      unpaidFine: student.totalUnpaidFine || 0,
      paidFine: student.totalPaidFine || 0,
      category: category,
      enrollmentStatus: student.status || student.enrollmentStatus || 'Active',
      raw: student
    };
  }

  function computeStudentAvgAttendance(student) {
    if (student.subjects && Array.isArray(student.subjects) && student.subjects.length > 0) {
      const sum = student.subjects.reduce((acc, sub) => acc + (Number(sub.attendance) || 0), 0);
      return sum / student.subjects.length;
    }
    return 80.0;
  }

  // Get all normalized students across the institution
  function getAllNormalizedStudents() {
    const rawList = getActiveStudents();
    return rawList.map((s, idx) => normalizeStudent(s, idx));
  }

  // ========================================================
  // 3. STATISTICAL AGGREGATIONS
  // ========================================================
  function getInstitutionMetrics() {
    const students = getAllNormalizedStudents();
    const depts = getDepartments().filter(d => d.active);

    const totalStudents = students.length;
    const highCount = students.filter(s => s.category === 'High Performance').length;
    const medCount = students.filter(s => s.category === 'Medium Performance').length;
    const riskCount = students.filter(s => s.category === 'At-Risk').length;

    const avgCgpa = totalStudents ? (students.reduce((a, s) => a + s.cgpa, 0) / totalStudents).toFixed(2) : '0.00';
    const avgAttendance = totalStudents ? (students.reduce((a, s) => a + s.attendance, 0) / totalStudents).toFixed(1) : '0.0';

    let totalSections = 0;
    depts.forEach(d => { totalSections += (d.sessions ? d.sessions.length : (d.sections ? d.sections.length : 4)); });

    return {
      totalDepts: depts.length,
      totalSections: totalSections,
      totalStudents: totalStudents,
      highCount: highCount,
      medCount: medCount,
      riskCount: riskCount,
      avgCgpa: avgCgpa,
      avgAttendance: avgAttendance
    };
  }

  function getDepartmentMetrics(deptId) {
    const depts = getDepartments();
    const dept = depts.find(d => d.id === deptId || d.code === deptId || d.name.toLowerCase() === deptId.toLowerCase()) || depts[0];
    const allStudents = getAllNormalizedStudents();
    const deptStudents = allStudents.filter(s => 
      s.deptId === dept.id || 
      s.deptCode === dept.code ||
      s.department.toLowerCase() === dept.name.toLowerCase() ||
      dept.name.toLowerCase().includes(s.department.toLowerCase())
    );

    const total = deptStudents.length;
    const high = deptStudents.filter(s => s.category === 'High Performance').length;
    const med = deptStudents.filter(s => s.category === 'Medium Performance').length;
    const risk = deptStudents.filter(s => s.category === 'At-Risk').length;

    const avgCgpa = total ? (deptStudents.reduce((a, s) => a + s.cgpa, 0) / total).toFixed(2) : '0.00';
    const avgAttendance = total ? (deptStudents.reduce((a, s) => a + s.attendance, 0) / total).toFixed(1) : '0.0';
    const totalUnpaidFine = deptStudents.reduce((a, s) => a + (s.unpaidFine || 0), 0);

    return {
      dept: dept,
      totalStudents: total,
      highCount: high,
      medCount: med,
      riskCount: risk,
      avgCgpa: avgCgpa,
      avgAttendance: avgAttendance,
      totalUnpaidFine: totalUnpaidFine,
      students: deptStudents
    };
  }

  function getSessionMetrics(deptId, sessionId) {
    const deptData = getDepartmentMetrics(deptId);
    const sessStudents = deptData.students.filter(s => 
      s.session === sessionId || 
      s.session.includes(sessionId) || 
      (s.batch && sessionId.includes(s.batch))
    );

    const total = sessStudents.length;
    const high = sessStudents.filter(s => s.category === 'High Performance').length;
    const med = sessStudents.filter(s => s.category === 'Medium Performance').length;
    const risk = sessStudents.filter(s => s.category === 'At-Risk').length;

    const avgCgpa = total ? (sessStudents.reduce((a, s) => a + s.cgpa, 0) / total).toFixed(2) : '0.00';
    const avgMarks = total ? (sessStudents.reduce((a, s) => a + s.avgMarks, 0) / total).toFixed(1) : '0.0';
    const avgAttendance = total ? (sessStudents.reduce((a, s) => a + s.attendance, 0) / total).toFixed(1) : '0.0';
    const totalUnpaidFine = sessStudents.reduce((a, s) => a + (s.unpaidFine || 0), 0);

    const batchName = sessionId.includes('2021') ? 'Batch 25' : 
                      sessionId.includes('2022') ? 'Batch 26' : 
                      sessionId.includes('2023') ? 'Batch 27' : 
                      sessionId.includes('2024') ? 'Batch 28' : 'Batch';

    return {
      dept: deptData.dept,
      sessionId: sessionId,
      sessionName: `Session ${sessionId} (${batchName})`,
      batch: batchName,
      totalStudents: total,
      highCount: high,
      medCount: med,
      riskCount: risk,
      avgCgpa: avgCgpa,
      avgMarks: avgMarks,
      avgAttendance: avgAttendance,
      totalUnpaidFine: totalUnpaidFine,
      students: sessStudents
    };
  }

  // Alias for backward compatibility
  function getSectionMetrics(deptId, sectionId) {
    return getSessionMetrics(deptId, sectionId);
  }

  // ========================================================
  // 4. MAIN DASHBOARD: STUDENT ANALYTICS EXPLORER
  // ========================================================
  window.renderStudentAnalyticsExplorer = function () {
    const container = document.getElementById('student-analytics-explorer-section');
    if (!container) return;

    const metrics = getInstitutionMetrics();
    const depts = getDepartments();
    const isAdmin = window.currentAuthUser && window.currentAuthUser.role === 'admin';

    container.innerHTML = `
      <!-- Power BI Style Top Card Header -->
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 22px 24px; color: #fff; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border-left: 5px solid #2563eb;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="background: #2563eb; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Power BI Architecture</span>
              <h2 style="font-size: 1.45rem; font-weight: 700; color: #ffffff; margin: 0;">STUDENT ANALYTICS EXPLORER</h2>
            </div>
            <p style="margin: 0; font-size: 0.88rem; color: #94a3b8;">
              Institutional Academic Hierarchy: Departments &rarr; Sessions / Batches &rarr; Student Roster &rarr; 360&deg; Individual BI Profile
            </p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            ${isAdmin ? `
              <button class="btn btn-primary btn-sm" onclick="window.openAddDepartmentModal()" style="display: inline-flex; align-items: center; gap: 6px;">
                <span>+</span> Add Department
              </button>
            ` : ''}
            <button class="btn btn-outline btn-sm" onclick="window.switchPage('students')" style="color: #cbd5e1; border-color: #475569;">
              Browse Complete Directory &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- 8 Power BI-Style Interactive KPI Summary Cards -->
      <div class="kpi-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 24px;">
        <div class="kpi-card" style="cursor: pointer; border-top: 3px solid #2563eb;" onclick="window.filterExplorerByKPI('all')" title="Click to view all departments">
          <div class="kpi-card-label" style="font-size: 0.75rem;">Total Departments</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #2563eb;">${metrics.totalDepts}</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem;">Active Faculties</div>
        </div>
        <div class="kpi-card" style="cursor: pointer; border-top: 3px solid #0284c7;" onclick="window.switchPage('classes')" title="Click to view all sessions">
          <div class="kpi-card-label" style="font-size: 0.75rem;">Total Sessions</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #0284c7;">${metrics.totalSections}</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem;">Academic Cohorts</div>
        </div>
        <div class="kpi-card" style="cursor: pointer; border-top: 3px solid #4f46e5;" onclick="window.switchPage('students')" title="Click to view all students">
          <div class="kpi-card-label" style="font-size: 0.75rem;">Total Students</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #4f46e5;">${metrics.totalStudents.toLocaleString()}</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem;">Enrolled Learners</div>
        </div>
        <div class="kpi-card" style="cursor: pointer; border-top: 3px solid #10b981;" onclick="window.filterExplorerByKPI('high')" title="Click to view High Performance students">
          <div class="kpi-card-label" style="font-size: 0.75rem;">High Performers</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #10b981;">${metrics.highCount.toLocaleString()}</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem; color: #10b981;">CGPA &ge; 3.50</div>
        </div>
        <div class="kpi-card" style="cursor: pointer; border-top: 3px solid #f59e0b;" onclick="window.filterExplorerByKPI('medium')" title="Click to view Medium Performance students">
          <div class="kpi-card-label" style="font-size: 0.75rem;">Medium Performers</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #f59e0b;">${metrics.medCount.toLocaleString()}</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem;">CGPA 2.50 &ndash; 3.49</div>
        </div>
        <div class="kpi-card" style="cursor: pointer; border-top: 3px solid #ef4444;" onclick="window.filterExplorerByKPI('risk')" title="Click to view At-Risk students">
          <div class="kpi-card-label" style="font-size: 0.75rem;">At-Risk Students</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #ef4444;">${metrics.riskCount.toLocaleString()}</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem; color: #ef4444;">Intervention Needed</div>
        </div>
        <div class="kpi-card" style="border-top: 3px solid #8b5cf6;" title="Institutional Cumulative GPA">
          <div class="kpi-card-label" style="font-size: 0.75rem;">Average CGPA</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #8b5cf6;">${metrics.avgCgpa}</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem;">Scale 4.00 Max</div>
        </div>
        <div class="kpi-card" style="border-top: 3px solid #0d9488;" title="Institutional Average Attendance Rate">
          <div class="kpi-card-label" style="font-size: 0.75rem;">Average Attendance</div>
          <div class="kpi-card-value" style="font-size: 1.5rem; color: #0d9488;">${metrics.avgAttendance}%</div>
          <div class="kpi-card-subtext" style="font-size: 0.7rem;">Mandatory &ge; 75%</div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- INTERACTIVE DASHBOARD CONSOLE: DEPT -> SESSION -> RECORD -->
      <!-- ======================================================== -->
      <div id="dashboard-interactive-explorer" style="background: var(--bg-surface); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 26px; box-shadow: var(--shadow-sm);">
        <!-- Rendered dynamically by renderDashboardInteractiveExplorer() -->
      </div>

      <!-- Department Directory Cards Grid -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>&#127963;</span> Academic Department Directory (${depts.length} Faculties)
          </h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Click any department card to explore its academic sessions, batch comparison charts, and full student directories</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="dept-search-input" placeholder="Search departments..." onkeyup="window.filterDepartmentGrid()" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-surface); color: var(--text-primary); width: 180px;">
        </div>
      </div>

      <div class="dept-cards-grid" id="explorer-dept-cards-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        ${depts.map(dept => renderDepartmentSummaryCard(dept)).join('')}
      </div>
    `;

    renderDashboardInteractiveExplorer();
  };

  function renderDepartmentSummaryCard(dept) {
    const data = getDepartmentMetrics(dept.id);
    const isAdmin = window.currentAuthUser && window.currentAuthUser.role === 'admin';
    const isDeactivated = !dept.active;
    const sessCount = (dept.sessions && dept.sessions.length) || 4;

    return `
      <div class="dept-summary-card" data-dept-name="${dept.name.toLowerCase()}" style="
        background: var(--bg-surface);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        padding: 18px;
        transition: transform 0.15s, box-shadow 0.2s;
        border-top: 4px solid ${dept.color || '#2563eb'};
        opacity: ${isDeactivated ? '0.6' : '1'};
        position: relative;
      "
        onmouseenter="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-2px)'"
        onmouseleave="this.style.boxShadow='';this.style.transform=''">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 8px; background: ${dept.color}18; color: ${dept.color}; font-weight: 700; font-size: 0.78rem; font-family: Poppins, sans-serif; border: 1.5px solid ${dept.color}33;">
              ${dept.icon || dept.id}
            </span>
            <div>
              <div style="font-weight: 700; font-size: 0.98rem; color: var(--text-primary);">${dept.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Dept Code: <strong>${dept.code || dept.id}</strong> &bull; ${dept.head}</div>
            </div>
          </div>
          ${isAdmin ? `
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.openEditDepartmentModal('${dept.id}')" style="padding: 2px 6px; font-size: 0.7rem;" title="Edit Department">&#9998;</button>
              <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.toggleDepartmentActiveStatus('${dept.id}')" style="padding: 2px 6px; font-size: 0.7rem; color: ${dept.active ? '#ef4444' : '#10b981'};" title="${dept.active ? 'Deactivate' : 'Activate'}">
                ${dept.active ? '&#9632;' : '&#9654;'}
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="background: rgba(37,99,235,0.06); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-600);">${data.totalStudents.toLocaleString()}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">${sessCount} Academic Sessions</div>
          </div>
          <div style="background: rgba(16,185,129,0.06); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-weight: 700; font-size: 1.1rem; color: #10b981;">${data.avgCgpa}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">${data.avgAttendance}% Attendance</div>
          </div>
        </div>

        <!-- Student Category Badges -->
        <div style="display: flex; gap: 6px; margin-bottom: 14px; font-size: 0.72rem; flex-wrap: wrap;">
          <span style="background: rgba(16,185,129,0.12); color: #10b981; padding: 2px 8px; border-radius: 999px; font-weight: 600;">${data.highCount} High</span>
          <span style="background: rgba(245,158,11,0.12); color: #f59e0b; padding: 2px 8px; border-radius: 999px; font-weight: 600;">${data.medCount} Med</span>
          <span style="background: rgba(239,68,68,0.12); color: #ef4444; padding: 2px 8px; border-radius: 999px; font-weight: 600;">${data.riskCount} Risk</span>
        </div>

        <!-- Action Button -->
        <button class="btn btn-outline btn-sm" onclick="window.openDepartmentAnalytics('${dept.id}')" style="width: 100%; justify-content: center; font-size: 0.8rem; font-weight: 600;">
          Explore Department &rarr;
        </button>
      </div>
    `;
  }

  // ========================================================
  // 5. DASHBOARD INTERACTIVE SPLIT-CONSOLE ENGINE
  // ========================================================
  function renderDashboardInteractiveExplorer() {
    const el = document.getElementById('dashboard-interactive-explorer');
    if (!el) return;

    const depts = getDepartments().filter(d => d.active);
    const activeDept = depts.find(d => d.id === currentDashboardDeptId || d.code === currentDashboardDeptId) || depts[0];
    const sessData = getSessionMetrics(activeDept.id, currentDashboardSessionId);
    let students = sessData.students || [];

    // Filter roster
    if (dashboardRosterSearchQuery) {
      const q = dashboardRosterSearchQuery.toLowerCase().trim();
      students = students.filter(s => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.fatherName.toLowerCase().includes(q));
    }
    if (dashboardRosterFilter !== 'ALL') {
      students = students.filter(s => s.category === dashboardRosterFilter);
    }

    // Active Student for Right Analytics Card
    let activeStudent = students.find(s => s.id === currentDashboardStudentId);
    if (!activeStudent && students.length > 0) {
      activeStudent = students[0];
      currentDashboardStudentId = activeStudent.id;
    }

    el.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.18rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>&#9881;</span> Live Academic Drill-Down Console: Department &rarr; Session &rarr; Student Record
          </h3>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
            Select department and academic batch to immediately inspect student cohort rosters and individual analytics side-by-side
          </div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="window.openSessionAnalytics('${activeDept.id}', '${currentDashboardSessionId}')" style="font-size: 0.78rem;">
          View Full 14-Column Directory &rarr;
        </button>
      </div>

      <!-- 1. Department Tabs Selector -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
          Step 1: Select Academic Department
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; -webkit-overflow-scrolling: touch;">
          ${depts.map(d => {
            const isSelected = (d.id === activeDept.id);
            return `
              <button type="button" onclick="window.selectDashboardExplorerDept('${d.id}')" style="
                white-space: nowrap;
                padding: 6px 12px;
                font-size: 0.8rem;
                font-weight: 600;
                border-radius: 6px;
                border: 1.5px solid ${isSelected ? d.color : 'var(--border-light)'};
                background: ${isSelected ? d.color : 'var(--bg-surface)'};
                color: ${isSelected ? '#ffffff' : 'var(--text-primary)'};
                cursor: pointer;
                transition: all 0.15s;
              ">
                <span style="font-size: 0.72rem; opacity: 0.9; margin-right: 4px;">${d.icon || d.id}</span>
                ${d.name}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Session / Batch Tabs Selector -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
          Step 2: Select Academic Session / Batch
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${STANDARD_SESSIONS.map(sess => {
            const isSelected = (sess.id === currentDashboardSessionId);
            const m = getSessionMetrics(activeDept.id, sess.id);
            return `
              <button type="button" onclick="window.selectDashboardExplorerSession('${sess.id}')" style="
                padding: 7px 14px;
                font-size: 0.82rem;
                font-weight: 600;
                border-radius: 6px;
                border: 1.5px solid ${isSelected ? '#2563eb' : 'var(--border-light)'};
                background: ${isSelected ? '#2563eb' : 'var(--bg-card, #f8fafc)'};
                color: ${isSelected ? '#ffffff' : 'var(--text-primary)'};
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <span>&#128197; ${sess.name}</span>
                <span style="background: ${isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(37,99,235,0.1)'}; color: ${isSelected ? '#fff' : '#2563eb'}; padding: 1px 6px; border-radius: 4px; font-size: 0.72rem;">
                  ${sess.batch} &bull; ${m.totalStudents} Students
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Two-Column Live Split View -->
      <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 20px; align-items: start;">
        
        <!-- LEFT COLUMN: Session Student Roster -->
        <div style="background: var(--bg-card, #f8fafc); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary);">
              ${activeDept.name} &bull; ${sessData.sessionName}
            </div>
            <span class="badge badge-primary" style="font-size: 0.72rem;">${sessData.totalStudents} Enrolled</span>
          </div>

          <!-- Quick Filters in Roster -->
          <div style="display: flex; gap: 6px; margin-bottom: 10px;">
            <input type="text" placeholder="Search student name / roll no..." value="${dashboardRosterSearchQuery}" oninput="window.handleDashboardRosterSearch(this.value)" style="flex: 1; padding: 5px 10px; font-size: 0.78rem; border-radius: 4px; border: 1px solid var(--border-light); background: var(--bg-surface); color: var(--text-primary);">
            <select onchange="window.handleDashboardRosterFilter(this.value)" style="padding: 5px 8px; font-size: 0.78rem; border-radius: 4px; border: 1px solid var(--border-light); background: var(--bg-surface); color: var(--text-primary);">
              <option value="ALL" ${dashboardRosterFilter === 'ALL' ? 'selected' : ''}>All Categories</option>
              <option value="High Performance" ${dashboardRosterFilter === 'High Performance' ? 'selected' : ''}>High Performers</option>
              <option value="At-Risk" ${dashboardRosterFilter === 'At-Risk' ? 'selected' : ''}>At-Risk</option>
            </select>
          </div>

          <!-- Students Scrollable List -->
          <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
            ${students.length ? students.map(s => {
              const isActive = activeStudent && (activeStudent.id === s.id);
              const color = s.category === 'High Performance' ? '#10b981' : s.category === 'At-Risk' ? '#ef4444' : '#f59e0b';
              return `
                <div onclick="window.selectDashboardExplorerStudent(${s.id})" style="
                  padding: 10px 12px;
                  border-radius: 6px;
                  background: ${isActive ? 'var(--bg-surface)' : '#ffffff'};
                  border: 1.5px solid ${isActive ? color : 'var(--border-light)'};
                  box-shadow: ${isActive ? 'var(--shadow-sm)' : 'none'};
                  cursor: pointer;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  transition: all 0.15s;
                ">
                  <div>
                    <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${s.name}</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">${s.studentId} &bull; ${s.fatherName}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 700; font-size: 0.88rem; color: ${color};">${s.cgpa.toFixed(2)} CGPA</div>
                    <div style="font-size: 0.72rem; color: ${s.attendance >= 75 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                      ${s.attendance}% Att.
                    </div>
                  </div>
                </div>
              `;
            }).join('') : `
              <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">
                No students found in this session filter.
              </div>
            `}
          </div>
        </div>

        <!-- RIGHT COLUMN: Instant Student Analytics Card & Preview -->
        <div style="background: var(--bg-surface); border: 1.5px solid var(--border-light); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-sm);">
          ${activeStudent ? `
            <!-- Student Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border-light);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 52px; height: 52px; border-radius: 50%; background: ${activeStudent.category === 'High Performance' ? '#10b981' : activeStudent.category === 'At-Risk' ? '#ef4444' : '#2563eb'}; color: #fff; font-weight: 700; font-size: 1.3rem; display: flex; align-items: center; justify-content: center;">
                  ${activeStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 style="margin: 0 0 2px 0; font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${activeStudent.name}</h4>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">
                    Roll No: <strong>${activeStudent.studentId}</strong> &bull; Father: <strong>${activeStudent.fatherName}</strong>
                  </div>
                  <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">
                    Department: ${activeStudent.department} &bull; ${activeStudent.session} (${activeStudent.batch}) &bull; Contact: ${activeStudent.contact}
                  </div>
                </div>
              </div>
              <span class="badge" style="background: ${activeStudent.category === 'High Performance' ? '#10b981' : activeStudent.category === 'At-Risk' ? '#ef4444' : '#f59e0b'}; color: #fff; font-size: 0.75rem; font-weight: 700;">
                ${activeStudent.category}
              </span>
            </div>

            <!-- 4 Quick Key Metrics -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px;">
              <div style="background: rgba(37,99,235,0.06); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-muted);">CGPA</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">${activeStudent.cgpa.toFixed(2)}</div>
                <div style="font-size: 0.65rem; color: var(--text-muted);">Scale 4.00</div>
              </div>
              <div style="background: rgba(16,185,129,0.06); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-muted);">Average Marks</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">${activeStudent.avgMarks}%</div>
                <div style="font-size: 0.65rem; color: var(--text-muted);">Cumulative</div>
              </div>
              <div style="background: ${activeStudent.attendance >= 75 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'}; padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-muted);">Attendance</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: ${activeStudent.attendance >= 75 ? '#10b981' : '#ef4444'};">${activeStudent.attendance}%</div>
                <div style="font-size: 0.65rem; color: ${activeStudent.attendance >= 75 ? '#10b981' : '#ef4444'};">${activeStudent.attendance >= 75 ? 'Exam Eligible' : 'Fine Imposed'}</div>
              </div>
              <div style="background: ${activeStudent.unpaidFine > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)'}; padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-muted);">Unpaid Fine</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: ${activeStudent.unpaidFine > 0 ? '#ef4444' : '#10b981'};">Rs. ${activeStudent.unpaidFine || 0}</div>
                <div style="font-size: 0.65rem; color: ${activeStudent.unpaidFine > 0 ? '#ef4444' : '#10b981'};">${activeStudent.unpaidFine > 0 ? 'Short Attendance' : 'All Clear'}</div>
              </div>
            </div>

            <!-- Curricular Marks Preview Table -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between;">
                <span>Curricular Subject Performance &amp; Attendance</span>
                <span style="color: var(--text-muted);">${activeStudent.semester}</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem;">
                <thead>
                  <tr style="background: var(--bg-card, #f8fafc); border-bottom: 1px solid var(--border-light); text-align: left;">
                    <th style="padding: 5px 8px;">Subject</th>
                    <th style="padding: 5px 8px;">Teacher</th>
                    <th style="padding: 5px 8px; text-align: center;">Total (60)</th>
                    <th style="padding: 5px 8px; text-align: center;">Grade</th>
                    <th style="padding: 5px 8px; text-align: right;">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  ${(activeStudent.raw && activeStudent.raw.subjects && activeStudent.raw.subjects.length) ? activeStudent.raw.subjects.map(sub => `
                    <tr style="border-bottom: 1px solid var(--border-light);">
                      <td style="padding: 5px 8px; font-weight: 600;">${sub.name}</td>
                      <td style="padding: 5px 8px; color: var(--text-muted); font-size: 0.74rem;">${sub.teacher || 'Faculty'}</td>
                      <td style="padding: 5px 8px; text-align: center; font-weight: 700; color: #2563eb;">${sub.total}</td>
                      <td style="padding: 5px 8px; text-align: center;"><span class="badge ${sub.grade === 'A+' || sub.grade === 'A' ? 'badge-success' : sub.grade === 'C' || sub.grade === 'D' ? 'badge-danger' : 'badge-primary'}" style="font-size: 0.68rem; padding: 1px 5px;">${sub.grade}</span></td>
                      <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: ${sub.attendance >= 75 ? '#10b981' : '#ef4444'};">${sub.attendance}%</td>
                    </tr>
                  `).join('') : `
                    <tr><td colspan="5" style="padding: 10px; text-align: center; color: var(--text-muted);">Curricular subjects recorded under semester syllabus.</td></tr>
                  `}
                </tbody>
              </table>
            </div>

            <!-- Drill-Down Buttons -->
            <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px;">
              <button class="btn btn-outline btn-sm" onclick="window.openSessionAnalytics('${activeDept.id}', '${currentDashboardSessionId}')">
                Open Session Roster (14 Columns) &rarr;
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.open360StudentAnalytics(${activeStudent.id})">
                Open Complete 360&deg; Profile &amp; Charts &rarr;
              </button>
            </div>
          ` : `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
              Select a student from the left roster to view their instant analytics card.
            </div>
          `}
        </div>
      </div>
    `;
  }

  window.selectDashboardExplorerDept = function (deptId) {
    currentDashboardDeptId = deptId;
    const sessData = getSessionMetrics(deptId, currentDashboardSessionId);
    if (sessData.students && sessData.students.length > 0) {
      currentDashboardStudentId = sessData.students[0].id;
    }
    renderDashboardInteractiveExplorer();
  };

  window.selectDashboardExplorerSession = function (sessionId) {
    currentDashboardSessionId = sessionId;
    const sessData = getSessionMetrics(currentDashboardDeptId, sessionId);
    if (sessData.students && sessData.students.length > 0) {
      currentDashboardStudentId = sessData.students[0].id;
    }
    renderDashboardInteractiveExplorer();
  };

  window.selectDashboardExplorerStudent = function (studentId) {
    currentDashboardStudentId = studentId;
    renderDashboardInteractiveExplorer();
  };

  window.handleDashboardRosterSearch = function (q) {
    dashboardRosterSearchQuery = q;
    renderDashboardInteractiveExplorer();
  };

  window.handleDashboardRosterFilter = function (cat) {
    dashboardRosterFilter = cat;
    renderDashboardInteractiveExplorer();
  };

  window.filterDepartmentGrid = function () {
    const q = (document.getElementById('dept-search-input')?.value || '').toLowerCase().trim();
    document.querySelectorAll('.dept-summary-card').forEach(card => {
      const name = card.getAttribute('data-dept-name') || '';
      card.style.display = (!q || name.includes(q)) ? 'block' : 'none';
    });
  };

  window.filterExplorerByKPI = function (type) {
    if (type === 'all') {
      window.switchPage('students');
    } else if (type === 'high') {
      window.switchPage('students');
      window.filterStudentsByCategory && window.filterStudentsByCategory('High Performance');
    } else if (type === 'medium') {
      window.switchPage('students');
      window.filterStudentsByCategory && window.filterStudentsByCategory('Medium Performance');
    } else if (type === 'risk') {
      window.switchPage('risk-monitoring');
    }
  };

  // ========================================================
  // 6. LEVEL 2: DEPARTMENT ANALYTICS & ACADEMIC SESSIONS
  // ========================================================
  window.openDepartmentAnalytics = function (deptId) {
    currentExplorerDeptId = deptId;
    window.switchPage('department-overview');
    setTimeout(() => window.renderDepartmentOverviewPage(deptId), 50);
  };

  window.renderDepartmentOverviewPage = function (deptId) {
    deptId = deptId || currentExplorerDeptId;
    const container = document.getElementById('dept-overview-content');
    if (!container) return;

    const data = getDepartmentMetrics(deptId);
    const dept = data.dept;
    const sessions = STANDARD_SESSIONS;

    container.innerHTML = `
      <!-- Breadcrumb Navigation with Reverse Button -->
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 20px; flex-wrap: wrap;">
        <span onclick="window.switchPage('dashboard')" style="cursor: pointer; color: var(--color-primary-600); font-weight: 600;">&#127968; College Overview</span>
        <span>&rsaquo;</span>
        <span style="font-weight: 700; color: var(--text-primary);">${dept.name}</span>
        <span style="margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Back to Dashboard</button>
        </span>
      </div>

      <!-- Department Header Banner -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 22px 24px; border-left: 5px solid ${dept.color}; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: ${dept.color}22; color: ${dept.color}; font-weight: 700;">${dept.icon}</span>
              <h2 style="margin: 0; font-size: 1.55rem; font-weight: 700; color: var(--text-primary);">${dept.name}</h2>
              <span class="badge badge-primary">Dept ID: ${dept.id}</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-secondary);">
              <strong>Head of Department:</strong> ${dept.head} &bull; 
              <strong>Total Enrolled Students:</strong> ${data.totalStudents.toLocaleString()} &bull; 
              <strong>Academic Sessions:</strong> ${sessions.length} Cohorts
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            ${window.currentAuthUser && window.currentAuthUser.role === 'admin' ? `
              <button class="btn btn-primary btn-sm" onclick="window.openAddSectionModal('${dept.id}')">+ Add New Section</button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Department KPI Cards Row -->
      <div class="kpi-metrics-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-card-label">Total Enrolled</div>
          <div class="kpi-card-value">${data.totalStudents.toLocaleString()}</div>
          <div class="kpi-card-subtext">${sessions.length} Active Sessions</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Average CGPA</div>
          <div class="kpi-card-value" style="color: #2563eb;">${data.avgCgpa}</div>
          <div class="kpi-card-subtext">Scale 4.00 Max</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Average Attendance</div>
          <div class="kpi-card-value" style="color: #10b981;">${data.avgAttendance}%</div>
          <div class="kpi-card-subtext">Mandatory Policy &ge; 75%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">High Performers</div>
          <div class="kpi-card-value" style="color: #10b981;">${data.highCount}</div>
          <div class="kpi-card-subtext">CGPA &ge; 3.50</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Medium Performers</div>
          <div class="kpi-card-value" style="color: #f59e0b;">${data.medCount}</div>
          <div class="kpi-card-subtext">CGPA 2.50 &ndash; 3.49</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">At-Risk Students</div>
          <div class="kpi-card-value" style="color: #ef4444;">${data.riskCount}</div>
          <div class="kpi-card-subtext">Need Academic Support</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Performance Stratification</h3>
              <div class="chart-card-subtitle">Distribution of High, Medium, and At-Risk students</div>
            </div>
            <span class="badge badge-success">Donut</span>
          </div>
          <div class="chart-canvas-container" style="height: 220px; position: relative;">
            <canvas id="dept-explorer-outcome-donut"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Session-wise Performance Comparison</h3>
              <div class="chart-card-subtitle">Average CGPA and Attendance across academic batches</div>
            </div>
            <span class="badge badge-info">Comparison</span>
          </div>
          <div class="chart-canvas-container" style="height: 220px; position: relative;">
            <canvas id="dept-explorer-section-bar"></canvas>
          </div>
        </div>
      </div>

      <!-- Academic Sessions & Batches Grid -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>&#128197;</span> Academic Sessions &amp; Batches in ${dept.name}
            </h3>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Click any academic session to open its complete enrolled student directory and individual profiles
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;">
          ${sessions.map(sess => {
            const sessData = getSessionMetrics(dept.id, sess.id);
            return `
              <div class="app-card" style="padding: 16px; cursor: pointer; border-top: 3.5px solid ${dept.color}; transition: all 0.15s;"
                onclick="window.openSessionAnalytics('${dept.id}', '${sess.id}')"
                onmouseenter="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-2px)'"
                onmouseleave="this.style.boxShadow='';this.style.transform=''">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">${sess.name}</span>
                  <span class="badge badge-primary" style="font-size: 0.72rem;">${sess.batch}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px;">
                  ${sess.label} &bull; ${sess.sem}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
                  <div style="background: rgba(37,99,235,0.06); padding: 6px; border-radius: 4px; text-align: center;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: #2563eb;">${sessData.totalStudents}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted);">Enrolled</div>
                  </div>
                  <div style="background: rgba(16,185,129,0.06); padding: 6px; border-radius: 4px; text-align: center;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: #10b981;">${sessData.avgCgpa}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted);">Avg CGPA</div>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px;">
                  <span>High: <strong style="color: #10b981;">${sessData.highCount}</strong></span>
                  <span>Med: <strong style="color: #f59e0b;">${sessData.medCount}</strong></span>
                  <span>Risk: <strong style="color: #ef4444;">${sessData.riskCount}</strong></span>
                </div>
                <button class="btn btn-outline btn-sm" style="width: 100%; justify-content: center; font-size: 0.78rem; font-weight: 600;">
                  View Session Students &amp; Roster &rarr;
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    setTimeout(() => {
      renderDeptExplorerCharts(data, sessions);
    }, 80);
  };

  function renderDeptExplorerCharts(data, sessions) {
    // 1. Outcome Donut
    const ctxDonut = document.getElementById('dept-explorer-outcome-donut');
    if (ctxDonut && typeof Chart !== 'undefined') {
      safeDestroyChart('deptOutcome');
      explorerCharts.deptOutcome = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: ['High Performance', 'Medium Performance', 'At-Risk'],
          datasets: [{
            data: [data.highCount, data.medCount, data.riskCount],
            backgroundColor: ['#10b981', '#3b82f6', '#f43f5e'],
            hoverBackgroundColor: ['#059669', '#2563eb', '#e11d48'],
            borderWidth: 3,
            borderColor: '#ffffff',
            borderRadius: 8,
            spacing: 5,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '76%',
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 700
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Poppins', size: 11, weight: '500' } } }
          }
        }
      });
    }

    // 2. Session comparison bar
    const ctxBar = document.getElementById('dept-explorer-section-bar');
    if (ctxBar && typeof Chart !== 'undefined') {
      safeDestroyChart('deptSectionComp');
      const sessDataList = sessions.map(sess => getSessionMetrics(data.dept.id, sess.id));
      explorerCharts.deptSectionComp = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: sessions.map(s => s.batch),
          datasets: [
            {
              label: 'Avg CGPA (x25 scale)',
              data: sessDataList.map(s => Number((Number(s.avgCgpa) * 25).toFixed(1))),
              backgroundColor: '#2563eb'
            },
            {
              label: 'Avg Attendance %',
              data: sessDataList.map(s => Number(s.avgAttendance)),
              backgroundColor: '#10b981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100 }
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }
  }

  // ========================================================
  // 7. LEVEL 3: SESSION ANALYTICS & COMPLETE STUDENT DIRECTORY
  // ========================================================
  window.openSessionAnalytics = function (deptId, sessionId) {
    currentExplorerDeptId = deptId;
    currentExplorerSessionId = sessionId;
    directoryCurrentPage = 1;
    directoryFilterCategory = 'ALL';
    directorySearchQuery = '';
    window.switchPage('session-overview');
    setTimeout(() => window.renderSessionOverviewPage(deptId, sessionId), 50);
  };

  // Alias
  window.openSectionAnalytics = function (deptId, sectionId) {
    window.openSessionAnalytics(deptId, sectionId);
  };

  window.renderSessionOverviewPage = function (deptId, sessionId) {
    deptId = deptId || currentExplorerDeptId;
    sessionId = sessionId || currentExplorerSessionId;
    const container = document.getElementById('session-overview-content');
    if (!container) return;

    const secData = getSessionMetrics(deptId, sessionId);
    const dept = secData.dept;

    container.innerHTML = `
      <!-- Breadcrumb Navigation with Reverse Buttons -->
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 20px; flex-wrap: wrap;">
        <span onclick="window.switchPage('dashboard')" style="cursor: pointer; color: var(--color-primary-600); font-weight: 600;">&#127968; College Overview</span>
        <span>&rsaquo;</span>
        <span onclick="window.openDepartmentAnalytics('${dept.id}')" style="cursor: pointer; color: var(--color-primary-600); font-weight: 600;">${dept.name}</span>
        <span>&rsaquo;</span>
        <span style="font-weight: 700; color: var(--text-primary);">${secData.sessionName} Directory</span>
        <span style="margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm" onclick="window.openDepartmentAnalytics('${dept.id}')">&#8592; Back to ${dept.name}</button>
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Back to Dashboard</button>
        </span>
      </div>

      <!-- Section Header Banner -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 20px 24px; border-left: 5px solid ${dept.color}; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="margin: 0 0 4px 0; font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">
              ${dept.name} &mdash; ${secData.sessionName} Student Directory
            </h2>
            <div style="font-size: 0.88rem; color: var(--text-secondary);">
              <strong>Department:</strong> ${dept.name} &bull; 
              <strong>Academic Session:</strong> ${sessionId} (${secData.batch}) &bull; 
              <strong>Total Enrolled Students:</strong> ${secData.totalStudents} &bull; 
              <strong>Class Teacher:</strong> ${dept.head}
            </div>
          </div>
        </div>
      </div>

      <!-- Section KPI Metrics Row -->
      <div class="kpi-metrics-grid" style="margin-bottom: 24px;">
        <div class="kpi-card"><div class="kpi-card-label">Total Students</div><div class="kpi-card-value">${secData.totalStudents}</div><div class="kpi-card-subtext">All Enrolled</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Average CGPA</div><div class="kpi-card-value" style="color: #2563eb;">${secData.avgCgpa}</div><div class="kpi-card-subtext">Scale 4.00</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Average Marks</div><div class="kpi-card-value">${secData.avgMarks}%</div><div class="kpi-card-subtext">Cumulative</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Average Attendance</div><div class="kpi-card-value" style="color: #10b981;">${secData.avgAttendance}%</div><div class="kpi-card-subtext">Policy &ge; 75%</div></div>
        <div class="kpi-card"><div class="kpi-card-label">High Performers</div><div class="kpi-card-value" style="color: #10b981;">${secData.highCount}</div><div class="kpi-card-subtext">CGPA &ge; 3.50</div></div>
        <div class="kpi-card"><div class="kpi-card-label">At-Risk Students</div><div class="kpi-card-value" style="color: #ef4444;">${secData.riskCount}</div><div class="kpi-card-subtext">Intervention Required</div></div>
      </div>

      <!-- COMPLETE STUDENT DIRECTORY WITH 14 COLUMNS -->
      <div class="app-card" style="margin-bottom: 24px;">
        <div class="app-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="app-card-title" style="font-size: 1.1rem; font-weight: 700;">
              Enrolled Students in ${secData.sessionName} (${secData.totalStudents} Total)
            </div>
            <div class="app-card-subtitle" style="font-size: 0.8rem; color: var(--text-muted);">
              Displaying ALL students (High, Medium, and At-Risk) with full demographic and academic details
            </div>
          </div>
          <!-- Filters & Controls Bar -->
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input type="text" id="sec-dir-search" placeholder="Search by name, ID..." oninput="window.handleDirectorySearch(this.value)" value="${directorySearchQuery}" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-surface); color: var(--text-primary); width: 170px;">
            <select id="sec-dir-category" onchange="window.handleDirectoryCategoryFilter(this.value)" style="padding: 6px 10px; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-surface); color: var(--text-primary);">
              <option value="ALL" ${directoryFilterCategory === 'ALL' ? 'selected' : ''}>All Categories</option>
              <option value="High Performance" ${directoryFilterCategory === 'High Performance' ? 'selected' : ''}>High Performance</option>
              <option value="Medium Performance" ${directoryFilterCategory === 'Medium Performance' ? 'selected' : ''}>Medium Performance</option>
              <option value="At-Risk" ${directoryFilterCategory === 'At-Risk' ? 'selected' : ''}>At-Risk</option>
            </select>
            <select id="sec-dir-sort" onchange="window.handleDirectorySort(this.value)" style="padding: 6px 10px; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-surface); color: var(--text-primary);">
              <option value="cgpa-desc">Sort: CGPA (High &rarr; Low)</option>
              <option value="cgpa-asc">Sort: CGPA (Low &rarr; High)</option>
              <option value="attendance-desc">Sort: Attendance (High &rarr; Low)</option>
              <option value="name-asc">Sort: Student Name (A &rarr; Z)</option>
            </select>
            <button class="btn btn-outline btn-sm" onclick="window.resetDirectoryFilters()" title="Reset all search and category filters">&#8635; Reset Filters</button>
          </div>
        </div>

        <!-- 14-Column Table -->
        <div class="table-responsive">
          <table class="app-table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Father's Name</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Section</th>
                <th>Session</th>
                <th>Semester</th>
                <th>CGPA</th>
                <th>Avg Marks</th>
                <th>Attendance %</th>
                <th>Category</th>
                <th>Enrollment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="section-students-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>

        <!-- Table Pagination Footer -->
        <div id="section-students-pagination" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-top: 1px solid var(--border-light); flex-wrap: wrap; gap: 10px;">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    renderDirectoryTableRows(secData.students);
  };

  // Alias
  window.renderSectionOverviewPage = function (deptId, sectionId) {
    window.renderSessionOverviewPage(deptId, sectionId);
  };

  function renderDirectoryTableRows(studentsList) {
    const tbody = document.getElementById('section-students-tbody');
    const pagContainer = document.getElementById('section-students-pagination');
    if (!tbody) return;

    // Filter
    let filtered = studentsList.slice();
    if (directorySearchQuery) {
      const q = directorySearchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.studentId.toLowerCase().includes(q) || 
        s.fatherName.toLowerCase().includes(q)
      );
    }
    if (directoryFilterCategory !== 'ALL') {
      filtered = filtered.filter(s => s.category === directoryFilterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (directorySortField === 'cgpa') {
        return directorySortOrder === 'desc' ? b.cgpa - a.cgpa : a.cgpa - b.cgpa;
      } else if (directorySortField === 'attendance') {
        return directorySortOrder === 'desc' ? b.attendance - a.attendance : a.attendance - b.attendance;
      } else if (directorySortField === 'name') {
        return directorySortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      return 0;
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / SECTION_PAGE_SIZE) || 1;
    if (directoryCurrentPage > totalPages) directoryCurrentPage = totalPages;
    const startIndex = (directoryCurrentPage - 1) * SECTION_PAGE_SIZE;
    const pageItems = filtered.slice(startIndex, startIndex + SECTION_PAGE_SIZE);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="15" style="text-align: center; padding: 30px; color: var(--text-muted);">
            No student records found matching the active filters.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pageItems.map((s, idx) => {
        const absIdx = startIndex + idx + 1;
        const catBadge = s.category === 'High Performance' 
          ? `<span class="badge" style="background: rgba(16,185,129,0.15); color: #10b981; font-weight: 700;">High</span>`
          : s.category === 'At-Risk'
            ? `<span class="badge" style="background: rgba(239,68,68,0.15); color: #ef4444; font-weight: 700;">At-Risk</span>`
            : `<span class="badge" style="background: rgba(245,158,11,0.15); color: #f59e0b; font-weight: 700;">Medium</span>`;

        const attendColor = s.attendance >= 75 ? '#10b981' : '#ef4444';

        return `
          <tr>
            <td style="color: var(--text-muted);">${absIdx}</td>
            <td style="font-weight: 700; color: var(--color-primary-600);">${s.studentId}</td>
            <td style="font-weight: 600;">
              <span onclick="window.open360StudentAnalytics(${s.id})" style="cursor: pointer; color: var(--text-primary); text-decoration: underline;">
                ${s.name}
              </span>
            </td>
            <td style="color: var(--text-secondary);">${s.fatherName}</td>
            <td style="color: var(--text-muted); font-size: 0.78rem;">${s.contact}</td>
            <td>${s.department}</td>
            <td><span class="badge badge-primary">${s.section}</span></td>
            <td>${s.session}</td>
            <td>${s.semester}</td>
            <td style="font-weight: 700; color: ${s.cgpa >= 3.5 ? '#10b981' : s.cgpa < 2.5 ? '#ef4444' : '#2563eb'};">${s.cgpa.toFixed(2)}</td>
            <td>${s.avgMarks}%</td>
            <td style="font-weight: 700; color: ${attendColor};">${s.attendance}%</td>
            <td>${catBadge}</td>
            <td><span class="badge badge-success">${s.enrollmentStatus}</span></td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="window.open360StudentAnalytics(${s.id})" style="padding: 3px 8px; font-size: 0.75rem;">
                View 360&deg; &rarr;
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Render Pagination Controls
    if (pagContainer) {
      pagContainer.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          Showing <strong>${totalCount === 0 ? 0 : startIndex + 1}</strong> &ndash; <strong>${Math.min(startIndex + SECTION_PAGE_SIZE, totalCount)}</strong> of <strong>${totalCount}</strong> students
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button class="btn btn-outline btn-sm" onclick="window.changeDirectoryPage(${directoryCurrentPage - 1})" ${directoryCurrentPage <= 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
            &larr; Prev
          </button>
          <span style="font-size: 0.82rem; font-weight: 600; padding: 0 8px;">
            Page ${directoryCurrentPage} of ${totalPages}
          </span>
          <button class="btn btn-outline btn-sm" onclick="window.changeDirectoryPage(${directoryCurrentPage + 1})" ${directoryCurrentPage >= totalPages ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
            Next &rarr;
          </button>
        </div>
      `;
    }
  }

  window.handleDirectorySearch = function (q) {
    directorySearchQuery = q;
    directoryCurrentPage = 1;
    const secData = getSessionMetrics(currentExplorerDeptId, currentExplorerSessionId);
    renderDirectoryTableRows(secData.students);
  };

  window.handleDirectoryCategoryFilter = function (cat) {
    directoryFilterCategory = cat;
    directoryCurrentPage = 1;
    const secData = getSessionMetrics(currentExplorerDeptId, currentExplorerSessionId);
    renderDirectoryTableRows(secData.students);
  };

  window.handleDirectorySort = function (val) {
    const parts = val.split('-');
    directorySortField = parts[0];
    directorySortOrder = parts[1] || 'desc';
    const secData = getSessionMetrics(currentExplorerDeptId, currentExplorerSessionId);
    renderDirectoryTableRows(secData.students);
  };

  window.changeDirectoryPage = function (newPage) {
    directoryCurrentPage = newPage;
    const secData = getSessionMetrics(currentExplorerDeptId, currentExplorerSessionId);
    renderDirectoryTableRows(secData.students);
  };

  window.resetDirectoryFilters = function () {
    directorySearchQuery = '';
    directoryFilterCategory = 'ALL';
    directorySortField = 'cgpa';
    directorySortOrder = 'desc';
    directoryCurrentPage = 1;

    const sIn = document.getElementById('sec-dir-search');
    if (sIn) sIn.value = '';
    const cSel = document.getElementById('sec-dir-category');
    if (cSel) cSel.value = 'ALL';
    const sortSel = document.getElementById('sec-dir-sort');
    if (sortSel) sortSel.value = 'cgpa-desc';

    const secData = getSessionMetrics(currentExplorerDeptId, currentExplorerSessionId);
    renderDirectoryTableRows(secData.students);
    if (window.showToast) window.showToast('Section student directory filters reset.', 'info');
  };

  // ========================================================
  // 8. LEVEL 4: 360-DEGREE INDIVIDUAL STUDENT ANALYTICS
  // ========================================================
  window.open360StudentAnalytics = function (studentId) {
    window.switchPage('student-profile');
    setTimeout(() => window.render360StudentProfilePage(studentId), 50);
  };

  window.render360StudentProfilePage = function (studentId) {
    const container = document.getElementById('student-profile-content');
    if (!container) return;

    const allStudents = getAllNormalizedStudents();
    const student = allStudents.find(s => s.id === studentId) || allStudents[0];
    if (!student) {
      container.innerHTML = '<div style="padding: 40px; text-align: center;">Student profile not found.</div>';
      return;
    }

    const raw = student.raw || {};
    const subjects = raw.subjects || [];
    const progressions = raw.semesterProgression || [
      { semester: 'Semester 1', gpa: 3.6 },
      { semester: 'Semester 2', gpa: 3.7 },
      { semester: 'Semester 3', gpa: 3.8 },
      { semester: 'Semester 4', gpa: student.cgpa }
    ];

    const highestSubject = subjects.length ? subjects.reduce((max, sub) => (sub.total > max.total ? sub : max), subjects[0]) : null;
    const lowestSubject = subjects.length ? subjects.reduce((min, sub) => (sub.total < min.total ? sub : min), subjects[0]) : null;

    const outcomeColor = student.category === 'High Performance' ? '#10b981' : student.category === 'At-Risk' ? '#ef4444' : '#f59e0b';

    const totalDays = 60;
    const presentDays = Math.round((totalDays * student.attendance) / 100);
    const absentDays = totalDays - presentDays;
    const lateArrivals = Math.max(0, Math.round(absentDays * 0.35));
    const monthlyAttData = [
      Math.min(100, Math.max(50, Math.round(student.attendance - 3))),
      Math.min(100, Math.max(50, Math.round(student.attendance + 2))),
      Math.min(100, Math.max(50, Math.round(student.attendance - 1))),
      Math.min(100, Math.max(50, Math.round(student.attendance)))
    ];

    container.innerHTML = `
      <!-- Breadcrumbs & Reverse Buttons -->
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 20px; flex-wrap: wrap;">
        <span onclick="window.switchPage('dashboard')" style="cursor: pointer; color: var(--color-primary-600); font-weight: 600;">&#127968; College Overview</span>
        <span>&rsaquo;</span>
        <span onclick="window.openDepartmentAnalytics('${student.deptId}')" style="cursor: pointer; color: var(--color-primary-600); font-weight: 600;">${student.department}</span>
        <span>&rsaquo;</span>
        <span onclick="window.openSessionAnalytics('${student.deptId}','${student.session}')" style="cursor: pointer; color: var(--color-primary-600); font-weight: 600;">Session ${student.session} (${student.batch})</span>
        <span>&rsaquo;</span>
        <span style="font-weight: 700; color: var(--text-primary);">${student.name}</span>
        <span style="margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm" onclick="window.openSessionAnalytics('${student.deptId}','${student.session}')">&#8592; Back to ${student.session}</button>
          <button class="btn btn-outline btn-sm" onclick="window.openDepartmentAnalytics('${student.deptId}')">&#8592; Back to ${student.department}</button>
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Dashboard</button>
          <button class="btn btn-primary btn-sm" onclick="window.print()"><span style="margin-right: 4px;">&#128438;</span> Print Transcript</button>
        </span>
      </div>

      <!-- Student Overview Banner -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); border-top: 4px solid ${outcomeColor}; padding: 22px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: ${outcomeColor}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 700; flex-shrink: 0;">
          ${student.name.charAt(0)}
        </div>
        <div style="flex-grow: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
            <h2 style="margin: 0; font-size: 1.45rem; font-weight: 700; color: var(--text-primary);">${student.name}</h2>
            <span class="badge" style="background: ${outcomeColor}; color: #fff; font-weight: 700; font-size: 0.78rem;">${student.category.toUpperCase()}</span>
            <span class="badge badge-primary" style="font-size: 0.72rem;">Roll No: ${student.studentId}</span>
          </div>
          <div style="font-size: 0.88rem; color: var(--text-secondary);">
            <strong>Father:</strong> ${student.fatherName} &bull; 
            <strong>Contact:</strong> ${student.contact} &bull; 
            <strong>Department:</strong> ${student.department} &bull; 
            <strong>Section:</strong> ${student.section} &bull; 
            <strong>Session:</strong> ${student.session} (${student.batch}) &bull; 
            <strong>Semester:</strong> ${student.semester}
          </div>
        </div>
        <div style="text-align: right; min-width: 140px;">
          <div style="font-size: 2.2rem; font-weight: 700; color: ${outcomeColor}; line-height: 1;">${student.cgpa.toFixed(2)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Cumulative GPA (4.00 Max)</div>
        </div>
      </div>

      <!-- KPI Metrics Overview Grid -->
      <div class="kpi-metrics-grid" style="margin-bottom: 24px;">
        <div class="kpi-card"><div class="kpi-card-label">Cumulative GPA</div><div class="kpi-card-value" style="color: ${outcomeColor};">${student.cgpa.toFixed(2)}</div><div class="kpi-card-subtext">Scale 4.00</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Average Marks</div><div class="kpi-card-value">${student.avgMarks}%</div><div class="kpi-card-subtext">Cumulative %</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Overall Attendance</div><div class="kpi-card-value" style="color: ${student.attendance >= 75 ? '#10b981' : '#ef4444'};">${student.attendance}%</div><div class="kpi-card-subtext">${student.attendance >= 75 ? 'Exam Eligible' : 'Fine Imposed'}</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Performance Band</div><div class="kpi-card-value" style="font-size: 1.15rem; color: ${outcomeColor};">${student.category}</div><div class="kpi-card-subtext">Institutional Standard</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Enrollment Status</div><div class="kpi-card-value" style="color: #2563eb;">${student.enrollmentStatus}</div><div class="kpi-card-subtext">Regular Student</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Total Unpaid Fine</div><div class="kpi-card-value" style="color: ${raw.totalUnpaidFine > 0 ? '#ef4444' : '#10b981'};">Rs. ${raw.totalUnpaidFine || 0}</div><div class="kpi-card-subtext">${raw.totalUnpaidFine > 0 ? 'Clearance Required' : 'All Clear'}</div></div>
      </div>

      <!-- Interactive BI Charts -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <!-- CGPA Progression Chart -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Semester-wise CGPA Progression</h3>
              <div class="chart-card-subtitle">Academic trend from Semester 1 to current semester</div>
            </div>
            <span class="badge badge-primary">Trend Line</span>
          </div>
          <div class="chart-canvas-container" style="height: 230px; position: relative;">
            <canvas id="student-cgpa-trend-chart"></canvas>
          </div>
        </div>

        <!-- Subject Performance Bar Chart -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Curriculum Subject Comparison</h3>
              <div class="chart-card-subtitle">Subject-wise marks vs class passing benchmark (50%)</div>
            </div>
            <span class="badge badge-info">Bar Chart</span>
          </div>
          <div class="chart-canvas-container" style="height: 230px; position: relative;">
            <canvas id="student-subjects-bar-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Subject-wise Performance Table -->
      <div class="app-card" style="margin-bottom: 24px;">
        <div class="app-card-header">
          <div class="app-card-title">Curricular Subject Tabulation (${student.semester})</div>
          <span class="badge badge-primary">Official Examination Record</span>
        </div>
        <div class="table-responsive">
          <table class="app-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Course Teacher</th>
                <th>Sessional (6)</th>
                <th>Midterm (18)</th>
                <th>Terminal (36)</th>
                <th>Total (60)</th>
                <th>GPA</th>
                <th>Grade</th>
                <th>Attendance %</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              ${subjects.length ? subjects.map(sub => `
                <tr>
                  <td style="font-weight: 600;">${sub.name}</td>
                  <td style="color: var(--text-muted);">${sub.teacher || 'Faculty Member'}</td>
                  <td>${sub.sessional}</td>
                  <td>${sub.mid}</td>
                  <td>${sub.terminal}</td>
                  <td style="font-weight: 700; color: #2563eb;">${sub.total}</td>
                  <td>${sub.gpa}</td>
                  <td><span class="badge ${sub.grade === 'A+' || sub.grade === 'A' ? 'badge-success' : sub.grade === 'C' || sub.grade === 'D' ? 'badge-danger' : 'badge-primary'}">${sub.grade}</span></td>
                  <td style="font-weight: 600; color: ${sub.attendance >= 75 ? '#10b981' : '#ef4444'};">${sub.attendance}%</td>
                  <td><span class="badge ${sub.fineStatus === 'Safe' ? 'badge-success' : 'badge-danger'}">${sub.fineStatus || 'Safe'}</span></td>
                </tr>
              `).join('') : `
                <tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 20px;">Curricular marks tabulation recorded under semester curriculum.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Comprehensive Attendance & Policy Analytics Module -->
      <div class="app-card" style="margin-bottom: 24px;">
        <div class="app-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div class="app-card-title">&#128203; Attendance &amp; Examination Eligibility Analytics</div>
            <div class="app-card-subtitle">Aggregate lecture presence, monthly trends, and college 75% policy compliance</div>
          </div>
          <span class="badge ${student.attendance >= 75 ? 'badge-success' : 'badge-danger'}">
            ${student.attendance >= 75 ? 'Exam Eligible (&ge;75%)' : 'Short Attendance (<75%)'}
          </span>
        </div>
        <div class="app-card-body">
          <div class="kpi-metrics-grid" style="margin-bottom: 20px;">
            <div class="kpi-card">
              <div class="kpi-card-label">Overall Attendance</div>
              <div class="kpi-card-value" style="color: ${student.attendance >= 75 ? '#10b981' : '#ef4444'};">${student.attendance}%</div>
              <div class="kpi-card-subtext">Policy Rule &ge; 75%</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-label">Lectures Present</div>
              <div class="kpi-card-value" style="color: #10b981;">${presentDays} Days</div>
              <div class="kpi-card-subtext">Out of 60 Lectures</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-label">Lectures Absent</div>
              <div class="kpi-card-value" style="color: ${absentDays > 15 ? '#ef4444' : '#f59e0b'};">${absentDays} Days</div>
              <div class="kpi-card-subtext">Cumulative Absence</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-label">Late Arrivals</div>
              <div class="kpi-card-value" style="color: #6366f1;">${lateArrivals} Days</div>
              <div class="kpi-card-subtext">Tardy &gt; 15 mins</div>
            </div>
          </div>

          <div style="height: 190px; position: relative; margin-top: 10px;">
            <canvas id="student-attendance-trend-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Student Performance Insights & Faculty Recommendations -->
      <div class="app-card" style="margin-bottom: 24px;">
        <div class="app-card-header">
          <div class="app-card-title">&#128161; Student Performance Insights &amp; Faculty Guidance</div>
        </div>
        <div class="app-card-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="background: rgba(16,185,129,0.06); border-left: 4px solid #10b981; padding: 14px; border-radius: 6px;">
              <div style="font-weight: 700; color: #10b981; margin-bottom: 6px;">Strongest Subject &amp; Core Strengths</div>
              <div style="font-size: 0.85rem; color: var(--text-primary);">
                ${highestSubject ? `<strong>${highestSubject.name}</strong> with <strong>${highestSubject.total}/60</strong> marks (${highestSubject.grade}) and ${highestSubject.attendance}% attendance.` : 'High academic consistency maintained across all evaluated subjects.'}
              </div>
            </div>
            <div style="background: rgba(239,68,68,0.06); border-left: 4px solid #ef4444; padding: 14px; border-radius: 6px;">
              <div style="font-weight: 700; color: #ef4444; margin-bottom: 6px;">Areas Requiring Attention &amp; Remediation</div>
              <div style="font-size: 0.85rem; color: var(--text-primary);">
                ${lowestSubject ? `<strong>${lowestSubject.name}</strong> currently standing at <strong>${lowestSubject.total}/60</strong> marks (${lowestSubject.grade}). Recommended for tutorial review with ${lowestSubject.teacher || 'Course Instructor'}.` : 'No critical deficiencies observed in current evaluation cycle.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      renderStudentProfileCharts(student, progressions, subjects, monthlyAttData);
    }, 80);
  };

  function renderStudentProfileCharts(student, progressions, subjects, monthlyAttData) {
    // 1. CGPA progression
    const ctxCgpa = document.getElementById('student-cgpa-trend-chart');
    if (ctxCgpa && typeof Chart !== 'undefined') {
      safeDestroyChart('studentCgpa');
      explorerCharts.studentCgpa = new Chart(ctxCgpa, {
        type: 'line',
        data: {
          labels: progressions.map(p => p.semester),
          datasets: [{
            label: 'Semester GPA',
            data: progressions.map(p => Number(p.gpa)),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            fill: true,
            tension: 0.42,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#4f46e5',
            pointBorderWidth: 2.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 1.0, max: 4.0, grid: { color: 'rgba(226, 232, 240, 0.7)' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Poppins', size: 11, weight: '500' } } }
          }
        }
      });
    }

    // 2. Subject Bar Chart
    const ctxSub = document.getElementById('student-subjects-bar-chart');
    if (ctxSub && typeof Chart !== 'undefined') {
      safeDestroyChart('studentSubjects');
      explorerCharts.studentSubjects = new Chart(ctxSub, {
        type: 'bar',
        data: {
          labels: subjects.map(s => s.name),
          datasets: [{
            label: 'Obtained Marks (out of 60)',
            data: subjects.map(s => Number(s.total)),
            backgroundColor: subjects.map(s => (s.total >= 45 ? '#10b981' : s.total < 30 ? '#f43f5e' : '#4f46e5')),
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 60, grid: { color: 'rgba(226, 232, 240, 0.7)' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Poppins', size: 11, weight: '500' } } }
          }
        }
      });
    }

    // 3. Attendance Trend Chart
    const ctxAtt = document.getElementById('student-attendance-trend-chart');
    if (ctxAtt && typeof Chart !== 'undefined') {
      safeDestroyChart('studentAttendance');
      explorerCharts.studentAttendance = new Chart(ctxAtt, {
        type: 'line',
        data: {
          labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4 (Current)'],
          datasets: [
            {
              label: 'Student Attendance %',
              data: monthlyAttData,
              borderColor: student.attendance >= 75 ? '#10b981' : '#f43f5e',
              backgroundColor: student.attendance >= 75 ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              fill: true,
              tension: 0.42,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: student.attendance >= 75 ? '#10b981' : '#f43f5e',
              pointBorderWidth: 2.5
            },
            {
              label: '75% Mandatory Policy Benchmark',
              data: [75, 75, 75, 75],
              borderColor: '#f43f5e',
              borderDash: [6, 4],
              borderWidth: 2,
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 40, max: 100 }
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12 } }
          }
        }
      });
    }
  }

  // ========================================================
  // 9. DEPARTMENT MANAGEMENT MODAL (ADMIN CRUD)
  // ========================================================
  window.openAddDepartmentModal = function () {
    let modal = document.getElementById('add-dept-modal');
    if (!modal) {
      createDepartmentModalDOM();
      modal = document.getElementById('add-dept-modal');
    }
    document.getElementById('dept-modal-title').innerText = 'Add Academic Department';
    document.getElementById('dept-modal-id').value = '';
    document.getElementById('dept-modal-code').value = '';
    document.getElementById('dept-modal-name').value = '';
    document.getElementById('dept-modal-head').value = '';
    document.getElementById('dept-modal-color').value = '#2563eb';
    modal.classList.add('active');
  };

  window.openEditDepartmentModal = function (deptId) {
    let modal = document.getElementById('add-dept-modal');
    if (!modal) {
      createDepartmentModalDOM();
      modal = document.getElementById('add-dept-modal');
    }
    const depts = getDepartments();
    const dept = depts.find(d => d.id === deptId);
    if (!dept) return;

    document.getElementById('dept-modal-title').innerText = `Edit Department (${dept.code || dept.id})`;
    document.getElementById('dept-modal-id').value = dept.id;
    document.getElementById('dept-modal-code').value = dept.code || dept.id;
    document.getElementById('dept-modal-name').value = dept.name;
    document.getElementById('dept-modal-head').value = dept.head;
    document.getElementById('dept-modal-color').value = dept.color || '#2563eb';
    modal.classList.add('active');
  };

  window.closeDepartmentModal = function () {
    const modal = document.getElementById('add-dept-modal');
    if (modal) modal.classList.remove('active');
  };

  window.handleDepartmentFormSubmit = function (event) {
    event.preventDefault();
    const idVal = document.getElementById('dept-modal-id').value.trim();
    const codeVal = document.getElementById('dept-modal-code').value.trim().toUpperCase();
    const nameVal = document.getElementById('dept-modal-name').value.trim();
    const headVal = document.getElementById('dept-modal-head').value.trim();
    const colorVal = document.getElementById('dept-modal-color').value;

    const depts = getDepartments();

    if (idVal) {
      const idx = depts.findIndex(d => d.id === idVal);
      if (idx !== -1) {
        depts[idx].code = codeVal;
        depts[idx].name = nameVal;
        depts[idx].head = headVal;
        depts[idx].color = colorVal;
      }
    } else {
      if (depts.some(d => d.code === codeVal || d.name.toLowerCase() === nameVal.toLowerCase())) {
        alert('A department with this code or name already exists.');
        return;
      }
      depts.push({
        id: codeVal,
        code: codeVal,
        name: nameVal,
        head: headVal,
        color: colorVal,
        icon: codeVal,
        active: true,
        sessions: STANDARD_SESSIONS,
        sections: [
          { id: `${codeVal}-A`, name: `${codeVal}-A`, session: '2022-2026', semester: 'Semester 4', room: 'Lecture Hall 1', shift: 'Morning' }
        ]
      });
    }

    saveDepartments(depts);
    closeDepartmentModal();
    window.renderStudentAnalyticsExplorer();
    if (window.showToast) window.showToast(`Department '${nameVal}' saved successfully.`, 'success');
  };

  window.toggleDepartmentActiveStatus = function (deptId) {
    const depts = getDepartments();
    const dept = depts.find(d => d.id === deptId);
    if (!dept) return;

    dept.active = !dept.active;
    saveDepartments(depts);
    window.renderStudentAnalyticsExplorer();
    if (window.showToast) {
      window.showToast(`Department '${dept.name}' ${dept.active ? 'activated' : 'deactivated'}.`, 'info');
    }
  };

  function createDepartmentModalDOM() {
    const div = document.createElement('div');
    div.id = 'add-dept-modal';
    div.className = 'app-modal';
    div.innerHTML = `
      <div class="app-modal-dialog" style="max-width: 500px;">
        <div class="app-modal-header">
          <div class="app-modal-title" id="dept-modal-title">Add Academic Department</div>
          <button class="app-modal-close" onclick="window.closeDepartmentModal()">&times;</button>
        </div>
        <form onsubmit="window.handleDepartmentFormSubmit(event)">
          <div class="app-modal-body">
            <input type="hidden" id="dept-modal-id">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Department Code (e.g. AI, DS, CS) *</label>
              <input type="text" class="form-input" id="dept-modal-code" placeholder="e.g. AI" required maxlength="6" style="text-transform: uppercase;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Department Full Name *</label>
              <input type="text" class="form-input" id="dept-modal-name" placeholder="e.g. Artificial Intelligence" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Head of Department (Faculty Lead) *</label>
              <input type="text" class="form-input" id="dept-modal-head" placeholder="e.g. Dr. Muhammad Asif" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Brand Color Code</label>
              <input type="color" class="form-input" id="dept-modal-color" value="#2563eb" style="height: 38px; padding: 2px;">
            </div>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn btn-outline" onclick="window.closeDepartmentModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Department</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  // Section Modal
  window.openAddSectionModal = function (deptId) {
    let modal = document.getElementById('add-section-modal');
    if (!modal) {
      createSectionModalDOM();
      modal = document.getElementById('add-section-modal');
    }
    document.getElementById('sec-modal-dept-id').value = deptId;
    document.getElementById('sec-modal-name').value = '';
    modal.classList.add('active');
  };

  window.closeSectionModal = function () {
    const modal = document.getElementById('add-section-modal');
    if (modal) modal.classList.remove('active');
  };

  window.handleSectionFormSubmit = function (event) {
    event.preventDefault();
    const deptId = document.getElementById('sec-modal-dept-id').value;
    const secName = document.getElementById('sec-modal-name').value.trim();
    const session = document.getElementById('sec-modal-session').value.trim();
    const semester = document.getElementById('sec-modal-semester').value.trim();
    const room = document.getElementById('sec-modal-room').value.trim();
    const shift = document.getElementById('sec-modal-shift').value;

    const depts = getDepartments();
    const dept = depts.find(d => d.id === deptId);
    if (!dept) return;

    if (!dept.sections) dept.sections = [];
    if (dept.sections.some(s => s.name.toLowerCase() === secName.toLowerCase())) {
      alert('A section with this name already exists in this department.');
      return;
    }

    dept.sections.push({
      id: secName,
      name: secName,
      session: session,
      semester: semester,
      room: room,
      shift: shift
    });

    saveDepartments(depts);
    closeSectionModal();
    window.renderDepartmentOverviewPage(deptId);
    if (window.showToast) window.showToast(`Section '${secName}' created successfully.`, 'success');
  };

  function createSectionModalDOM() {
    const div = document.createElement('div');
    div.id = 'add-section-modal';
    div.className = 'app-modal';
    div.innerHTML = `
      <div class="app-modal-dialog" style="max-width: 480px;">
        <div class="app-modal-header">
          <div class="app-modal-title">Add Academic Section</div>
          <button class="app-modal-close" onclick="window.closeSectionModal()">&times;</button>
        </div>
        <form onsubmit="window.handleSectionFormSubmit(event)">
          <div class="app-modal-body">
            <input type="hidden" id="sec-modal-dept-id">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Section Name / ID *</label>
              <input type="text" class="form-input" id="sec-modal-name" placeholder="e.g. CS-C or SE-D" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Academic Session *</label>
              <input type="text" class="form-input" id="sec-modal-session" value="2022-2026" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Class / Semester *</label>
              <input type="text" class="form-input" id="sec-modal-semester" value="Semester 4" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Classroom / Laboratory</label>
              <input type="text" class="form-input" id="sec-modal-room" placeholder="e.g. IT Lab 3">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Shift</label>
              <select class="form-input" id="sec-modal-shift">
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn btn-outline" onclick="window.closeSectionModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Section</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  // ========================================================
  // 10. AUTOMATIC INITIALIZATION ON DOM READY
  // ========================================================
  function initExplorer() {
    window.renderStudentAnalyticsExplorer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExplorer);
  } else {
    setTimeout(initExplorer, 100);
  }

  // Hook into switchPage to re-render when switching to dashboard
  const origSwitchPage = window.switchPage;
  window.switchPage = function (pageId) {
    if (typeof origSwitchPage === 'function') origSwitchPage(pageId);
    if (pageId === 'dashboard') {
      setTimeout(window.renderStudentAnalyticsExplorer, 50);
    }
  };

})();
