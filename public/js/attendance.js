/**
 * Attendance & Biometric Integration Engine
 * Student Performance & Attendance Analytics Dashboard
 * Govt. Degree College No. 1, D.I. Khan
 * 
 * Group 4: Advanced Attendance & Biometric Integration
 * Zero-Database CSV Architecture * Offline Operation
 */

const ATTENDANCE_STORAGE_KEY = 'app_attendance_ledger';
const BIOMETRIC_SYNC_KEY = 'app_biometric_last_sync';

// Default statuses
const ATTEND_STATUSES = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
  CUSTOM: 'Duty Leave'
};

let currentRegisterDate = new Date().toISOString().slice(0, 10);
let currentRegisterRecords = [];
let pendingBiometricLogs = [];

// ========================================================
// 1. BIOMETRIC PROVIDER ABSTRACTION INTERFACE
// ========================================================
class BiometricProvider {
  async fetchLogs() { throw new Error('Not implemented'); }
  async testConnection() { throw new Error('Not implemented'); }
  mapUser(deviceUserId) { throw new Error('Not implemented'); }
}

class CSVFileAdapter extends BiometricProvider {
  constructor() { super(); this.name = 'CSVFileAdapter'; }

  async parseLogs(csvText, studentsPool = []) {
    const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return { success: false, error: 'Empty biometric CSV file.' };

    const validLogs = [];
    const errorLogs = [];
    const seenPunches = new Set();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      const deviceUserId = parts[0];
      const rollNo = parts[1];
      const timestamp = parts[2];
      const deviceId = parts[3] || 'BIO-DEV-01';
      const status = parts[5] || 'Present';

      // Validation
      const errs = [];
      if (!deviceUserId) errs.push('Missing device user ID');
      if (!timestamp || isNaN(Date.parse(timestamp))) errs.push('Invalid timestamp format');

      // Check student mapping
      const studentMatch = studentsPool.find(s => s.studentId && s.studentId.toUpperCase() === rollNo.toUpperCase());
      if (!studentMatch) errs.push(`Unmapped student roll number: ${rollNo}`);

      // Duplicate punch detection within same session
      const punchKey = `${rollNo}_${timestamp.slice(0, 10)}`;
      if (seenPunches.has(punchKey)) {
        errs.push(`Duplicate punch detected for ${rollNo} on ${timestamp.slice(0, 10)}`);
      } else {
        seenPunches.add(punchKey);
      }

      if (errs.length === 0) {
        validLogs.push({
          device_user_id: deviceUserId,
          student_id: rollNo,
          student_name: studentMatch.name,
          timestamp,
          device_id: deviceId,
          status
        });
      } else {
        errorLogs.push({ line: i + 1, rollNo, errors: errs });
      }
    }

    return {
      success: true,
      totalLogs: lines.length - 1,
      validLogs,
      errorLogs
    };
  }
}

class HTTPDeviceAdapter extends BiometricProvider {
  constructor(endpoint, apiKey, deviceId) {
    super();
    this.name = 'HTTPDeviceAdapter';
    this.endpoint = endpoint || 'http://192.168.1.201:8080/adms';
    this.apiKey = apiKey || 'DEMO_DEVICE_KEY';
    this.deviceId = deviceId || 'ZKT-GDC1-01';
  }

  async testConnection() {
    // Hardware stub - marked requires device credentials
    return {
      success: false,
      status: 'Requires Biometric Hardware Credentials',
      message: `Cannot reach terminal at ${this.endpoint}. Hardware physical connection required.`,
      fallback: 'CSVFileAdapter is active and fully functional.'
    };
  }
}

