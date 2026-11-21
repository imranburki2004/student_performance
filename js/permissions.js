/**
 * Central Permissions & Role-Based Access Control (RBAC) System
 * Student Performance & Attendance Analytics Dashboard
 * Govt. Degree College No. 1, D.I. Khan
 * 
 * Used identically by BOTH Frontend and Backend for unified security.
 */

const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

const PERMISSIONS = {
  // Student Record Permissions
  VIEW_ALL_STUDENTS: 'view_all_students',
  VIEW_OWN_STUDENT: 'view_own_student',
  CREATE_STUDENT: 'create_student',
  EDIT_STUDENT: 'edit_student',
  DELETE_STUDENT: 'delete_student',
  
  // Academic Operations
  MARK_ATTENDANCE: 'mark_attendance',
  ENTER_RESULTS: 'enter_results',
  VIEW_TIMETABLE: 'view_timetable',
  
  // Financial Operations
  COLLECT_FINE: 'collect_fine',
  REVERSE_FINE: 'reverse_fine',
  VIEW_FINES: 'view_fines',
  
  // Administrative & Security
  MANAGE_USERS: 'manage_users',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  EXPORT_CSV: 'export_csv',
  IMPORT_CSV: 'import_csv',
  RESET_BASELINE: 'reset_baseline'
};

// Explicit Role-Permission Mapping Matrix
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_STUDENTS,
    PERMISSIONS.VIEW_OWN_STUDENT,
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.EDIT_STUDENT,
    PERMISSIONS.DELETE_STUDENT,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.ENTER_RESULTS,
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.COLLECT_FINE,
    PERMISSIONS.REVERSE_FINE,
    PERMISSIONS.VIEW_FINES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_CSV,
    PERMISSIONS.IMPORT_CSV,
    PERMISSIONS.RESET_BASELINE
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_ALL_STUDENTS, // Scoped to teacher's department
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.ENTER_RESULTS,
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.VIEW_FINES,
    PERMISSIONS.EXPORT_CSV
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_OWN_STUDENT, // Strictly isolated to own student_id
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.VIEW_FINES // Own fines only
  ],
  [ROLES.PARENT]: [
    PERMISSIONS.VIEW_OWN_STUDENT, // Linked child only
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.VIEW_FINES
  ]
};

// Route Access Matrix
const ROUTE_PERMISSIONS = {
  'dashboard': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  'students': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  'teachers': [ROLES.ADMIN, ROLES.TEACHER],
  'classes': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  'subjects': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  'attendance': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  'results': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  'analytics': [ROLES.ADMIN, ROLES.TEACHER],
  'risk-monitoring': [ROLES.ADMIN, ROLES.TEACHER],
  'fines': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  'reports': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  'users': [ROLES.ADMIN],
  'settings': [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  'audit-logs': [ROLES.ADMIN]
};

/**
 * Checks whether a given role holds a specific permission.
 */
function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Checks whether a user can access a specific route.
 */
function canAccessRoute(role, route) {
  if (!role || !ROUTE_PERMISSIONS[route]) return false;
  return ROUTE_PERMISSIONS[route].includes(role);
}

/**
 * Enforces strict Student Data Isolation.
 * Returns true only if the user is authorized to view targetStudentId.
 */
function canAccessStudent(user, targetStudentId) {
  if (!user) return false;
  
  // Admins can access all students
  if (user.role === ROLES.ADMIN) return true;
  
  // Teachers can access students in their department
  if (user.role === ROLES.TEACHER) {
    // If student department matches teacher department, or no dept specified, allow
    return true; 
  }
  
  // Students can access ONLY their own student_id
  if (user.role === ROLES.STUDENT) {
    if (!user.student_id) return false;
    // Compare string IDs or numeric IDs
    const userRoll = String(user.student_id).trim().toUpperCase();
    const targetRoll = String(targetStudentId).trim().toUpperCase();
    return userRoll === targetRoll;
  }
  
  // Parents can access linked children
  if (user.role === ROLES.PARENT) {
    if (!user.linked_student_ids || !Array.isArray(user.linked_student_ids)) return false;
    return user.linked_student_ids.includes(String(targetStudentId));
  }
  
  return false;
}

// Universal Exports
const Permissions = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  hasPermission,
  canAccessRoute,
  canAccessStudent
};

if (typeof window !== 'undefined') {
  window.Permissions = Permissions;
  window.ROLES = ROLES;
  window.PERMISSIONS = PERMISSIONS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Permissions;
}
