-- ==============================================================================
-- EduPulse DIK - Govt. Degree College No. 1, Dera Ismail Khan
-- SQLite 3 Database Schema (Zero-Setup Fallback Engine)
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    module TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Role Permissions Mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    linked_student_id INTEGER NULL,
    linked_teacher_id INTEGER NULL,
    is_active INTEGER DEFAULT 1,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TEXT NULL,
    must_change_password INTEGER DEFAULT 0,
    last_login_at TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 5. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    device_info TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    hod_name TEXT,
    established_year INTEGER DEFAULT 1950,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 7. Programs Table
CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    duration_years INTEGER DEFAULT 4,
    total_semesters INTEGER DEFAULT 8,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 8. Classes (Sections)
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    section TEXT DEFAULT 'A',
    session TEXT NOT NULL,
    room_number TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- 9. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_no TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    qualification TEXT,
    department_id INTEGER NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    hire_date TEXT,
    photo TEXT DEFAULT '/assets/avatar-teacher.png',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'retired')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 10. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    credit_hours INTEGER DEFAULT 3,
    department_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    theory_marks INTEGER DEFAULT 70,
    practical_marks INTEGER DEFAULT 30,
    total_marks INTEGER DEFAULT 100,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- 11. Teacher Subject Assignment
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    academic_session TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE (teacher_id, subject_id, class_id, academic_session)
);

-- 12. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_no TEXT NOT NULL UNIQUE,
    registration_no TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    cnic TEXT,
    gender TEXT DEFAULT 'Male' CHECK (gender IN ('Male', 'Female')),
    dob TEXT,
    phone TEXT,
    guardian_phone TEXT,
    email TEXT,
    address TEXT,
    district TEXT DEFAULT 'Dera Ismail Khan',
    department_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    semester INTEGER DEFAULT 1,
    session TEXT NOT NULL,
    admission_date TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'suspended', 'dropped')),
    photo TEXT DEFAULT '/assets/avatar-student.png',
    biometric_id TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- 13. Subject Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    academic_session TEXT NOT NULL,
    enrollment_date TEXT DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE (student_id, subject_id, semester)
);

-- 14. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('midterm', 'final', 'quiz', 'assignment', 'practical')),
    semester INTEGER NOT NULL,
    weightage_percent REAL DEFAULT 30.00,
    exam_date TEXT,
    max_marks REAL DEFAULT 100.00,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 15. Marks Entry Table
CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    obtained_marks REAL NOT NULL,
    max_marks REAL NOT NULL DEFAULT 100.00,
    entered_by_teacher_id INTEGER NULL,
    is_locked INTEGER DEFAULT 0,
    remarks TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    UNIQUE (student_id, subject_id, exam_id)
);

-- 16. Grade Scale Definition (Gomal University / HEC Standard)
CREATE TABLE IF NOT EXISTS grade_scale (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    letter_grade TEXT NOT NULL UNIQUE,
    grade_point REAL NOT NULL,
    min_percentage REAL NOT NULL,
    max_percentage REAL NOT NULL,
    remarks TEXT
);

-- 17. Calculated Results Table
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    academic_session TEXT NOT NULL,
    total_credit_hours INTEGER DEFAULT 0,
    obtained_marks REAL DEFAULT 0.00,
    total_marks REAL DEFAULT 0.00,
    percentage REAL DEFAULT 0.00,
    gpa REAL DEFAULT 0.00,
    cgpa REAL DEFAULT 0.00,
    letter_grade TEXT DEFAULT 'F',
    status TEXT DEFAULT 'Pass' CHECK (status IN ('Pass', 'Fail', 'Promoted', 'Probation')),
    position_in_class INTEGER NULL,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE (student_id, semester, academic_session)
);

-- 18. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NULL,
    attendance_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave', 'Late')),
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'biometric', 'import')),
    marked_by_user_id INTEGER NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    UNIQUE (student_id, subject_id, attendance_date)
);

-- 19. Biometric Devices & Logs
CREATE TABLE IF NOT EXISTS biometric_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    port INTEGER DEFAULT 4370,
    location TEXT,
    last_sync_at TEXT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biometric_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    biometric_id TEXT NOT NULL,
    device_id INTEGER NULL,
    punch_time TEXT NOT NULL,
    raw_payload TEXT,
    is_processed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES biometric_devices(id) ON DELETE SET NULL
);

-- 20. Fines Management
CREATE TABLE IF NOT EXISTS fines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fine_number TEXT NOT NULL UNIQUE,
    student_id INTEGER NOT NULL,
    fine_type TEXT NOT NULL CHECK (fine_type IN ('attendance_shortage', 'library_overdue', 'late_fee', 'disciplinary', 'damage', 'other')),
    amount REAL NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'reversed', 'waived')),
    issued_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    issued_by_user_id INTEGER NULL,
    paid_date TEXT NULL,
    reversed_date TEXT NULL,
    reversed_reason TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 21. Fine Payments Ledger
CREATE TABLE IF NOT EXISTS fine_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_receipt_no TEXT NOT NULL UNIQUE,
    fine_id INTEGER NOT NULL,
    amount_paid REAL NOT NULL,
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank Challan', 'Online Transfer')),
    transaction_ref TEXT NULL,
    received_by_user_id INTEGER NOT NULL,
    payment_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE
);

-- 22. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id INTEGER NULL,
    ip_address TEXT,
    old_values TEXT NULL,
    new_values TEXT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 23. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical', 'success')),
    is_read INTEGER DEFAULT 0,
    action_url TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 24. College Circulars / Notice Board
CREATE TABLE IF NOT EXISTS circulars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    circular_no TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers', 'parents')),
    department_id INTEGER NULL,
    publish_date TEXT NOT NULL,
    expiry_date TEXT NULL,
    is_pinned INTEGER DEFAULT 0,
    created_by_user_id INTEGER NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 25. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_dept_sem ON students(department_id, semester);
CREATE INDEX IF NOT EXISTS idx_marks_student_sub ON marks(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_attend_student_date ON attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_fines_student ON fines(student_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
