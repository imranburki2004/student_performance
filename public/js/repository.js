/**
 * Central CSV & Entity Repository Layer
 * Student Performance & Attendance Analytics Dashboard
 * Govt. Degree College No. 1, D.I. Khan
 * 
 * Group 3: Student, Academic & Record Management
 * Storage Rule: Zero SQL database. Primary storage is CSV & LocalStorage cache.
 * Designed with standard Repository Interface for drop-in SQL swap in future.
 */

const STORAGE_KEYS = {
  STUDENTS: 'student_analytics_db',
  TEACHERS: 'app_teachers_db',
  CLASSES: 'app_classes_db',
  SUBJECTS: 'app_subjects_db',
  ARCHIVED_STUDENTS: 'app_archived_students_db'
};

// ========================================================
// 1. SEED DATA GENERATORS FOR ACADEMIC ENTITIES
// ========================================================
const SEED_TEACHERS = [
  { id: 1, employee_no: 'FAC-101', name: 'Prof. Abdur Rehman', designation: 'Assistant Professor & Supervisor', department: 'Computer Science', email: 'rehman@gdc1.edu.pk', phone: '0300-1234567', assigned_subjects: 'Computer Networks; Algorithms', status: 'active', is_deleted: false },
  { id: 2, employee_no: 'FAC-102', name: 'Dr. Muhammad Aslam', designation: 'Associate Professor', department: 'Physics', email: 'aslam.phy@gdc1.edu.pk', phone: '0301-2345678', assigned_subjects: 'Quantum Mechanics; Electrodynamics', status: 'active', is_deleted: false },
  { id: 3, employee_no: 'FAC-103', name: 'Prof. Tariq Bilal', designation: 'Lecturer', department: 'Mathematics', email: 'tariq.math@gdc1.edu.pk', phone: '0302-3456789', assigned_subjects: 'Linear Algebra; Calculus IV', status: 'active', is_deleted: false },
  { id: 4, employee_no: 'FAC-104', name: 'Dr. Sajid Khan', designation: 'Assistant Professor', department: 'Computer Science', email: 'sajid.cs@gdc1.edu.pk', phone: '0303-4567890', assigned_subjects: 'Operating Systems; Database Systems', status: 'active', is_deleted: false },
  { id: 5, employee_no: 'FAC-105', name: 'Prof. Irfanullah', designation: 'Lecturer', department: 'Computer Science', email: 'irfan.cs@gdc1.edu.pk', phone: '0304-5678901', assigned_subjects: 'Data Structures & Algorithms', status: 'active', is_deleted: false },
  { id: 6, employee_no: 'FAC-106', name: 'Prof. Nisar Ahmad', designation: 'Assistant Professor', department: 'Chemistry', email: 'nisar.chem@gdc1.edu.pk', phone: '0305-6789012', assigned_subjects: 'Organic Chemistry; Biochemistry', status: 'active', is_deleted: false }
];

const SEED_CLASSES = [
  { id: 1, class_name: 'BSCS-4th-Morning', department: 'Computer Science', semester: 'Semester 4', session: '2022-2026', section: 'A', room_no: 'IT Lab 1', max_capacity: 50, class_teacher: 'Prof. Abdur Rehman' },
  { id: 2, class_name: 'BSCS-4th-Evening', department: 'Computer Science', semester: 'Semester 4', session: '2022-2026', section: 'B', room_no: 'IT Lab 2', max_capacity: 45, class_teacher: 'Dr. Sajid Khan' },
  { id: 3, class_name: 'BS-Physics-4th', department: 'Physics', semester: 'Semester 4', session: '2022-2026', section: 'A', room_no: 'Science Block Rm 12', max_capacity: 40, class_teacher: 'Dr. Muhammad Aslam' },
  { id: 4, class_name: 'BS-Math-4th', department: 'Mathematics', semester: 'Semester 4', session: '2022-2026', section: 'A', room_no: 'Block C Rm 4', max_capacity: 45, class_teacher: 'Prof. Tariq Bilal' },
  { id: 5, class_name: 'BS-Chem-4th', department: 'Chemistry', semester: 'Semester 4', session: '2022-2026', section: 'A', room_no: 'Chemistry Lab 1', max_capacity: 35, class_teacher: 'Prof. Nisar Ahmad' },
  { id: 6, class_name: 'BS-English-4th', department: 'English', semester: 'Semester 4', session: '2022-2026', section: 'A', room_no: 'Humanities Rm 8', max_capacity: 50, class_teacher: 'Prof. Tahir' }
];

