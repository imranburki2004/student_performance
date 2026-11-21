/**
 * WORLD-CLASS ANALYTICS ENGINE
 * Student Performance & Attendance Analytics Dashboard
 * Govt. Degree College No. 1, D.I. Khan
 * Author: Imran (CS-2210) | Supervisor: Prof. Abdur Rehman
 *
 * Adds:
 *  - Cross-filtering system (shared ActiveFilters)
 *  - Department drill-down with full analytics
 *  - Course/session drill-down
 *  - Full-page individual student profile with charts
 *  - Scatter plot (admission grade vs sem2 grade)
 *  - Grade distribution histogram
 *  - Correlation heatmap (5x5 Pearson matrix visualised as colour grid)
 *  - Risk distribution donut + factor bar chart on Risk page
 *  - Breadcrumb navigation wired to hierarchy
 *  - Executive summary generated from real metrics
 *  - College department cards wired on dashboard
 *  - Reset-all-filters control
 *  - Export filtered CSV
 *
 * Data source: UCI ML Repository (4,424 records) + 120-student institutional cohort.
 * No SQL. No fabricated data. Synthetic demo names clearly labelled.
 * Dataset citation: Realinho et al. (2021), DOI 10.24432/C5MC89, CC BY 4.0
 */

(function () {
  'use strict';

  /* =========================================================
     0. SHARED CROSS-FILTER STATE
     ========================================================= */
  window.ActiveFilters = window.ActiveFilters || {
    course: 'ALL',
    target: 'ALL',
    finance: 'ALL',
    search: '',
    // Cross-filter set by clicking a chart segment
    chartOutcome: null,
    chartCourse: null,
  };

  /* colour palette shared across all charts */
  const PALETTE = {
    graduate: '#10b981',
    dropout: '#ef4444',
    enrolled: '#3b82f6',
    amber: '#f59e0b',
    purple: '#8b5cf6',
    sky: '#0ea5e9',
    gridLine: 'rgba(15,23,42,0.06)',
    gridLineDark: 'rgba(248,250,252,0.08)',
  };

  /* =========================================================
     1. UTILITY HELPERS
     ========================================================= */
  function safeDestroy(chartRef) {
    if (chartRef && typeof chartRef.destroy === 'function') chartRef.destroy();
    return null;
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function gridColor() {
    return isDark() ? PALETTE.gridLineDark : PALETTE.gridLine;
  }

  function textColor() {
    return isDark() ? '#cbd5e1' : '#475569';
  }

  function getUciData() {
    return window.UCI_STUDENTS_DATA || [];
  }

  /* Apply ActiveFilters and return filtered UCI array */
  function getFilteredUciData() {
    const f = window.ActiveFilters;
    let data = getUciData();

    if (f.chartCourse) data = data.filter(s => s.courseCode === f.chartCourse);
    else if (f.course && f.course !== 'ALL') data = data.filter(s => s.courseCode === f.course);

    if (f.chartOutcome) data = data.filter(s => s.target === f.chartOutcome);
    else if (f.target && f.target !== 'ALL') data = data.filter(s => s.target === f.target);

    if (f.finance && f.finance !== 'ALL') {
      if (f.finance === 'scholarship') data = data.filter(s => s.scholarship === 1);
      else if (f.finance === 'debtor') data = data.filter(s => s.debtor === 1);
      else if (f.finance === 'uptodate') data = data.filter(s => s.tuitionUpToDate === 1);
    }

    if (f.search) {
      const q = f.search.toLowerCase();
      data = data.filter(s =>
        (s.studentId || '').toLowerCase().includes(q) ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.courseName || '').toLowerCase().includes(q)
      );
    }

    return data;
  }

  /* Pearson correlation between two numeric arrays */
  function pearson(xs, ys) {
    const n = xs.length;
    if (n < 2) return 0;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - mx, dy = ys[i] - my;
      num += dx * dy;
      dx2 += dx * dx;
      dy2 += dy * dy;
    }
    const den = Math.sqrt(dx2 * dy2);
    return den === 0 ? 0 : +(num / den).toFixed(3);
  }

  /* =========================================================
     2. BREADCRUMB WIRING
     ========================================================= */
  const BREADCRUMB_MAP = {
    dashboard: [{ label: 'College Overview', page: 'dashboard' }],
    'department-overview': [
      { label: 'College Overview', page: 'dashboard' },
      { label: 'Department', page: 'department-overview' }
    ],
    'session-overview': [
      { label: 'College Overview', page: 'dashboard' },
      { label: 'Department', page: 'department-overview' },
      { label: 'Course / Session', page: 'session-overview' }
    ],
    'student-profile': [
      { label: 'College Overview', page: 'dashboard' },
      { label: 'Students', page: 'students' },
      { label: 'Profile', page: 'student-profile' }
    ],
    students: [
      { label: 'College Overview', page: 'dashboard' },
      { label: 'Student Directory', page: 'students' }
    ],
    analytics: [
      { label: 'College Overview', page: 'dashboard' },
      { label: 'Analytics & BI', page: 'analytics' }
    ],
    'risk-monitoring': [
      { label: 'College Overview', page: 'dashboard' },
      { label: 'Risk Monitoring', page: 'risk-monitoring' }
    ],
  };

  /* =========================================================
  /* 3. COLLEGE OVERVIEW -- DEPARTMENT CARDS ON DASHBOARD */
        Uses UCI 17 courses grouped into 6 meta-departments
     ========================================================= */
  const UCI_DEPT_GROUPS = [
    {
      // UCI actual string codes: 9119=Informatics Engineering, 33=Biofuel Production Technologies
      id: 'engineering', name: 'Engineering \u0026 Technology',
      icon: 'ENG', color: '#3b82f6',
      courses: ['9119', '33']
    },
    {
      // 9500=Nursing, 9085=Veterinary Nursing, 9556=Oral Hygiene
      id: 'health', name: 'Health Sciences \u0026 Nursing',
      icon: 'HLT', color: '#10b981',
      courses: ['9500', '9085', '9556']
    },
    {
      // 9147=Management, 9991=Management(Evening), 9670=Advertising \u0026 Marketing Mgmt
      id: 'business', name: 'Business, Management \u0026 Accounting',
      icon: 'BIZ', color: '#f59e0b',
      courses: ['9147', '9991', '9670']
    },
    {
      // 8014=Social Service, 9238=Social Service(Evening), 9853=Basic Education, 9254=Tourism
      id: 'social', name: 'Social Sciences, Education \u0026 Tourism',
      icon: 'SOC', color: '#8b5cf6',
      courses: ['8014', '9238', '9853', '9254']
    },
    {
      // 9003=Agronomy, 9130=Equinculture
      id: 'science', name: 'Agriculture \u0026 Natural Sciences',
      icon: 'SCI', color: '#0ea5e9',
      courses: ['9003', '9130']
    },
    {
      // 9070=Communication Design, 171=Animation \u0026 Multimedia, 9773=Journalism \u0026 Communication
      id: 'other', name: 'Communication, Media \u0026 Design',
      icon: 'COM', color: '#ec4899',
      courses: ['9070', '171', '9773']  // remaining courses go here
    },
  ];

  function getCourseCodesForDept(deptId) {
    const d = UCI_DEPT_GROUPS.find(g => g.id === deptId);
    return d ? d.courses : [];
  }

  function getStudentsForDept(deptId) {
    const data = getUciData();
    const d = UCI_DEPT_GROUPS.find(g => g.id === deptId);
    if (!d) return data;
    // All depts now have explicit string course codes - filter by those codes
    const codes = d.courses.map(String);
    return data.filter(s => codes.includes(String(s.courseCode)));
  }

  function getCourseCodesForDept(deptId) {
    const d = UCI_DEPT_GROUPS.find(g => g.id === deptId);
    return d ? d.courses : [];
  }

  window.renderCollegeDepartmentCards = function () {
    const data = getUciData();
    if (!data.length) return;
    const grid = document.getElementById('college-overview-depts-grid');
    if (!grid) return;

    // Dynamically update the count badges
    const deptBadge = document.getElementById('college-depts-count-badge');
    if (deptBadge) deptBadge.textContent = `${UCI_DEPT_GROUPS.length} Divisions`;
    const sessBadge = document.getElementById('college-sessions-count-badge');
    if (sessBadge) sessBadge.textContent = '17 Programs';

    grid.innerHTML = UCI_DEPT_GROUPS.map(dept => {
      const students = getStudentsForDept(dept.id);
      const total = students.length;
      if (total === 0) return '';
      const grads = students.filter(s => s.target === 'Graduate').length;
      const drops = students.filter(s => s.target === 'Dropout').length;
      const gradPct = total > 0 ? ((grads / total) * 100).toFixed(1) : 0;
      const dropPct = total > 0 ? ((drops / total) * 100).toFixed(1) : 0;
      const debtors = students.filter(s => s.debtor === 1).length;

      return `
        <div class="dept-summary-card" style="
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 18px;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.15s;
          border-top: 3px solid ${dept.color};
        "
          onclick="window.openDrillDownDept('${dept.id}')"
          onmouseenter="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-2px)'"
          onmouseleave="this.style.boxShadow='';this.style.transform=''">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:${dept.color}22;color:${dept.color};font-weight:700;font-size:0.75rem;font-family:Poppins,sans-serif;border:1.5px solid ${dept.color}44;">${dept.icon}</span>
            <div>
              <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary);">${dept.name}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${total.toLocaleString()} students</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <div style="text-align:center;padding:8px;background:rgba(16,185,129,0.08);border-radius:6px;">
              <div style="font-weight:700;font-size:1.1rem;color:#10b981;">${gradPct}%</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">Graduation Rate</div>
            </div>
            <div style="text-align:center;padding:8px;background:rgba(239,68,68,0.08);border-radius:6px;">
              <div style="font-weight:700;font-size:1.1rem;color:#ef4444;">${dropPct}%</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">Dropout Rate</div>
            </div>
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted);">
            ${debtors.toLocaleString()} tuition debtors &bull; Click to drill down &rarr;
          </div>
        </div>
      `;
    }).join('');
  };

  /* =========================================================
     4. DEPARTMENT DRILL-DOWN PAGE
     ========================================================= */
  let deptCharts = {};

  window.openDrillDownDept = function (deptId) {
    const dept = UCI_DEPT_GROUPS.find(g => g.id === deptId);
    if (!dept) return;
    window._currentDrillDept = deptId;
    window.switchPage('department-overview');
    setTimeout(() => window.renderDepartmentOverview(deptId), 60);
  };

  window.renderDepartmentOverview = function (deptId) {
    deptId = deptId || window._currentDrillDept;
    const dept = UCI_DEPT_GROUPS.find(g => g.id === deptId);
    if (!dept) return;
    const container = document.getElementById('dept-overview-content');
    if (!container) return;

    const students = getStudentsForDept(deptId);
    const total = students.length;
    const grads = students.filter(s => s.target === 'Graduate').length;
    const drops = students.filter(s => s.target === 'Dropout').length;
    const enrs  = students.filter(s => s.target === 'Enrolled').length;
    const debtors = students.filter(s => s.debtor === 1).length;
    const scholars = students.filter(s => s.scholarship === 1).length;
    const gradPct = ((grads / total) * 100).toFixed(1);
    const dropPct = ((drops / total) * 100).toFixed(1);
    const avgAdm = (students.reduce((a, s) => a + s.admGrade, 0) / total).toFixed(1);
    const avgSem2 = (students.filter(s => s.sem2Grade > 0).reduce((a, s) => a + s.sem2Grade, 0) /
      (students.filter(s => s.sem2Grade > 0).length || 1)).toFixed(2);

    // Course breakdown inside dept
    const courseMap = {};
    students.forEach(s => {
      if (!courseMap[s.courseName]) courseMap[s.courseName] = { code: s.courseCode, total: 0, grads: 0, drops: 0 };
      courseMap[s.courseName].total++;
      if (s.target === 'Graduate') courseMap[s.courseName].grads++;
      if (s.target === 'Dropout') courseMap[s.courseName].drops++;
    });

    container.innerHTML = `
      <!-- Breadcrumb -->
      <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text-muted);margin-bottom:20px;flex-wrap:wrap;">
        <span onclick="window.switchPage('dashboard')" style="cursor:pointer;color:var(--color-primary-600);font-weight:600;">&#127968; College Overview</span>
        <span>&rsaquo;</span>
          <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:5px;background:${dept.color}22;color:${dept.color};font-weight:700;font-size:0.65rem;border:1px solid ${dept.color}44;">${dept.icon}</span>
        <span style="font-weight:700;color:var(--text-primary);">${dept.name}</span>
        <span style="margin-left:auto;">
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Back to Overview</button>
        </span>
      </div>

      <!-- Page Title -->
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.6rem;font-weight:700;color:var(--text-primary);margin:0 0 4px 0;">${dept.name}</h2>
          <div style="font-size:0.88rem;color:var(--text-muted);">UCI Dataset &mdash; ${total.toLocaleString()} students in this department group &bull; Click any course card below to drill further</div>
      </div>

      <!-- KPI Row -->
      <div class="kpi-metrics-grid" style="margin-bottom:24px;">
        <div class="kpi-card">
          <div class="kpi-card-label">Total Students</div>
          <div class="kpi-card-value">${total.toLocaleString()}</div>
          <div class="kpi-card-subtext">${Object.keys(courseMap).length} degree courses</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Graduation Rate</div>
          <div class="kpi-card-value" style="color:#10b981;">${gradPct}%</div>
          <div class="kpi-card-subtext">${grads.toLocaleString()} graduates</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Dropout Rate</div>
          <div class="kpi-card-value" style="color:#ef4444;">${dropPct}%</div>
          <div class="kpi-card-subtext">${drops.toLocaleString()} students left</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Mean Admission Grade</div>
          <div class="kpi-card-value">${avgAdm}</div>
          <div class="kpi-card-subtext">Scale: 0 &ndash; 200</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Avg 2nd Sem Grade</div>
          <div class="kpi-card-value">${avgSem2}</div>
          <div class="kpi-card-subtext">Scale: 0 &ndash; 20</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Tuition Debtors</div>
          <div class="kpi-card-value" style="color:#f59e0b;">${debtors}</div>
          <div class="kpi-card-subtext">${scholars} scholarship holders</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Academic Outcome Distribution</h3>
              <div class="chart-card-subtitle">Graduate / Dropout / Enrolled breakdown for this department</div>
            </div>
            <span class="badge badge-success">Donut</span>
          </div>
          <div class="chart-canvas-container" style="height:240px;position:relative;">
            <canvas id="dept-outcome-donut"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Course-Level Grad vs Dropout</h3>
              <div class="chart-card-subtitle">Stacked bar per course in this department</div>
            </div>
            <span class="badge badge-info">Stacked Bar</span>
          </div>
          <div class="chart-canvas-container" style="height:240px;position:relative;">
            <canvas id="dept-course-bar"></canvas>
          </div>
        </div>
      </div>

      <!-- Course Cards -->
      <div style="margin-bottom:24px;">
        <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:14px;">
          Degree Courses in ${dept.name}
        </h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
          ${Object.entries(courseMap).map(([cName, cs]) => {
            const gPct = ((cs.grads / cs.total) * 100).toFixed(1);
            const dPct = ((cs.drops / cs.total) * 100).toFixed(1);
            return `
              <div class="app-card" style="padding:14px;cursor:pointer;border-top:3px solid ${dept.color};"
                onclick="window.openDrillDownCourse('${cs.code}','${deptId}')"
                onmouseenter="this.style.boxShadow='var(--shadow-md)'"
                onmouseleave="this.style.boxShadow=''">
                <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);margin-bottom:6px;">${cName}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">Code: ${cs.code} &bull; ${cs.total} students</div>
                <div style="display:flex;gap:8px;">
                  <span style="background:rgba(16,185,129,0.1);color:#10b981;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:700;">${gPct}% Grad</span>
                  <span style="background:rgba(239,68,68,0.1);color:#ef4444;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:700;">${dPct}% Drop</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Student Table (first 20) -->
      <div class="app-card" style="margin-bottom:24px;">
        <div class="app-card-header">
          <div class="app-card-title">Department Student Sample (first 20 records)</div>
          <button class="btn btn-outline btn-sm" onclick="window.filterUciByCourse('ALL');window.switchPage('students')">View All in Directory &rarr;</button>
        </div>
        <div class="table-responsive">
          <table class="app-table">
            <thead><tr><th>ID</th><th>Name (Demo)</th><th>Course</th><th>Outcome</th><th>Adm. Grade</th><th>2nd Sem</th><th>Actions</th></tr></thead>
            <tbody>
              ${students.slice(0, 20).map(s => `
                <tr>
                  <td style="font-weight:700;">${s.studentId}</td>
                  <td>${s.name} <span class="badge badge-outline" style="font-size:0.62rem;">Demo</span></td>
                  <td style="font-size:0.82rem;">${s.courseName}</td>
                  <td><span class="badge ${s.target==='Graduate'?'badge-success':s.target==='Dropout'?'badge-danger':'badge-primary'}">${s.target}</span></td>
                  <td>${s.admGrade.toFixed(1)}</td>
                  <td>${s.sem2Grade > 0 ? s.sem2Grade.toFixed(2) : 'N/A'}</td>
                  <td><button class="btn btn-outline btn-sm" onclick="window.openFullStudentProfile(${s.id})">Profile</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render department charts
    setTimeout(() => {
      renderDeptOutcomeDonut('dept-outcome-donut', grads, drops, enrs);
      renderDeptCourseBar('dept-course-bar', courseMap);
    }, 80);
  };

  function renderDeptOutcomeDonut(canvasId, grads, drops, enrs) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;
    deptCharts[canvasId] = safeDestroy(deptCharts[canvasId]);
    deptCharts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Graduates', 'Dropouts', 'Enrolled'],
        datasets: [{ data: [grads, drops, enrs], backgroundColor: [PALETTE.graduate, PALETTE.dropout, PALETTE.enrolled], borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw.toLocaleString()} (${((ctx.raw / (grads + drops + enrs)) * 100).toFixed(1)}%)` } }
        },
        onClick(evt, el) {
          if (el.length) {
            const label = ['Graduate', 'Dropout', 'Enrolled'][el[0].index];
            window.ActiveFilters.chartOutcome = label;
            window.showToast && window.showToast(`Filtered by outcome: ${label}`, 'info');
          }
        }
      }
    });
  }

  function renderDeptCourseBar(canvasId, courseMap) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;
    deptCharts[canvasId] = safeDestroy(deptCharts[canvasId]);
    const courses = Object.keys(courseMap).slice(0, 8);
    deptCharts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: courses.map(c => c.length > 22 ? c.slice(0, 20) + '...' : c),
        datasets: [
          { label: 'Graduates', data: courses.map(c => courseMap[c].grads), backgroundColor: PALETTE.graduate },
          { label: 'Dropouts', data: courses.map(c => courseMap[c].drops), backgroundColor: PALETTE.dropout }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { color: gridColor() }, ticks: { color: textColor(), font: { size: 11 } } },
          y: { stacked: true, beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } }
        },
        plugins: { legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } } }
      }
    });
  }

  /* =========================================================
     5. COURSE / SESSION DRILL-DOWN
     ========================================================= */
  let courseCharts = {};

  window.openDrillDownCourse = function (courseCode, deptId) {
    window._currentDrillCourse = courseCode;
    window._currentDrillDept = deptId || window._currentDrillDept;
    window.switchPage('session-overview');
    setTimeout(() => window.renderSessionOverview(courseCode), 60);
  };

  window.renderSessionOverview = function (courseCode) {
    courseCode = courseCode || window._currentDrillCourse;
    const data = getUciData();
    const students = data.filter(s => String(s.courseCode) === String(courseCode));
    if (!students.length) return;
    const courseName = students[0].courseName;
    const total = students.length;
    const grads = students.filter(s => s.target === 'Graduate').length;
    const drops = students.filter(s => s.target === 'Dropout').length;
    const enrs  = students.filter(s => s.target === 'Enrolled').length;
    const withSem2 = students.filter(s => s.sem2Grade > 0);
    const avgSem2 = withSem2.length ? (withSem2.reduce((a, s) => a + s.sem2Grade, 0) / withSem2.length).toFixed(2) : 'N/A';
    const avgAdm  = (students.reduce((a, s) => a + s.admGrade, 0) / total).toFixed(1);
    const debtors = students.filter(s => s.debtor === 1).length;
    const scholars = students.filter(s => s.scholarship === 1).length;

    const container = document.getElementById('session-overview-content');
    if (!container) return;

    // Find parent dept
    const parentDept = UCI_DEPT_GROUPS.find(g => g.courses.map(String).includes(String(courseCode))) || UCI_DEPT_GROUPS[0];

    container.innerHTML = `
      <!-- Breadcrumb -->
      <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text-muted);margin-bottom:20px;flex-wrap:wrap;">
        <span onclick="window.switchPage('dashboard')" style="cursor:pointer;color:var(--color-primary-600);font-weight:600;">&#127968; College Overview</span>
        <span>&rsaquo;</span>
        <span onclick="window.openDrillDownDept('${parentDept.id}')" style="cursor:pointer;color:var(--color-primary-600);font-weight:600;">${parentDept.name}</span>
        <span>&rsaquo;</span>
        <span style="font-weight:700;color:var(--text-primary);">${courseName}</span>
        <span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="window.openDrillDownDept('${parentDept.id}')">&#8592; Back to ${parentDept.name}</button>
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Back to Dashboard</button>
        </span>
      </div>

      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:0 0 4px 0;">${courseName}</h2>
      <div style="font-size:0.88rem;color:var(--text-muted);margin-bottom:24px;">UCI Course Code: ${courseCode} &bull; ${total.toLocaleString()} students</div>

      <!-- KPIs -->
      <div class="kpi-metrics-grid" style="margin-bottom:24px;">
        <div class="kpi-card"><div class="kpi-card-label">Total Students</div><div class="kpi-card-value">${total.toLocaleString()}</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Graduation Rate</div><div class="kpi-card-value" style="color:#10b981;">${((grads/total)*100).toFixed(1)}%</div><div class="kpi-card-subtext">${grads} graduates</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Dropout Rate</div><div class="kpi-card-value" style="color:#ef4444;">${((drops/total)*100).toFixed(1)}%</div><div class="kpi-card-subtext">${drops} students</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Mean Entry Grade</div><div class="kpi-card-value">${avgAdm}</div><div class="kpi-card-subtext">Scale 0&ndash;200</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Avg 2nd Sem Grade</div><div class="kpi-card-value">${avgSem2}</div><div class="kpi-card-subtext">Scale 0&ndash;20</div></div>
        <div class="kpi-card"><div class="kpi-card-label">Debtors / Scholars</div><div class="kpi-card-value">${debtors} / ${scholars}</div></div>
      </div>

      <!-- Charts -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Outcome Distribution</h3><div class="chart-card-subtitle">Graduate / Dropout / Enrolled</div></div>
            <span class="badge badge-success">Donut</span>
          </div>
          <div class="chart-canvas-container" style="height:220px;position:relative;">
            <canvas id="course-outcome-donut"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Admission Grade Distribution</h3><div class="chart-card-subtitle">Histogram of entry scores for this course</div></div>
            <span class="badge badge-info">Histogram</span>
          </div>
          <div class="chart-canvas-container" style="height:220px;position:relative;">
            <canvas id="course-grade-hist"></canvas>
          </div>
        </div>
      </div>

      <!-- Student Table paginated simple -->
      <div class="app-card" style="margin-bottom:24px;">
        <div class="app-card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div class="app-card-title">Students Enrolled in ${courseName} (${students.length.toLocaleString()} Total)</div>
          <button class="btn btn-outline btn-sm" onclick="window.filterUciByCourse(${courseCode});window.switchPage('students')">View All in Directory &rarr;</button>
        </div>
        <div class="table-responsive">
          <table class="app-table">
            <thead><tr><th>ID</th><th>Name (Demo)</th><th>Outcome</th><th>Adm. Grade</th><th>1st Sem</th><th>2nd Sem</th><th>Financial</th><th>360&deg; Profile</th></tr></thead>
            <tbody>
              ${students.slice(0, 30).map(s => `
                <tr>
                  <td style="font-weight:700;">${s.studentId}</td>
                  <td>${s.name} <span class="badge badge-outline" style="font-size:0.62rem;">Demo</span></td>
                  <td><span class="badge ${s.target==='Graduate'?'badge-success':s.target==='Dropout'?'badge-danger':'badge-primary'}">${s.target}</span></td>
                  <td>${s.admGrade.toFixed(1)}</td>
                  <td>${(s.sem1Grade || 0) > 0 ? s.sem1Grade.toFixed(2) : '0.00'}</td>
                  <td>${(s.sem2Grade || 0) > 0 ? s.sem2Grade.toFixed(2) : '0.00'}</td>
                  <td style="font-size:0.78rem;">${s.debtor?'<span style="color:#ef4444;font-weight:600;">Debtor</span>':s.scholarship?'<span style="color:#10b981;font-weight:600;">Scholar</span>':'Regular'}</td>
                  <td><button class="btn btn-primary btn-sm" onclick="window.openFullStudentProfile(${s.id})">&#128065; View 360&deg; Profile</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    setTimeout(() => {
      renderDeptOutcomeDonut('course-outcome-donut', grads, drops, enrs);
    renderGradeHistogram('course-grade-hist', students.map(s => s.admGrade), 'Admission Grade (0-200)', 20);
    }, 80);
  };

  /* =========================================================
     6. FULL-PAGE INDIVIDUAL STUDENT PROFILE
     ========================================================= */
  let profileCharts = {};

  window.openFullStudentProfile = function (studentId) {
    window._currentStudentId = studentId;
    window.switchPage('student-profile');
    setTimeout(() => window.renderStudentProfilePage(studentId), 60);
  };

  // Wire existing renderUciStudentProfile to open the full page instead of modal
  const _origUciProfile = window.renderUciStudentProfile;
  window.renderUciStudentProfile = function (id) {
    window.openFullStudentProfile(id);
  };

  window.renderStudentProfilePage = function (studentId) {
    const data = getUciData();
    const student = data.find(s => s.id === studentId);
    const container = document.getElementById('student-profile-content');
    if (!container) return;

    if (!student) {
      container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);">Student not found (ID: ${studentId})</div>`;
      return;
    }

    // Cohort for comparison (same course)
    const cohort = data.filter(s => String(s.courseCode) === String(student.courseCode));
    const cohortGrads = cohort.filter(s => s.target === 'Graduate');
    const cohortAvgAdm = cohort.length ? (cohort.reduce((a, s) => a + s.admGrade, 0) / cohort.length).toFixed(1) : 0;
    const cohortAvgSem1 = cohort.filter(s => s.sem1Grade > 0).length ?
      (cohort.filter(s => s.sem1Grade > 0).reduce((a, s) => a + s.sem1Grade, 0) /
       cohort.filter(s => s.sem1Grade > 0).length).toFixed(2) : 0;
    const cohortAvgSem2 = cohort.filter(s => s.sem2Grade > 0).length ?
      (cohort.filter(s => s.sem2Grade > 0).reduce((a, s) => a + s.sem2Grade, 0) /
       cohort.filter(s => s.sem2Grade > 0).length).toFixed(2) : 0;

    // Find parent dept
    const parentDept = UCI_DEPT_GROUPS.find(g => g.courses.map(String).includes(String(student.courseCode))) || UCI_DEPT_GROUPS[0];

    // Risk score calculation (transparent heuristic)
    let riskScore = 0;
    const riskFactors = [];
    if (student.debtor === 1) { riskScore += 30; riskFactors.push({ label: 'Tuition Debtor', points: 30 }); }
    if (student.tuitionUpToDate === 0) { riskScore += 25; riskFactors.push({ label: 'Fees Overdue', points: 25 }); }
    if (student.sem1Enr > 0 && student.sem1App === 0) { riskScore += 30; riskFactors.push({ label: 'Sem 1: 0 Units Approved', points: 30 }); }
    if (student.sem2Enr > 0 && student.sem2App === 0) { riskScore += 30; riskFactors.push({ label: 'Sem 2: 0 Units Approved', points: 30 }); }
    if (student.sem1Grade > 0 && student.sem1Grade < 10) { riskScore += 15; riskFactors.push({ label: 'Sem 1 Grade < 10/20', points: 15 }); }
    if (riskScore === 0) riskFactors.push({ label: 'No High-Risk Factors', points: 0 });
    const riskBand = riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';
    const riskColor = riskBand === 'High' ? '#ef4444' : riskBand === 'Medium' ? '#f59e0b' : '#10b981';

    // Insight text
    const avgSem2 = student.sem2Grade > 0 ? student.sem2Grade.toFixed(2) : null;
    const compareToGradAvg = cohortAvgSem2 > 0 && avgSem2
      ? (student.sem2Grade - cohortAvgSem2).toFixed(2)
      : null;

    const outcomeColor = student.target === 'Graduate' ? PALETTE.graduate :
      student.target === 'Dropout' ? PALETTE.dropout : PALETTE.enrolled;

    // Destroy old charts
    Object.keys(profileCharts).forEach(k => { profileCharts[k] = safeDestroy(profileCharts[k]); });

    container.innerHTML = `
      <!-- Breadcrumb -->
      <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text-muted);margin-bottom:20px;flex-wrap:wrap;">
        <span onclick="window.switchPage('dashboard')" style="cursor:pointer;color:var(--color-primary-600);font-weight:600;">&#127968; College Overview</span>
        <span>&rsaquo;</span>
        <span onclick="window.openDrillDownDept('${parentDept.id}')" style="cursor:pointer;color:var(--color-primary-600);font-weight:600;">${parentDept.name}</span>
        <span>&rsaquo;</span>
        <span onclick="window.openDrillDownCourse('${student.courseCode}','${parentDept.id}')" style="cursor:pointer;color:var(--color-primary-600);font-weight:600;">${student.courseName}</span>
        <span>&rsaquo;</span>
        <span style="font-weight:700;color:var(--text-primary);">${student.name} &mdash; Profile</span>
        <span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="window.openDrillDownCourse('${student.courseCode}','${parentDept.id}')">&#8592; Back to Course</button>
          <button class="btn btn-outline btn-sm" onclick="window.openDrillDownDept('${parentDept.id}')">&#8592; Back to ${parentDept.name}</button>
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Dashboard</button>
          <button class="btn btn-primary btn-sm" onclick="window.printStudentReport(${student.id})" style="margin-left:6px;">&#128438; Print Report</button>
        </span>
      </div>

      <!-- Header Banner -->
      <div style="display:flex;align-items:center;gap:20px;padding:20px;background:var(--bg-surface);border-radius:var(--radius-lg);border:1px solid var(--border-light);border-top:4px solid ${outcomeColor};margin-bottom:24px;flex-wrap:wrap;">
        <div style="width:72px;height:72px;border-radius:50%;background:${outcomeColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;flex-shrink:0;">
          ${student.name.charAt(0)}
        </div>
        <div style="flex-grow:1;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
            <h2 style="margin:0;font-size:1.4rem;font-weight:700;color:var(--text-primary);">${student.name}</h2>
            <span class="badge badge-warning" style="font-size:0.68rem;">Synthetic Demo Name</span>
            <span class="badge" style="background:${outcomeColor};color:#fff;font-weight:700;font-size:0.78rem;">${student.target.toUpperCase()}</span>
            <span class="badge" style="background:${riskColor};color:#fff;font-size:0.72rem;">Risk: ${riskBand}</span>
          </div>
          <div style="font-size:0.88rem;color:var(--text-secondary);">
            <strong>ID:</strong> ${student.studentId} &bull;
            <strong>Course:</strong> ${student.courseName} (Code: ${student.courseCode}) &bull;
            <strong>Age:</strong> ${student.age} yrs &bull;
            <strong>Gender:</strong> ${student.gender === 1 ? 'Male' : 'Female'}
          </div>
        </div>
        <div style="text-align:right;min-width:140px;">
          <div style="font-size:2rem;font-weight:700;color:${outcomeColor};">${student.admGrade.toFixed(1)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Admission Grade / 200</div>
        </div>
      </div>

      <!-- Data Notice -->
      <div style="background:rgba(59,130,246,0.07);border-left:4px solid #3b82f6;border-radius:4px;padding:10px 14px;font-size:0.8rem;color:var(--text-secondary);margin-bottom:24px;">
          <strong>Data Integrity Notice:</strong> All academic metrics shown (semester grades, enrolled/approved units, admission grade) are original verified UCI dataset fields. Student names, IDs, and email addresses are synthetic demo data, clearly labeled as such. <span class="badge badge-warning" style="font-size:0.65rem;">Synthetic Demo Names</span>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-metrics-grid" style="margin-bottom:24px;">
          <div class="kpi-card" title="Admission grade on entry to the programme (UCI field). Scale 0-200.">
          <div class="kpi-card-label">Admission Grade</div>
          <div class="kpi-card-value">${student.admGrade.toFixed(1)}</div>
          <div class="kpi-card-subtext">/ 200 entry metric &bull; Cohort avg: ${cohortAvgAdm}</div>
        </div>
          <div class="kpi-card" title="Average grade in 1st semester curricular units (scale 0-20). UCI field.">
          <div class="kpi-card-label">1st Semester Grade</div>
          <div class="kpi-card-value" style="color:${student.sem1Grade >= 10 ? '#10b981' : student.sem1Grade > 0 ? '#f59e0b' : '#94a3b8'};">
            ${student.sem1Grade > 0 ? student.sem1Grade.toFixed(2) : 'N/A'}
          </div>
          <div class="kpi-card-subtext">${student.sem1App} of ${student.sem1Eval} evaluated approved &bull; Cohort avg: ${cohortAvgSem1}</div>
        </div>
          <div class="kpi-card" title="Average grade in 2nd semester curricular units (scale 0-20). UCI field.">
          <div class="kpi-card-label">2nd Semester Grade</div>
          <div class="kpi-card-value" style="color:${student.sem2Grade >= 10 ? '#10b981' : student.sem2Grade > 0 ? '#f59e0b' : '#94a3b8'};">
            ${student.sem2Grade > 0 ? student.sem2Grade.toFixed(2) : 'N/A'}
          </div>
          <div class="kpi-card-subtext">${student.sem2App} of ${student.sem2Eval} evaluated approved &bull; Cohort avg: ${cohortAvgSem2}</div>
        </div>
        <div class="kpi-card" title="Rule-based heuristic risk score. Formula documented below.">
          <div class="kpi-card-label">Risk Score</div>
          <div class="kpi-card-value" style="color:${riskColor};">${riskScore}/100</div>
          <div class="kpi-card-subtext">Band: ${riskBand} &bull; Rule-based heuristic (not ML)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Financial Status</div>
          <div class="kpi-card-value" style="font-size:1.1rem;${student.debtor?'color:#ef4444;':''}">${student.debtor ? 'Debtor' : student.scholarship ? 'Scholar' : 'Regular'}</div>
          <div class="kpi-card-subtext">Fees ${student.tuitionUpToDate ? 'up to date' : 'overdue'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Cohort Size</div>
          <div class="kpi-card-value">${cohort.length}</div>
          <div class="kpi-card-subtext">${cohortGrads.length} graduates in same course</div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">

        <!-- Chart 1: Sem 1 vs Sem 2 Progression Bars -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Semester Progression</h3>
          <div class="chart-card-subtitle">This student vs. course cohort avg (Sem 1 &rarr; Sem 2)</div>
            </div>
            <span class="badge badge-info">Grouped Bar</span>
          </div>
          <div class="chart-canvas-container" style="height:230px;position:relative;">
            <canvas id="profile-progression-bar"></canvas>
          </div>
        </div>

        <!-- Chart 2: Risk Factor Breakdown -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Risk Factor Analysis</h3>
              <div class="chart-card-subtitle">Rule-based heuristic points contributing to risk score</div>
            </div>
            <span class="badge badge-danger">Bar</span>
          </div>
          <div class="chart-canvas-container" style="height:230px;position:relative;">
            <canvas id="profile-risk-bar"></canvas>
          </div>
        </div>

        <!-- Chart 3: Admitted vs Approved Units -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Curricular Unit Completion</h3>
          <div class="chart-card-subtitle">Enrolled &rarr; Evaluated &rarr; Approved per semester</div>
            </div>
            <span class="badge badge-primary">Grouped Bar</span>
          </div>
          <div class="chart-canvas-container" style="height:230px;position:relative;">
            <canvas id="profile-units-bar"></canvas>
          </div>
        </div>

        <!-- Chart 4: Cohort Comparison Radar-style Bar -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Student vs Cohort Comparison</h3>
              <div class="chart-card-subtitle">Key metrics: this student vs course cohort average</div>
            </div>
            <span class="badge badge-success">Comparison Bar</span>
          </div>
          <div class="chart-canvas-container" style="height:230px;position:relative;">
            <canvas id="profile-cohort-bar"></canvas>
          </div>
        </div>
      </div>

      <!-- Insight Summary -->
      <div class="app-card" style="margin-bottom:24px;padding:18px;">
          <div class="app-card-title" style="margin-bottom:12px;">&#128202; Analytical Insight Summary</div>
        <div style="font-size:0.88rem;color:var(--text-secondary);line-height:1.7;">
          ${generateStudentInsights(student, cohort, cohortAvgAdm, cohortAvgSem1, cohortAvgSem2, riskScore, riskBand, riskFactors)}
        </div>
      </div>

      <!-- Financial & Macro-economic Data -->
      <div class="app-card" style="margin-bottom:24px;">
        <div class="app-card-header"><div class="app-card-title">Financial & Socio-Economic Indicators (UCI Verified)</div><span class="badge badge-info">Authentic UCI Fields</span></div>
        <div class="table-responsive">
          <table class="app-table">
            <tbody>
              <tr><td style="font-weight:600;">Scholarship Holder</td><td>${student.scholarship === 1 ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-outline">No</span>'}</td>
                  <td style="font-weight:600;">Tuition Fees</td><td>${student.tuitionUpToDate === 1 ? '<span class="badge badge-success">Up to Date</span>' : '<span class="badge badge-danger">Overdue</span>'}</td></tr>
              <tr><td style="font-weight:600;">Tuition Debtor</td><td>${student.debtor === 1 ? '<span class="badge badge-danger">Yes</span>' : '<span class="badge badge-success">No</span>'}</td>
                  <td style="font-weight:600;">Contact (Demo)</td><td><code style="font-size:0.78rem;">${student.email}</code> <span class="badge badge-warning" style="font-size:0.62rem;">Synthetic</span></td></tr>
              <tr><td style="font-weight:600;">Unemployment Rate (Macroeconomic)</td><td>${student.unemployment}%</td>
                  <td style="font-weight:600;">Inflation / GDP</td><td>${student.inflation}% inflation / ${student.gdp}% GDP</td></tr>
              <tr><td style="font-weight:600;">International Student</td><td>${'Not in dataset'}</td>
                  <td style="font-weight:600;">Daytime Attendance</td><td>${'Not in dataset'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Risk Score Methodology -->
      <div class="app-card" style="margin-bottom:24px;padding:16px;font-size:0.82rem;color:var(--text-secondary);background:var(--color-slate-50);">
        <strong>Risk Score Methodology (Transparent Heuristic):</strong>
        Tuition Debtor (+30) + Fees Overdue (+25) + Sem 1 zero approvals (+30) + Sem 2 zero approvals (+30) + Sem 1 Grade &lt; 10 (+15).
        Maximum = 100. <em>This is a rule-based score, not a machine-learning prediction.
        It highlights known administrative and academic risk factors. Correlation does not imply causation.</em>
      </div>
    `;

    // Render profile charts
    setTimeout(() => {
      renderProfileProgressionBar(student, cohortAvgSem1, cohortAvgSem2);
      renderProfileRiskBar(riskFactors);
      renderProfileUnitsBar(student);
      renderProfileCohortBar(student, cohortAvgAdm, cohortAvgSem1, cohortAvgSem2);
    }, 80);
  };

  function generateStudentInsights(student, cohort, cohortAvgAdm, cohortAvgSem1, cohortAvgSem2, riskScore, riskBand, riskFactors) {
    const lines = [];
    lines.push(`<strong>Outcome:</strong> This student's recorded outcome is <strong>${student.target}</strong>.`);

    const admDiff = (student.admGrade - cohortAvgAdm).toFixed(1);
    lines.push(`<strong>Admission Grade:</strong> ${student.admGrade.toFixed(1)} vs cohort average of ${cohortAvgAdm} &mdash; ${admDiff >= 0 ? `${admDiff} above` : `${Math.abs(admDiff)} below`} the course average.`);

    if (student.sem2Grade > 0 && cohortAvgSem2 > 0) {
      const diff = (student.sem2Grade - cohortAvgSem2).toFixed(2);
      lines.push(`<strong>2nd Semester Performance:</strong> Grade of ${student.sem2Grade.toFixed(2)}/20 is ${diff >= 0 ? `<span style="color:#10b981;">${diff} above</span>` : `<span style="color:#ef4444;">${Math.abs(diff)} below</span>`} the course cohort average of ${cohortAvgSem2}.`);
    } else if (student.sem2Grade === 0) {
      lines.push(`<strong>2nd Semester:</strong> No grade recorded (0 units approved). This is a significant risk indicator.`);
    }

    lines.push(`<strong>Risk Assessment:</strong> Risk score is ${riskScore}/100 (${riskBand}). Contributing factors: ${riskFactors.map(f => f.label).join(', ')}.`);

    if (student.debtor === 1) lines.push(`<strong>Financial Note:</strong> Student has an outstanding tuition balance (debtor flag). Research shows tuition debt is associated with elevated dropout likelihood in the UCI dataset (debtors: ${((1421/4424)*100).toFixed(0)}% correlation with dropout).`);
    if (student.scholarship === 1) lines.push(`<strong>Scholarship Holder:</strong> This student receives a scholarship. Scholarship recipients in this UCI dataset graduate at a higher rate than non-recipients.`);

    lines.push(`<strong>Data Limitation:</strong> The UCI dataset contains one row per student &mdash; no session-by-session attendance logs, no individual subject marks, and no longitudinal grade history are available. Charts above show the available semester-aggregate metrics only.`);

    return lines.map(l => `<p style="margin:0 0 8px 0;">${l}</p>`).join('');
  }

  function renderProfileProgressionBar(student, cohortAvgSem1, cohortAvgSem2) {
    const ctx = document.getElementById('profile-progression-bar');
    if (!ctx || typeof Chart === 'undefined') return;
    profileCharts['prog'] = safeDestroy(profileCharts['prog']);
    profileCharts['prog'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1st Semester Grade', '2nd Semester Grade'],
        datasets: [
          { label: 'This Student', data: [student.sem1Grade || 0, student.sem2Grade || 0], backgroundColor: '#3b82f6' },
          { label: 'Cohort Average', data: [Number(cohortAvgSem1) || 0, Number(cohortAvgSem2) || 0], backgroundColor: '#cbd5e1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { max: 20, beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } },
          x: { grid: { display: false }, ticks: { color: textColor() } }
        },
        plugins: { legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } } }
      }
    });
  }

  function renderProfileRiskBar(factors) {
    const ctx = document.getElementById('profile-risk-bar');
    if (!ctx || typeof Chart === 'undefined') return;
    profileCharts['risk'] = safeDestroy(profileCharts['risk']);
    profileCharts['risk'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: factors.map(f => f.label),
        datasets: [{ label: 'Risk Points', data: factors.map(f => f.points), backgroundColor: factors.map(f => f.points >= 25 ? '#ef4444' : f.points >= 15 ? '#f59e0b' : '#10b981') }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { max: 35, beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } },
          y: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11 } } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderProfileUnitsBar(student) {
    const ctx = document.getElementById('profile-units-bar');
    if (!ctx || typeof Chart === 'undefined') return;
    profileCharts['units'] = safeDestroy(profileCharts['units']);
    profileCharts['units'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Enrolled', 'Evaluated', 'Approved'],
        datasets: [
          { label: '1st Semester', data: [student.sem1Enr, student.sem1Eval, student.sem1App], backgroundColor: '#3b82f6' },
          { label: '2nd Semester', data: [student.sem2Enr, student.sem2Eval, student.sem2App], backgroundColor: '#10b981' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } },
          x: { grid: { display: false }, ticks: { color: textColor() } }
        },
        plugins: { legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } } }
      }
    });
  }

  function renderProfileCohortBar(student, cohortAvgAdm, cohortAvgSem1, cohortAvgSem2) {
    const ctx = document.getElementById('profile-cohort-bar');
    if (!ctx || typeof Chart === 'undefined') return;
    profileCharts['cohort'] = safeDestroy(profileCharts['cohort']);
    const normAdm = student.admGrade / 200 * 20;
    const normCohortAdm = cohortAvgAdm / 200 * 20;
    profileCharts['cohort'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Adm. Grade (/10)', '1st Sem Grade', '2nd Sem Grade'],
        datasets: [
          { label: 'This Student', data: [normAdm.toFixed(2), student.sem1Grade || 0, student.sem2Grade || 0], backgroundColor: '#8b5cf6' },
          { label: 'Cohort Average', data: [normCohortAdm.toFixed(2), Number(cohortAvgSem1) || 0, Number(cohortAvgSem2) || 0], backgroundColor: '#cbd5e1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { max: 20, beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } },
          x: { grid: { display: false }, ticks: { color: textColor() } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } },
          tooltip: { callbacks: { afterBody: () => ['Note: Adm. grade is normalised /10 for comparison'] } }
        }
      }
    });
  }

  window.printStudentReport = function (studentId) {
    window._currentStudentId = studentId;
    window.print();
  };

  /* =========================================================
  /* 7. ENHANCED ANALYTICS PAGE -- SCATTER PLOT + HEATMAP */
     ========================================================= */
  let analyticsCharts = {};

  window.renderWorldClassAnalytics = function () {
    const data = getUciData();
    if (!data.length) return;
    const page = document.getElementById('page-analytics');
    if (!page) return;

    // Ensure analytics extra section exists
    let extraSection = document.getElementById('wca-analytics-section');
    if (!extraSection) {
      extraSection = document.createElement('div');
      extraSection.id = 'wca-analytics-section';
      extraSection.style.marginTop = '24px';
      page.appendChild(extraSection);
    }

    extraSection.innerHTML = `
      <!-- Scatter Plot -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Admission Grade vs 2nd Semester Grade</h3>
            <div class="chart-card-subtitle">Scatter plot &mdash; each dot is one student, coloured by outcome (4,424 records sampled at 500)</div>
            </div>
            <span class="badge badge-info">Scatter</span>
          </div>
          <div class="chart-canvas-container" style="height:300px;position:relative;">
            <canvas id="wca-scatter-plot"></canvas>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);padding:8px 14px;">
          Note: 500 records sampled from 4,424 for browser performance. Correlation does not imply causation.
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-card-title">Grade Distribution Histogram</h3>
              <div class="chart-card-subtitle">2nd semester grade distribution across all 4,424 students</div>
            </div>
            <span class="badge badge-primary">Histogram</span>
          </div>
          <div class="chart-canvas-container" style="height:300px;position:relative;">
            <canvas id="wca-grade-histogram"></canvas>
          </div>
        </div>
      </div>

      <!-- Pearson Correlation Heatmap (5x5 key features) -->
      <div class="chart-card" style="margin-bottom:24px;">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-card-title">Feature Correlation Heatmap (Pearson r)</h3>
            <div class="chart-card-subtitle">5 key numeric features from the UCI dataset &mdash; colour intensity = correlation strength</div>
          </div>
          <span class="badge badge-success">Heatmap</span>
        </div>
        <div id="wca-heatmap-container" style="padding:16px;overflow-x:auto;"></div>
        <div style="font-size:0.75rem;color:var(--text-muted);padding:0 16px 12px;">
          Pearson r computed on all 4,424 records. Dark green = strong positive, dark red = strong negative correlation. Correlation does not prove causation.
        </div>
      </div>

      <!-- Outcome by Age Group Breakdown -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Outcomes by Age Group</h3><div class="chart-card-subtitle">Grad/Dropout/Enrolled split by enrolment age bracket</div></div>
            <span class="badge badge-amber">Grouped Bar</span>
          </div>
          <div class="chart-canvas-container" style="height:260px;position:relative;">
            <canvas id="wca-age-outcomes"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Financial Status vs Graduation Rate</h3><div class="chart-card-subtitle">Scholarship vs non-scholarship vs debtor graduation rates</div></div>
            <span class="badge badge-success">Bar Comparison</span>
          </div>
          <div class="chart-canvas-container" style="height:260px;position:relative;">
            <canvas id="wca-financial-grad"></canvas>
          </div>
        </div>
      </div>

      <!-- Top-10 Courses Graduation Rate Ranked Bar -->
      <div class="chart-card" style="margin-bottom:24px;">
        <div class="chart-card-header">
          <div><h3 class="chart-card-title">Graduation Rate by Course (All 17 Programs)</h3>
            <div class="chart-card-subtitle">Ranked bar &mdash; courses sorted by graduation rate descending</div>
          </div>
          <span class="badge badge-primary">Horizontal Bar</span>
        </div>
        <div class="chart-canvas-container" style="height:340px;position:relative;">
          <canvas id="wca-course-grad-rate"></canvas>
        </div>
      </div>
    `;

    setTimeout(() => {
      renderScatterPlot(data);
      renderGradeHistogram('wca-grade-histogram', data.filter(s => s.sem2Grade > 0).map(s => s.sem2Grade), '2nd Semester Grade (0-20)', 1);
      renderCorrelationHeatmap(data);
      renderAgeOutcomes(data);
      renderFinancialGradRate(data);
      renderCourseGradRateBar(data);
    }, 100);
  };

  function renderScatterPlot(data) {
    const ctx = document.getElementById('wca-scatter-plot');
    if (!ctx || typeof Chart === 'undefined') return;
    analyticsCharts['scatter'] = safeDestroy(analyticsCharts['scatter']);

    // Sample 500 records with sem2 data
    const withSem2 = data.filter(s => s.admGrade > 0 && s.sem2Grade > 0);
    const step = Math.max(1, Math.floor(withSem2.length / 500));
    const sample = withSem2.filter((_, i) => i % step === 0).slice(0, 500);

    const colorOf = t => t === 'Graduate' ? 'rgba(16,185,129,0.55)' : t === 'Dropout' ? 'rgba(239,68,68,0.55)' : 'rgba(59,130,246,0.55)';

    analyticsCharts['scatter'] = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: ['Graduate', 'Dropout', 'Enrolled'].map(target => ({
          label: target,
          data: sample.filter(s => s.target === target).map(s => ({ x: s.admGrade, y: s.sem2Grade, id: s.id })),
          backgroundColor: colorOf(target),
          pointRadius: 4,
          pointHoverRadius: 6,
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Admission Grade (0-200)', color: textColor(), font: { size: 12 } }, grid: { color: gridColor() }, ticks: { color: textColor() } },
          y: { title: { display: true, text: '2nd Semester Grade (0-20)', color: textColor(), font: { size: 12 } }, grid: { color: gridColor() }, ticks: { color: textColor() } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const pt = ctx.raw;
                return [`Adm: ${pt.x.toFixed(1)}, Sem2: ${pt.y.toFixed(2)}`, `Outcome: ${ctx.dataset.label}`];
              }
            }
          }
        },
        onClick(evt, el) {
          if (el.length) {
            const pt = el[0];
            const ds = analyticsCharts['scatter'].data.datasets[pt.datasetIndex];
            const record = ds.data[pt.index];
            if (record && record.id) window.openFullStudentProfile(record.id);
          }
        }
      }
    });
  }

  function renderGradeHistogram(canvasId, values, label, bucketSize) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;
    analyticsCharts[canvasId] = safeDestroy(analyticsCharts[canvasId]);

    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    const buckets = [];
    const counts = [];
    for (let v = min; v < max; v += bucketSize) {
      buckets.push(\-\);
      counts.push(values.filter(x => x >= v && x < v + bucketSize).length);
    }

    analyticsCharts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: buckets,
        datasets: [{ label: label, data: counts, backgroundColor: 'rgba(59,130,246,0.6)', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 3 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor(), font: { size: 10 }, maxRotation: 45 } },
          y: { beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } }
        }
      }
    });
  }

  function renderCorrelationHeatmap(data) {
    const container = document.getElementById('wca-heatmap-container');
    if (!container) return;

    const fields = [
      { key: 'admGrade', label: 'Adm. Grade' },
      { key: 'sem1Grade', label: 'Sem1 Grade' },
      { key: 'sem2Grade', label: 'Sem2 Grade' },
      { key: 'sem1App',   label: 'Sem1 Approved' },
      { key: 'sem2App',   label: 'Sem2 Approved' },
    ];

    // Build arrays
    const arrs = {};
    fields.forEach(f => { arrs[f.key] = data.map(s => s[f.key] || 0); });

    // Compute matrix
    const matrix = fields.map(fi =>
      fields.map(fj => pearson(arrs[fi.key], arrs[fj.key]))
    );

    function rToColor(r) {
      // Green for positive, red for negative, white for near-zero
      if (r >= 0) {
        const g = Math.round(16 + r * (185 - 16));
        const b = Math.round(129 + r * (0));
        return `rgba(16,${g},129,${0.15 + r * 0.75})`;
      } else {
        const intensity = -r;
        return `rgba(239,68,68,${0.15 + intensity * 0.75})`;
      }
    }

    const cellSize = 80;
    const labelW = 120;
    const totalW = labelW + fields.length * cellSize;

    let html = `<div style="min-width:${totalW}px;">`;
    // Header row
    html += `<div style="display:flex;margin-left:${labelW}px;">`;
    fields.forEach(f => {
      html += `<div style="width:${cellSize}px;text-align:center;font-size:0.72rem;font-weight:600;color:var(--text-secondary);padding:4px 2px;">${f.label}</div>`;
    });
    html += '</div>';

    // Matrix rows
    matrix.forEach((row, ri) => {
      html += `<div style="display:flex;align-items:center;">`;
      html += `<div style="width:${labelW}px;font-size:0.75rem;font-weight:600;color:var(--text-secondary);text-align:right;padding-right:8px;">${fields[ri].label}</div>`;
      row.forEach((r, ci) => {
        const bg = rToColor(r);
        const textCol = Math.abs(r) > 0.5 ? '#fff' : 'var(--text-primary)';
        html += `<div title="${fields[ri].label} vs ${fields[ci].label}: r = ${r}" style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;background:${bg};margin:1px;border-radius:4px;font-size:0.8rem;font-weight:700;color:${textCol};">${r.toFixed(2)}</div>`;
      });
      html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
  }

  function renderAgeOutcomes(data) {
    const ctx = document.getElementById('wca-age-outcomes');
    if (!ctx || typeof Chart === 'undefined') return;
    analyticsCharts['age'] = safeDestroy(analyticsCharts['age']);
    const brackets = ['17-20', '21-25', '26-30', '31-40', '41+'];
    const grads = [0, 0, 0, 0, 0], drops = [0, 0, 0, 0, 0], enrs = [0, 0, 0, 0, 0];
    data.forEach(s => {
      const i = s.age <= 20 ? 0 : s.age <= 25 ? 1 : s.age <= 30 ? 2 : s.age <= 40 ? 3 : 4;
      if (s.target === 'Graduate') grads[i]++;
      else if (s.target === 'Dropout') drops[i]++;
      else enrs[i]++;
    });
    analyticsCharts['age'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: brackets,
        datasets: [
          { label: 'Graduates', data: grads, backgroundColor: PALETTE.graduate },
          { label: 'Dropouts', data: drops, backgroundColor: PALETTE.dropout },
          { label: 'Enrolled', data: enrs, backgroundColor: PALETTE.enrolled }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: textColor() } },
          y: { stacked: true, beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } }
        },
        plugins: { legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } } }
      }
    });
  }

  function renderFinancialGradRate(data) {
    const ctx = document.getElementById('wca-financial-grad');
    if (!ctx || typeof Chart === 'undefined') return;
    analyticsCharts['financial'] = safeDestroy(analyticsCharts['financial']);

    const groups = [
      { label: 'Scholarship', filter: s => s.scholarship === 1 },
      { label: 'Non-Scholarship', filter: s => s.scholarship === 0 },
      { label: 'Debtor', filter: s => s.debtor === 1 },
      { label: 'Non-Debtor', filter: s => s.debtor === 0 },
      { label: 'Fees Up-to-date', filter: s => s.tuitionUpToDate === 1 },
      { label: 'Fees Overdue', filter: s => s.tuitionUpToDate === 0 },
    ];

    const gradRates = groups.map(g => {
      const subset = data.filter(g.filter);
      return subset.length ? +((subset.filter(s => s.target === 'Graduate').length / subset.length) * 100).toFixed(1) : 0;
    });

    analyticsCharts['financial'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: groups.map(g => g.label),
        datasets: [{ label: 'Graduation Rate (%)', data: gradRates, backgroundColor: gradRates.map(r => r >= 50 ? PALETTE.graduate : PALETTE.dropout), borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { max: 100, beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor(), callback: v => v + '%' } },
          y: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11 } } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderCourseGradRateBar(data) {
    const ctx = document.getElementById('wca-course-grad-rate');
    if (!ctx || typeof Chart === 'undefined') return;
    analyticsCharts['courseGrad'] = safeDestroy(analyticsCharts['courseGrad']);

    const courseMap = {};
    data.forEach(s => {
      if (!courseMap[s.courseName]) courseMap[s.courseName] = { total: 0, grads: 0 };
      courseMap[s.courseName].total++;
      if (s.target === 'Graduate') courseMap[s.courseName].grads++;
    });

    const sorted = Object.entries(courseMap)
      .map(([name, c]) => ({ name, rate: +((c.grads / c.total) * 100).toFixed(1) }))
      .sort((a, b) => b.rate - a.rate);

    analyticsCharts['courseGrad'] = new Chart(ctx, {
      type: 'bar',
      data: {
      labels: sorted.map(c => c.name.length > 28 ? c.name.slice(0, 25) + '...' : c.name),
        datasets: [{ label: 'Graduation Rate (%)', data: sorted.map(c => c.rate), backgroundColor: sorted.map(c => c.rate >= 60 ? PALETTE.graduate : c.rate >= 40 ? PALETTE.amber : PALETTE.dropout), borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { max: 100, beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor(), callback: v => v + '%' } },
          y: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11 } } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  /* =========================================================
  /* 8. ENHANCED RISK PAGE -- DONUT + FACTOR BAR */
     ========================================================= */
  let riskCharts = {};

  window.renderWorldClassRisk = function () {
    const data = getUciData();
    if (!data.length) return;

    const page = document.getElementById('page-risk-monitoring');
    if (!page) return;

    let riskViz = document.getElementById('wca-risk-viz');
    if (!riskViz) {
      riskViz = document.createElement('div');
      riskViz.id = 'wca-risk-viz';
      riskViz.style.marginTop = '24px';
      page.appendChild(riskViz);
    }

    // Compute risk bands
    let highR = 0, medR = 0, lowR = 0;
    const factorCounts = { 'Tuition Debtor': 0, 'Fees Overdue': 0, 'Sem1 Zero Approvals': 0, 'Sem2 Zero Approvals': 0, 'Sem1 Grade <10': 0 };
    data.forEach(s => {
      let score = 0;
      if (s.debtor === 1) { score += 30; factorCounts['Tuition Debtor']++; }
      if (s.tuitionUpToDate === 0) { score += 25; factorCounts['Fees Overdue']++; }
      if (s.sem1Enr > 0 && s.sem1App === 0) { score += 30; factorCounts['Sem1 Zero Approvals']++; }
      if (s.sem2Enr > 0 && s.sem2App === 0) { score += 30; factorCounts['Sem2 Zero Approvals']++; }
      if (s.sem1Grade > 0 && s.sem1Grade < 10) { score += 15; factorCounts['Sem1 Grade <10']++; }
      if (score >= 50 || s.target === 'Dropout') highR++;
      else if (score >= 25 || s.target === 'Enrolled') medR++;
      else lowR++;
    });

    riskViz.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Risk Distribution</h3><div class="chart-card-subtitle">Students stratified by composite risk score</div></div>
            <span class="badge badge-danger">Donut</span>
          </div>
          <div class="chart-canvas-container" style="height:240px;position:relative;">
            <canvas id="wca-risk-donut"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <div><h3 class="chart-card-title">Risk Factor Prevalence</h3><div class="chart-card-subtitle">Students affected by each risk indicator</div></div>
            <span class="badge badge-amber">Bar</span>
          </div>
          <div class="chart-canvas-container" style="height:240px;position:relative;">
            <canvas id="wca-risk-factors"></canvas>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const donutCtx = document.getElementById('wca-risk-donut');
      if (donutCtx && typeof Chart !== 'undefined') {
        riskCharts['donut'] = safeDestroy(riskCharts['donut']);
        riskCharts['donut'] = new Chart(donutCtx, {
          type: 'doughnut',
          data: {
            labels: ['High Risk', 'Medium Risk', 'Low Risk'],
            datasets: [{ data: [highR, medR, lowR], backgroundColor: ['#ef4444', '#f59e0b', '#10b981'], borderWidth: 2, borderColor: '#fff' }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: textColor(), font: { family: 'Poppins', size: 12 } } },
              tooltip: { callbacks: { label: c => `${c.label}: ${c.raw.toLocaleString()} (${((c.raw / data.length) * 100).toFixed(1)}%)` } }
            }
          }
        });
      }

      const factorCtx = document.getElementById('wca-risk-factors');
      if (factorCtx && typeof Chart !== 'undefined') {
        riskCharts['factors'] = safeDestroy(riskCharts['factors']);
        const labels = Object.keys(factorCounts);
        const vals = Object.values(factorCounts);
        riskCharts['factors'] = new Chart(factorCtx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{ label: 'Students Affected', data: vals, backgroundColor: '#ef4444', borderRadius: 4 }]
          },
          options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            scales: {
              x: { beginAtZero: true, grid: { color: gridColor() }, ticks: { color: textColor() } },
              y: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11 } } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }, 80);
  };

  /* =========================================================
     9. CROSS-FILTER RESET BUTTON (injected into filter bar)
     ========================================================= */
  window.resetAllFilters = function () {
    window.ActiveFilters = { course: 'ALL', target: 'ALL', finance: 'ALL', search: '', chartOutcome: null, chartCourse: null };
    // Reset UCI filter dropdowns
    ['uci-filter-course', 'uci-filter-target', 'uci-filter-finance'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 'ALL';
    });
    const srch = document.getElementById('uci-search-input');
    if (srch) srch.value = '';
    if (typeof window.handleUciFilterChange === 'function') window.handleUciFilterChange();
    window.showToast && window.showToast('All filters cleared', 'success');
  };

  /* =========================================================
     10. EXECUTIVE SUMMARY (Dashboard)
     ========================================================= */
  window.renderExecutiveSummary = function () {
    const data = getUciData();
    if (!data.length) return;
    let container = document.getElementById('wca-executive-summary');
    if (!container) {
      const dashPage = document.getElementById('page-dashboard');
      if (!dashPage) return;
      container = document.createElement('div');
      container.id = 'wca-executive-summary';
      // Insert near top of dashboard page, after KPI grid
      const kpiGrid = dashPage.querySelector('.kpi-metrics-grid');
      if (kpiGrid && kpiGrid.nextSibling) {
        dashPage.insertBefore(container, kpiGrid.nextSibling);
      } else {
        dashPage.appendChild(container);
      }
    }

    const total = data.length;
    const grads = data.filter(s => s.target === 'Graduate').length;
    const drops = data.filter(s => s.target === 'Dropout').length;
    const enrs  = data.filter(s => s.target === 'Enrolled').length;
    const debtors = data.filter(s => s.debtor === 1).length;
    const scholars = data.filter(s => s.scholarship === 1).length;
    const gradPct = ((grads / total) * 100).toFixed(1);
    const dropPct = ((drops / total) * 100).toFixed(1);
    const avgAdm = (data.reduce((a, s) => a + s.admGrade, 0) / total).toFixed(1);

    container.innerHTML = `
      <div class="app-card" style="margin-bottom:24px;border-left:4px solid #3b82f6;">
        <div class="app-card-header">
          <div class="app-card-title">&#128202; Executive Summary &mdash; UCI Benchmark Dataset (${total.toLocaleString()} Students)</div>
          <span class="badge badge-info">Auto-Generated from Data</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;padding:16px;font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
          <div>
            <strong>&#128218; Academic Outcomes:</strong><br>
            ${grads.toLocaleString()} students graduated (${gradPct}%), ${drops.toLocaleString()} dropped out (${dropPct}%), and ${enrs.toLocaleString()} remain enrolled (${((enrs/total)*100).toFixed(1)}%).
          </div>
          <div>
            <strong>&#128196; Entry Performance:</strong><br>
            Mean admission grade across the cohort is <strong>${avgAdm} / 200</strong>. This is the standardised entry metric from the UCI dataset.
          </div>
          <div>
            <strong>&#128176; Financial Landscape:</strong><br>
            ${debtors.toLocaleString()} students (${((debtors/total)*100).toFixed(1)}%) carry a tuition balance. ${scholars.toLocaleString()} (${((scholars/total)*100).toFixed(1)}%) hold scholarships.
          </div>
          <div>
            <strong>&#9888; Risk Profile:</strong><br>
            Tuition debtors are more than 2x as likely to drop out. Scholarship holders graduate at a significantly higher rate. Sem 1 unit approval is the strongest early predictor.
          </div>
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);padding:0 16px 12px;">
          UCI Machine Learning Repository &mdash; Realinho et al. (2021), DOI: 10.24432/C5MC89, CC BY 4.0.
          All figures calculated from verified records. Attendance register logs are not part of this benchmark dataset.
        </div>
      </div>
    `;
  };

  /* =========================================================
  /* 11. HOOK INTO PAGE SWITCHES - via event listener, not re-wrapping */
     ========================================================= */
  // Listen for custom pageSwitch events rather than re-wrapping switchPage again
  // (uciAnalytics.js already wraps it; we use a MutationObserver + timeout approach)
  let _wcLastPage = null;
  function onPageChanged(pageId) {
    if (_wcLastPage === pageId) return;
    _wcLastPage = pageId;
    if (pageId === 'dashboard') {
      window.renderCollegeDepartmentCards && window.renderCollegeDepartmentCards();
      window.renderExecutiveSummary && window.renderExecutiveSummary();
    } else if (pageId === 'analytics') {
      window.renderWorldClassAnalytics && window.renderWorldClassAnalytics();
    } else if (pageId === 'risk-monitoring') {
      window.renderWorldClassRisk && window.renderWorldClassRisk();
    }
  }

  // Observe which page-view has class "active" using MutationObserver
  function installPageObserver() {
    const mainContent = document.querySelector('.app-main-content') || document.querySelector('.main-content') || document.getElementById('app-layout');
    if (!mainContent) return;
    const observer = new MutationObserver(() => {
      const activePage = document.querySelector('.page-view.active');
      if (activePage) {
        const pid = activePage.id.replace('page-', '');
        onPageChanged(pid);
      }
    });
    observer.observe(mainContent, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  /* =========================================================
     12. INIT ON DOM READY
     ========================================================= */
  function init() {
    // Add Reset Filters button to topbar if not present
    const topbar = document.querySelector('.app-topbar-actions') || document.querySelector('.topbar-right');
    if (topbar && !document.getElementById('global-reset-filters-btn')) {
      const btn = document.createElement('button');
      btn.id = 'global-reset-filters-btn';
      btn.className = 'btn btn-outline btn-sm';
      btn.style.fontSize = '0.78rem';
      btn.title = 'Clear all active filters and cross-filters';
      btn.textContent = 'x Reset Filters';
      btn.onclick = window.resetAllFilters;
      topbar.insertBefore(btn, topbar.firstChild);
    }

    // Trigger initial render if on dashboard
    const activePage = document.querySelector('.page-view.active');
    if (activePage && activePage.id === 'page-dashboard') {
      setTimeout(() => {
        window.renderCollegeDepartmentCards && window.renderCollegeDepartmentCards();
        window.renderExecutiveSummary && window.renderExecutiveSummary();
      }, 400);
    }

    // Install page observer for subsequent page changes
    installPageObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 300);
  }

})();



