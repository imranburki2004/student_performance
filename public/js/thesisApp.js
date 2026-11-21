/**
 * Student Performance and Attendance Analytical Dashboard - Core Application Logic
 * Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 * 
 * Group 1 Architecture & Modern UI Upgrade
 * Enterprise Power BI Theme * Zero-Database LocalStorage Architecture * 100% Offline
 */

// Data seed loader supporting both local file:// protocol and web server
function getSeedStudents() {
  if (typeof window !== 'undefined' && typeof window.generateFullStudentList === 'function') {
    return window.generateFullStudentList();
  }
  if (typeof INITIAL_STUDENTS !== 'undefined' && Array.isArray(INITIAL_STUDENTS)) {
    return JSON.parse(JSON.stringify(INITIAL_STUDENTS));
  }
  return [];
}

const STORAGE_KEY = 'student_analytics_db';
const SIDEBAR_STORAGE_KEY = 'app_sidebar_collapsed';
const WIDGETS_STORAGE_KEY = 'dashboard_widget_visibility';
const THEME_STORAGE_KEY = 'app_theme_mode';

// State container
let studentsData = [];
let currentDetailStudentId = 1;
let currentPage = 'dashboard';

// Chart.js instances
let performanceChartInstance = null;
let progressionChartInstance = null;
let attendanceChartInstance = null;
let deptComparisonChartInstance = null;
let academicTrendChartInstance = null;
let attendanceTrendMonthlyChartInstance = null;
let genderComparisonChartInstance = null;

// Modern Attendance Trend Monthly Datasets (Jul 2025 - Dec 2025)
const MONTHLY_ATTENDANCE_DATA = {
  all: {
    labels: ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'],
    datasets: [
      {
        label: 'Grade 10',
        data: [85, 89, 91, 90, 94, 96],
        backgroundColor: '#38bdf8',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      },
      {
        label: 'Grade 11',
        data: [88, 87, 93, 91, 95, 93],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      },
      {
        label: 'Grade 12',
        data: [92, 94, 95, 93, 96, 95],
        backgroundColor: '#4338ca',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      },
      {
        label: 'Cohort Average',
        data: [88.3, 90.0, 93.0, 91.3, 95.0, 94.7],
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }
    ]
  },
  grade10: {
    labels: ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'],
    datasets: [
      {
        label: 'Grade 10 Actual',
        data: [85, 89, 91, 90, 94, 96],
        backgroundColor: '#38bdf8',
        borderRadius: 6,
        barPercentage: 0.5
      },
      {
        label: 'Benchmark Target (90%)',
        data: [90, 90, 90, 90, 90, 90],
        type: 'line',
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 4
      }
    ]
  },
  grade11: {
    labels: ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'],
    datasets: [
      {
        label: 'Grade 11 Actual',
        data: [88, 87, 93, 91, 95, 93],
        backgroundColor: '#06b6d4',
        borderRadius: 6,
        barPercentage: 0.5
      },
      {
        label: 'Benchmark Target (90%)',
        data: [90, 90, 90, 90, 90, 90],
        type: 'line',
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 4
      }
    ]
  },
  grade12: {
    labels: ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'],
    datasets: [
      {
        label: 'Grade 12 Actual',
        data: [92, 94, 95, 93, 96, 95],
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.5
      },
      {
        label: 'Benchmark Target (90%)',
        data: [90, 90, 90, 90, 90, 90],
        type: 'line',
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 4
      }
    ]
  },
  semester: {
    labels: ['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'],
    datasets: [
      {
        label: 'Grade 10',
        data: [91, 90, 94, 96],
        backgroundColor: '#6366f1',
        borderRadius: 6,
        barPercentage: 0.7
      },
      {
        label: 'Grade 11',
        data: [93, 91, 95, 93],
        backgroundColor: '#06b6d4',
        borderRadius: 6,
        barPercentage: 0.7
      },
      {
        label: 'Grade 12',
        data: [95, 93, 96, 95],
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.7
      }
    ]
  }
};

// Default Widget Visibility Settings
let widgetVisibility = {
  'kpi-cards': true,
  'attendance-widget': true,
  'performance-chart-card': true,
  'dept-chart-card': true,
  'trend-chart-card': true,
  'leaderboard-widget': true,
  'at-risk-widget': true,
  'activity-widget': true
};

// ========================================================
// 1. DATA INITIALIZATION & STORAGE PERSISTENCE
// ========================================================
function initDatabase() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      studentsData = JSON.parse(stored);
      if (!Array.isArray(studentsData) || studentsData.length < 150) {
        studentsData = getSeedStudents();
        saveDatabase();
      }
    } catch (e) {
      console.warn('Corrupted local storage data. Re-initializing seed.');
      studentsData = getSeedStudents();
      saveDatabase();
    }
  } else {
    studentsData = getSeedStudents();
    saveDatabase();
  }

  // Load widget visibility preferences
  const storedWidgets = localStorage.getItem(WIDGETS_STORAGE_KEY);
  if (storedWidgets) {
    try {
      widgetVisibility = Object.assign(widgetVisibility, JSON.parse(storedWidgets));
    } catch (e) {
      console.warn('Corrupted widget visibility settings.');
    }
  }
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(studentsData));
  if (typeof window.renderStudentAnalyticsExplorer === 'function') {
    window.renderStudentAnalyticsExplorer();
  }
}

function saveWidgetVisibility() {
  localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgetVisibility));
}

// ========================================================
// 2. LAYOUT, SIDEBAR & TOPBAR CONTROLLERS
// ========================================================
window.toggleSidebar = function() {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;

  sidebar.classList.toggle('collapsed');
  const isCollapsed = sidebar.classList.contains('collapsed');
  localStorage.setItem(SIDEBAR_STORAGE_KEY, isCollapsed ? 'true' : 'false');
};

function initSidebarState() {
  const isCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar && isCollapsed) {
    sidebar.classList.add('collapsed');
  }
}

// Breadcrumb configuration map
const BREADCRUMB_MAP = {
  'dashboard': ['Dashboard', 'Overview'],
  'students': ['Students', 'Overview'],
  'guardians': ['Students', 'Guardians'],
  'documents': ['Students', 'Documents'],
  'health-record': ['Students', 'Health Record'],
  'classes': ['Classes', 'Overview'],
  'attendance': ['Attendance', 'Overview'],
  'academic': ['Academic', 'Overview'],
  'teachers': ['Teachers', 'Overview'],
  'reports': ['Reports', 'Overview'],
  'payment': ['Payment', 'Overview'],
  'alumni': ['Alumni', 'Overview'],
  'settings': ['Settings', 'Overview'],
  'analytics': ['Analytics', 'Overview'],
  'risk-monitoring': ['Risk Monitoring', 'Overview'],
  'results': ['Academic', 'Results & Grades'],
  'subjects': ['Academic', 'Course Matrix'],
  'fines': ['Payment', 'Fines & Dues'],
  'users': ['Administration', 'User Management'],
  'audit-logs': ['System', 'System Audit Trail'],
  'department-overview': ['Academic', 'Department Hierarchy'],
  'session-overview': ['Academic', 'Session Roster'],
  'student-profile': ['Students', 'Individual 360 Profile']
};

function updateBreadcrumbs(pageId) {
  const breadcrumbsContainer = document.getElementById('topbar-breadcrumbs');
  if (!breadcrumbsContainer) return;

  const crumbs = BREADCRUMB_MAP[pageId] || ['Dashboard', 'Overview'];
  breadcrumbsContainer.innerHTML = `
    <span class="breadcrumb-item">${crumbs[0]}</span>
    <span class="breadcrumb-separator">&gt;</span>
    <span class="breadcrumb-item active">${crumbs[1]}</span>
  `;
}

// Sidebar Submenu Toggle
window.toggleSubmenu = function(submenuId) {
  const submenu = document.getElementById(submenuId);
  const parent = document.getElementById('nav-item-students-parent');
  if (!submenu) return;
  const isOpen = submenu.classList.contains('open');
  if (isOpen) {
    submenu.classList.remove('open');
    if (parent) parent.classList.remove('open');
  } else {
    submenu.classList.add('open');
    if (parent) parent.classList.add('open');
  }
};

// Notifications Drawer Toggle
window.toggleNotificationsDrawer = function() {
  const drawer = document.getElementById('notifications-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (!drawer) return;
  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  } else {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }
};

// Filter Drawer Notifications by Category
window.filterDrawerNotifications = function(type) {
  const cards = document.querySelectorAll('.notification-card');
  const tabs = document.querySelectorAll('.drawer-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  if (window.event && window.event.target) {
    window.event.target.classList.add('active');
  }
  cards.forEach(card => {
    if (type === 'all' || card.getAttribute('data-type') === type) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
};

// Mark All System Notifications as Read
window.markAllNotificationsAsRead = function() {
  document.querySelectorAll('.notification-card.unread, .notification-alert-card').forEach(el => {
    el.classList.remove('unread');
  });
  const unreadCount = document.getElementById('notifications-unread-count');
  if (unreadCount) unreadCount.textContent = '0';
  const drawerBadge = document.getElementById('drawer-unread-count-badge');
  if (drawerBadge) drawerBadge.textContent = '0 New';
  if (window.showToast) window.showToast('All system notifications marked as read', 'info');
};

// Theme Toggle
window.toggleTheme = function() {
  const current = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  const next = (current === 'light') ? 'dark' : 'light';
  localStorage.setItem(THEME_STORAGE_KEY, next);
  applyTheme(next);
  showToast(`Theme switched to ${next.toUpperCase()} mode (Palette active)`, 'info');
};

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'high-contrast') {
    document.body.classList.add('high-contrast-theme');
    document.documentElement.setAttribute('data-theme', 'high-contrast');
  } else {
    document.body.classList.remove('dark-theme', 'high-contrast-theme');
    document.documentElement.removeAttribute('data-theme');
  }
}

// System theme preference listener
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

// Toast Notification Engine
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('app-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '&#9989;' : type === 'danger' ? '&#9888;' : '&#8505;';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
};

