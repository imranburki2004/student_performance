/**
 * ENHANCED DASHBOARD MANAGEMENT ENGINE
 * Student Performance & Attendance Analytics Dashboard
 * Govt. Degree College No. 1, D.I. Khan
 * Author: Imran (CS-2210) | Supervisor: Prof. Abdur Rehman
 *
 * Implements:
 * - Clickable KPI cards with proper drill-downs
 * - High/Medium/At-Risk performance filters
 * - Enhanced student list with View/Edit/Delete
 * - n8n Workflow Automation UI
 * - Touchscreen-friendly interactions
 * - Automatic data refresh on record changes
 * - Performance classification engine
 * - Notification centre
 * - Settings enhancements
 */

(function () {
  'use strict';

  /* =========================================================
     PERFORMANCE CLASSIFICATION CONFIG (configurable)
     ========================================================= */
  window.PerfConfig = window.PerfConfig || {
    highThreshold: 80,    // sem2 grade % on 0-20 scale -> >= 16
    medLow: 60,           // medium: 60-79% -> 12-15.9/20
    // risk: below 60% -> below 12/20
    attendanceRisk: 75,   // attendance % threshold
  };

  /* Map 0-20 grade to percentage */
  function gradeToPercent(g) { return g > 0 ? (g / 20) * 100 : 0; }

  function classifyStudent(s) {
    if (window.getActiveDataset && window.getActiveDataset() === 'uci') {
      const pct = gradeToPercent(s.sem2Grade > 0 ? s.sem2Grade : s.sem1Grade);
      if (pct === 0) return 'at-risk';
      if (pct >= window.PerfConfig.highThreshold) return 'high';
      if (pct >= window.PerfConfig.medLow) return 'medium';
      return 'at-risk';
    }
    // Institutional dataset
    const cgpa = parseFloat(s.cgpa || 0);
    if (cgpa >= 3.5) return 'high';
    if (cgpa >= 2.5) return 'medium';
    return 'at-risk';
  }

  window.classifyStudent = classifyStudent;

  /* =========================================================
     1. MAKE ALL KPI CARDS CLICKABLE
     ========================================================= */
  function wireKpiCards() {
    const cardConfigs = [
      {
        cardId: null,
        valueId: 'kpi-total-students',
        action: () => {
          window.ActiveFilters && (window.ActiveFilters.target = 'ALL');
          window.switchPage('students');
          window.showToast && window.showToast('Showing all students', 'info');
        },
        title: 'Click to view all students'
      },
      {
        valueId: 'kpi-avg-attendance',
        action: () => {
          if (window.getActiveDataset && window.getActiveDataset() === 'uci') {
            window.ActiveFilters && (window.ActiveFilters.target = 'Graduate');
            window.switchPage('students');
          } else {
            window.switchPage('attendance');
          }
        },
        title: 'Click to view graduation / attendance details'
      },
      {
        valueId: 'kpi-at-risk',
        action: () => {
          if (window.getActiveDataset && window.getActiveDataset() === 'uci') {
            window.ActiveFilters && (window.ActiveFilters.target = 'Dropout');
          }
          window.switchPage('risk-monitoring');
          window.showToast && window.showToast('Showing at-risk students', 'warning');
        },
        title: 'Click to view at-risk students'
      },
      {
        valueId: 'kpi-unpaid-fines',
        action: () => { window.switchPage('fines'); },
        title: 'Click to view fines & dues'
      },
    ];

    cardConfigs.forEach(cfg => {
      const el = document.getElementById(cfg.valueId);
      if (!el) return;
      const card = el.closest('.kpi-card');
      if (!card) return;
      card.style.cursor = 'pointer';
      card.setAttribute('tabindex', '0');
      card.setAttribute('title', cfg.title);
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', cfg.title);
      // Remove old listener to avoid duplication
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
      newCard.addEventListener('click', cfg.action);
      newCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cfg.action(); } });
      // Touch visual feedback
      newCard.addEventListener('touchstart', () => newCard.style.transform = 'scale(0.98)', { passive: true });
      newCard.addEventListener('touchend', () => newCard.style.transform = '', { passive: true });
      // Hover accent
      newCard.style.transition = 'box-shadow 0.2s, transform 0.15s, border-color 0.2s';
      newCard.addEventListener('mouseenter', () => { newCard.style.boxShadow = 'var(--shadow-md)'; newCard.style.transform = 'translateY(-2px)'; });
      newCard.addEventListener('mouseleave', () => { newCard.style.boxShadow = ''; newCard.style.transform = ''; });
    });
  }

  /* =========================================================
     2. HIGH / MEDIUM / AT-RISK PERFORMANCE PAGES
     ========================================================= */
  function ensurePerformancePage() {
    if (document.getElementById('page-high-performers')) return;
    const html = `
      <section class="page-view" id="page-high-performers">
        <div id="high-performers-content"></div>
      </section>
      <section class="page-view" id="page-medium-performers">
        <div id="medium-performers-content"></div>
      </section>
      <section class="page-view" id="page-at-risk-detail">
        <div id="at-risk-detail-content"></div>
      </section>
      <section class="page-view" id="page-automation">
        <div id="automation-content"></div>
      </section>
    `;
    const body = document.getElementById('app-layout') || document.body;
    body.insertAdjacentHTML('beforeend', html);
  }

  function renderPerformanceFilterPage(band, containerId, title, subtitle, color) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isUci = window.getActiveDataset && window.getActiveDataset() === 'uci';
    const data = isUci ? (window.UCI_STUDENTS_DATA || []) : (window.studentsData || []);

    const filtered = data.filter(s => classifyStudent(s) === band);
    const total = filtered.length;

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:0 0 4px 0;">${title}</h2>
          <div style="font-size:0.88rem;color:var(--text-muted);">${subtitle}</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Dashboard</button>
          <button class="btn btn-outline btn-sm" onclick="window.exportPerformanceBandCSV('${band}')">Export CSV</button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-metrics-grid" style="margin-bottom:24px;">
        <div class="kpi-card" style="border-top:3px solid ${color};">
          <div class="kpi-card-label">${title}</div>
          <div class="kpi-card-value" style="color:${color};">${total.toLocaleString()}</div>
          <div class="kpi-card-subtext">${((total / (data.length || 1)) * 100).toFixed(1)}% of total cohort</div>
        </div>
        ${isUci ? `
        <div class="kpi-card">
          <div class="kpi-card-label">Avg 2nd Sem Grade</div>
          <div class="kpi-card-value">${filtered.filter(s=>s.sem2Grade>0).length ? (filtered.filter(s=>s.sem2Grade>0).reduce((a,s)=>a+s.sem2Grade,0)/filtered.filter(s=>s.sem2Grade>0).length).toFixed(2) : 'N/A'} / 20</div>
          <div class="kpi-card-subtext">Average within this band</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Debtors in Band</div>
          <div class="kpi-card-value" style="color:#f59e0b;">${filtered.filter(s=>s.debtor===1).length}</div>
          <div class="kpi-card-subtext">Tuition balance outstanding</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Scholarship Holders</div>
          <div class="kpi-card-value" style="color:#10b981;">${filtered.filter(s=>s.scholarship===1).length}</div>
          <div class="kpi-card-subtext">Receiving financial support</div>
        </div>
        ` : `
        <div class="kpi-card">
          <div class="kpi-card-label">Avg CGPA</div>
          <div class="kpi-card-value">${filtered.length ? (filtered.reduce((a,s)=>a+parseFloat(s.cgpa||0),0)/filtered.length).toFixed(2) : 'N/A'}</div>
          <div class="kpi-card-subtext">Average within this band</div>
        </div>
        `}
      </div>

      <!-- Performance Note -->
      <div class="alert alert-info" style="margin-bottom:20px;font-size:0.82rem;">
        <strong>Classification Method:</strong>
        ${isUci
          ? `Students classified by 2nd Semester Grade (0-20 scale) converted to percentage.
             High &ge; ${window.PerfConfig.highThreshold}% | Medium ${window.PerfConfig.medLow}%-${window.PerfConfig.highThreshold - 0.1}% | At-Risk < ${window.PerfConfig.medLow}%.
             Students with zero 2nd-semester grades are classified At-Risk. This is a heuristic rule, not an official grading outcome.`
          : `Classified by CGPA. High &ge; 3.5 | Medium 2.5-3.49 | At-Risk < 2.5.`
        }
      </div>

      <!-- Student Table -->
      <div class="app-card" style="margin-bottom:24px;">
        <div class="app-card-header">
          <div class="app-card-title">${title} - Student Records (${total.toLocaleString()} results)</div>
          <input type="text" class="form-input" style="max-width:260px;padding:6px 12px;font-size:13px;"
            placeholder="Search within results..."
            oninput="window.filterPerfBandTable(this.value, '${band}')">
        </div>
        <div class="table-responsive">
          <table class="app-table" id="perf-band-table-${band}">
            <thead>
              <tr>
                <th>ID</th>
                <th>${isUci ? 'Name (Demo)' : 'Student Name'}</th>
                <th>${isUci ? 'Course / Program' : 'Department'}</th>
                <th>${isUci ? 'Outcome' : 'Sem'}</th>
                <th>${isUci ? '2nd Sem Grade' : 'CGPA'}</th>
                <th>${isUci ? 'Financial' : 'Attendance'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="perf-band-tbody-${band}">
              ${renderPerfBandRows(filtered, isUci, band)}
            </tbody>
          </table>
        </div>
        ${total > 50 ? `<div style="padding:10px 18px;font-size:0.8rem;color:var(--text-muted);">Showing first 50 of ${total.toLocaleString()} records. Use Export CSV for the full list.</div>` : ''}
      </div>
    `;
  }

  function renderPerfBandRows(students, isUci, band) {
    const shown = students.slice(0, 50);
    if (!shown.length) return `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">No students in this performance band.</td></tr>`;

    return shown.map(s => {
      const id = isUci ? s.id : s.id;
      const outcome = isUci
        ? `<span class="badge ${s.target==='Graduate'?'badge-success':s.target==='Dropout'?'badge-danger':'badge-primary'}">${s.target}</span>`
        : `Sem ${s.currentSemester || '-'}`;
      const metric = isUci
        ? (s.sem2Grade > 0 ? `${s.sem2Grade.toFixed(2)}/20` : '<span style="color:#94a3b8;">N/A</span>')
        : s.cgpa || '-';
      const financial = isUci
        ? (s.debtor ? '<span style="color:#ef4444;">Debtor</span>' : s.scholarship ? '<span style="color:#10b981;">Scholar</span>' : 'Regular')
        : (s.attendance ? s.attendance + '%' : '-');
      const name = isUci ? `${s.name} <span class="badge badge-outline" style="font-size:0.6rem;">Demo</span>` : (s.name || '-');
      const dept = isUci ? `<span style="font-size:0.82rem;">${s.courseName}</span>` : (s.department || '-');

      return `
        <tr>
          <td style="font-weight:700;font-size:0.85rem;">${isUci ? s.studentId : s.studentId || s.id}</td>
          <td>${name}</td>
          <td>${dept}</td>
          <td>${outcome}</td>
          <td style="font-weight:600;">${metric}</td>
          <td>${financial}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="window.openFullStudentProfile(${id})" title="View full profile">
              &#128065;&#65039; View
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.filterPerfBandTable = function (query, band) {
    const tbody = document.getElementById(`perf-band-tbody-${band}`);
    if (!tbody) return;
    const q = query.toLowerCase();
    tbody.querySelectorAll('tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  window.exportPerformanceBandCSV = function (band) {
    const isUci = window.getActiveDataset && window.getActiveDataset() === 'uci';
    const data = isUci ? (window.UCI_STUDENTS_DATA || []) : (window.studentsData || []);
    const filtered = data.filter(s => classifyStudent(s) === band);

    const headers = isUci
      ? ['student_id', 'name_demo', 'course', 'outcome', 'sem1_grade', 'sem2_grade', 'admission_grade', 'debtor', 'scholarship']
      : ['student_id', 'name', 'department', 'cgpa', 'attendance', 'semester'];

    const rows = filtered.map(s => isUci
      ? [s.studentId, `"${s.name}"`, `"${s.courseName}"`, s.target, s.sem1Grade, s.sem2Grade, s.admGrade, s.debtor, s.scholarship]
      : [s.studentId || s.id, `"${s.name || ''}"`, `"${s.department || ''}"`, s.cgpa, s.attendance, s.currentSemester]
    );

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `${band}_performers_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    window.showToast && window.showToast(`Exported ${filtered.length} ${band}-performance records`, 'success');
  };

  /* =========================================================
     3. NAVIGATION - WIRE NEW PAGES INTO switchPage
     ========================================================= */
  function patchSwitchPage() {
    const prev = window.switchPage;
    window.switchPage = function (pageId) {
      // Show the section page-view if it exists
      document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('page-' + pageId);
      if (target) target.classList.add('active');

      // Call the original chain
      if (typeof prev === 'function') prev(pageId);

      // Handle new pages
      if (pageId === 'high-performers') {
        ensurePerformancePage();
        renderPerformanceFilterPage('high', 'high-performers-content', 'High Performers', 'Students achieving &ge; 80% on 2nd Semester Grade (0-20 scale)', '#10b981');
      } else if (pageId === 'medium-performers') {
        ensurePerformancePage();
        renderPerformanceFilterPage('medium', 'medium-performers-content', 'Medium Performers', 'Students achieving 60%-79% on 2nd Semester Grade', '#f59e0b');
      } else if (pageId === 'at-risk-detail') {
        ensurePerformancePage();
        renderAtRiskDetailPage();
      } else if (pageId === 'automation') {
        ensurePerformancePage();
        renderAutomationPage();
      }
    };
  }

  /* =========================================================
     4. AT-RISK DETAIL PAGE
     ========================================================= */
  function renderAtRiskDetailPage() {
    const container = document.getElementById('at-risk-detail-content');
    if (!container) return;

    const isUci = window.getActiveDataset && window.getActiveDataset() === 'uci';
    const data = isUci ? (window.UCI_STUDENTS_DATA || []) : (window.studentsData || []);
    const atRisk = data.filter(s => classifyStudent(s) === 'at-risk');

    // Further breakdown
    const zeroGrade = atRisk.filter(s => (s.sem2Grade || 0) === 0 && (s.sem1Grade || 0) === 0);
    const debtors   = atRisk.filter(s => s.debtor === 1);
    const noFees    = atRisk.filter(s => s.tuitionUpToDate === 0);
    const zeroUnits = atRisk.filter(s => (s.sem1App || 0) === 0 && (s.sem2App || 0) === 0);

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:0 0 4px 0;">&#9888;&#65039; At-Risk Student Monitor</h2>
          <div style="font-size:0.88rem;color:var(--text-muted);">Early warning system - students requiring academic or financial intervention</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Dashboard</button>
          <button class="btn btn-primary btn-sm" onclick="window.exportPerformanceBandCSV('at-risk')">Export At-Risk CSV</button>
        </div>
      </div>

      <!-- Risk KPIs -->
      <div class="kpi-metrics-grid" style="margin-bottom:24px;">
        <div class="kpi-card" style="border-top:3px solid #ef4444;">
          <div class="kpi-card-label">Total At-Risk</div>
          <div class="kpi-card-value" style="color:#ef4444;">${atRisk.length.toLocaleString()}</div>
          <div class="kpi-card-subtext">${((atRisk.length / (data.length||1)) * 100).toFixed(1)}% of cohort</div>
        </div>
        <div class="kpi-card" style="border-top:3px solid #ef4444;">
          <div class="kpi-card-label">Zero Academic Activity</div>
          <div class="kpi-card-value" style="color:#ef4444;">${zeroGrade.length.toLocaleString()}</div>
          <div class="kpi-card-subtext">No semester grades recorded</div>
        </div>
        <div class="kpi-card" style="border-top:3px solid #f59e0b;">
          <div class="kpi-card-label">Tuition Debtors (At-Risk)</div>
          <div class="kpi-card-value" style="color:#f59e0b;">${debtors.length.toLocaleString()}</div>
          <div class="kpi-card-subtext">Outstanding fee balance</div>
        </div>
        <div class="kpi-card" style="border-top:3px solid #f59e0b;">
          <div class="kpi-card-label">Fees Overdue (At-Risk)</div>
          <div class="kpi-card-value" style="color:#f59e0b;">${noFees.length.toLocaleString()}</div>
          <div class="kpi-card-subtext">Tuition not up to date</div>
        </div>
        <div class="kpi-card" style="border-top:3px solid #8b5cf6;">
          <div class="kpi-card-label">Zero Units Approved</div>
          <div class="kpi-card-value" style="color:#8b5cf6;">${zeroUnits.length.toLocaleString()}</div>
          <div class="kpi-card-subtext">No curricular units completed</div>
        </div>
      </div>

      <!-- Risk Methodology -->
      <div class="alert alert-warning" style="margin-bottom:20px;font-size:0.82rem;">
        <strong>Risk Classification Criteria (Rule-Based Heuristic - Not ML):</strong>
        At-Risk = 2nd Semester Grade converts to &lt; ${window.PerfConfig.medLow}% OR both sem1 and sem2 grade = 0.
        Risk indicators: tuition debt (+30 pts), fees overdue (+25 pts), zero sem1 approvals (+30 pts), zero sem2 approvals (+30 pts), sem1 grade &lt; 10/20 (+15 pts).
        <em>Correlation does not imply causation. These are administrative indicators only.</em>
      </div>

      <!-- Risk Priority Table -->
      <div class="app-card" style="margin-bottom:24px;">
        <div class="app-card-header">
          <div class="app-card-title">Priority Intervention List - ${atRisk.length.toLocaleString()} Students</div>
          <input type="text" class="form-input" style="max-width:260px;padding:6px 12px;font-size:13px;"
            placeholder="Search at-risk records..."
            oninput="window.filterPerfBandTable(this.value, 'at-risk')">
        </div>
        <div class="table-responsive">
          <table class="app-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name (Demo)</th>
                <th>Course</th>
                <th>Outcome</th>
                <th>2nd Sem Grade</th>
                <th>Risk Indicators</th>
                <th>Risk Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="perf-band-tbody-at-risk">
              ${renderAtRiskRows(atRisk.slice(0, 60))}
            </tbody>
          </table>
        </div>
        ${atRisk.length > 60 ? `<div style="padding:10px 18px;font-size:0.8rem;color:var(--text-muted);">Showing first 60 of ${atRisk.length.toLocaleString()} records. Export for full list.</div>` : ''}
      </div>
    `;
  }

  function renderAtRiskRows(students) {
    if (!students.length) return `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">No at-risk students found.</td></tr>`;

    return students.map(s => {
      const risks = [];
      let score = 0;
      if (s.debtor === 1) { risks.push('Debtor'); score += 30; }
      if (s.tuitionUpToDate === 0) { risks.push('Fees Overdue'); score += 25; }
      if ((s.sem1Enr||0) > 0 && (s.sem1App||0) === 0) { risks.push('Sem1 Zero Pass'); score += 30; }
      if ((s.sem2Enr||0) > 0 && (s.sem2App||0) === 0) { risks.push('Sem2 Zero Pass'); score += 30; }
      if ((s.sem1Grade||0) > 0 && s.sem1Grade < 10) { risks.push('Low Sem1'); score += 15; }
      if (risks.length === 0) risks.push('Low Grade');

      const scoreColor = score >= 50 ? '#ef4444' : score >= 25 ? '#f59e0b' : '#94a3b8';
      const riskBadges = risks.map(r => `<span class="badge badge-danger" style="font-size:0.65rem;margin-right:2px;">${r}</span>`).join('');

      return `
        <tr>
          <td style="font-weight:700;">${s.studentId}</td>
          <td>${s.name} <span class="badge badge-outline" style="font-size:0.6rem;">Demo</span></td>
          <td style="font-size:0.82rem;">${s.courseName}</td>
          <td><span class="badge ${s.target==='Graduate'?'badge-success':s.target==='Dropout'?'badge-danger':'badge-primary'}">${s.target}</span></td>
          <td style="color:${(s.sem2Grade||0) === 0 ? '#ef4444' : '#f59e0b'};font-weight:600;">${(s.sem2Grade||0) > 0 ? s.sem2Grade.toFixed(2) : '0.00'} / 20</td>
          <td>${riskBadges}</td>
          <td><span style="font-weight:700;color:${scoreColor};">${score}/100</span></td>
          <td><button class="btn btn-outline btn-sm" onclick="window.openFullStudentProfile(${s.id})">&#128065;&#65039; Profile</button></td>
        </tr>
      `;
    }).join('');
  }

  /* =========================================================
     5. n8n WORKFLOW AUTOMATION PAGE
     ========================================================= */
  function renderAutomationPage() {
    const container = document.getElementById('automation-content');
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:0 0 4px 0;">&#9889; Workflow Automation (n8n Integration)</h2>
          <div style="font-size:0.88rem;color:var(--text-muted);">Configure n8n workflows for attendance alerts, academic reports, and AI-assisted insights</div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-outline btn-sm" onclick="window.switchPage('dashboard')">&#8592; Dashboard</button>
          <button class="btn btn-primary btn-sm" onclick="window.testN8nConnection()">Test n8n Connection</button>
        </div>
      </div>

      <!-- n8n Connection Status -->
      <div class="app-card" style="margin-bottom:24px;">
        <div class="app-card-header">
          <div class="app-card-title">n8n Server Connection</div>
          <span class="badge badge-warning" id="n8n-status-badge">Not Configured</span>
        </div>
        <div class="app-card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group">
              <label>n8n Server URL</label>
              <input type="url" class="form-input" id="n8n-server-url"
                placeholder="http://localhost:5678"
                value="${localStorage.getItem('n8n_url') || ''}">
            </div>
            <div class="form-group">
              <label>API Key (if authentication enabled)</label>
              <input type="password" class="form-input" id="n8n-api-key"
                placeholder="n8n API key or leave blank"
                value="${localStorage.getItem('n8n_key') ? '********' : ''}">
            </div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="window.saveN8nConfig()">Save Configuration</button>
            <button class="btn btn-outline btn-sm" onclick="window.testN8nConnection()">Test Connection</button>
          </div>
          <div id="n8n-test-result" style="margin-top:12px;font-size:0.83rem;"></div>
          <div style="margin-top:12px;padding:10px;background:var(--color-slate-50);border-radius:6px;font-size:0.8rem;color:var(--text-muted);">
            <strong>Setup:</strong> Install n8n locally with <code>npm install -g n8n</code> then run <code>n8n start</code>.
            The dashboard will connect to your local n8n instance to trigger automation workflows.
            No external server or paid subscription is required for local operation.
          </div>
        </div>
      </div>

      <!-- Available Workflows -->
      <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:16px;">Available Automation Workflows</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-bottom:24px;">

        ${renderWorkflowCard('A', 'Attendance Alert System', '&#128276;',
          'Monitors student attendance and triggers alerts when below the configured threshold (default 75%).',
          ['Check attendance records', 'Calculate percentage', 'Skip already-alerted students', 'Create dashboard notification', 'Optional: email advisory staff'],
          'attendance-alert', '#ef4444')}

        ${renderWorkflowCard('B', 'Academic Performance Alert', '&#128201;',
          'Detects meaningful performance declines or missing assessments and notifies authorized staff.',
          ['Scan semester grade records', 'Detect declines vs. prior period', 'Identify missing assessments', 'Generate evidence-based summary', 'Log workflow result'],
          'academic-alert', '#f59e0b')}

        ${renderWorkflowCard('C', 'Scheduled Analytics Reports', '&#128202;',
          'Generates daily, weekly, or monthly reports with enrollment totals, attendance summaries, and risk indicators.',
          ['Calculate current metrics from CSV', 'Build HTML/PDF report', 'Include data-quality warnings', 'Save to reports folder', 'Optional: send via email or webhook'],
          'scheduled-report', '#3b82f6')}

        ${renderWorkflowCard('D', 'CSV Data Import Pipeline', '&#128193;',
          'Automates CSV validation, duplicate detection, and import preparation before bulk data changes.',
          ['Watch for new CSV uploads', 'Validate headers and data types', 'Detect duplicates', 'Preview import summary', 'Require staff confirmation'],
          'csv-import', '#8b5cf6')}

        ${renderWorkflowCard('E', 'AI Academic Assistant', '&#129302;',
          'Connects the dashboard AI assistant to an n8n workflow that queries your data and returns analytical insights.',
          ['Receive question from dashboard', 'Query relevant student records', 'Pass context to AI model (optional)', 'Return structured insight', 'Display in AI Assistant panel'],
          'ai-assistant', '#10b981')}

        ${renderWorkflowCard('F', 'Biometric Sync Processor', '&#128400;&#65039;',
          'Processes attendance events from a biometric device connector and updates student attendance records.',
          ['Receive device events via webhook', 'Verify student identity', 'Deduplicate events', 'Write attendance record', 'Update dashboard in real time'],
          'biometric-sync', '#0ea5e9')}

      </div>

      <!-- Workflow Execution Log -->
      <div class="app-card" style="margin-bottom:24px;">
        <div class="app-card-header">
          <div class="app-card-title">Workflow Execution Log</div>
          <button class="btn btn-outline btn-sm" onclick="window.clearAutomationLog()">Clear Log</button>
        </div>
        <div class="table-responsive">
          <table class="app-table">
            <thead><tr><th>Timestamp</th><th>Workflow</th><th>Status</th><th>Summary</th></tr></thead>
            <tbody id="automation-log-tbody">
              ${renderAutomationLog()}
            </tbody>
          </table>
        </div>
      </div>

      <!-- n8n Setup Guide -->
      <div class="app-card" style="padding:20px;">
        <div class="app-card-title" style="margin-bottom:14px;">&#128216; n8n Setup Guide (Local Installation)</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.8;">
          <ol style="margin:0;padding-left:20px;">
            <li><strong>Install n8n:</strong> Open terminal and run <code style="background:var(--color-slate-100);padding:1px 6px;border-radius:3px;">npm install -g n8n</code></li>
            <li><strong>Start n8n:</strong> Run <code style="background:var(--color-slate-100);padding:1px 6px;border-radius:3px;">n8n start</code> - it will open at <code>http://localhost:5678</code></li>
            <li><strong>Import workflows:</strong> In n8n, go to Workflows -> Import -> paste the workflow JSON for each automation above</li>
            <li><strong>Configure webhooks:</strong> Each workflow exposes a webhook URL - paste it into the corresponding field above</li>
            <li><strong>Connect dashboard:</strong> Enter your n8n URL above and save. Click "Test Connection" to verify</li>
            <li><strong>Activate workflows:</strong> Toggle each workflow to Active in n8n before triggering from the dashboard</li>
          </ol>
          <div style="margin-top:12px;padding:10px;background:rgba(59,130,246,0.07);border-radius:6px;">
            <strong>Note:</strong> n8n workflows run on your local machine. No cloud subscription required.
            For email alerts, configure an SMTP node inside n8n with your mail provider credentials.
            The dashboard connects to n8n via HTTP webhooks - no additional plugins needed.
          </div>
        </div>
      </div>
    `;
  }

  function renderWorkflowCard(letter, name, icon, desc, steps, id, color) {
    const webhookKey = `n8n_webhook_${id}`;
    const savedWebhook = localStorage.getItem(webhookKey) || '';
    const lastRun = localStorage.getItem(`n8n_lastrun_${id}`) || 'Never';
    const lastStatus = localStorage.getItem(`n8n_status_${id}`) || 'idle';
    const statusColor = lastStatus === 'success' ? '#10b981' : lastStatus === 'error' ? '#ef4444' : '#94a3b8';

    return `
      <div class="app-card" style="border-top:3px solid ${color};">
        <div style="padding:16px 18px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="font-size:1.5rem;">${icon}</span>
            <div>
              <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary);">Workflow ${letter}: ${name}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">Last run: ${lastRun} &bull; <span style="color:${statusColor};">&#9679;</span> ${lastStatus}</div>
            </div>
          </div>
          <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:10px;line-height:1.5;">${desc}</p>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px;">
            <strong>Steps:</strong> ${steps.map((s, i) => `${i+1}. ${s}`).join(' -> ')}
          </div>
          <div class="form-group" style="margin-bottom:10px;">
            <label style="font-size:11.5px;font-weight:600;color:var(--text-muted);">Webhook URL (from n8n)</label>
            <input type="url" class="form-input" id="webhook-${id}" placeholder="http://localhost:5678/webhook/..."
              value="${savedWebhook}" style="font-size:12px;padding:6px 10px;">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="window.triggerWorkflow('${id}', '${name}')">&#9654; Trigger Now</button>
            <button class="btn btn-outline btn-sm" onclick="window.saveWorkflowWebhook('${id}')">&#128190; Save Webhook</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderAutomationLog() {
    const log = JSON.parse(localStorage.getItem('automation_log') || '[]');
    if (!log.length) return `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">No workflow executions logged yet.</td></tr>`;
    return log.slice(0, 20).reverse().map(entry => `
      <tr>
        <td style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;">${entry.ts}</td>
        <td style="font-weight:600;">${entry.workflow}</td>
        <td><span class="badge ${entry.status === 'success' ? 'badge-success' : entry.status === 'error' ? 'badge-danger' : 'badge-warning'}">${entry.status}</span></td>
        <td style="font-size:0.82rem;">${entry.summary}</td>
      </tr>
    `).join('');
  }

  window.saveN8nConfig = function () {
    const url = document.getElementById('n8n-server-url')?.value?.trim();
    const key = document.getElementById('n8n-api-key')?.value?.trim();
    if (url) localStorage.setItem('n8n_url', url);
    if (key && key !== '********') localStorage.setItem('n8n_key', key);
    window.showToast && window.showToast('n8n configuration saved', 'success');
  };

  window.testN8nConnection = async function () {
    const url = localStorage.getItem('n8n_url') || document.getElementById('n8n-server-url')?.value?.trim();
    const result = document.getElementById('n8n-test-result');
    const badge = document.getElementById('n8n-status-badge');
    if (!url) {
      if (result) result.innerHTML = `<span style="color:#ef4444;">&#9888;&#65039; Enter n8n server URL first.</span>`;
      return;
    }
    if (result) result.innerHTML = `<span style="color:#64748b;">Testing connection to ${url}...</span>`;
    try {
      const resp = await fetch(`${url}/healthz`, { mode: 'cors', signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        if (result) result.innerHTML = `<span style="color:#10b981;">&#9989; Connected to n8n at ${url}</span>`;
        if (badge) { badge.textContent = 'Connected'; badge.className = 'badge badge-success'; }
      } else {
        throw new Error(`HTTP ${resp.status}`);
      }
    } catch (e) {
      if (result) result.innerHTML = `<span style="color:#ef4444;">&#10060; Could not connect: ${e.message}. Ensure n8n is running at ${url}</span>`;
      if (badge) { badge.textContent = 'Connection Failed'; badge.className = 'badge badge-danger'; }
    }
  };

  window.saveWorkflowWebhook = function (id) {
    const inp = document.getElementById(`webhook-${id}`);
    if (inp) { localStorage.setItem(`n8n_webhook_${id}`, inp.value.trim()); }
    window.showToast && window.showToast('Webhook URL saved', 'success');
  };

  window.triggerWorkflow = async function (id, name) {
    const webhook = localStorage.getItem(`n8n_webhook_${id}`) || document.getElementById(`webhook-${id}`)?.value?.trim();
    if (!webhook) {
      window.showToast && window.showToast(`Set and save the webhook URL for "${name}" first`, 'warning');
      return;
    }

    window.showToast && window.showToast(`Triggering workflow: ${name}...`, 'info');

    // Build payload from current dashboard data
    const data = window.UCI_STUDENTS_DATA || [];
    const payload = {
      trigger: 'manual',
      workflow: id,
      source: 'StudentDashboard',
      timestamp: new Date().toISOString(),
      summary: {
        totalStudents: data.length,
        graduates: data.filter(s => s.target === 'Graduate').length,
        dropouts: data.filter(s => s.target === 'Dropout').length,
        debtors: data.filter(s => s.debtor === 1).length,
        atRisk: data.filter(s => classifyStudent(s) === 'at-risk').length,
      }
    };

    try {
      const resp = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
        mode: 'cors',
      });
      const status = resp.ok ? 'success' : 'error';
      const summary = resp.ok ? `Workflow triggered successfully (HTTP ${resp.status})` : `HTTP ${resp.status} - check n8n logs`;
      localStorage.setItem(`n8n_lastrun_${id}`, new Date().toLocaleString());
      localStorage.setItem(`n8n_status_${id}`, status);
      logAutomationRun(name, status, summary);
      window.showToast && window.showToast(summary, resp.ok ? 'success' : 'error');
    } catch (e) {
      const summary = `Failed: ${e.message}`;
      localStorage.setItem(`n8n_lastrun_${id}`, new Date().toLocaleString());
      localStorage.setItem(`n8n_status_${id}`, 'error');
      logAutomationRun(name, 'error', summary);
      window.showToast && window.showToast(`Workflow error: ${e.message}`, 'error');
    }

    // Re-render log
    const tbody = document.getElementById('automation-log-tbody');
    if (tbody) tbody.innerHTML = renderAutomationLog();
  };

  function logAutomationRun(workflow, status, summary) {
    const log = JSON.parse(localStorage.getItem('automation_log') || '[]');
    log.push({ ts: new Date().toLocaleString(), workflow, status, summary });
    if (log.length > 100) log.splice(0, log.length - 100);
    localStorage.setItem('automation_log', JSON.stringify(log));
  }

  window.clearAutomationLog = function () {
    localStorage.removeItem('automation_log');
    const tbody = document.getElementById('automation-log-tbody');
    if (tbody) tbody.innerHTML = renderAutomationLog();
    window.showToast && window.showToast('Automation log cleared', 'info');
  };

  /* =========================================================
     6. ENHANCED SIDEBAR NAV ITEMS
     ========================================================= */
  function injectSidebarNavItems() {
    // Find the existing nav section
    const sidebar = document.querySelector('.app-sidebar .sidebar-nav') || document.querySelector('.app-sidebar');
    if (!sidebar) return;

    // Check if already injected
    if (document.getElementById('nav-item-high-performers')) return;

    // Find 'Students' nav container to insert performance items after it
    const studentsSubmenu = document.getElementById('students-submenu');
    const studentsNav = studentsSubmenu || document.getElementById('nav-item-students') || document.querySelector('[data-page="students"]');
    if (!studentsNav) return;

    const perfNav = document.createElement('div');
    perfNav.innerHTML = `
      <div class="nav-item" id="nav-item-high-performers" data-page="high-performers"
        onclick="window.switchPage('high-performers')" title="High Performers (&ge;80%)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span style="color:#10b981;">High Performers</span>
      </div>
      <div class="nav-item" id="nav-item-medium-performers" data-page="medium-performers"
        onclick="window.switchPage('medium-performers')" title="Medium Performers (60-79%)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style="color:#f59e0b;">Medium Performers</span>
      </div>
      <div class="nav-item" id="nav-item-at-risk-detail" data-page="at-risk-detail"
        onclick="window.switchPage('at-risk-detail')" title="At-Risk Students">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span style="color:#ef4444;">At-Risk Students</span>
      </div>
    `;
    studentsNav.parentNode.insertBefore(perfNav, studentsNav.nextSibling);

    // Inject Automation nav near bottom
    const auditNav = document.getElementById('nav-item-audit-logs');
    if (auditNav) {
      const autoNav = document.createElement('div');
      autoNav.className = 'nav-item';
      autoNav.id = 'nav-item-automation';
      autoNav.setAttribute('data-page', 'automation');
      autoNav.setAttribute('onclick', "window.switchPage('automation')");
      autoNav.title = 'n8n Workflow Automation';
      autoNav.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span>Automation</span>
      `;
      auditNav.parentNode.insertBefore(autoNav, auditNav);
    }
  }

  /* =========================================================
     7. TOUCHSCREEN ENHANCEMENTS
     ========================================================= */
  function applyTouchEnhancements() {
    // Ensure all buttons have min touch target
    const style = document.createElement('style');
    style.id = 'touch-enhancements';
    style.textContent = `
      .btn { min-height: 36px; }
      .btn-sm { min-height: 32px; }
      .nav-item { min-height: 44px; padding: 10px 16px; }
      .kpi-card { min-height: 90px; }
      .form-input, .filter-select { min-height: 38px; }
      .app-table td, .app-table th { padding: 12px 14px; }
      @media (pointer: coarse) {
        .btn { min-height: 44px; padding: 10px 20px; }
        .btn-sm { min-height: 40px; padding: 9px 16px; }
        .nav-item { min-height: 52px; }
        .kpi-card { cursor: pointer; }
        .kpi-card:active { transform: scale(0.97); }
        .app-table td { padding: 14px; }
        .filter-select, .form-input { min-height: 44px; font-size: 16px; }
      }
    `;
    if (!document.getElementById('touch-enhancements')) {
      document.head.appendChild(style);
    }
  }

  /* =========================================================
     8. REAL-TIME DASHBOARD REFRESH
     ========================================================= */
  window.refreshDashboardMetrics = function () {
    const dataset = window.getActiveDataset ? window.getActiveDataset() : 'institutional';
    if (dataset === 'uci') {
      window.renderUciDashboard && window.renderUciDashboard();
      window.renderCollegeDepartmentCards && window.renderCollegeDepartmentCards();
      window.renderExecutiveSummary && window.renderExecutiveSummary();
    } else {
      if (typeof computeDashboardMetrics === 'function') computeDashboardMetrics();
    }
    const lastUpdated = document.getElementById('dashboard-last-updated');
    if (lastUpdated) lastUpdated.textContent = 'Updated: ' + new Date().toLocaleTimeString();
  };

  // Auto-refresh every 60 seconds if on dashboard
  setInterval(() => {
    const active = document.querySelector('.page-view.active');
    if (active && active.id === 'page-dashboard') {
      window.refreshDashboardMetrics();
    }
  }, 60000);

  /* =========================================================
     9. DASHBOARD LAST-UPDATED TIMESTAMP WIDGET
     ========================================================= */
  function injectLastUpdatedWidget() {
    const kpiGrid = document.getElementById('widget-kpi-cards');
    if (!kpiGrid || document.getElementById('dashboard-last-updated')) return;
    const widget = document.createElement('div');
    widget.style.cssText = 'font-size:11.5px;color:var(--text-muted);text-align:right;margin-bottom:8px;grid-column:1/-1;';
    widget.id = 'dashboard-last-updated';
    widget.textContent = 'Updated: ' + new Date().toLocaleTimeString();
    kpiGrid.before(widget);
  }

  /* =========================================================
     10. ENHANCED SETTINGS PAGE
     ========================================================= */
  window.renderWorldClassSettings = function () {
    const container = document.getElementById('page-settings');
    if (!container) return;

    // Find or create settings inner content
    let inner = document.getElementById('wcs-settings-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.id = 'wcs-settings-inner';
      container.appendChild(inner);
    }

    inner.innerHTML = `
      <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:0 0 20px 0;">&#9881;&#65039; System Settings</h2>

      <!-- Performance Classification Thresholds -->
      <div class="app-card" style="margin-bottom:20px;">
        <div class="app-card-header">
          <div class="app-card-title">Performance Classification Thresholds</div>
          <span class="badge badge-info">Admin Only</span>
        </div>
        <div class="app-card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:14px;">
            <div class="form-group">
              <label>High Performance (&ge; this %)</label>
              <input type="number" class="form-input" id="cfg-high" min="1" max="100" value="${window.PerfConfig.highThreshold}">
            </div>
            <div class="form-group">
              <label>Medium Performance (&ge; this %)</label>
              <input type="number" class="form-input" id="cfg-med" min="1" max="100" value="${window.PerfConfig.medLow}">
            </div>
            <div class="form-group">
              <label>Attendance Risk Threshold (%)</label>
              <input type="number" class="form-input" id="cfg-attend" min="1" max="100" value="${window.PerfConfig.attendanceRisk}">
            </div>
          </div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">
            Grade scale: 0-20 (UCI dataset). Classification converts grade to percentage: (grade / 20) x 100.
            At-Risk = below medium threshold OR both semester grades = 0.
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.savePerformanceConfig()">Save Thresholds</button>
        </div>
      </div>

      <!-- Theme -->
      <div class="app-card" style="margin-bottom:20px;">
        <div class="app-card-header"><div class="app-card-title">Interface Theme</div></div>
        <div class="app-card-body">
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="window.toggleTheme && window.toggleTheme('light')">&#9728;&#65039; Light Mode</button>
            <button class="btn btn-outline btn-sm" onclick="window.toggleTheme && window.toggleTheme('dark')">&#127769; Dark Mode</button>
            <button class="btn btn-outline btn-sm" onclick="window.toggleTheme && window.toggleTheme('high-contrast')">&#11035; High Contrast</button>
          </div>
        </div>
      </div>

      <!-- Dataset Selector -->
      <div class="app-card" style="margin-bottom:20px;">
        <div class="app-card-header"><div class="app-card-title">Active Dataset</div></div>
        <div class="app-card-body">
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            <button class="btn btn-primary btn-sm" onclick="window.switchActiveDataset && window.switchActiveDataset('uci')">UCI Dataset (4,424 Records)</button>
            <button class="btn btn-outline btn-sm" onclick="window.switchActiveDataset && window.switchActiveDataset('institutional')">Institutional Dataset (120 Students)</button>
          </div>
          <div style="font-size:0.8rem;color:var(--text-muted);">
            UCI = Predict Students' Dropout and Academic Success (Realinho et al., 2021, DOI: 10.24432/C5MC89, CC BY 4.0).
            Institutional = 120-student Govt. Degree College No. 1, D.I. Khan demo cohort.
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="app-card" style="margin-bottom:20px;">
        <div class="app-card-header"><div class="app-card-title">Data Management</div></div>
        <div class="app-card-body">
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="window.exportUciDataCSV && window.exportUciDataCSV()">Export UCI CSV (4,424)</button>
            <button class="btn btn-outline btn-sm" onclick="window.exportDatabaseAsCsv && window.exportDatabaseAsCsv()">Export Institutional CSV</button>
            <button class="btn btn-outline btn-sm" onclick="window.switchPage('reports')">View Reports Page</button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="app-card" style="padding:18px;">
        <div class="app-card-title" style="margin-bottom:10px;">&#8505;&#65039; About This System</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.7;">
          <div><strong>Project:</strong> Student Performance & Attendance Analytics Dashboard</div>
          <div><strong>Institution:</strong> Govt. Degree College No. 1, Dera Ismail Khan</div>
          <div><strong>Department:</strong> Computer Science</div>
          <div><strong>Author:</strong> Imran (Roll No: CS-2210)</div>
          <div><strong>Supervisor:</strong> Prof. Abdur Rehman</div>
          <div><strong>Programme:</strong> BS Computer Science Final Year Project (2022-2026)</div>
          <div><strong>Architecture:</strong> Zero-DB | LocalStorage + CSV | 100% Offline Capable</div>
          <div><strong>UCI Dataset:</strong> Realinho, V. et al. (2021). DOI: 10.24432/C5MC89. CC BY 4.0</div>
        </div>
      </div>
    `;
  };

  window.savePerformanceConfig = function () {
    const high = parseInt(document.getElementById('cfg-high')?.value || 80);
    const med  = parseInt(document.getElementById('cfg-med')?.value  || 60);
    const att  = parseInt(document.getElementById('cfg-attend')?.value || 75);
    if (med >= high) { window.showToast && window.showToast('Medium threshold must be lower than High', 'error'); return; }
    window.PerfConfig.highThreshold = high;
    window.PerfConfig.medLow = med;
    window.PerfConfig.attendanceRisk = att;
    localStorage.setItem('perf_config', JSON.stringify(window.PerfConfig));
    window.showToast && window.showToast('Performance thresholds saved. Dashboard will update.', 'success');
    window.refreshDashboardMetrics && window.refreshDashboardMetrics();
  };

  /* =========================================================
     11. LOAD SAVED CONFIG
     ========================================================= */
  function loadSavedConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem('perf_config') || '{}');
      if (saved.highThreshold) window.PerfConfig.highThreshold = saved.highThreshold;
      if (saved.medLow) window.PerfConfig.medLow = saved.medLow;
      if (saved.attendanceRisk) window.PerfConfig.attendanceRisk = saved.attendanceRisk;
    } catch (e) {}
  }

  /* =========================================================
     12. INIT
     ========================================================= */
  function init() {
    loadSavedConfig();
    ensurePerformancePage();
    applyTouchEnhancements();

    // Wire KPI cards after a short delay to let UCI data render first
    setTimeout(() => {
      wireKpiCards();
      injectSidebarNavItems();
      injectLastUpdatedWidget();
    }, 800);

    // Patch switchPage last in the chain
    patchSwitchPage();

    // Enhance settings page when it's visible
    const settingsPage = document.getElementById('page-settings');
    if (settingsPage) {
      const obs = new MutationObserver(() => {
        if (settingsPage.classList.contains('active')) {
          window.renderWorldClassSettings();
        }
      });
      obs.observe(settingsPage, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }

})();