// ========================================================
// 2. ATTENDANCE MANAGER CORE LOGIC
// ========================================================
const AttendanceManager = {
  getAll: function() {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  saveRecordBatch: function(records) {
    const list = this.getAll();
    records.forEach(r => {
      // Replace if existing for same student, subject, date
      const idx = list.findIndex(item => item.date === r.date && item.subject_code === r.subject_code && item.student_id === r.student_id);
      if (idx !== -1) {
        list[idx] = r;
      } else {
        r.id = list.length + 1;
        list.push(r);
      }
    });

    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(list));
    return true;
  },

  toCSV: function() {
    const list = this.getAll();
    const headers = ['id', 'date', 'class_name', 'subject_code', 'student_id', 'student_name', 'status', 'marked_by', 'created_at'];
    const rows = list.map(r => [
      r.id, r.date, `"${r.class_name}"`, `"${r.subject_code}"`, `"${r.student_id}"`, `"${r.student_name}"`, `"${r.status}"`, `"${r.marked_by}"`, `"${r.created_at}"`
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  },

  recalculateAttendanceFines: function() {
    const students = window.studentsData || [];
    let updatedCount = 0;
    students.forEach(student => {
      let deficitSubjects = 0;
      if (student.subjects && Array.isArray(student.subjects)) {
        student.subjects.forEach(sub => {
          if (sub.attendance < 75) {
            deficitSubjects++;
            if (!sub.paidFine) {
              sub.unpaidFine = 1000;
              sub.fineStatus = "Danger";
            }
          }
        });
      }
      if (student.overallAttendance < 75 && deficitSubjects === 0) {
        if (!student.totalPaidFine) {
          student.totalUnpaidFine = 1000;
        }
      }
      updatedCount++;
    });
    if (typeof persistDataToStorage === 'function') {
      persistDataToStorage();
    }
    return updatedCount;
  }
};

// ========================================================
// 3. UI CONTROLLER FOR PAGE ATTENDANCE
// ========================================================
window.renderAttendancePage = function() {
  const tbody = document.getElementById('attendance-register-tbody');
  if (!tbody) return;

  const dateInput = document.getElementById('attend-reg-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = currentRegisterDate;
  }

  const selectedClass = document.getElementById('attend-reg-class') ? document.getElementById('attend-reg-class').value : 'BSCS-4th-Morning';
  const selectedSubject = document.getElementById('attend-reg-subject') ? document.getElementById('attend-reg-subject').value : 'CS-401';

  // Filter students enrolled in that class
  const classStudents = (window.studentsData || []).filter(s => s.department === 'Computer Science');
  tbody.innerHTML = '';

  currentRegisterRecords = [];

  classStudents.forEach((s, idx) => {
    const defaultStatus = s.riskStatus === 'Danger' || s.riskStatus === 'At Risk' ? 'Absent' : 'Present';
    currentRegisterRecords.push({
      student_id: s.studentId,
      student_name: s.name,
      status: defaultStatus
    });

    const tr = document.createElement('tr');
    tr.id = `attend-row-${s.studentId}`;
    tr.innerHTML = `
      <td><strong>${s.studentId}</strong></td>
      <td><strong>${s.name}</strong></td>
      <td>${s.department}</td>
      <td><span id="attend-badge-${s.studentId}" class="badge ${defaultStatus === 'Present' ? 'badge-success' : defaultStatus === 'Late' ? 'badge-warning' : 'badge-danger'}">${defaultStatus}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn btn-sm ${defaultStatus === 'Present' ? 'btn-success' : 'btn-outline'}" onclick="setStudentAttendanceStatus('${s.studentId}', 'Present')">P</button>
          <button type="button" class="btn btn-sm ${defaultStatus === 'Absent' ? 'btn-danger' : 'btn-outline'}" onclick="setStudentAttendanceStatus('${s.studentId}', 'Absent')">A</button>
          <button type="button" class="btn btn-sm ${defaultStatus === 'Late' ? 'btn-warning' : 'btn-outline'}" onclick="setStudentAttendanceStatus('${s.studentId}', 'Late')">L</button>
          <button type="button" class="btn btn-sm ${defaultStatus === 'Excused' ? 'btn-secondary' : 'btn-outline'}" onclick="setStudentAttendanceStatus('${s.studentId}', 'Excused')">E</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateAttendanceLiveStats();
  renderAttendanceAnalyticsChart();
};

window.setStudentAttendanceStatus = function(studentId, newStatus) {
  const rec = currentRegisterRecords.find(r => r.student_id === studentId);
  if (rec) {
    rec.status = newStatus;
  }

  const badge = document.getElementById(`attend-badge-${studentId}`);
  if (badge) {
    badge.innerText = newStatus;
    badge.className = `badge ${newStatus === 'Present' ? 'badge-success' : newStatus === 'Late' ? 'badge-warning' : newStatus === 'Excused' ? 'badge-secondary' : 'badge-danger'}`;
  }

  const row = document.getElementById(`attend-row-${studentId}`);
  if (row) {
    const btns = row.querySelectorAll('button');
    btns.forEach(b => {
      b.className = 'btn btn-sm btn-outline';
      if (b.innerText === 'P' && newStatus === 'Present') b.className = 'btn btn-sm btn-success';
      if (b.innerText === 'A' && newStatus === 'Absent') b.className = 'btn btn-sm btn-danger';
      if (b.innerText === 'L' && newStatus === 'Late') b.className = 'btn btn-sm btn-warning';
      if (b.innerText === 'E' && newStatus === 'Excused') b.className = 'btn btn-sm btn-secondary';
    });
  }

  updateAttendanceLiveStats();
};

window.markAllAttendancePresent = function() {
  currentRegisterRecords.forEach(r => {
    window.setStudentAttendanceStatus(r.student_id, 'Present');
  });
  if (typeof showToast === 'function') {
    showToast('All enrolled students marked Present (P). Review exceptions.', 'info');
  }
};

function updateAttendanceLiveStats() {
  const total = currentRegisterRecords.length;
  const presentCount = currentRegisterRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentCount = currentRegisterRecords.filter(r => r.status === 'Absent').length;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '0.0';

  const rateEl = document.getElementById('attend-stat-rate');
  const presentEl = document.getElementById('attend-stat-present');
  const absentEl = document.getElementById('attend-stat-absent');
  if (rateEl) rateEl.innerText = `${rate}%`;
  if (presentEl) presentEl.innerText = `${presentCount} / ${total}`;
  if (absentEl) absentEl.innerText = absentCount;
}

window.saveDailyAttendance = function() {
  const dateVal = document.getElementById('attend-reg-date').value || currentRegisterDate;
  const classVal = document.getElementById('attend-reg-class').value;
  const subjectVal = document.getElementById('attend-reg-subject').value;

  const batch = currentRegisterRecords.map(r => ({
    date: dateVal,
    class_name: classVal,
    subject_code: subjectVal,
    student_id: r.student_id,
    student_name: r.student_name,
    status: r.status,
    marked_by: window.getCurrentAuthUser ? window.getCurrentAuthUser().name : 'Prof. Abdur Rehman',
    created_at: new Date().toISOString()
  }));

  AttendanceManager.saveRecordBatch(batch);

  // Update student attendance rate and check 75% threshold
  batch.forEach(item => {
    const s = (window.studentsData || []).find(st => st.studentId === item.student_id);
    if (s && s.subjects) {
      const sub = s.subjects[0];
      if (sub) {
        if (item.status === 'Absent') {
          sub.attendance = Math.max(50, sub.attendance - 2.5);
        } else if (item.status === 'Present') {
          sub.attendance = Math.min(100, sub.attendance + 1.0);
        }
        sub.fineStatus = sub.attendance < 75 ? "Danger" : "Safe";
        sub.unpaidFine = sub.attendance < 75 ? 1000 : 0;
      }
    }
  });

  if (typeof saveDatabase === 'function') saveDatabase();
  if (typeof computeDashboardMetrics === 'function') computeDashboardMetrics();

  if (typeof showToast === 'function') {
    showToast(`Attendance register for ${classVal} (${dateVal}) saved successfully!`, 'success');
  }
};

window.exportAttendanceCSV = function() {
  const csv = AttendanceManager.toCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `GDC1_Attendance_Register_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof showToast === 'function') {
    showToast('Attendance register CSV exported successfully!', 'success');
  }
};

// ========================================================
// 4. BIOMETRIC CSV IMPORT PIPELINE
// ========================================================
window.openBiometricImportModal = function() {
  pendingBiometricLogs = [];
  const modal = document.getElementById('biometric-import-modal');
  if (modal) {
    document.getElementById('bio-import-file').value = '';
    document.getElementById('bio-diag-summary').style.display = 'none';
    document.getElementById('btn-confirm-bio-import').style.display = 'none';
    modal.classList.add('active');
  }
};

window.closeBiometricImportModal = function() {
  const modal = document.getElementById('biometric-import-modal');
  if (modal) modal.classList.remove('active');
};

window.handleBiometricFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const adapter = new CSVFileAdapter();
  const reader = new FileReader();

  reader.onload = async function(e) {
    const res = await adapter.parseLogs(e.target.result, window.studentsData || []);
    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.error, 'danger');
      return;
    }

    pendingBiometricLogs = res.validLogs;
    document.getElementById('bio-diag-summary').style.display = 'block';
    document.getElementById('bio-total-scanned').innerText = res.totalLogs;
    document.getElementById('bio-valid-punches').innerText = res.validLogs.length;
    document.getElementById('bio-invalid-punches').innerText = res.errorLogs.length;

    const errBox = document.getElementById('bio-error-log-box');
    const errList = document.getElementById('bio-error-list');
    errList.innerHTML = '';

    if (res.errorLogs.length > 0) {
      errBox.style.display = 'block';
      res.errorLogs.forEach(err => {
        const li = document.createElement('li');
        li.innerText = `Line ${err.line} (${err.rollNo || 'Unknown'}): ${err.errors.join('; ')}`;
        errList.appendChild(li);
      });
    } else {
      errBox.style.display = 'none';
    }

    const confirmBtn = document.getElementById('btn-confirm-bio-import');
    if (res.validLogs.length > 0) {
      confirmBtn.style.display = 'inline-block';
      confirmBtn.innerText = `Batch Commit ${res.validLogs.length} Punches`;
    } else {
      confirmBtn.style.display = 'none';
    }
  };

  reader.readAsText(file);
};