// ========================================================
// 3. PAGE ROUTING & NAVIGATION
// ========================================================
window.switchPage = function(pageId) {
  currentPage = pageId;

  // Update navigation items in sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    const dataPage = el.getAttribute('data-page');
    const elId = el.id || '';
    if (dataPage === pageId || elId === `nav-item-${pageId}`) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Update sub-menu navigation items
  document.querySelectorAll('.nav-sub-item').forEach(el => {
    const dataPage = el.getAttribute('data-page');
    const elId = el.id || '';
    if (dataPage === pageId || elId === `nav-item-${pageId}`) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // If visiting student sub-pages, keep student parent active and submenu open
  const studentPages = ['students', 'guardians', 'documents', 'health-record'];
  const parentStudents = document.getElementById('nav-item-students-parent');
  const submenuStudents = document.getElementById('students-submenu');
  if (studentPages.includes(pageId)) {
    if (parentStudents) parentStudents.classList.add('active');
    if (submenuStudents) submenuStudents.classList.add('open');
  } else {
    if (parentStudents) parentStudents.classList.remove('active');
  }

  // Toggle page visibility
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
  });

  let targetView = document.getElementById(`page-${pageId}`);
  if (!targetView) {
    if (pageId === 'academic') targetView = document.getElementById('page-academic') || document.getElementById('page-results');
    if (pageId === 'payment') targetView = document.getElementById('page-payment') || document.getElementById('page-fines');
  }
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update breadcrumbs
  updateBreadcrumbs(pageId);

  // Trigger page-specific data updates
  if (pageId === 'dashboard') {
    computeDashboardMetrics();
    if (typeof window.renderAttendanceTrendMonthlyChart === 'function') {
      window.renderAttendanceTrendMonthlyChart('all');
    }
    if (typeof window.renderGenderComparisonChart === 'function') {
      window.renderGenderComparisonChart();
    }
  } else if (pageId === 'students') {
    renderStudentDirectory();
  } else if (pageId === 'attendance') {
    if (typeof renderAttendancePage === 'function') renderAttendancePage();
  } else if (pageId === 'fines') {
    renderFinesPageView();
  } else if (pageId === 'reports') {
    renderReportsPageView();
  } else if (pageId === 'settings') {
    renderSettingsPageView();
  } else if (pageId === 'teachers') {
    renderTeachersPage();
  } else if (pageId === 'classes') {
    renderClassesPage();
  } else if (pageId === 'subjects') {
    renderSubjectsPage();
  } else if (pageId === 'users') {
    if (typeof renderUsersAdminTable === 'function') renderUsersAdminTable();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Legacy alias to support existing buttons
window.switchSection = function(sectionName) {
  if (sectionName === 'dashboard') {
    switchPage('dashboard');
  } else if (sectionName === 'students') {
    switchPage('students');
    document.getElementById('students-view-directory').style.display = 'block';
    document.getElementById('section-detail').style.display = 'none';
    document.getElementById('section-add').style.display = 'none';
  } else if (sectionName === 'detail') {
    switchPage('students');
    document.getElementById('students-view-directory').style.display = 'none';
    document.getElementById('section-detail').style.display = 'block';
    document.getElementById('section-add').style.display = 'none';
  } else if (sectionName === 'add') {
    switchPage('students');
    document.getElementById('students-view-directory').style.display = 'none';
    document.getElementById('section-detail').style.display = 'none';
    document.getElementById('section-add').style.display = 'block';
    initAddStudentDefaults();
  }
};

// ========================================================
// 4. ADVANCED DASHBOARD METRICS & WIDGET RENDERING
// ========================================================
function getFilteredStudents() {
  const deptFilter = document.getElementById('filter-department') ? document.getElementById('filter-department').value : 'ALL';
  const semFilter = document.getElementById('filter-semester') ? document.getElementById('filter-semester').value : 'ALL';
  const sessionFilter = document.getElementById('filter-session') ? document.getElementById('filter-session').value : 'ALL';

  return studentsData.filter(s => {
    if (deptFilter !== 'ALL' && s.department !== deptFilter) return false;
    if (semFilter !== 'ALL' && s.semester !== semFilter) return false;
    if (sessionFilter !== 'ALL') {
      const sessionStr = `${s.sessionStart}-${s.sessionEnd}`;
      if (sessionStr !== sessionFilter) return false;
    }
    return true;
  });
}

function computeDashboardMetrics() {
  const filtered = getFilteredStudents();
  const total = filtered.length;

  if (total === 0) {
    updateKPIElements(0, 0, 0, 0, 0, 0, 0, 0);
    return;
  }

  let highPerformers = 0;
  let medPerformers = 0;
  let atRiskCount = 0;
  let totalAttendanceSum = 0;
  let totalCGPASum = 0;
  let totalUnpaidFine = 0;
  let totalPaidFine = 0;

  const deptStats = {};

  filtered.forEach(s => {
    totalCGPASum += s.cgpa;

    let studentAttendSum = 0;
    if (s.subjects && s.subjects.length > 0) {
      s.subjects.forEach(sub => {
        studentAttendSum += sub.attendance;
        if (sub.unpaidFine) totalUnpaidFine += sub.unpaidFine;
        if (sub.paidFine) totalPaidFine += sub.paidFine;
      });
      const studentAvgAttend = studentAttendSum / s.subjects.length;
      totalAttendanceSum += studentAvgAttend;

      if (studentAvgAttend < 75 || s.cgpa < 2.0) {
        atRiskCount++;
      } else if (s.cgpa >= 3.0) {
        highPerformers++;
      } else {
        medPerformers++;
      }
    } else {
      totalAttendanceSum += 80;
      if (s.cgpa >= 3.0) highPerformers++;
      else if (s.cgpa >= 2.0) medPerformers++;
      else atRiskCount++;
    }

    if (!deptStats[s.department]) {
      deptStats[s.department] = { count: 0, unpaidFines: 0, paidFines: 0, totalAttend: 0 };
    }
    deptStats[s.department].count++;
    deptStats[s.department].unpaidFines += (s.totalUnpaidFine || 0);
    deptStats[s.department].paidFines += (s.totalPaidFine || 0);
    deptStats[s.department].totalAttend += (s.percentage || 80);
  });

  const avgAttendance = parseFloat((totalAttendanceSum / total).toFixed(1));
  const avgCGPA = parseFloat((totalCGPASum / total).toFixed(2));

  updateKPIElements(total, avgAttendance, avgCGPA, atRiskCount, highPerformers, medPerformers, totalUnpaidFine, totalPaidFine);
  
  // Render Visual Widgets
  renderAttendanceSummaryWidget(filtered, avgAttendance, atRiskCount);
  renderPerformanceChart(highPerformers, medPerformers, atRiskCount);
  renderDeptComparisonChart(deptStats);
  renderAcademicTrendChart(filtered);
  renderLeaderboardWidget(filtered);
  renderAtRiskWidget(filtered);
  renderRecentActivityWidget();
  if (typeof window.renderAttendanceTrendMonthlyChart === 'function') {
    window.renderAttendanceTrendMonthlyChart('all');
  }
  if (typeof window.renderGenderComparisonChart === 'function') {
    window.renderGenderComparisonChart();
  }
  applyWidgetVisibility();
}

function updateKPIElements(total, avgAttend, avgCgpa, atRisk, high, med, unpaidFine, paidFine) {
  // Top summary widgets
  const kpiTotal = document.getElementById('kpi-total-students');
  const kpiAttend = document.getElementById('kpi-avg-attendance');
  const kpiCgpa = document.getElementById('kpi-avg-cgpa');
  const kpiRisk = document.getElementById('kpi-at-risk') || document.getElementById('kpi-at-risk-count');
  const kpiFine = document.getElementById('kpi-unpaid-fines');

  if (kpiTotal) kpiTotal.innerText = total.toLocaleString();
  if (kpiAttend) kpiAttend.innerText = `${avgAttend}%`;
  if (kpiCgpa) kpiCgpa.innerText = `${avgCgpa}`;
  if (kpiRisk) kpiRisk.innerText = atRisk.toLocaleString();
  if (kpiFine) kpiFine.innerText = `Rs. ${unpaidFine.toLocaleString()}`;

  // Reset labels for Institutional College mode
  const lblTotal = document.getElementById('kpi-total-label');
  if (lblTotal) lblTotal.textContent = 'Total Enrolled';
  const lblAttend = document.getElementById('kpi-attendance-label');
  if (lblAttend) lblAttend.textContent = 'Avg Attendance Rate';
  const lblCgpa = document.getElementById('kpi-cgpa-label');
  if (lblCgpa) lblCgpa.textContent = 'Overall Average CGPA';
  const lblRisk = document.getElementById('kpi-risk-label');
  if (lblRisk) lblRisk.textContent = 'At-Risk Students';

  const subTotal = document.getElementById('kpi-total-sub');
  if (subTotal) subTotal.innerHTML = `<span class="trend-indicator trend-up">&bull; Active</span> Across 6 College Departments`;

  const subAttend = document.getElementById('kpi-attend-sub');
  if (subAttend) subAttend.innerHTML = `<span class="trend-indicator trend-up">&#9650; Safe</span> Official College Threshold: &ge;75%`;

  // Subtext updates
  const subHigh = document.getElementById('kpi-high-sub');
  if (subHigh && total > 0) {
    subHigh.innerText = `Highest: 4.00 (${high} Students &ge; 3.0)`;
  }

  const subRisk = document.getElementById('kpi-risk-sub');
  if (subRisk && total > 0) {
    subRisk.innerHTML = `<span class="trend-indicator trend-down">&#9660; Monitored</span> ${atRisk} Students (&lt;75% Attend or CGPA &lt;2.0)`;
  }
}

// Attendance Progress Meter Widget
function renderAttendanceSummaryWidget(filtered, avgAttend, atRiskCount) {
  const safeCount = filtered.length - atRiskCount;
  const safePct = filtered.length > 0 ? ((safeCount / filtered.length) * 100).toFixed(1) : 0;
  const riskPct = filtered.length > 0 ? ((atRiskCount / filtered.length) * 100).toFixed(1) : 0;

  const barSafe = document.getElementById('attend-bar-safe');
  const barRisk = document.getElementById('attend-bar-risk');
  const safeLbl = document.getElementById('attend-safe-count');
  const riskLbl = document.getElementById('attend-risk-count');

  if (barSafe) barSafe.style.width = `${safePct}%`;
  if (barRisk) barRisk.style.width = `${riskPct}%`;
  if (safeLbl) safeLbl.innerText = `${safeCount} Eligible (${safePct}%)`;
  if (riskLbl) riskLbl.innerText = `${atRiskCount} Shortage (${riskPct}%)`;
}

// ========================================================
// MODERN CHART 1: RISK STRATIFICATION DONUT CHART (2026 SAAS)
// ========================================================
function renderPerformanceChart(high, med, risk) {
  const canvas = document.getElementById('performanceChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (performanceChartInstance) {
    performanceChartInstance.destroy();
  }

  const total = (high + med + risk) || 250;
  const safePct = Math.round(((high + med) / total) * 100);

  // Update center overlay values
  const centerTotal = document.getElementById('donut-center-total');
  const centerStatus = document.getElementById('donut-center-status');
  if (centerTotal) centerTotal.textContent = total.toLocaleString();
  if (centerStatus) centerStatus.textContent = `${safePct}% Safe`;

  // Update custom legend values
  const countHigh = document.getElementById('donut-count-high');
  const countMed = document.getElementById('donut-count-med');
  const countRisk = document.getElementById('donut-count-risk');
  if (countHigh) countHigh.textContent = high || 168;
  if (countMed) countMed.textContent = med || 60;
  if (countRisk) countRisk.textContent = risk || 22;

  const ctx = canvas.getContext('2d');

  performanceChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Safe / High Performers', 'Moderate Performers', 'At-Risk / Action Required'],
      datasets: [{
        data: [high || 168, med || 60, risk || 22],
        backgroundColor: [
          '#10b981', // Vibrant Emerald
          '#3b82f6', // Electric Royal Blue
          '#f43f5e'  // Neon Rose Red
        ],
        hoverBackgroundColor: [
          '#059669',
          '#2563eb',
          '#e11d48'
        ],
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
        duration: 800
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Poppins', size: 12, weight: 'bold' },
          bodyFont: { family: 'Poppins', size: 11 },
          padding: 12,
          cornerRadius: 10,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = Math.round((val / total) * 100);
              return ` ${context.label}: ${val} students (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// Chart 2: Department Comparison Bar Chart
function renderDeptComparisonChart(deptStats) {
  const canvas = document.getElementById('deptComparisonChart');
  if (!canvas) return;

  if (deptComparisonChartInstance) {
    deptComparisonChartInstance.destroy();
  }

  const depts = Object.keys(deptStats);
  const studentCounts = depts.map(d => deptStats[d].count);
  const avgAttends = depts.map(d => (deptStats[d].count > 0 ? (deptStats[d].totalAttend / deptStats[d].count).toFixed(1) : 80));

  deptComparisonChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [
        {
          label: 'Total Students',
          data: studentCounts,
          backgroundColor: '#4f46e5',
          borderRadius: 6
        },
        {
          label: 'Avg Attendance %',
          data: avgAttends,
          backgroundColor: '#06b6d4',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { position: 'top', labels: { font: { size: 11, family: 'Poppins' } } }
      }
    }
  });
}

// ========================================================
// MODERN CHART 3: ACADEMIC & ATTENDANCE PROGRESSION (2026 SAAS)
// ========================================================
let currentAcademicTrendView = 'attendance';

window.switchAcademicTrendView = function(viewMode) {
  currentAcademicTrendView = viewMode;
  document.querySelectorAll('#academic-trend-tabs .chart-pill-tab').forEach(tab => {
    if (tab.getAttribute('data-view') === viewMode) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  renderAcademicTrendChart();
};

function renderAcademicTrendChart(students) {
  const canvas = document.getElementById('academicTrendChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (academicTrendChartInstance) {
    academicTrendChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  // Create modern smooth linear gradients
  const indigoGradient = ctx.createLinearGradient(0, 0, 0, 260);
  indigoGradient.addColorStop(0, 'rgba(79, 70, 229, 0.32)');
  indigoGradient.addColorStop(0.65, 'rgba(79, 70, 229, 0.08)');
  indigoGradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');

  const blueGradient = ctx.createLinearGradient(0, 0, 0, 260);
  blueGradient.addColorStop(0, 'rgba(37, 99, 235, 0.30)');
  blueGradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

  const milestones = ['Sem 1 (Fall 22)', 'Sem 2 (Spr 23)', 'Sem 3 (Fall 23)', 'Sem 4 (Spr 24)', 'Sem 5 (Fall 24)', 'Sem 6 (Spr 25)'];
  
  let datasets = [];

  if (currentAcademicTrendView === 'attendance') {
    datasets = [
      {
        label: 'Active Cohort Attendance %',
        data: [87.5, 89.2, 91.0, 90.4, 93.8, 94.6],
        borderColor: '#4f46e5',
        backgroundColor: indigoGradient,
        borderWidth: 3,
        tension: 0.42,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBorderWidth: 3
      },
      {
        label: 'High Merit Track',
        data: [91.0, 93.4, 94.8, 95.2, 96.5, 97.2],
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.42,
        fill: false,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: '75% Mandatory Threshold',
        data: [75, 75, 75, 75, 75, 75],
        borderColor: '#f43f5e',
        borderDash: [6, 6],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ];
  } else if (currentAcademicTrendView === 'cgpa') {
    datasets = [
      {
        label: 'Institutional Average CGPA',
        data: [3.35, 3.42, 3.38, 3.51, 3.56, 3.62],
        borderColor: '#2563eb',
        backgroundColor: blueGradient,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7
      },
      {
        label: 'First Class Honors Benchmark (3.00)',
        data: [3.0, 3.0, 3.0, 3.0, 3.0, 3.0],
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ];
  } else {
    // vs Target view
    datasets = [
      {
        label: 'Actual Attendance %',
        data: [87.5, 89.2, 91.0, 90.4, 93.8, 94.6],
        borderColor: '#4f46e5',
        backgroundColor: indigoGradient,
        borderWidth: 3,
        tension: 0.42,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 2.5,
        pointRadius: 4
      },
      {
        label: 'Target Benchmark (90%)',
        data: [90, 90, 90, 90, 90, 90],
        borderColor: '#06b6d4',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ];
  }

  const isCgpa = currentAcademicTrendView === 'cgpa';

  academicTrendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: milestones,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      animation: {
        duration: 750,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Poppins', size: 12, weight: 'bold' },
          bodyFont: { family: 'Poppins', size: 11 },
          padding: 12,
          cornerRadius: 10,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              const val = context.parsed.y;
              return isCgpa 
                ? ` ${context.dataset.label}: ${val.toFixed(2)} CGPA`
                : ` ${context.dataset.label}: ${val}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Poppins', size: 11, weight: '500' },
            color: '#64748b'
          }
        },
        y: {
          min: isCgpa ? 2.5 : 60,
          max: isCgpa ? 4.0 : 100,
          grid: {
            color: 'rgba(226, 232, 240, 0.7)',
            drawBorder: false
          },
          ticks: {
            stepSize: isCgpa ? 0.5 : 10,
            font: { family: 'Poppins', size: 11 },
            color: '#64748b',
            callback: function(val) {
              return isCgpa ? val.toFixed(1) : val + '%';
            }
          }
        }
      }
    }
  });
}