const SEED_SUBJECTS = [
  { id: 1, code: 'CS-401', name: 'Database Systems', department: 'Computer Science', semester: 'Semester 4', credit_hours: 4, teacher_name: 'Engr. Waqas', max_sessional: 20, max_mid: 30, max_terminal: 50 },
  { id: 2, code: 'CS-402', name: 'Data Structures & Algorithms', department: 'Computer Science', semester: 'Semester 4', credit_hours: 4, teacher_name: 'Prof. Irfanullah', max_sessional: 20, max_mid: 30, max_terminal: 50 },
  { id: 3, code: 'CS-403', name: 'Operating Systems', department: 'Computer Science', semester: 'Semester 4', credit_hours: 4, teacher_name: 'Dr. Sajid Khan', max_sessional: 20, max_mid: 30, max_terminal: 50 },
  { id: 4, code: 'CS-404', name: 'Computer Networks', department: 'Computer Science', semester: 'Semester 4', credit_hours: 3, teacher_name: 'Prof. Abdur Rehman', max_sessional: 20, max_mid: 30, max_terminal: 50 },
  { id: 5, code: 'PHY-401', name: 'Quantum Mechanics', department: 'Physics', semester: 'Semester 4', credit_hours: 4, teacher_name: 'Dr. Muhammad Aslam', max_sessional: 20, max_mid: 30, max_terminal: 50 },
  { id: 6, code: 'MATH-401', name: 'Linear Algebra', department: 'Mathematics', semester: 'Semester 4', credit_hours: 3, teacher_name: 'Prof. Tariq Bilal', max_sessional: 20, max_mid: 30, max_terminal: 50 },
  { id: 7, code: 'CHEM-401', name: 'Organic Chemistry', department: 'Chemistry', semester: 'Semester 4', credit_hours: 4, teacher_name: 'Prof. Nisar Ahmad', max_sessional: 20, max_mid: 30, max_terminal: 50 },
  { id: 8, code: 'ENG-401', name: 'Linguistics & Communication', department: 'English', semester: 'Semester 4', credit_hours: 3, teacher_name: 'Prof. Tahir', max_sessional: 20, max_mid: 30, max_terminal: 50 }
];