window.confirmBiometricImport = function() {
  if (pendingBiometricLogs.length === 0) return;

  const selectedDate = currentRegisterDate;
  pendingBiometricLogs.forEach(log => {
    window.setStudentAttendanceStatus(log.student_id, log.status);
  });

  localStorage.setItem(BIOMETRIC_SYNC_KEY, JSON.stringify({
    timestamp: new Date().toISOString(),
    punchesCount: pendingBiometricLogs.length,
    status: 'Synced via CSVFileAdapter'
  }));

  closeBiometricImportModal();
  updateBiometricStatusWidget();
  if (typeof showToast === 'function') {
    showToast(`Biometric log sync completed! ${pendingBiometricLogs.length} punches registered.`, 'success');
  }
};

function updateBiometricStatusWidget() {
  const syncWidget = document.getElementById('bio-sync-status-text');
  if (!syncWidget) return;

  const raw = localStorage.getItem(BIOMETRIC_SYNC_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    syncWidget.innerText = `Last Sync: ${data.timestamp.slice(0, 16).replace('T', ' ')} (${data.punchesCount} punches)`;
  } else {
    syncWidget.innerText = 'Last Sync: Initialized (CSVFileAdapter Active)';
  }
}

// ========================================================
// 5. ATTENDANCE ANALYTICS CHART
// ========================================================
let attendAnalyticsChartInstance = null;

function renderAttendanceAnalyticsChart() {
  const canvas = document.getElementById('attendanceAnalyticsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (attendAnalyticsChartInstance) {
    attendAnalyticsChartInstance.destroy();
  }

  attendAnalyticsChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [
        {
          label: 'Present %',
          data: [92.0, 88.5, 86.0, 89.2, 84.0, 91.5],
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 4
        },
        {
          label: 'Absent %',
          data: [8.0, 11.5, 14.0, 10.8, 16.0, 8.5],
          backgroundColor: 'rgba(239, 68, 68, 0.85)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, max: 100 }
      }
    }
  });
}

// Global Exports
window.AttendanceManager = AttendanceManager;
window.CSVFileAdapter = CSVFileAdapter;
window.HTTPDeviceAdapter = HTTPDeviceAdapter;