// ========================================================
// MODERN DATA VISUALIZATION SECTION (BOTTOM GRID CHARTS)
// ========================================================
window.renderAttendanceTrendMonthlyChart = function(filterType = 'all') {
  const canvas = document.getElementById('attendanceTrendMonthlyChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (attendanceTrendMonthlyChartInstance) {
    attendanceTrendMonthlyChartInstance.destroy();
  }

  const chartData = MONTHLY_ATTENDANCE_DATA[filterType] || MONTHLY_ATTENDANCE_DATA.all;

  attendanceTrendMonthlyChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Poppins', size: 12, weight: 'bold' },
          bodyFont: { family: 'Poppins', size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Poppins', size: 11, weight: '500' },
            color: '#64748b'
          }
        },
        y: {
          beginAtZero: false,
          min: 70,
          max: 100,
          grid: {
            color: 'rgba(226, 232, 240, 0.8)',
            drawBorder: false
          },
          ticks: {
            stepSize: 10,
            font: { family: 'Poppins', size: 11 },
            color: '#64748b',
            callback: function(val) { return val + '%'; }
          }
        }
      }
    }
  });
};

window.filterAttendanceTrend = function(filterType) {
  // Update button active styling
  document.querySelectorAll('#attendance-trend-filters .chart-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Re-render chart with selected dataset
  window.renderAttendanceTrendMonthlyChart(filterType);
};

window.renderGenderComparisonChart = function() {
  const canvas = document.getElementById('genderComparisonChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (genderComparisonChartInstance) {
    genderComparisonChartInstance.destroy();
  }

  genderComparisonChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Female Students (55%)', 'Male Students (45%)'],
      datasets: [{
        data: [235, 193], // 55% Female (235), 45% Male (193) -> 428 total active
        backgroundColor: ['#8b5cf6', '#3b82f6'],
        hoverBackgroundColor: ['#7c3aed', '#2563eb'],
        borderWidth: 3,
        borderColor: '#ffffff',
        borderRadius: 8,
        spacing: 6,
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
        duration: 800
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Poppins', size: 12, weight: 'bold' },
          bodyFont: { family: 'Poppins', size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const total = 428;
              const pct = ((val / total) * 100).toFixed(0);
              return `${context.label}: ${val} students (${pct}%)`;
            }
          }
        }
      }
    }
  });
};

// Widget: Top Performing Students Leaderboard
function renderLeaderboardWidget(students) {
  const container = document.getElementById('top-students-list');
  if (!container) return;

  const sorted = [...students].sort((a, b) => b.cgpa - a.cgpa).slice(0, 5);

  container.innerHTML = sorted.map((s, idx) => `
    <div class="leaderboard-item">
      <div class="leaderboard-rank rank-${idx + 1}">${idx + 1}</div>
      <div class="leaderboard-info">
        <span class="leaderboard-name">${s.name}</span>
        <span class="leaderboard-dept">${s.department} * ${s.studentId}</span>
      </div>
      <div class="leaderboard-metric">${s.cgpa.toFixed(2)} CGPA</div>
    </div>
  `).join('');
}

// Widget: Students Needing Immediate Attention (At-Risk)
function renderAtRiskWidget(students) {
  const container = document.getElementById('at-risk-students-list');
  if (!container) return;

  const atRiskList = students.filter(s => s.riskStatus.includes('Risk') || s.riskStatus.includes('Danger') || s.totalUnpaidFine > 0).slice(0, 5);

  if (atRiskList.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--color-success); padding: 1rem; font-weight: 600;">&#9989; No students currently flagged in danger!</div>`;
    return;
  }

  container.innerHTML = atRiskList.map(s => `
    <div class="leaderboard-item" style="border-left: 3px solid #ef4444;">
      <div class="leaderboard-info">
        <span class="leaderboard-name" style="color: #ef4444;">${s.name} (${s.studentId})</span>
        <span class="leaderboard-dept">${s.department} * Unpaid Fine: Rs. ${s.totalUnpaidFine.toLocaleString()}</span>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="openStudentDetail(${s.id})">
        Resolve
      </button>
    </div>
  `).join('');
}

// Widget: Recent Activity Feed
function renderRecentActivityWidget() {
  const container = document.getElementById('recent-activity-feed');
  if (!container) return;

  const activities = [
    { icon: '&#128179;', text: 'Attendance fine of Rs. 1,000 paid for <strong>Muhammad Bilal (CS-2215)</strong>', time: '12 mins ago' },
    { icon: '&#9888;', text: 'Attendance warning alert issued to parent of <strong>Hamza Khan (MATH-2208)</strong>', time: '1 hour ago' },
    { icon: '&#10133;', text: 'New academic record created for <strong>Ayesha Bibi (BOT-2201)</strong>', time: '3 hours ago' },
    { icon: '&#128424;', text: 'Official DMC Transcript printed for <strong>Ali Raza (CS-2201)</strong>', time: 'Yesterday' }
  ];

  container.innerHTML = activities.map(act => `
    <div class="activity-item">
      <div class="activity-icon">${act.icon}</div>
      <div class="activity-details">
        <div class="activity-text">${act.text}</div>
        <div class="activity-time">${act.time}</div>
      </div>
    </div>
  `).join('');
}

// Widget Visibility Filter
function applyWidgetVisibility() {
  Object.keys(widgetVisibility).forEach(key => {
    const el = document.getElementById(key);
    if (el) {
      el.style.display = widgetVisibility[key] ? 'block' : 'none';
    }
  });
}

window.toggleWidget = function(widgetKey) {
  widgetVisibility[widgetKey] = !widgetVisibility[widgetKey];
  saveWidgetVisibility();
  applyWidgetVisibility();
  showToast(`Widget ${widgetKey} visibility updated`, 'info');
};

window.handleDashboardFilterChange = function() {
  computeDashboardMetrics();
};

