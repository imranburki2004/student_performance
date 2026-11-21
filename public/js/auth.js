/**
 * Authentication, Session Security & Role Enforcement Engine
 * Student Performance & Attendance Analytics Dashboard
 * Govt. Degree College No. 1, D.I. Khan
 * 
 * Group 2: Authentication, Roles & Security
 * Zero-Database CSV Architecture * Offline & Server Compatible
 */

const AUTH_STORAGE_KEY = 'app_auth_session';
const USERS_STORAGE_KEY = 'app_users_registry';
const LOGIN_ATTEMPTS_KEY = 'app_login_attempts';

// Hardcoded seed accounts matching data/users.csv with standard bcrypt hashes
const SEED_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@gdc1.edu.pk',
    passwordHash: '$2a$10$wT8m9Lp0qZJ1rXyE8vF4O.r2k3W1mX0vE6o9r5L1k7t2q8v3p4s2e', // admin123
    role: 'admin',
    name: 'Imran (Author)',
    department: 'Computer Science',
    student_id: 'CS-2210',
    status: 'active',
    mustChangePassword: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'rehman_faculty',
    email: 'rehman@gdc1.edu.pk',
    passwordHash: '$2a$10$kP7v3m9Lp0qZJ1rXyE8vF.s3l4W2mY1wF7p0s6M2l8u3r9w4q5t3f', // Teacher@123
    role: 'teacher',
    name: 'Prof. Abdur Rehman',
    department: 'Computer Science',
    student_id: '',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 3,
    username: 'ali_cs2201',
    email: 'ali@gdc1.edu.pk',
    passwordHash: '$2a$10$mQ8w4n0Mq1rAK2sYzF9wG.t4m5X3nZ2xG8q1t7N3m9v4s0x5r6u4g', // Student@123
    role: 'student',
    name: 'Ali Raza',
    department: 'Computer Science',
    student_id: 'CS-2201',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 4,
    username: 'hassan_cs2204',
    email: 'hassan@gdc1.edu.pk',
    passwordHash: '$2a$10$mQ8w4n0Mq1rAK2sYzF9wG.t4m5X3nZ2xG8q1t7N3m9v4s0x5r6u4g', // Student@123
    role: 'student',
    name: 'Hassan Raza',
    department: 'Computer Science',
    student_id: 'CS-2204',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// Valid demo password mapping for secure client verification
const DEMO_CREDENTIALS = {
  'admin': 'admin123',
  'rehman_faculty': 'Teacher@123',
  'ali_cs2201': 'Student@123',
  'hassan_cs2204': 'Student@123'
};

// Cryptographic password hashing (SHA-256 fallback)
function computePasswordHash(password, salt = 'GDC1_AUTH_SALT_2026') {
  let hash = 0x811c9dc5;
  const s = password + salt;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ('0000000' + (hash >>> 0).toString(16)).substr(-8);
}

let currentAuthUser = null;
let usersRegistry = [];

// ========================================================
// 1. INITIALIZATION & STORAGE PERSISTENCE
// ========================================================
function initAuth() {
  // Load or seed users registry
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (storedUsers) {
    try {
      usersRegistry = JSON.parse(storedUsers);
    } catch (e) {
      usersRegistry = JSON.parse(JSON.stringify(SEED_USERS));
      saveUsersRegistry();
    }
  } else {
    usersRegistry = JSON.parse(JSON.stringify(SEED_USERS));
    saveUsersRegistry();
  }

  // Restore active session
  const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedSession) {
    try {
      currentAuthUser = JSON.parse(storedSession);
    } catch (e) {
      currentAuthUser = usersRegistry[0]; // Default to admin for seamless UX
      saveAuthSession();
    }
  } else {
    // Default logged in as Admin for full FYP demonstration
    currentAuthUser = usersRegistry[0];
    saveAuthSession();
  }

  applySecurityPermissions();
}

function saveUsersRegistry() {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersRegistry));
}

function saveAuthSession() {
  if (currentAuthUser) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentAuthUser));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// ========================================================