// ========================================================
// 2. TEACHER REPOSITORY
// ========================================================
const TeacherRepository = {
  getAll: function(includeDeleted = false) {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    let list = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_TEACHERS));
    if (!includeDeleted) {
      list = list.filter(t => !t.is_deleted);
    }
    return list;
  },

  getById: function(id) {
    return this.getAll(true).find(t => t.id === parseInt(id, 10));
  },

  create: function(data) {
    const list = this.getAll(true);
    const newId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
    const record = Object.assign({
      id: newId,
      employee_no: `FAC-${100 + newId}`,
      status: 'active',
      is_deleted: false,
      created_at: new Date().toISOString()
    }, data);

    list.push(record);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(list));
    return record;
  },

  update: function(id, updates) {
    const list = this.getAll(true);
    const idx = list.findIndex(t => t.id === parseInt(id, 10));
    if (idx === -1) return null;

    list[idx] = Object.assign(list[idx], updates);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(list));
    return list[idx];
  },

  softDelete: function(id) {
    return this.update(id, { is_deleted: true, status: 'archived' });
  },

  restore: function(id) {
    return this.update(id, { is_deleted: false, status: 'active' });
  },

  toCSV: function() {
    const list = this.getAll(false);
    const headers = ['id', 'employee_no', 'name', 'designation', 'department', 'email', 'phone', 'assigned_subjects', 'status'];
    const rows = list.map(t => [
      t.id,
      `"${t.employee_no}"`,
      `"${t.name}"`,
      `"${t.designation}"`,
      `"${t.department}"`,
      `"${t.email}"`,
      `"${t.phone}"`,
      `"${t.assigned_subjects || ''}"`,
      `"${t.status}"`
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};

// ========================================================
// 3. CLASS & SECTION REPOSITORY
// ========================================================
const ClassRepository = {
  getAll: function() {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_CLASSES));
  },

  getById: function(id) {
    return this.getAll().find(c => c.id === parseInt(id, 10));
  },

  create: function(data) {
    const list = this.getAll();
    const newId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const record = Object.assign({
      id: newId,
      created_at: new Date().toISOString()
    }, data);

    list.push(record);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
    return record;
  },

  update: function(id, updates) {
    const list = this.getAll();
    const idx = list.findIndex(c => c.id === parseInt(id, 10));
    if (idx === -1) return null;

    list[idx] = Object.assign(list[idx], updates);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
    return list[idx];
  },

  delete: function(id) {
    let list = this.getAll();
    list = list.filter(c => c.id !== parseInt(id, 10));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
    return true;
  },

  toCSV: function() {
    const list = this.getAll();
    const headers = ['id', 'class_name', 'department', 'semester', 'session', 'section', 'room_no', 'max_capacity', 'class_teacher'];
    const rows = list.map(c => [
      c.id, `"${c.class_name}"`, `"${c.department}"`, `"${c.semester}"`, `"${c.session}"`, `"${c.section}"`, `"${c.room_no}"`, c.max_capacity, `"${c.class_teacher}"`
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};

// ========================================================
// 4. SUBJECT / COURSE REPOSITORY
// ========================================================
const SubjectRepository = {
  getAll: function() {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_SUBJECTS));
  },

  getById: function(id) {
    return this.getAll().find(s => s.id === parseInt(id, 10));
  },

  create: function(data) {
    const list = this.getAll();
    const newId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const record = Object.assign({
      id: newId,
      max_sessional: 20,
      max_mid: 30,
      max_terminal: 50,
      created_at: new Date().toISOString()
    }, data);

    list.push(record);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(list));
    return record;
  },

  update: function(id, updates) {
    const list = this.getAll();
    const idx = list.findIndex(s => s.id === parseInt(id, 10));
    if (idx === -1) return null;

    list[idx] = Object.assign(list[idx], updates);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(list));
    return list[idx];
  },

  delete: function(id) {
    let list = this.getAll();
    list = list.filter(s => s.id !== parseInt(id, 10));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(list));
    return true;
  },

  toCSV: function() {
    const list = this.getAll();
    const headers = ['id', 'code', 'name', 'department', 'semester', 'credit_hours', 'teacher_name', 'max_sessional', 'max_mid', 'max_terminal'];
    const rows = list.map(s => [
      s.id, `"${s.code}"`, `"${s.name}"`, `"${s.department}"`, `"${s.semester}"`, s.credit_hours, `"${s.teacher_name}"`, s.max_sessional, s.max_mid, s.max_terminal
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};

// ========================================================
// 5. ENHANCED STUDENT REPOSITORY & CSV IMPORT VALIDATOR
// ========================================================
const StudentRepository = {
  validateRow: function(row, existingList = []) {
    const errors = [];
    if (!row.name || row.name.trim().length < 2) errors.push('Missing or invalid student name (min 2 chars)');
    if (!row.department) errors.push('Missing department');
    if (row.cgpa !== undefined && (row.cgpa < 0 || row.cgpa > 4.0)) errors.push(`Invalid CGPA: ${row.cgpa} (must be 0.0 - 4.0)`);
    if (row.attendance !== undefined && (row.attendance < 0 || row.attendance > 100)) errors.push(`Invalid attendance: ${row.attendance}%`);
    
    // Duplicate roll number check
    if (row.studentId) {
      const isDup = existingList.some(s => s.studentId && s.studentId.toUpperCase() === row.studentId.trim().toUpperCase());
      if (isDup) errors.push(`Duplicate roll number detected: ${row.studentId}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  parseAndValidateCSV: function(csvText, currentStudents = []) {
    const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, error: 'CSV file is empty or missing headers.' };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const parsedRows = [];
    const errorReport = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      const studentObj = {
        studentId: parts[0] || `CS-${2200 + i}`,
        name: parts[1] || '',
        fatherName: parts[2] || '',
        department: parts[3] || 'Computer Science',
        sessionStart: parseInt(parts[4]) || 2022,
        sessionEnd: parseInt(parts[5]) || 2026,
        semester: parts[6] || 'Semester 4',
        cgpa: parseFloat(parts[7]) || 3.0,
        attendance: parseFloat(parts[8]) || 80.0
      };

      const val = this.validateRow(studentObj, currentStudents);
      if (val.isValid) {
        parsedRows.push(studentObj);
      } else {
        errorReport.push({ line: i + 1, data: studentObj, errors: val.errors });
      }
    }

    return {
      success: true,
      validRows: parsedRows,
      invalidRows: errorReport,
      totalRows: lines.length - 1
    };
  }
};

// Global Exports
window.TeacherRepository = TeacherRepository;
window.ClassRepository = ClassRepository;
window.SubjectRepository = SubjectRepository;
window.StudentRepository = StudentRepository;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TeacherRepository, ClassRepository, SubjectRepository, StudentRepository };
}