// ========================================================
// 5. STUDENT DIRECTORY & CRUD CONTROLLERS (Figure 8.2)
// ========================================================
function renderStudentDirectory() {
  const container = document.getElementById('dept-cards-container');
  if (!container) return;

  const groups = {};
  studentsData.forEach(s => {
    if (!groups[s.department]) groups[s.department] = [];
    groups[s.department].push(s);
  });

  const depts = ["Botany", "Chemistry", "Computer Science", "English", "HPE", "Islamiat", "Mathematics", "Physics"];

  container.innerHTML = depts.map(dept => {
    const list = groups[dept] || [];
    const atRiskInDept = list.filter(st => st.riskStatus.includes('Risk') || st.riskStatus.includes('Danger')).length;

    return `
      <div class="app-card dept-card-interactive" onclick="openDepartmentStudents('${dept}')" style="cursor: pointer;">
        <div class="app-card-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: #f0f9ff; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">&#127963;</div>
            <span class="app-badge ${atRiskInDept > 0 ? 'badge-danger' : 'badge-success'}">
              ${atRiskInDept > 0 ? `${atRiskInDept} At-Risk` : 'All Safe'}
            </span>
          </div>
          <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">${dept}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Bachelor of Science (4-Year)</p>
          <div style="display: flex; justify-content: space-between; font-size: 0.825rem; font-weight: 600; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
            <span>Enrolled Students</span>
            <span style="color: var(--color-brand-accent); font-weight: 800;">${list.length}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openDepartmentStudents = function(department) {
  const modal = document.getElementById('dept-modal');
  const title = document.getElementById('modal-dept-title');
  const tbody = document.getElementById('modal-dept-tbody');

  title.innerText = `${department} - Enrolled Students`;
  const list = studentsData.filter(s => s.department === department);

  tbody.innerHTML = list.map(s => `
    <tr>
      <td><strong>${s.studentId}</strong></td>
      <td><strong>${s.name}</strong></td>
      <td>${s.fatherName}</td>
      <td>${s.sessionStart}-${s.sessionEnd}</td>
      <td><strong style="color: #0284c7;">${s.cgpa.toFixed(2)}</strong> (${s.overallGrade})</td>
      <td>
        <span class="app-badge ${s.riskStatus.includes('Risk') || s.riskStatus.includes('Danger') ? 'badge-danger' : 'badge-safe'}">
          ${s.riskStatus}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-secondary btn-sm" onclick="openStudentDetail(${s.id})" title="View Analytics">
            &#128202; View
          </button>
          <button class="btn btn-primary btn-sm" onclick="openEditStudentModal(${s.id})" title="Edit / Update Record">
            &#9999; Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})" title="Delete Record">
            &#128465;
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  modal.classList.add('active');
};

window.closeDeptModal = function() {
  const modal = document.getElementById('dept-modal');
  if (modal) modal.classList.remove('active');
};

window.handleStudentSearch = function(query) {
  const q = query.trim().toLowerCase();
  const resultsContainer = document.getElementById('search-results-table-container');
  const tbody = document.getElementById('search-results-tbody');
  const deptContainer = document.getElementById('dept-cards-container');

  if (!q) {
    resultsContainer.style.display = 'none';
    deptContainer.style.display = 'grid';
    return;
  }

  resultsContainer.style.display = 'block';
  deptContainer.style.display = 'none';

  const matches = studentsData.filter(s => 
    s.name.toLowerCase().includes(q) ||
    s.studentId.toLowerCase().includes(q) ||
    s.department.toLowerCase().includes(q) ||
    s.fatherName.toLowerCase().includes(q)
  );

  tbody.innerHTML = matches.map(s => `
    <tr>
      <td><strong>${s.studentId}</strong></td>
      <td><strong>${s.name}</strong></td>
      <td>${s.fatherName}</td>
      <td>${s.department}</td>
      <td>${s.sessionStart}-${s.sessionEnd}</td>
      <td><strong>${s.cgpa.toFixed(2)}</strong></td>
      <td>${s.percentage}%</td>
      <td>
        <span class="app-badge ${s.totalUnpaidFine > 0 ? 'badge-danger' : 'badge-safe'}">
          ${s.totalUnpaidFine > 0 ? `Unpaid: Rs. ${s.totalUnpaidFine}` : 'Paid / Safe'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-secondary btn-sm" onclick="openStudentDetail(${s.id})" title="View Analytics">
            &#128202; View
          </button>
          <button class="btn btn-primary btn-sm" onclick="openEditStudentModal(${s.id})" title="Edit / Update Record">
            &#9999; Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})" title="Delete Record">
            &#128465;
          </button>
        </div>
      </td>
    </tr>
  `).join('');
};

window.clearSearch = function() {
  document.getElementById('dir-search-input').value = '';
  document.getElementById('search-results-table-container').style.display = 'none';
  document.getElementById('dept-cards-container').style.display = 'grid';
};

// ========================================================
// 6. STUDENT DETAIL ANALYTICS VIEW (Figure 8.3)
// ========================================================
window.openStudentDetail = function(studentId) {
  if (typeof window.verifyStudentAccess === 'function') {
    if (!window.verifyStudentAccess(studentId)) {
      return;
    }
  }
  currentDetailStudentId = studentId;
  const s = studentsData.find(st => st.id === studentId);
  if (!s) return;

  closeDeptModal();
  switchSection('detail');

  // Fill Profile Card
  document.getElementById('det-name').innerText = s.name;
  document.getElementById('det-father').innerText = s.fatherName;
  document.getElementById('det-dept').innerText = s.department;
  document.getElementById('det-cgpa').innerText = `${s.cgpa.toFixed(2)} / 4.00`;
  document.getElementById('det-percentage').innerText = `${s.percentage.toFixed(1)}%`;
  document.getElementById('det-grade').innerText = s.overallGrade;
  document.getElementById('det-unpaid-fine').innerText = `Rs. ${s.totalUnpaidFine.toLocaleString()}`;
  document.getElementById('det-paid-fine').innerText = `Rs. ${s.totalPaidFine.toLocaleString()}`;

  const isRisk = s.riskStatus.includes('Risk') || s.riskStatus.includes('Danger') || s.totalUnpaidFine > 0;
  const riskBadge = document.getElementById('det-risk-badge');
  riskBadge.innerHTML = `<span class="app-badge ${isRisk ? 'badge-danger' : 'badge-safe'}">${s.riskStatus}</span>`;

  // Render Progression Chart
  renderProgressionChart(s.semesterProgression || []);

  // Render Attendance Ratio Donut Chart
  let totalAttend = 0;
  if (s.subjects && s.subjects.length > 0) {
    s.subjects.forEach(sub => totalAttend += sub.attendance);
    totalAttend = totalAttend / s.subjects.length;
  } else {
    totalAttend = 80;
  }
  renderAttendanceChart(totalAttend);

  // Render Semester Directory Table (Table 6.3 - Out of 60 marks)
  const semTbody = document.getElementById('det-sem-tbody');
  semTbody.innerHTML = (s.subjects || []).map(sub => `
    <tr>
      <td><strong>${sub.name}</strong></td>
      <td>${sub.teacher}</td>
      <td>${sub.sessional.toFixed(1)} / 6.0</td>
      <td>${sub.mid.toFixed(1)} / 18.0</td>
      <td>${sub.terminal.toFixed(1)} / 36.0</td>
      <td><strong>${sub.total.toFixed(1)} / 60.0</strong></td>
      <td><strong style="color: #0284c7;">${sub.gpa.toFixed(1)}</strong></td>
      <td><strong>${sub.grade}</strong></td>
    </tr>
  `).join('');

  // Render Attendance Fine Management Table (Table 6.4)
  const fineTbody = document.getElementById('det-fines-tbody');
  fineTbody.innerHTML = (s.subjects || []).map((sub, idx) => {
    const isDanger = sub.attendance < 75;
    const isPaid = sub.paidFine > 0;

    return `
      <tr>
        <td><strong>${sub.name}</strong></td>
        <td>
          <span style="font-weight: 700; color: ${isDanger ? '#ef4444' : '#10b981'};">
            ${sub.attendance.toFixed(1)}%
          </span>
        </td>
        <td>
          <span class="app-badge ${isDanger ? 'badge-danger' : 'badge-safe'}">
            ${isDanger ? 'Danger (< 75%)' : 'Safe'}
          </span>
        </td>
        <td>${isPaid ? 'Yes (Paid)' : (sub.unpaidFine > 0 ? 'No' : 'N/A')}</td>
        <td style="color: #ef4444; font-weight: 700;">Rs. ${sub.unpaidFine}</td>
        <td style="color: #10b981; font-weight: 700;">Rs. ${sub.paidFine}</td>
        <td>
          ${sub.unpaidFine > 0 ? `
            <button class="btn btn-success btn-sm" onclick="handlePayFine(${s.id}, ${idx})">
              Pay Fine (Rs. ${sub.unpaidFine})
            </button>
          ` : `
            <span style="color: var(--text-muted); font-size: 0.8rem;">No Fine Pending</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
};

function renderProgressionChart(progression) {
  const canvas = document.getElementById('progressionChart');
  if (!canvas) return;

  if (progressionChartInstance) {
    progressionChartInstance.destroy();
  }

  const labels = progression.map(p => p.semester);
  const data = progression.map(p => p.gpa);

  progressionChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Semester GPA',
        data,
        backgroundColor: '#0284c7',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 4.0, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderAttendanceChart(avgAttend) {
  const canvas = document.getElementById('attendanceGaugeChart');
  if (!canvas) return;

  if (attendanceChartInstance) {
    attendanceChartInstance.destroy();
  }

  const present = parseFloat(avgAttend.toFixed(1));
  const absent = parseFloat((100 - present).toFixed(1));

  attendanceChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Present Ratio', 'Absent Ratio'],
      datasets: [{
        data: [present, absent],
        backgroundColor: [present >= 75 ? '#10b981' : '#f43f5e', '#f1f5f9'],
        borderWidth: 2,
        borderColor: '#ffffff',
        borderRadius: 8,
        spacing: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 11, weight: '500' } } }
      },
      cutout: '78%',
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 800
      }
    }
  });
}

// Action: Pay Fine
window.handlePayFine = function(studentId, subjectIndex) {
  const s = studentsData.find(st => st.id === studentId);
  if (!s || !s.subjects[subjectIndex]) return;

  const sub = s.subjects[subjectIndex];
  const paidAmount = sub.unpaidFine;

  sub.paidFine += paidAmount;
  sub.unpaidFine = 0;
  sub.fineStatus = "Paid";

  s.totalPaidFine += paidAmount;
  s.totalUnpaidFine = Math.max(0, s.totalUnpaidFine - paidAmount);

  if (s.totalUnpaidFine === 0) {
    s.riskStatus = s.cgpa >= 3.0 ? "High Performer" : "Medium Performer";
  }

  saveDatabase();
  computeDashboardMetrics();
  openStudentDetail(studentId);

  showToast(`Fine Paid! Rs. ${paidAmount} recorded for "${sub.name}". Status: Paid.`, 'success');
};

// ========================================================
// 7. FULL CRUD: ADD, EDIT / UPDATE, DELETE
// ========================================================

// Add Student Form Initializer
function initAddStudentDefaults() {
  const cont = document.getElementById('subjects-entry-container');
  if (cont && cont.children.length === 0) {
    addSubjectInputRow('Database Systems', 'Engr. Waqas', 5.5, 16.5, 32.0, 88.0);
    addSubjectInputRow('Computer Networks', 'Prof. Abdur Rehman', 5.8, 17.0, 33.5, 92.0);
  }
}