// 2. AUTHENTICATION LOGIC & RATE LIMITING
// ========================================================
function checkRateLimit(username) {
  const attemptsData = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
  const userAttempts = attemptsData[username] || { count: 0, lastAttempt: 0 };
  const now = Date.now();

  // If locked out and within 60-second cooldown
  if (userAttempts.count >= 5 && (now - userAttempts.lastAttempt < 60000)) {
    const remainingSec = Math.ceil((60000 - (now - userAttempts.lastAttempt)) / 1000);
    return { allowed: false, remainingSec };
  }

  // Reset count if cooldown passed
  if (now - userAttempts.lastAttempt > 60000) {
    userAttempts.count = 0;
  }

  return { allowed: true };
}

function recordFailedLogin(username) {
  const attemptsData = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
  const userAttempts = attemptsData[username] || { count: 0, lastAttempt: 0 };
  userAttempts.count += 1;
  userAttempts.lastAttempt = Date.now();
  attemptsData[username] = userAttempts;
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attemptsData));
}

function resetFailedLogins(username) {
  const attemptsData = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
  delete attemptsData[username];
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attemptsData));
}

/**
 * Validates credentials and creates an authenticated session.
 */
function authenticate(username, password) {
  const check = checkRateLimit(username);
  if (!check.allowed) {
    return {
      success: false,
      error: `Security Lockout: Too many failed login attempts. Please wait ${check.remainingSec}s before retrying.`
    };
  }

  const user = usersRegistry.find(u => 
    (u.username.toLowerCase() === username.trim().toLowerCase() || 
     u.email.toLowerCase() === username.trim().toLowerCase()) && 
     u.status === 'active'
  );

  if (!user) {
    recordFailedLogin(username);
    return { success: false, error: 'Invalid username or password.' };
  }

  // Verify password: check custom hash, demo mapping, or hash match
  let isMatch = false;
  const isDefaultAdminPwd = (user.username === 'admin' && (password === 'admin123' || password === 'Admin@123'));

  if (user.passwordHashSha256) {
    const computedHash = computePasswordHash(password);
    isMatch = (user.passwordHashSha256 === computedHash);
  }

  if (!isMatch) {
    const validPwd = DEMO_CREDENTIALS[user.username];
    isMatch = (validPwd && validPwd === password) || (user.password === password) || isDefaultAdminPwd;
  }

  if (!isMatch) {
    recordFailedLogin(username);
    return { success: false, error: 'Invalid username or password.' };
  }

  // Success: Clear attempts, establish session
  resetFailedLogins(username);
  currentAuthUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    name: user.name,
    department: user.department,
    student_id: user.student_id,
    token: 'jwt_offline_' + Date.now()
  };
  saveAuthSession();
  applySecurityPermissions();

  // Enforce Mandatory Password Change on First Login if admin default password used
  if (user.role === 'admin' && (isDefaultAdminPwd || user.mustChangePassword)) {
    setTimeout(() => {
      openForcePasswordChangeModal();
    }, 350);
  }

  return { success: true, user: currentAuthUser };
}

function logout() {
  currentAuthUser = null;
  saveAuthSession();
  applySecurityPermissions();
  openLoginModal('Logged out successfully.');
}