window.addSubjectInputRow = function(name = '', teacher = '', sessional = 5.0, mid = 15.0, terminal = 30.0, attendance = 85.0) {
  const container = document.getElementById('subjects-entry-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'subject-entry-row app-card';
  row.style.cssText = 'padding: 0.75rem; margin-bottom: 0.6rem; display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr auto; gap: 0.5rem; align-items: center;';

  row.innerHTML = `
    <input type="text" class="form-input subj-name" placeholder="Subject Name" value="${name}" required>
    <input type="text" class="form-input subj-teacher" placeholder="Teacher Name" value="${teacher}" required>
    <input type="number" class="form-input subj-sess" placeholder="Sess (6)" value="${sessional}" min="0" max="6" step="0.1" required title="Sessional Max 6">
    <input type="number" class="form-input subj-mid" placeholder="Mid (18)" value="${mid}" min="0" max="18" step="0.1" required title="Midterm Max 18">
    <input type="number" class="form-input subj-term" placeholder="Term (36)" value="${terminal}" min="0" max="36" step="0.1" required title="Terminal Max 36">
    <input type="number" class="form-input subj-attend" placeholder="Attend %" value="${attendance}" min="0" max="100" step="1" required title="Attendance %">
    <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.subject-entry-row').remove()">&#10005;</button>
  `;

  container.appendChild(row);
};

window.addSubjectRow = function() {
  addSubjectInputRow('New Subject', 'Faculty Member', 5.0, 15.0, 30.0, 85.0);
};

window.handleSaveStudent = function(event) {
  event.preventDefault();

  const name = document.getElementById('entry-student-name').value.trim();
  const father = document.getElementById('entry-father-name').value.trim();
  const department = document.getElementById('entry-department').value;
  const semester = document.getElementById('entry-semester').value;
  const start = parseInt(document.getElementById('entry-session-start').value, 10) || 2024;
  const end = parseInt(document.getElementById('entry-session-end').value, 10) || 2028;

  const subjectRows = document.querySelectorAll('#subjects-entry-container .subject-entry-row');
  if (subjectRows.length === 0) {
    showToast('Please add at least one subject.', 'danger');
    return;
  }

  const subjects = [];
  let totalQualityPoints = 0;
  let totalMarksSum = 0;
  let totalUnpaidFine = 0;
  let isAnyShortAttendance = false;

  subjectRows.forEach(row => {
    const sName = row.querySelector('.subj-name').value.trim();
    const sTeacher = row.querySelector('.subj-teacher').value.trim();
    const sSess = Math.min(6, Math.max(0, parseFloat(row.querySelector('.subj-sess').value) || 0));
    const sMid = Math.min(18, Math.max(0, parseFloat(row.querySelector('.subj-mid').value) || 0));
    const sTerm = Math.min(36, Math.max(0, parseFloat(row.querySelector('.subj-term').value) || 0));
    const sAttend = Math.min(100, Math.max(0, parseFloat(row.querySelector('.subj-attend').value) || 0));

    const total = parseFloat((sSess + sMid + sTerm).toFixed(1));
    totalMarksSum += total;

    const pct = (total / 60) * 100;
    let gpa = 0.0, grade = 'F';
    if (pct >= 85) { gpa = 4.0; grade = 'A+'; }
    else if (pct >= 80) { gpa = 3.7; grade = 'A'; }
    else if (pct >= 75) { gpa = 3.3; grade = 'B+'; }
    else if (pct >= 70) { gpa = 3.0; grade = 'B'; }
    else if (pct >= 65) { gpa = 2.7; grade = 'C+'; }
    else if (pct >= 60) { gpa = 2.3; grade = 'C'; }
    else if (pct >= 50) { gpa = 1.7; grade = 'D'; }

    totalQualityPoints += gpa;

    let unpaidFine = 0;
    let fineStatus = "Safe";
    if (sAttend < 75) {
      unpaidFine = 1000;
      fineStatus = "Danger";
      totalUnpaidFine += 1000;
      isAnyShortAttendance = true;
    }

    subjects.push({
      name: sName,
      teacher: sTeacher,
      sessional: sSess,
      mid: sMid,
      terminal: sTerm,
      total,
      gpa,
      grade,
      attendance: sAttend,
      fineStatus,
      unpaidFine,
      paidFine: 0
    });
  });

  const overallCGPA = parseFloat((totalQualityPoints / subjects.length).toFixed(2));
  const overallPercentage = parseFloat(((totalMarksSum / (subjects.length * 60)) * 100).toFixed(1));
  const overallGrade = overallCGPA >= 3.7 ? 'A+' : overallCGPA >= 3.0 ? 'A' : overallCGPA >= 2.0 ? 'B' : 'D';

  const riskStatus = (isAnyShortAttendance || overallCGPA < 2.0) ? "At Risk / Danger" 
                     : overallCGPA >= 3.0 ? "High Performer" : "Medium Performer";

  const newId = studentsData.length > 0 ? Math.max(...studentsData.map(s => s.id)) + 1 : 1;
  const deptCode = department.substring(0, 3).toUpperCase();
  const studentId = `${deptCode}-${start.toString().slice(-2)}${newId < 10 ? '0' + newId : newId}`;

  const newStudent = {
    id: newId,
    studentId,
    name,
    fatherName: father,
    department,
    sessionStart: start,
    sessionEnd: end,
    semester,
    cgpa: overallCGPA,
    percentage: overallPercentage,
    overallGrade,
    riskStatus,
    totalUnpaidFine,
    totalPaidFine: 0,
    semesterProgression: [{ semester, gpa: overallCGPA }],
    subjects
  };

  studentsData.unshift(newStudent);
  saveDatabase();
  computeDashboardMetrics();
  renderStudentDirectory();

  showToast(`Registered "${name}" (${studentId}) successfully!`, 'success');
  switchSection('students');
};

// Delete Student Action
window.deleteStudent = function(studentId) {
  const s = studentsData.find(st => st.id === studentId);
  if (!s) return;

  if (!confirm(`Are you sure you want to permanently delete student "${s.name}" (${s.studentId}) from LocalStorage?\n\nThis will update total enrollments, fine calculations, and department metrics.`)) {
    return;
  }

  const idx = studentsData.findIndex(st => st.id === studentId);
  if (idx !== -1) {
    studentsData.splice(idx, 1);
    saveDatabase();
    computeDashboardMetrics();
    renderStudentDirectory();

    const deptModal = document.getElementById('dept-modal');
    if (deptModal && deptModal.classList.contains('active')) {
      const remainingInDept = studentsData.filter(st => st.department === s.department);
      if (remainingInDept.length > 0) {
        openDepartmentStudents(s.department);
      } else {
        closeDeptModal();
      }
    }

    const detailSec = document.getElementById('section-detail');
    if (detailSec && detailSec.style.display !== 'none' && currentDetailStudentId === studentId) {
      switchSection('students');
    }

    showToast(`Student "${s.name}" permanently deleted.`, 'danger');
  }
};

// Edit Student Modal Actions
window.openEditStudentModal = function(studentId) {
  const s = studentsData.find(st => st.id === studentId);
  if (!s) return;

  document.getElementById('edit-student-id').value = s.id;
  document.getElementById('edit-student-name').value = s.name;
  document.getElementById('edit-student-father').value = s.fatherName;
  document.getElementById('edit-student-dept').value = s.department;
  document.getElementById('edit-student-sem').value = s.semester || 'Semester 4';
  document.getElementById('edit-student-session-start').value = s.sessionStart || 2022;
  document.getElementById('edit-student-session-end').value = s.sessionEnd || 2026;

  const container = document.getElementById('edit-subjects-container');
  container.innerHTML = '';

  (s.subjects || []).forEach(sub => {
    addEditSubjectInputRow(sub.name, sub.teacher, sub.sessional, sub.mid, sub.terminal, sub.attendance);
  });

  if ((s.subjects || []).length === 0) {
    addEditSubjectInputRow('Subject 1', 'Faculty Member', 5.0, 15.0, 30.0, 85.0);
  }

  document.getElementById('edit-student-modal').classList.add('active');
};

window.closeEditStudentModal = function() {
  const modal = document.getElementById('edit-student-modal');
  if (modal) modal.classList.remove('active');
};

window.addEditSubjectInputRow = function(name = '', teacher = '', sessional = 5.0, mid = 15.0, terminal = 30.0, attend = 85.0) {
  const container = document.getElementById('edit-subjects-container');
  const div = document.createElement('div');
  div.className = 'edit-subject-row app-card';
  div.style.cssText = 'display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr auto; gap: 0.5rem; align-items: center; background: #f8fafc; padding: 0.5rem; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 0.4rem;';
  
  div.innerHTML = `
    <input type="text" class="form-input edit-subj-name" placeholder="Subject Name" value="${name}" required style="padding: 0.35rem 0.5rem; font-size: 0.8rem;">
    <input type="text" class="form-input edit-subj-teacher" placeholder="Teacher Name" value="${teacher}" required style="padding: 0.35rem 0.5rem; font-size: 0.8rem;">
    <input type="number" class="form-input edit-subj-sess" placeholder="Sess (6)" value="${sessional}" min="0" max="6" step="0.1" required style="padding: 0.35rem 0.4rem; font-size: 0.8rem;" title="Sessional Max 6">
    <input type="number" class="form-input edit-subj-mid" placeholder="Mid (18)" value="${mid}" min="0" max="18" step="0.1" required style="padding: 0.35rem 0.4rem; font-size: 0.8rem;" title="Midterm Max 18">
    <input type="number" class="form-input edit-subj-term" placeholder="Term (36)" value="${terminal}" min="0" max="36" step="0.1" required style="padding: 0.35rem 0.4rem; font-size: 0.8rem;" title="Terminal Max 36">
    <input type="number" class="form-input edit-subj-attend" placeholder="Attend %" value="${attend}" min="0" max="100" step="1" required style="padding: 0.35rem 0.4rem; font-size: 0.8rem;" title="Attendance Percentage">
    <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.edit-subject-row').remove()" style="padding: 0.3rem 0.5rem;" title="Remove Subject">&#10005;</button>
  `;

  container.appendChild(div);
};

window.addEditSubjectRow = function() {
  addEditSubjectInputRow('New Subject', 'Faculty Member', 5.0, 15.0, 30.0, 85.0);
};

window.handleUpdateStudentSubmit = function(event) {
  event.preventDefault();
  const studentId = parseInt(document.getElementById('edit-student-id').value, 10);
  const s = studentsData.find(st => st.id === studentId);
  if (!s) return;

  const name = document.getElementById('edit-student-name').value.trim();
  const father = document.getElementById('edit-student-father').value.trim();
  const department = document.getElementById('edit-student-dept').value;
  const semester = document.getElementById('edit-student-sem').value;
  const start = parseInt(document.getElementById('edit-student-session-start').value, 10) || 2022;
  const end = parseInt(document.getElementById('edit-student-session-end').value, 10) || 2026;

  const rows = document.querySelectorAll('#edit-subjects-container .edit-subject-row');
  if (rows.length === 0) {
    showToast('Please enter at least one subject.', 'danger');
    return;
  }

  const subjects = [];
  let totalQualityPoints = 0;
  let totalMarksSum = 0;
  let totalUnpaidFine = 0;
  let isAnyShortAttendance = false;

  rows.forEach(row => {
    const sName = row.querySelector('.edit-subj-name').value.trim();
    const sTeacher = row.querySelector('.edit-subj-teacher').value.trim();
    const sSess = Math.min(6, Math.max(0, parseFloat(row.querySelector('.edit-subj-sess').value) || 0));
    const sMid = Math.min(18, Math.max(0, parseFloat(row.querySelector('.edit-subj-mid').value) || 0));
    const sTerm = Math.min(36, Math.max(0, parseFloat(row.querySelector('.edit-subj-term').value) || 0));
    const sAttend = Math.min(100, Math.max(0, parseFloat(row.querySelector('.edit-subj-attend').value) || 0));

    const total = parseFloat((sSess + sMid + sTerm).toFixed(1));
    totalMarksSum += total;

    const pct = (total / 60) * 100;
    let gpa = 0.0, grade = 'F';
    if (pct >= 85) { gpa = 4.0; grade = 'A+'; }
    else if (pct >= 80) { gpa = 3.7; grade = 'A'; }
    else if (pct >= 75) { gpa = 3.3; grade = 'B+'; }
    else if (pct >= 70) { gpa = 3.0; grade = 'B'; }
    else if (pct >= 65) { gpa = 2.7; grade = 'C+'; }
    else if (pct >= 60) { gpa = 2.3; grade = 'C'; }
    else if (pct >= 50) { gpa = 1.7; grade = 'D'; }

    totalQualityPoints += gpa;

    const existingSub = (s.subjects || []).find(sub => sub.name === sName);
    let unpaidFine = 0;
    let paidFine = (existingSub && existingSub.paidFine) ? existingSub.paidFine : 0;
    let fineStatus = "Safe";

    if (sAttend < 75) {
      if (paidFine > 0) {
        fineStatus = "Paid";
      } else {
        fineStatus = "Danger";
        unpaidFine = 1000;
        totalUnpaidFine += 1000;
      }
      isAnyShortAttendance = true;
    }

    subjects.push({
      name: sName,
      teacher: sTeacher,
      sessional: sSess,
      mid: sMid,
      terminal: sTerm,
      total,
      gpa,
      grade,
      attendance: sAttend,
      fineStatus,
      unpaidFine,
      paidFine
    });
  });

  const overallCGPA = parseFloat((totalQualityPoints / subjects.length).toFixed(2));
  const overallPercentage = parseFloat(((totalMarksSum / (subjects.length * 60)) * 100).toFixed(1));
  const overallGrade = overallCGPA >= 3.7 ? 'A+' : overallCGPA >= 3.0 ? 'A' : overallCGPA >= 2.0 ? 'B' : 'D';

  const riskStatus = (isAnyShortAttendance || overallCGPA < 2.0) ? "At Risk / Danger" 
                     : overallCGPA >= 3.0 ? "High Performer" : "Medium Performer";

  s.name = name;
  s.fatherName = father;
  s.department = department;
  s.semester = semester;
  s.sessionStart = start;
  s.sessionEnd = end;
  s.cgpa = overallCGPA;
  s.percentage = overallPercentage;
  s.overallGrade = overallGrade;
  s.riskStatus = riskStatus;
  s.totalUnpaidFine = totalUnpaidFine;
  s.subjects = subjects;

  if (s.semesterProgression && s.semesterProgression.length > 0) {
    s.semesterProgression[s.semesterProgression.length - 1].gpa = overallCGPA;
  }

  saveDatabase();
  computeDashboardMetrics();
  renderStudentDirectory();

  const deptModal = document.getElementById('dept-modal');
  if (deptModal && deptModal.classList.contains('active')) {
    openDepartmentStudents(department);
  }

  const detailSec = document.getElementById('section-detail');
  if (detailSec && detailSec.style.display !== 'none' && currentDetailStudentId === studentId) {
    openStudentDetail(studentId);
  }

  closeEditStudentModal();
  showToast(`Updated student "${name}" (${s.studentId}) successfully!`, 'success');
};

// ========================================================
// 8. FINES & REPORTS SPECIALIZED VIEWS
// ========================================================
function renderFinesPageView() {
  const container = document.getElementById('fines-ledger-tbody');
  if (!container) return;

  const finesList = [];
  studentsData.forEach(s => {
    (s.subjects || []).forEach((sub, subIdx) => {
      if (sub.unpaidFine > 0 || sub.paidFine > 0) {
        finesList.push({
          studentId: s.id,
          roll: s.studentId,
          name: s.name,
          dept: s.department,
          subject: sub.name,
          attend: sub.attendance,
          unpaid: sub.unpaidFine,
          paid: sub.paidFine,
          status: sub.fineStatus,
          subIdx
        });
      }
    });
  });

  const totalUnpaid = finesList.reduce((acc, curr) => acc + curr.unpaid, 0);
  const totalPaid = finesList.reduce((acc, curr) => acc + curr.paid, 0);

  const statUnpaid = document.getElementById('fines-stat-unpaid');
  const statPaid = document.getElementById('fines-stat-paid');
  const statCount = document.getElementById('fines-stat-count');

  if (statUnpaid) statUnpaid.innerText = `Rs. ${totalUnpaid.toLocaleString()}`;
  if (statPaid) statPaid.innerText = `Rs. ${totalPaid.toLocaleString()}`;
  if (statCount) statCount.innerText = `${finesList.length} Fines Registered`;

  container.innerHTML = finesList.map(f => `
    <tr>
      <td><strong>${f.roll}</strong></td>
      <td><strong>${f.name}</strong></td>
      <td>${f.dept}</td>
      <td>${f.subject}</td>
      <td><span style="color: ${f.attend < 75 ? '#ef4444' : '#10b981'}; font-weight: 700;">${f.attend}%</span></td>
      <td style="color: #ef4444; font-weight: 800;">Rs. ${f.unpaid}</td>
      <td style="color: #10b981; font-weight: 800;">Rs. ${f.paid}</td>
      <td>
        <span class="app-badge ${f.unpaid > 0 ? 'badge-danger' : 'badge-success'}">
          ${f.unpaid > 0 ? 'Pending' : 'Settled'}
        </span>
      </td>
      <td>
        ${f.unpaid > 0 ? `
          <button class="btn btn-success btn-sm" onclick="handlePayFine(${f.studentId}, ${f.subIdx})">
            Collect Rs. ${f.unpaid}
          </button>
        ` : `
          <span style="color: var(--text-muted); font-size: 0.75rem;">Paid &#10003;</span>
        `}
      </td>
    </tr>
  `).join('');
}

function renderReportsPageView() {
  const select = document.getElementById('report-student-select');
  if (!select) return;

  select.innerHTML = studentsData.slice(0, 50).map(s => `
    <option value="${s.id}">${s.studentId} - ${s.name} (${s.department})</option>
  `).join('');
}

window.generateSelectedStudentReport = function() {
  const select = document.getElementById('report-student-select');
  if (!select) return;

  const id = parseInt(select.value, 10);
  currentDetailStudentId = id;
  printStudentDMC();
};

function renderSettingsPageView() {
  // Update toggle checkboxes in settings page
  Object.keys(widgetVisibility).forEach(key => {
    const chk = document.getElementById(`toggle-widget-${key}`);
    if (chk) {
      chk.checked = widgetVisibility[key];
    }
  });
  if (typeof window.initSecuritySettingsForm === 'function') {
    window.initSecuritySettingsForm();
  }
}

// ========================================================
// GROUP 3: TEACHER & FACULTY MANAGEMENT
// ========================================================
let showArchivedTeachers = false;

window.renderTeachersPage = function() {
  const tbody = document.getElementById('teachers-table-tbody');
  if (!tbody || typeof window.TeacherRepository === 'undefined') return;

  const teachers = window.TeacherRepository.getAll(showArchivedTeachers);
  tbody.innerHTML = '';

  const statTotal = document.getElementById('stat-total-teachers');
  const statWorkloads = document.getElementById('stat-active-workloads');
  if (statTotal) statTotal.innerText = teachers.filter(t => !t.is_deleted).length;
  if (statWorkloads) statWorkloads.innerText = teachers.filter(t => !t.is_deleted).length * 2;

  if (teachers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--color-slate-400); padding: 30px;">No faculty records found.</td></tr>';
    return;
  }

  teachers.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${t.employee_no}</strong></td>
      <td><strong>${t.name}</strong></td>
      <td>${t.designation}</td>
      <td>${t.department}</td>
      <td>${t.email}</td>
      <td>${t.phone || '-'}</td>
      <td>${t.assigned_subjects || 'N/A'}</td>
      <td><span class="badge ${t.status === 'active' ? 'badge-success' : 'badge-danger'}">${t.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          ${t.is_deleted ? 
            `<button class="btn btn-outline btn-sm" onclick="handleRestoreTeacher(${t.id})">Restore</button>` : 
            `<button class="btn btn-outline btn-sm" onclick="openEditTeacherModal(${t.id})">Edit</button>
             <button class="btn btn-danger btn-sm" onclick="handleSoftDeleteTeacher(${t.id})">Archive</button>`
          }
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

window.toggleTeacherArchiveView = function() {
  showArchivedTeachers = !showArchivedTeachers;
  const btn = document.getElementById('btn-toggle-archived-teachers');
  const title = document.getElementById('teachers-table-title');
  if (btn) btn.innerText = showArchivedTeachers ? 'Show Active Faculty' : 'Show Archived Faculty';
  if (title) title.innerText = showArchivedTeachers ? 'Archived Faculty Roster' : 'Departmental Faculty Roster (data/teachers.csv)';
  renderTeachersPage();
};

window.openTeacherModal = function() {
  document.getElementById('teacher-id').value = '';
  document.getElementById('teacher-emp-no').value = `FAC-${101 + window.TeacherRepository.getAll(true).length}`;
  document.getElementById('teacher-name').value = '';
  document.getElementById('teacher-email').value = '';
  document.getElementById('teacher-phone').value = '';
  document.getElementById('teacher-subjects').value = '';
  document.getElementById('teacher-modal-title').innerText = 'Add Faculty Member';
  document.getElementById('teacher-modal').classList.add('active');
};

window.openEditTeacherModal = function(id) {
  const t = window.TeacherRepository.getById(id);
  if (!t) return;

  document.getElementById('teacher-id').value = t.id;
  document.getElementById('teacher-emp-no').value = t.employee_no;
  document.getElementById('teacher-name').value = t.name;
  document.getElementById('teacher-dept').value = t.department;
  document.getElementById('teacher-designation').value = t.designation;
  document.getElementById('teacher-email').value = t.email;
  document.getElementById('teacher-phone').value = t.phone || '';
  document.getElementById('teacher-subjects').value = t.assigned_subjects || '';
  document.getElementById('teacher-modal-title').innerText = 'Edit Faculty Record';
  document.getElementById('teacher-modal').classList.add('active');
};

window.closeTeacherModal = function() {
  const modal = document.getElementById('teacher-modal');
  if (modal) modal.classList.remove('active');
};

window.handleSaveTeacher = function(event) {
  event.preventDefault();
  const id = document.getElementById('teacher-id').value;
  const data = {
    employee_no: document.getElementById('teacher-emp-no').value.trim(),
    name: document.getElementById('teacher-name').value.trim(),
    department: document.getElementById('teacher-dept').value,
    designation: document.getElementById('teacher-designation').value,
    email: document.getElementById('teacher-email').value.trim(),
    phone: document.getElementById('teacher-phone').value.trim(),
    assigned_subjects: document.getElementById('teacher-subjects').value.trim()
  };

  if (id) {
    window.TeacherRepository.update(id, data);
    showToast(`Faculty record for ${data.name} updated successfully!`, 'success');
  } else {
    window.TeacherRepository.create(data);
    showToast(`New faculty member ${data.name} registered!`, 'success');
  }

  closeTeacherModal();
  renderTeachersPage();
};

window.handleSoftDeleteTeacher = function(id) {
  if (confirm('Are you sure you want to archive this faculty member? Record will be retained in history.')) {
    window.TeacherRepository.softDelete(id);
    showToast('Faculty member archived. Can be restored anytime from Archived view.', 'warning');
    renderTeachersPage();
  }
};

window.handleRestoreTeacher = function(id) {
  window.TeacherRepository.restore(id);
  showToast('Faculty member successfully restored to active roster!', 'success');
  renderTeachersPage();
};

window.exportTeachersToCSV = function() {
  const csv = window.TeacherRepository.toCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `GDC1_Faculty_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Faculty roster CSV exported successfully!', 'success');
};

// ========================================================
// GROUP 3: CLASS & SECTION MANAGEMENT
// ========================================================
window.renderClassesPage = function() {
  const tbody = document.getElementById('classes-table-tbody');
  if (!tbody || typeof window.ClassRepository === 'undefined') return;

  const classes = window.ClassRepository.getAll();
  tbody.innerHTML = '';

  const statTotal = document.getElementById('stat-total-classes');
  const statCap = document.getElementById('stat-total-capacity');
  if (statTotal) statTotal.innerText = classes.length;
  if (statCap) statCap.innerText = classes.reduce((sum, c) => sum + (parseInt(c.max_capacity) || 0), 0);

  if (classes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--color-slate-400); padding: 30px;">No class sections scheduled.</td></tr>';
    return;
  }

  classes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.class_name}</strong></td>
      <td>${c.department}</td>
      <td>${c.semester}</td>
      <td>${c.session || '2022-2026'}</td>
      <td><span class="badge badge-info">Sec ${c.section}</span></td>
      <td>${c.room_no || 'TBD'}</td>
      <td>${c.max_capacity} Seats</td>
      <td>${c.class_teacher || 'Assigned Staff'}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="openEditClassModal(${c.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="handleDeleteClass(${c.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

window.openClassModal = function() {
  document.getElementById('class-id').value = '';
  document.getElementById('class-name').value = '';
  document.getElementById('class-room').value = '';
  document.getElementById('class-teacher').value = '';
  document.getElementById('class-modal-title').innerText = 'Add Class Section';
  document.getElementById('class-modal').classList.add('active');
};

window.openEditClassModal = function(id) {
  const c = window.ClassRepository.getById(id);
  if (!c) return;

  document.getElementById('class-id').value = c.id;
  document.getElementById('class-name').value = c.class_name;
  document.getElementById('class-dept').value = c.department;
  document.getElementById('class-sem').value = c.semester;
  document.getElementById('class-session').value = c.session;
  document.getElementById('class-section').value = c.section;
  document.getElementById('class-room').value = c.room_no || '';
  document.getElementById('class-capacity').value = c.max_capacity;
  document.getElementById('class-teacher').value = c.class_teacher || '';
  document.getElementById('class-modal-title').innerText = 'Edit Class Section';
  document.getElementById('class-modal').classList.add('active');
};

window.closeClassModal = function() {
  const modal = document.getElementById('class-modal');
  if (modal) modal.classList.remove('active');
};

window.handleSaveClass = function(event) {
  event.preventDefault();
  const id = document.getElementById('class-id').value;
  const data = {
    class_name: document.getElementById('class-name').value.trim(),
    department: document.getElementById('class-dept').value,
    semester: document.getElementById('class-sem').value,
    session: document.getElementById('class-session').value.trim(),
    section: document.getElementById('class-section').value.trim(),
    room_no: document.getElementById('class-room').value.trim(),
    max_capacity: parseInt(document.getElementById('class-capacity').value, 10) || 45,
    class_teacher: document.getElementById('class-teacher').value.trim()
  };

  if (id) {
    window.ClassRepository.update(id, data);
    showToast(`Class section ${data.class_name} updated!`, 'success');
  } else {
    window.ClassRepository.create(data);
    showToast(`New class section ${data.class_name} created!`, 'success');
  }

  closeClassModal();
  renderClassesPage();
};

window.handleDeleteClass = function(id) {
  if (confirm('Delete this class section? Students currently allocated will need reassignment.')) {
    window.ClassRepository.delete(id);
    showToast('Class section deleted.', 'info');
    renderClassesPage();
  }
};

window.exportClassesToCSV = function() {
  const csv = window.ClassRepository.toCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `GDC1_Class_Sections_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Class schedules CSV exported!', 'success');
};

// ========================================================
// GROUP 3: SUBJECT & SYLLABUS MANAGEMENT
// ========================================================
window.renderSubjectsPage = function() {
  const tbody = document.getElementById('subjects-table-tbody');
  if (!tbody || typeof window.SubjectRepository === 'undefined') return;

  const subjects = window.SubjectRepository.getAll();
  tbody.innerHTML = '';

  if (subjects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--color-slate-400); padding: 30px;">No courses in syllabus.</td></tr>';
    return;
  }

  subjects.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.code}</strong></td>
      <td><strong>${s.name}</strong></td>
      <td>${s.department}</td>
      <td>${s.semester}</td>
      <td><span class="badge badge-primary">${s.credit_hours} CH</span></td>
      <td>${s.teacher_name || 'Department Faculty'}</td>
      <td>${s.max_sessional || 20} / ${s.max_mid || 30} / ${s.max_terminal || 50} (Total 100)</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="openEditSubjectModal(${s.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="handleDeleteSubject(${s.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

window.openSubjectModal = function() {
  document.getElementById('subject-id').value = '';
  document.getElementById('subject-code').value = '';
  document.getElementById('subject-name').value = '';
  document.getElementById('subject-teacher').value = '';
  document.getElementById('subject-modal-title').innerText = 'Add Course to Syllabus';
  document.getElementById('subject-modal').classList.add('active');
};

window.openEditSubjectModal = function(id) {
  const s = window.SubjectRepository.getById(id);
  if (!s) return;

  document.getElementById('subject-id').value = s.id;
  document.getElementById('subject-code').value = s.code;
  document.getElementById('subject-name').value = s.name;
  document.getElementById('subject-dept').value = s.department;
  document.getElementById('subject-sem').value = s.semester;
  document.getElementById('subject-credits').value = s.credit_hours;
  document.getElementById('subject-teacher').value = s.teacher_name || '';
  document.getElementById('subject-modal-title').innerText = 'Edit Course in Syllabus';
  document.getElementById('subject-modal').classList.add('active');
};

window.closeSubjectModal = function() {
  const modal = document.getElementById('subject-modal');
  if (modal) modal.classList.remove('active');
};

window.handleSaveSubject = function(event) {
  event.preventDefault();
  const id = document.getElementById('subject-id').value;
  const data = {
    code: document.getElementById('subject-code').value.trim(),
    name: document.getElementById('subject-name').value.trim(),
    department: document.getElementById('subject-dept').value,
    semester: document.getElementById('subject-sem').value,
    credit_hours: parseInt(document.getElementById('subject-credits').value, 10) || 4,
    teacher_name: document.getElementById('subject-teacher').value.trim()
  };

  if (id) {
    window.SubjectRepository.update(id, data);
    showToast(`Course ${data.code}: ${data.name} updated!`, 'success');
  } else {
    window.SubjectRepository.create(data);
    showToast(`Course ${data.code}: ${data.name} added to syllabus!`, 'success');
  }

  closeSubjectModal();
  renderSubjectsPage();
};

window.handleDeleteSubject = function(id) {
  if (confirm('Delete this course from curriculum?')) {
    window.SubjectRepository.delete(id);
    showToast('Course removed from syllabus.', 'info');
    renderSubjectsPage();
  }
};

window.exportSubjectsToCSV = function() {
  const csv = window.SubjectRepository.toCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `GDC1_Curriculum_Syllabus_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Curriculum syllabus CSV exported!', 'success');
};

// ========================================================
// GROUP 3: CSV IMPORT WIZARD & VALIDATION DIAGNOSTICS
// ========================================================
let pendingValidCSVRows = [];

window.openCSVImportModal = function() {
  pendingValidCSVRows = [];
  const modal = document.getElementById('csv-import-modal');
  if (modal) {
    document.getElementById('csv-wizard-file-input').value = '';
    document.getElementById('csv-wizard-diagnostics').style.display = 'none';
    document.getElementById('btn-confirm-csv-import').style.display = 'none';
    modal.classList.add('active');
  }
};

window.closeCSVImportModal = function() {
  const modal = document.getElementById('csv-import-modal');
  if (modal) modal.classList.remove('active');
};

window.handleCSVWizardFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const diag = window.StudentRepository.parseAndValidateCSV(text, studentsData);

    if (!diag.success) {
      showToast(diag.error, 'danger');
      return;
    }

    pendingValidCSVRows = diag.validRows;
    document.getElementById('csv-wizard-diagnostics').style.display = 'block';
    document.getElementById('diag-total-rows').innerText = diag.totalRows;
    document.getElementById('diag-valid-rows').innerText = diag.validRows.length;
    document.getElementById('diag-invalid-rows').innerText = diag.invalidRows.length;

    const errCont = document.getElementById('diag-error-log-container');
    const errList = document.getElementById('diag-error-list');
    errList.innerHTML = '';

    if (diag.invalidRows.length > 0) {
      errCont.style.display = 'block';
      diag.invalidRows.slice(0, 10).forEach(inv => {
        const li = document.createElement('li');
        li.innerText = `Line ${inv.line} (${inv.data.name || 'Unnamed'}): ${inv.errors.join('; ')}`;
        errList.appendChild(li);
      });
    } else {
      errCont.style.display = 'none';
    }

    const confirmBtn = document.getElementById('btn-confirm-csv-import');
    if (diag.validRows.length > 0) {
      confirmBtn.style.display = 'inline-block';
      confirmBtn.innerText = `Commit ${diag.validRows.length} Valid Records`;
    } else {
      confirmBtn.style.display = 'none';
    }
  };
  reader.readAsText(file);
};

window.confirmCSVImport = function() {
  if (pendingValidCSVRows.length === 0) return;

  let addedCount = 0;
  pendingValidCSVRows.forEach(row => {
    const newId = studentsData.length > 0 ? Math.max(...studentsData.map(st => st.id)) + 1 : 1;
    const studentRecord = {
      id: newId,
      studentId: row.studentId,
      name: row.name,
      fatherName: row.fatherName,
      department: row.department,
      sessionStart: row.sessionStart,
      sessionEnd: row.sessionEnd,
      semester: row.semester,
      cgpa: row.cgpa,
      percentage: parseFloat((row.cgpa * 22.5).toFixed(1)),
      overallGrade: row.cgpa >= 3.7 ? "A" : row.cgpa >= 3.0 ? "B" : row.cgpa >= 2.0 ? "C" : "D",
      riskStatus: (row.attendance < 75 || row.cgpa < 2.0) ? "At Risk" : row.cgpa >= 3.7 ? "Excellent" : "Safe",
      totalUnpaidFine: row.attendance < 75 ? 1000 : 0,
      totalPaidFine: 0,
      semesterProgression: [
        { semester: "Semester 1", gpa: row.cgpa },
        { semester: "Semester 2", gpa: row.cgpa },
        { semester: "Semester 3", gpa: row.cgpa },
        { semester: "Semester 4", gpa: row.cgpa }
      ],
      subjects: [
        {
          name: `Core Course (${row.department})`,
          teacher: "Assigned Faculty",
          sessional: 5.0,
          mid: 15.0,
          terminal: 30.0,
          total: 50.0,
          gpa: row.cgpa,
          grade: row.cgpa >= 3.7 ? "A" : "B",
          attendance: row.attendance,
          fineStatus: row.attendance < 75 ? "Danger" : "Safe",
          unpaidFine: row.attendance < 75 ? 1000 : 0,
          paidFine: 0
        }
      ]
    };
    studentsData.push(studentRecord);
    addedCount++;
  });

  saveDatabase();
  computeDashboardMetrics();
  renderStudentDirectory();
  closeCSVImportModal();
  showToast(`Successfully imported ${addedCount} student records from CSV!`, 'success');
};

// ========================================================
// 9. CSV EXPORT & IMPORT ENGINE
// ========================================================
window.exportDataToCSV = function() {
  let csvContent = "Student ID,Student Name,Father Name,Department,Session,Semester,Subject Name,Teacher Name,Sessional (6),Mid (18),Terminal (36),Total (60),Subject GPA,Grade,Attendance %,Fine Status,Unpaid Fine,Paid Fine,Overall CGPA\n";

  studentsData.forEach(s => {
    (s.subjects || []).forEach(sub => {
      csvContent += `"${s.studentId}","${s.name}","${s.fatherName}","${s.department}","${s.sessionStart}-${s.sessionEnd}","${s.semester}","${sub.name}","${sub.teacher}",${sub.sessional},${sub.mid},${sub.terminal},${sub.total},${sub.gpa},"${sub.grade}",${sub.attendance},"${sub.fineStatus}",${sub.unpaidFine},${sub.paidFine},${s.cgpa}\n`;
    });
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `student_performance_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("CSV data exported successfully!", "success");
};

window.handleCSVImport = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      showToast('CSV file appears to be empty.', 'danger');
      return;
    }

    const studentMap = {};
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 15) continue;

      const [sId, sName, sFather, sDept, sSession, sSem, subName, subTeacher, sSess, sMid, sTerm, sTotal, subGpa, subGrade, sAttend, sFineStatus, sUnpaid, sPaid, sCgpa] = parts;

      if (!studentMap[sId]) {
        const sessionParts = sSession.split('-');
        studentMap[sId] = {
          id: Object.keys(studentMap).length + 1,
          studentId: sId,
          name: sName,
          fatherName: sFather,
          department: sDept,
          sessionStart: parseInt(sessionParts[0], 10) || 2022,
          sessionEnd: parseInt(sessionParts[1], 10) || 2026,
          semester: sSem,
          cgpa: parseFloat(sCgpa) || 3.0,
          percentage: 80.0,
          overallGrade: 'B',
          riskStatus: 'Safe',
          totalUnpaidFine: 0,
          totalPaidFine: 0,
          semesterProgression: [{ semester: sSem, gpa: parseFloat(sCgpa) || 3.0 }],
          subjects: []
        };
      }

      const unpaid = parseFloat(sUnpaid) || 0;
      const paid = parseFloat(sPaid) || 0;
      studentMap[sId].totalUnpaidFine += unpaid;
      studentMap[sId].totalPaidFine += paid;
      if (unpaid > 0) studentMap[sId].riskStatus = "At Risk / Danger";

      studentMap[sId].subjects.push({
        name: subName,
        teacher: subTeacher,
        sessional: parseFloat(sSess) || 0,
        mid: parseFloat(sMid) || 0,
        terminal: parseFloat(sTerm) || 0,
        total: parseFloat(sTotal) || 0,
        gpa: parseFloat(subGpa) || 0,
        grade: subGrade,
        attendance: parseFloat(sAttend) || 80,
        fineStatus: sFineStatus,
        unpaidFine: unpaid,
        paidFine: paid
      });
    }

    const importedList = Object.values(studentMap);
    if (importedList.length > 0) {
      studentsData = importedList;
      saveDatabase();
      computeDashboardMetrics();
      renderStudentDirectory();
      showToast(`Imported ${importedList.length} student records from CSV.`, 'success');
    }
  };
  reader.readAsText(file);
};

// ========================================================
// 10. PRINT OFFICIAL DMC (Detailed Marks Certificate)
// ========================================================
window.printStudentDMC = function() {
  const s = studentsData.find(st => st.id === currentDetailStudentId);
  if (!s) return;

  const target = document.getElementById('dmc-sheet-target');
  target.innerHTML = `
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 18px;">
      <h2 style="font-size: 16pt; margin: 0; text-transform: uppercase; font-family: serif; letter-spacing: 0.5px;">GOVERNMENT DEGREE COLLEGE NO. 1, DERA ISMAIL KHAN</h2>
      <p style="margin: 3px 0; font-size: 10pt; font-style: italic;">Affiliated with Gomal University, Dera Ismail Khan (Khyber Pakhtunkhwa)</p>
      <h3 style="margin: 8px 0 0 0; font-size: 13pt; text-decoration: underline;">OFFICIAL DETAILED MARKS CERTIFICATE (DMC)</h3>
      <p style="margin: 2px 0 0 0; font-size: 9pt; font-weight: bold;">Bachelor of Science in ${s.department} (4-Year Degree Program)</p>
    </div>

    <table style="width: 100%; margin-bottom: 15px; font-size: 10pt; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px 0;"><strong>Student Name:</strong> ${s.name}</td>
        <td style="padding: 4px 0;"><strong>Roll No:</strong> ${s.studentId}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;"><strong>Father's Name:</strong> ${s.fatherName}</td>
        <td style="padding: 4px 0;"><strong>Registration No:</strong> 2022-GDC-DIK-${s.id < 10 ? '0' + s.id : s.id}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;"><strong>Academic Session:</strong> ${s.sessionStart} - ${s.sessionEnd}</td>
        <td style="padding: 4px 0;"><strong>Examination Term:</strong> ${s.semester} (Fall/Spring)</td>
      </tr>
    </table>

    <table style="width: 100%; border: 1px solid #444; border-collapse: collapse; font-size: 9pt; margin-top: 10px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="border: 1px solid #444; padding: 6px; text-align: left;">Course Title</th>
          <th style="border: 1px solid #444; padding: 6px; text-align: left;">Instructor</th>
          <th style="border: 1px solid #444; padding: 6px; text-align: center;">Sess (6)</th>
          <th style="border: 1px solid #444; padding: 6px; text-align: center;">Mid (18)</th>
          <th style="border: 1px solid #444; padding: 6px; text-align: center;">Term (36)</th>
          <th style="border: 1px solid #444; padding: 6px; text-align: center;">Total (60)</th>
          <th style="border: 1px solid #444; padding: 6px; text-align: center;">GPA</th>
          <th style="border: 1px solid #444; padding: 6px; text-align: center;">Grade</th>
        </tr>
      </thead>
      <tbody>
        ${(s.subjects || []).map(sub => `
          <tr>
            <td style="border: 1px solid #444; padding: 6px;">${sub.name}</td>
            <td style="border: 1px solid #444; padding: 6px;">${sub.teacher}</td>
            <td style="border: 1px solid #444; padding: 6px; text-align: center;">${sub.sessional.toFixed(1)}</td>
            <td style="border: 1px solid #444; padding: 6px; text-align: center;">${sub.mid.toFixed(1)}</td>
            <td style="border: 1px solid #444; padding: 6px; text-align: center;">${sub.terminal.toFixed(1)}</td>
            <td style="border: 1px solid #444; padding: 6px; text-align: center;"><strong>${sub.total.toFixed(1)}</strong></td>
            <td style="border: 1px solid #444; padding: 6px; text-align: center;">${sub.gpa.toFixed(1)}</td>
            <td style="border: 1px solid #444; padding: 6px; text-align: center;"><strong>${sub.grade}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <table style="width: 100%; border: 1px solid #444; border-collapse: collapse; margin-top: 15px; font-size: 10pt;">
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #444; text-align: center;">Cumulative CGPA: <strong style="font-size: 11pt;">${s.cgpa.toFixed(2)}</strong></td>
        <td style="padding: 8px; border: 1px solid #444; text-align: center;">Overall Percentage: <strong>${s.percentage.toFixed(1)}%</strong></td>
        <td style="padding: 8px; border: 1px solid #444; text-align: center;">Final Grade: <strong>${s.overallGrade}</strong></td>
        <td style="padding: 8px; border: 1px solid #444; text-align: center;">Standing: <strong style="color: #10b981;">PASSED</strong></td>
      </tr>
    </table>

    <div style="margin-top: 40px; display: flex; justify-content: space-between; padding: 0 20px;">
      <div style="text-align: center; border-top: 1px solid #000; width: 160px; padding-top: 4px; font-size: 9pt;">Prepared by Tabulator</div>
      <div style="text-align: center; border-top: 1px solid #000; width: 160px; padding-top: 4px; font-size: 9pt;">Head of Department</div>
      <div style="text-align: center; border-top: 1px solid #000; width: 160px; padding-top: 4px; font-size: 9pt;">Controller of Examinations</div>
    </div>
  `;

  document.getElementById('dmc-print-modal').style.display = 'block';
};

window.closeDMCModal = function() {
  document.getElementById('dmc-print-modal').style.display = 'none';
};

// Reset database to official thesis baseline (100 students, Figure 8.1 values)
window.resetDatabaseToDefaults = function() {
  if (confirm("Reset database to official Thesis Seed data (100 students, Figure 8.1)?\n\nThis will restore all metrics (Rs. 189,000 fine, 40 at-risk, 79.4% attendance) exactly as presented in Chapter 8.")) {
    studentsData = getSeedStudents();
    saveDatabase();
    computeDashboardMetrics();
    renderStudentDirectory();
    showToast("Database successfully reset to official thesis baseline (Figure 8.1)!", "success");
    switchPage('dashboard');
  }
};

// Keyboard Hotkey (Ctrl + K) for Quick Search
window.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
});

// Function Compatibility Aliases for HTML Handlers
window.applyDashboardFilters = window.handleDashboardFilterChange;
window.exportDatabaseAsCsv = window.exportDataToCSV;
window.importDatabaseFromCsv = window.handleCSVImport;
window.filterStudentsByDirectory = window.handleStudentSearch;
window.handleGlobalSearch = window.handleStudentSearch;
window.clearDirectorySearch = window.clearSearch;
window.openAddStudentSection = () => window.switchSection('add');
window.backToDirectory = () => window.switchSection('students');
window.handleNewStudentSubmit = window.handleSaveStudent;
window.addSubjectEntryRow = window.addSubjectRow;
window.closeEditModal = window.closeEditStudentModal;
window.handleEditStudentSubmit = window.handleUpdateStudentSubmit;
window.launchSelectedStudentDmc = window.generateSelectedStudentReport;
window.printDmcSheet = window.printStudentDMC;
window.closeDmcModal = window.closeDMCModal;
window.viewStudentDetail = window.openStudentDetail;
window.payFine = window.handlePayFine;

// ========================================================
// APP STARTUP
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  initSidebarState();
  const theme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  applyTheme(theme);

  computeDashboardMetrics();
  renderStudentDirectory();
  updateBreadcrumbs('dashboard');

  if (typeof window.renderAttendanceTrendMonthlyChart === 'function') {
    window.renderAttendanceTrendMonthlyChart('all');
  }
  if (typeof window.renderGenderComparisonChart === 'function') {
    window.renderGenderComparisonChart();
  }

  if (typeof window.initAuth === 'function') {
    window.initAuth();
  }
});

/* =========================================================
   ROLE SWITCHER DROPDOWN (Topbar)
   ========================================================= */
function toggleRoleSwitcher() {
  var menu = document.getElementById('role-switcher-menu');
  if (!menu) return;
  if (menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
    // Close on outside click
    setTimeout(function() {
      document.addEventListener('click', closeRoleSwitcherOutside, { once: true });
    }, 10);
  } else {
    menu.style.display = 'none';
  }
}

function closeRoleSwitcherOutside(e) {
  var dropdown = document.getElementById('role-switcher-dropdown');
  var menu = document.getElementById('role-switcher-menu');
  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.style.display = 'none';
  } else if (menu && menu.style.display === 'block') {
    // Re-attach if click was inside dropdown but not on a role option
    setTimeout(function() {
      document.addEventListener('click', closeRoleSwitcherOutside, { once: true });
    }, 10);
  }
}

function switchToRole(role) {
  // Close the dropdown
  var menu = document.getElementById('role-switcher-menu');
  if (menu) menu.style.display = 'none';

  var roleLabels = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };
  var roleColors = { admin: '#3b82f6', teacher: '#10b981', student: '#f59e0b' };
  var roleName = roleLabels[role] || 'Admin';
  var roleColor = roleColors[role] || '#3b82f6';

  // Update the user profile pill in the topbar
  var namePill = document.querySelector('.user-profile-name');
  var badgePill = document.querySelector('.user-profile-badge');
  var avatarPill = document.querySelector('.user-avatar-sm');

  if (role === 'admin') {
    if (namePill) namePill.textContent = 'Imran (CS-2210)';
    if (badgePill) badgePill.textContent = 'Admin & Scholar';
    if (avatarPill) { avatarPill.textContent = 'IM'; avatarPill.style.background = 'linear-gradient(135deg,#3b82f6,#1d4ed8)'; }
  } else if (role === 'teacher') {
    if (namePill) namePill.textContent = 'Prof. Abdur Rehman';
    if (badgePill) badgePill.textContent = 'Teacher';
    if (avatarPill) { avatarPill.textContent = 'AR'; avatarPill.style.background = 'linear-gradient(135deg,#10b981,#059669)'; }
  } else if (role === 'student') {
    if (namePill) namePill.textContent = 'Ali Raza (CS-2201)';
    if (badgePill) badgePill.textContent = 'Student';
    if (avatarPill) { avatarPill.textContent = 'AR'; avatarPill.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)'; }
  }

  // Store role in localStorage
  localStorage.setItem('current_user_role', role);

  // Use quickFillDemo if auth is available to set credentials, then auto-login
  if (role === 'admin' && typeof quickFillDemo === 'function') {
    quickFillDemo('admin');
  } else if (role === 'teacher' && typeof quickFillDemo === 'function') {
    quickFillDemo('teacher');
  } else if (role === 'student' && typeof quickFillDemo === 'function') {
    quickFillDemo('student_ali');
  }

  // Show toast notification
  if (typeof showToast === 'function') {
    showToast('Switched to ' + roleName + ' role', 'success');
  }

  // Navigate to dashboard
  if (typeof switchPage === 'function') {
    switchPage('dashboard');
  }
}

// Expose globally
window.toggleRoleSwitcher = toggleRoleSwitcher;
window.switchToRole = switchToRole;