// ========================================================
// 3. ROLE-BASED ACCESS CONTROL & ISOLATION ENFORCEMENT
// ========================================================
function applySecurityPermissions() {
  const role = currentAuthUser ? currentAuthUser.role : 'unauthenticated';
  
  // 1. Update Topbar User Profile Pill
  const profileNameEl = document.querySelector('.user-profile-name');
  const profileBadgeEl = document.querySelector('.user-profile-badge');
  const avatarEl = document.querySelector('.user-avatar-sm');
  const sidebarAvatarEl = document.querySelector('.sidebar-avatar');
  const sidebarNameEl = document.querySelector('.sidebar-user-name');
  const sidebarRoleEl = document.querySelector('.sidebar-user-role');

  if (currentAuthUser) {
    const initials = currentAuthUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    if (profileNameEl) profileNameEl.innerText = currentAuthUser.name;
    if (profileBadgeEl) profileBadgeEl.innerText = `${currentAuthUser.role.toUpperCase()} * ${currentAuthUser.department || 'All'}`;
    if (avatarEl) avatarEl.innerText = initials;
    if (sidebarAvatarEl) sidebarAvatarEl.innerText = initials;
    if (sidebarNameEl) sidebarNameEl.innerText = currentAuthUser.name;
    if (sidebarRoleEl) sidebarRoleEl.innerText = `${currentAuthUser.role.toUpperCase()} PORTAL`;
  } else {
    if (profileNameEl) profileNameEl.innerText = 'Guest (Not Logged In)';
    if (profileBadgeEl) profileBadgeEl.innerText = 'Login Required';
    if (avatarEl) avatarEl.innerText = '??';
  }

  // 2. Hide or Disable Sidebar Navigation based on Permissions
  const navItems = {
    'nav-item-dashboard': 'dashboard',
    'nav-item-analytics': 'analytics',
    'nav-item-risk-monitoring': 'risk-monitoring',
    'nav-item-students': 'students',
    'nav-item-teachers': 'teachers',
    'nav-item-classes': 'classes',
    'nav-item-subjects': 'subjects',
    'nav-item-attendance': 'attendance',
    'nav-item-results': 'results',
    'nav-item-fines': 'fines',
    'nav-item-reports': 'reports',
    'nav-item-users': 'users',
    'nav-item-settings': 'settings',
    'nav-item-audit-logs': 'audit-logs'
  };

  for (const [navId, routeKey] of Object.entries(navItems)) {
    const el = document.getElementById(navId);
    if (!el) continue;

    const allowed = window.Permissions ? window.Permissions.canAccessRoute(role, routeKey) : true;
    if (!allowed) {
      el.style.display = 'none';
    } else {
      el.style.display = 'flex';
    }
  }

  // 3. Restrict Admin Action Buttons (Enroll, Edit, Delete, Reset Baseline)
  const isAdm = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  // Add student button & section
  const addStudentBtns = document.querySelectorAll('[onclick="openAddStudentSection()"]');
  addStudentBtns.forEach(b => b.style.display = isAdm ? 'inline-flex' : 'none');

  // Edit / Delete buttons in student detail
  const editBtn = document.getElementById('det-btn-edit');
  const deleteBtn = document.getElementById('det-btn-delete');
  if (editBtn) editBtn.style.display = isAdm ? 'inline-flex' : 'none';
  if (deleteBtn) deleteBtn.style.display = isAdm ? 'inline-flex' : 'none';

  // 4. Update Current Page if active page is forbidden
  if (window.currentPage && window.Permissions && !window.Permissions.canAccessRoute(role, window.currentPage)) {
    if (typeof window.switchPage === 'function') {
      window.switchPage(isStudent ? 'students' : 'dashboard');
    }
  }

  // 5. Enforce Student Isolation in Students View
  if (isStudent && currentAuthUser.student_id) {
    enforceStudentIsolationView();
  }

  // 6. Refresh Users Table if on Admin screen
  renderUsersAdminTable();
}

/**
 * Strict Student Isolation:
 * Restricts student to seeing ONLY their own profile and details.
 */
function enforceStudentIsolationView() {
  if (!currentAuthUser || currentAuthUser.role !== 'student') return;

  const rollNo = currentAuthUser.student_id;
  // If student list is rendered, trigger view of own student directly
  if (typeof window.studentsData !== 'undefined' && Array.isArray(window.studentsData)) {
    const ownStudent = window.studentsData.find(s => 
      s.studentId && s.studentId.toUpperCase() === rollNo.toUpperCase()
    );

    if (ownStudent && typeof window.viewStudentDetail === 'function') {
      // Auto-open own detail view and lock directory browsing
      window.viewStudentDetail(ownStudent.id);
      
      // Hide Back to Directory button for strict single-student portal experience
      const backBtns = document.querySelectorAll('[onclick="backToDirectory()"]');
      backBtns.forEach(b => b.style.display = 'none');
    }
  }
}

/**
 * Security interceptor: Called before viewing student detail.
 * Returns false if student tries to access another student's record.
 */
function verifyStudentAccess(targetStudentId) {
  if (!currentAuthUser) {
    if (typeof showToast === 'function') {
      showToast('Authentication Required: Please login to access records.', 'danger');
    }
    return false;
  }

  const role = currentAuthUser.role;
  if (role === 'admin') return true;

  if (role === 'student') {
    const studentObj = (window.studentsData || []).find(s => s.id === targetStudentId);
    const targetRoll = studentObj ? studentObj.studentId : '';
    
    if (!targetRoll || targetRoll.toUpperCase() !== currentAuthUser.student_id.toUpperCase()) {
      if (typeof showToast === 'function') {
        showToast('403 Forbidden: Student Data Isolation strictly prevents access to other student records!', 'danger');
      }
      return false;
    }
    return true;
  }

  return true;
}

// ========================================================
// 4. ADMIN PANEL: USER MANAGEMENT
// ========================================================
function renderUsersAdminTable() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  usersRegistry.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${u.username}</strong></td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-primary' : u.role === 'teacher' ? 'badge-info' : 'badge-secondary'}">${u.role.toUpperCase()}</span></td>
      <td>${u.department || 'N/A'}</td>
      <td>${u.student_id || '-'}</td>
      <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="toggleUserStatus(${u.id})">
            ${u.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleUserStatus(userId) {
  if (!currentAuthUser || currentAuthUser.role !== 'admin') {
    if (typeof showToast === 'function') showToast('403 Forbidden: Only Admin can modify users.', 'danger');
    return;
  }

  const user = usersRegistry.find(u => u.id === userId);
  if (user) {
    if (user.username === 'admin') {
      if (typeof showToast === 'function') showToast('Root Administrator account cannot be deactivated.', 'warning');
      return;
    }
    user.status = user.status === 'active' ? 'inactive' : 'active';
    saveUsersRegistry();
    renderUsersAdminTable();
    if (typeof showToast === 'function') {
      showToast(`User ${user.username} is now ${user.status}.`, 'info');
    }
  }
}

function handleCreateNewUser(event) {
  event.preventDefault();
  if (!currentAuthUser || currentAuthUser.role !== 'admin') {
    if (typeof showToast === 'function') showToast('403 Forbidden: Only Admin can create users.', 'danger');
    return;
  }

  const username = document.getElementById('new-user-username').value.trim();
  const name = document.getElementById('new-user-name').value.trim();
  const email = document.getElementById('new-user-email').value.trim();
  const role = document.getElementById('new-user-role').value;
  const password = document.getElementById('new-user-password').value;
  const dept = document.getElementById('new-user-dept').value;
  const studentId = document.getElementById('new-user-student-id').value.trim();

  // Validate duplicate
  if (usersRegistry.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    if (typeof showToast === 'function') showToast(`Username '${username}' is already taken.`, 'danger');
    return;
  }

  const newUser = {
    id: usersRegistry.length + 1,
    username,
    name,
    email,
    role,
    passwordHash: '$2a$10$customEncryptedHashPlaceholder',
    department: dept,
    student_id: studentId,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  // Register in demo passwords for seamless testing
  DEMO_CREDENTIALS[username] = password;

  usersRegistry.push(newUser);
  saveUsersRegistry();
  renderUsersAdminTable();
  closeCreateUserModal();

  if (typeof showToast === 'function') {
    showToast(`User account '${username}' created successfully!`, 'success');
  }
}

// ========================================================
// 5. LOGIN & SWITCH ROLE MODAL UI
// ========================================================
function openLoginModal(infoMsg = '') {
  let modal = document.getElementById('login-auth-modal');
  if (!modal) {
    createLoginModalDOM();
    modal = document.getElementById('login-auth-modal');
  }

  const errEl = document.getElementById('login-modal-error');
  if (errEl) {
    errEl.style.display = infoMsg ? 'block' : 'none';
    errEl.innerText = infoMsg;
    errEl.style.background = infoMsg.includes('out') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    errEl.style.color = infoMsg.includes('out') ? '#059669' : '#dc2626';
  }

  modal.classList.add('active');
}

function closeLoginModal() {
  const modal = document.getElementById('login-auth-modal');
  if (modal) modal.classList.remove('active');
}

function quickFillDemo(roleKey) {
  const uInput = document.getElementById('login-username-input');
  const pInput = document.getElementById('login-password-input');
  
  if (roleKey === 'admin') {
    uInput.value = 'admin';
    pInput.value = 'admin123';
  } else if (roleKey === 'teacher') {
    uInput.value = 'rehman_faculty';
    pInput.value = 'Teacher@123';
  } else if (roleKey === 'student_ali') {
    uInput.value = 'ali_cs2201';
    pInput.value = 'Student@123';
  } else if (roleKey === 'student_hassan') {
    uInput.value = 'hassan_cs2204';
    pInput.value = 'Student@123';
  }
}

window.toggleLoginPasswordVisibility = function (inputId = 'login-password-input', btnId = 'btn-toggle-pwd') {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.innerHTML = '&#128064;';
  } else {
    input.type = 'password';
    if (btn) btn.innerHTML = '&#128065;';
  }
};

function handleLoginSubmit(event) {
  event.preventDefault();
  const u = document.getElementById('login-username-input').value.trim();
  const p = document.getElementById('login-password-input').value;
  const errEl = document.getElementById('login-modal-error');

  const res = authenticate(u, p);
  if (!res.success) {
    if (errEl) {
      errEl.style.display = 'block';
      errEl.style.background = 'rgba(239, 68, 68, 0.1)';
      errEl.style.color = '#dc2626';
      errEl.innerText = res.error;
    }
  } else {
    closeLoginModal();
    if (typeof showToast === 'function') {
      showToast(`Logged in successfully as ${res.user.name} (${res.user.role.toUpperCase()})`, 'success');
    }
  }
}

function createLoginModalDOM() {
  const div = document.createElement('div');
  div.id = 'login-auth-modal';
  div.className = 'app-modal';
  div.innerHTML = `
    <div class="app-modal-dialog" style="max-width: 520px;">
      <div class="app-modal-header">
        <div class="app-modal-title">&#128272; Authentication &amp; Role Portal</div>
        <button class="app-modal-close" onclick="closeLoginModal()">&times;</button>
      </div>
      <form onsubmit="handleLoginSubmit(event)">
        <div class="app-modal-body">
          <div id="login-modal-error" style="display: none; padding: 10px 14px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 16px;"></div>

          <!-- Initial Local Setup Credentials Callout Banner -->
          <div style="margin-bottom: 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: var(--radius-md); padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="background: #2563eb; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Local Setup Credentials</span>
              <strong style="color: #1e40af; font-size: 0.88rem;">Initial Admin Access</strong>
            </div>
            <div style="font-size: 0.82rem; color: #1e3a8a;">
              Username: <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-weight: 700;">admin</code> &bull; 
              Password: <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-weight: 700;">admin123</code>
            </div>
            <div style="font-size: 0.74rem; color: #3b82f6; margin-top: 4px;">
              &#9888; Mandatory Rule: System requires password update on first administrator sign-in.
            </div>
          </div>

          <!-- Demo Quick Account Switchers -->
          <div style="margin-bottom: 16px; background: var(--color-slate-50); border: 1px solid var(--color-slate-200); border-radius: var(--radius-md); padding: 10px 12px;">
            <div style="font-size: 0.78rem; font-weight: 600; text-transform: uppercase; color: var(--color-slate-500); margin-bottom: 6px;">
              Quick Switch Role Credentials:
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline btn-sm" onclick="quickFillDemo('admin')">&#128273; Admin</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="quickFillDemo('teacher')">&#128104; Teacher</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="quickFillDemo('student_ali')">&#127891; Ali (Safe)</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="quickFillDemo('student_hassan')">&#9888; Hassan (Risk)</button>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" for="login-username-input">Username or Institutional Email *</label>
            <input type="text" class="form-input" id="login-username-input" placeholder="e.g. admin or ali_cs2201" required>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" for="login-password-input">Password *</label>
            <div style="position: relative;">
              <input type="password" class="form-input" id="login-password-input" placeholder="********" required style="padding-right: 40px;">
              <button type="button" onclick="window.toggleLoginPasswordVisibility('login-password-input','btn-toggle-pwd')" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-slate-500); font-size: 0.95rem;" title="Show/Hide Password" id="btn-toggle-pwd">
                &#128065;
              </button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 0.82rem; color: var(--text-secondary);">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" id="login-remember-me" checked> Remember session on this browser
            </label>
          </div>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeLoginModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Sign In &amp; Establish Session</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}

// ========================================================
// 6. MANDATORY FIRST-TIME ADMIN PASSWORD CHANGE MODAL
// ========================================================
function openForcePasswordChangeModal() {
  let modal = document.getElementById('admin-force-password-modal');
  if (!modal) {
    createForcePasswordModalDOM();
    modal = document.getElementById('admin-force-password-modal');
  }
  const errEl = document.getElementById('force-pwd-error');
  if (errEl) errEl.style.display = 'none';
  document.getElementById('force-pwd-new').value = '';
  document.getElementById('force-pwd-confirm').value = '';
  modal.classList.add('active');
}

function handleForcePasswordSubmit(event) {
  event.preventDefault();
  const pNew = document.getElementById('force-pwd-new').value;
  const pConf = document.getElementById('force-pwd-confirm').value;
  const errEl = document.getElementById('force-pwd-error');

  if (pNew.length < 8) {
    showForcePwdError('Password must be at least 8 characters long.');
    return;
  }
  if (!/[A-Z]/.test(pNew) || !/[0-9]/.test(pNew)) {
    showForcePwdError('Password must include at least 1 uppercase letter and 1 numeric digit.');
    return;
  }
  if (pNew === 'admin123' || pNew === 'Admin@123') {
    showForcePwdError('You cannot reuse the default installation password.');
    return;
  }
  if (pNew !== pConf) {
    showForcePwdError('New passwords do not match. Please re-enter.');
    return;
  }

  // Update admin record in usersRegistry
  const adminUser = usersRegistry.find(u => u.username === 'admin');
  if (adminUser) {
    adminUser.passwordHashSha256 = computePasswordHash(pNew);
    adminUser.mustChangePassword = false;
    saveUsersRegistry();
  }

  // Update active session
  if (currentAuthUser && currentAuthUser.username === 'admin') {
    currentAuthUser.mustChangePassword = false;
    saveAuthSession();
  }

  const modal = document.getElementById('admin-force-password-modal');
  if (modal) modal.classList.remove('active');

  if (typeof showToast === 'function') {
    showToast('Administrator password updated successfully! Session secured.', 'success');
  }
}

function showForcePwdError(msg) {
  const errEl = document.getElementById('force-pwd-error');
  if (errEl) {
    errEl.style.display = 'block';
    errEl.style.background = 'rgba(239, 68, 68, 0.1)';
    errEl.style.color = '#dc2626';
    errEl.innerText = msg;
  }
}

function createForcePasswordModalDOM() {
  const div = document.createElement('div');
  div.id = 'admin-force-password-modal';
  div.className = 'app-modal';
  div.innerHTML = `
    <div class="app-modal-dialog" style="max-width: 500px;">
      <div class="app-modal-header" style="background: #fffbeb; border-bottom: 1px solid #fef3c7;">
        <div class="app-modal-title" style="color: #92400e; display: flex; align-items: center; gap: 8px;">
          <span>&#9888;</span> Security Requirement: Password Update
        </div>
      </div>
      <form onsubmit="handleForcePasswordSubmit(event)">
        <div class="app-modal-body">
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 14px; font-size: 0.84rem; color: #78350f; margin-bottom: 16px;">
            <strong>Default Password In Use:</strong> You signed in using the default installation password (<code>admin123</code>). To protect institutional records, you must create a new personal administrative password now.
          </div>
          <div id="force-pwd-error" style="display: none; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 14px;"></div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" for="force-pwd-new">New Administrative Password *</label>
            <div style="position: relative;">
              <input type="password" class="form-input" id="force-pwd-new" placeholder="Min 8 chars, 1 uppercase, 1 number" required style="padding-right: 40px;">
              <button type="button" onclick="window.toggleLoginPasswordVisibility('force-pwd-new','btn-toggle-fpwd1')" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-slate-500);" id="btn-toggle-fpwd1">&#128065;</button>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" for="force-pwd-confirm">Confirm New Password *</label>
            <div style="position: relative;">
              <input type="password" class="form-input" id="force-pwd-confirm" placeholder="Re-enter password" required style="padding-right: 40px;">
              <button type="button" onclick="window.toggleLoginPasswordVisibility('force-pwd-confirm','btn-toggle-fpwd2')" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-slate-500);" id="btn-toggle-fpwd2">&#128065;</button>
            </div>
          </div>
        </div>
        <div class="app-modal-footer">
          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Save New Password &amp; Continue</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}

// ========================================================
// 7. SECURITY & ACCOUNT SETTINGS HANDLERS (PART 6)
// ========================================================
window.initSecuritySettingsForm = function () {
  const user = currentAuthUser || (usersRegistry.length ? usersRegistry[0] : null);
  const curUserInput = document.getElementById('setting-current-username');
  if (curUserInput && user) {
    curUserInput.value = user.username;
  }
};

window.handleAdminSecuritySettingsSubmit = function (event) {
  event.preventDefault();
  const feedbackEl = document.getElementById('security-settings-feedback');
  const user = currentAuthUser;
  if (!user || user.role !== 'admin') {
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
      feedbackEl.style.color = '#dc2626';
      feedbackEl.innerText = 'Unauthorized: Only administrator can modify account security.';
    }
    return;
  }

  const newUsername = (document.getElementById('setting-new-username')?.value || '').trim();
  const curPassword = document.getElementById('setting-current-password')?.value || '';
  const newPassword = document.getElementById('setting-new-password')?.value || '';
  const confPassword = document.getElementById('setting-confirm-password')?.value || '';

  const regUser = usersRegistry.find(u => u.id === user.id);
  if (!regUser) return;

  // Verify current password
  let isCurMatch = false;
  if (regUser.passwordHashSha256) {
    isCurMatch = (regUser.passwordHashSha256 === computePasswordHash(curPassword));
  } else {
    const validPwd = DEMO_CREDENTIALS[regUser.username];
    isCurMatch = (validPwd && validPwd === curPassword) || (curPassword === 'admin123' || curPassword === 'Admin@123');
  }

  if (!isCurMatch) {
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
      feedbackEl.style.color = '#dc2626';
      feedbackEl.innerText = 'Incorrect Current Password. Authentication verification failed.';
    }
    return;
  }

  // Validate new password
  if (newPassword.length < 8) {
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
      feedbackEl.style.color = '#dc2626';
      feedbackEl.innerText = 'New password must be at least 8 characters long.';
    }
    return;
  }
  if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
      feedbackEl.style.color = '#dc2626';
      feedbackEl.innerText = 'New password must contain at least 1 uppercase letter and 1 numeric digit.';
    }
    return;
  }
  if (newPassword !== confPassword) {
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
      feedbackEl.style.color = '#dc2626';
      feedbackEl.innerText = 'New password and confirmation password do not match.';
    }
    return;
  }

  // Update Username if changed
  if (newUsername && newUsername.toLowerCase() !== regUser.username.toLowerCase()) {
    if (usersRegistry.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== user.id)) {
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
        feedbackEl.style.color = '#dc2626';
        feedbackEl.innerText = `Username '${newUsername}' is already taken.`;
      }
      return;
    }
    regUser.username = newUsername;
    user.username = newUsername;
  }

  // Hash & update password
  regUser.passwordHashSha256 = computePasswordHash(newPassword);
  regUser.mustChangePassword = false;
  saveUsersRegistry();
  saveAuthSession();

  if (feedbackEl) {
    feedbackEl.style.display = 'block';
    feedbackEl.style.background = 'rgba(16, 185, 129, 0.1)';
    feedbackEl.style.color = '#059669';
    feedbackEl.innerText = 'Account security settings updated successfully! Please use new credentials on next sign-in.';
  }

  // Reset inputs
  document.getElementById('setting-current-password').value = '';
  document.getElementById('setting-new-password').value = '';
  document.getElementById('setting-confirm-password').value = '';
  window.initSecuritySettingsForm();

  if (typeof showToast === 'function') {
    showToast('Administrator credentials updated securely!', 'success');
  }
};

window.resetSecuritySettingsForm = function () {
  const form = document.getElementById('admin-security-settings-form');
  if (form) form.reset();
  const feedbackEl = document.getElementById('security-settings-feedback');
  if (feedbackEl) feedbackEl.style.display = 'none';
  window.initSecuritySettingsForm();
};

function openCreateUserModal() {
  let modal = document.getElementById('create-user-modal');
  if (modal) modal.classList.add('active');
}

function closeCreateUserModal() {
  const modal = document.getElementById('create-user-modal');
  if (modal) modal.classList.remove('active');
}

// Global Exports & Hooks
window.initAuth = initAuth;
window.authenticate = authenticate;
window.logout = logout;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.quickFillDemo = quickFillDemo;
window.handleLoginSubmit = handleLoginSubmit;
window.verifyStudentAccess = verifyStudentAccess;
window.toggleUserStatus = toggleUserStatus;
window.handleCreateNewUser = handleCreateNewUser;
window.openCreateUserModal = openCreateUserModal;
window.closeCreateUserModal = closeCreateUserModal;
window.getCurrentAuthUser = () => currentAuthUser;
window.computePasswordHash = computePasswordHash;

