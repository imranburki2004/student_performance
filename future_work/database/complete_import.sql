-- ==============================================================================
-- EduPulse DIK - Govt. Degree College No. 1, Dera Ismail Khan
-- Enterprise MySQL 8 / MariaDB Database Schema (3NF)
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS circulars;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS fine_payments;
DROP TABLE IF EXISTS fines;
DROP TABLE IF EXISTS biometric_logs;
DROP TABLE IF EXISTS biometric_devices;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS grade_scale;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teacher_subjects;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles Table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Permissions Table
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Role Permissions Mapping
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(25),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    linked_student_id INT NULL,
    linked_teacher_id INT NULL,
    is_active TINYINT(1) DEFAULT 1,
    failed_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    must_change_password TINYINT(1) DEFAULT 0,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_user_role (role_id),
    INDEX idx_user_username (username),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Refresh Tokens
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    hod_name VARCHAR(120),
    established_year INT DEFAULT 1950,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Programs Table (BS 4-Year, Inter, etc.)
CREATE TABLE programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    duration_years INT DEFAULT 4,
    total_semesters INT DEFAULT 8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_program_dept (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Classes (Sections)
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10) DEFAULT 'A',
    session VARCHAR(30) NOT NULL, -- e.g., '2023-2027'
    room_number VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    INDEX idx_class_prog_sem (program_id, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Teachers Table
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    designation VARCHAR(80) NOT NULL, -- Professor, Associate Prof, Assistant Prof, Lecturer
    qualification VARCHAR(120),
    department_id INT NOT NULL,
    phone VARCHAR(25),
    email VARCHAR(120) UNIQUE,
    hire_date DATE,
    photo VARCHAR(255) DEFAULT '/assets/avatar-teacher.png',
    status ENUM('active', 'on_leave', 'retired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_teacher_dept (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Subjects Table
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    credit_hours INT DEFAULT 3,
    department_id INT NOT NULL,
    program_id INT NOT NULL,
    semester INT NOT NULL,
    theory_marks INT DEFAULT 70,
    practical_marks INT DEFAULT 30,
    total_marks INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    INDEX idx_subject_prog_sem (program_id, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Teacher Subject Assignment
CREATE TABLE teacher_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    class_id INT NOT NULL,
    academic_session VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY uq_teacher_sub_class (teacher_id, subject_id, class_id, academic_session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Students Table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(40) NOT NULL UNIQUE,
    registration_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    father_name VARCHAR(120) NOT NULL,
    cnic VARCHAR(30),
    gender ENUM('Male', 'Female') DEFAULT 'Male',
    dob DATE,
    phone VARCHAR(25),
    guardian_phone VARCHAR(25),
    email VARCHAR(120),
    address VARCHAR(255),
    district VARCHAR(80) DEFAULT 'Dera Ismail Khan',
    department_id INT NOT NULL,
    program_id INT NOT NULL,
    class_id INT NOT NULL,
    semester INT DEFAULT 1,
    session VARCHAR(30) NOT NULL,
    admission_date DATE,
    status ENUM('active', 'graduated', 'suspended', 'dropped') DEFAULT 'active',
    photo VARCHAR(255) DEFAULT '/assets/avatar-student.png',
    biometric_id VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    INDEX idx_student_roll (roll_no),
    INDEX idx_student_dept_sem (department_id, semester),
    INDEX idx_student_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Subject Enrollments
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester INT NOT NULL,
    academic_session VARCHAR(30) NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('enrolled', 'dropped', 'completed') DEFAULT 'enrolled',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_subject_sem (student_id, subject_id, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Exams Table
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL, -- Midterm Exam, Final Exam, Quiz, Assignment
    exam_type ENUM('midterm', 'final', 'quiz', 'assignment', 'practical') NOT NULL,
    semester INT NOT NULL,
    weightage_percent DECIMAL(5,2) DEFAULT 30.00,
    exam_date DATE,
    max_marks DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Marks Entry Table
CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    exam_id INT NOT NULL,
    obtained_marks DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    entered_by_teacher_id INT NULL,
    is_locked TINYINT(1) DEFAULT 0,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_sub_exam (student_id, subject_id, exam_id),
    INDEX idx_marks_student (student_id),
    INDEX idx_marks_subject (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Grade Scale Definition (Gomal University / HEC Standard)
CREATE TABLE grade_scale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    letter_grade VARCHAR(5) NOT NULL UNIQUE,
    grade_point DECIMAL(3,2) NOT NULL,
    min_percentage DECIMAL(5,2) NOT NULL,
    max_percentage DECIMAL(5,2) NOT NULL,
    remarks VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Calculated Results Table
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    semester INT NOT NULL,
    academic_session VARCHAR(30) NOT NULL,
    total_credit_hours INT DEFAULT 0,
    obtained_marks DECIMAL(6,2) DEFAULT 0.00,
    total_marks DECIMAL(6,2) DEFAULT 0.00,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    cgpa DECIMAL(3,2) DEFAULT 0.00,
    letter_grade VARCHAR(5) DEFAULT 'F',
    status ENUM('Pass', 'Fail', 'Promoted', 'Probation') DEFAULT 'Pass',
    position_in_class INT NULL,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_sem_result (student_id, semester, academic_session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Leave', 'Late') NOT NULL,
    source ENUM('manual', 'biometric', 'import') DEFAULT 'manual',
    marked_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    UNIQUE KEY uq_attendance_student_sub_date (student_id, subject_id, attendance_date),
    INDEX idx_attend_student (student_id),
    INDEX idx_attend_date (attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Biometric Devices & Logs
CREATE TABLE biometric_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    port INT DEFAULT 4370,
    location VARCHAR(100),
    last_sync_at DATETIME NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE biometric_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    biometric_id VARCHAR(50) NOT NULL,
    device_id INT NULL,
    punch_time DATETIME NOT NULL,
    raw_payload TEXT,
    is_processed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES biometric_devices(id) ON DELETE SET NULL,
    INDEX idx_biometric_punch (biometric_id, punch_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Fines Management
CREATE TABLE fines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fine_number VARCHAR(50) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    fine_type ENUM('attendance_shortage', 'library_overdue', 'late_fee', 'disciplinary', 'damage', 'other') NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'paid', 'reversed', 'waived') DEFAULT 'pending',
    issued_date DATE NOT NULL,
    due_date DATE NOT NULL,
    issued_by_user_id INT NULL,
    paid_date DATETIME NULL,
    reversed_date DATETIME NULL,
    reversed_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_fine_student (student_id),
    INDEX idx_fine_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Fine Payments Ledger
CREATE TABLE fine_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_receipt_no VARCHAR(50) NOT NULL UNIQUE,
    fine_id INT NOT NULL,
    amount_paid DECIMAL(8,2) NOT NULL,
    payment_method ENUM('Cash', 'Bank Challan', 'Online Transfer') DEFAULT 'Cash',
    transaction_ref VARCHAR(100) NULL,
    received_by_user_id INT NOT NULL,
    payment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255),
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Audit Logs
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(80) NOT NULL, -- e.g., "FINE_PAID", "MARKS_UPDATED", "STUDENT_CREATED"
    entity_name VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    ip_address VARCHAR(45),
    old_values JSON NULL,
    new_values JSON NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'critical', 'success') DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    action_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. College Circulars / Notice Board
CREATE TABLE circulars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    circular_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience ENUM('all', 'students', 'teachers', 'parents') DEFAULT 'all',
    department_id INT NULL,
    publish_date DATE NOT NULL,
    expiry_date DATE NULL,
    is_pinned TINYINT(1) DEFAULT 0,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. System Settings
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ==============================================================================
-- EduPulse DIK - Govt. Degree College No. 1, Dera Ismail Khan
-- Comprehensive Realistic Seed Data (MySQL 8 / MariaDB)
-- Default Password for all seed users: Admin@123
-- Bcrypt Hash: $2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe
-- ==============================================================================

-- 1. Insert Roles
INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'admin', 'System Administrator', 'Full system access and maintenance'),
(2, 'principal', 'Principal / Executive', 'Executive oversight, college KPIs, audit trail'),
(3, 'hod', 'Head of Department', 'Departmental management, faculty monitoring, curriculum'),
(4, 'teacher', 'Faculty / Lecturer', 'Marks entry, class attendance, student feedback'),
(5, 'accounts', 'Accounts / Fine Clerk', 'Fine issuance, payment collection, fee ledgers'),
(6, 'student', 'Student', 'Personal performance, DMC, attendance, notices'),
(7, 'parent', 'Parent / Guardian', 'Wards performance, attendance warnings, fee status');

-- 2. Insert Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(1, 'students.view', 'students', 'View student lists and profiles'),
(2, 'students.create', 'students', 'Enroll new students'),
(3, 'students.edit', 'students', 'Modify student details'),
(4, 'students.delete', 'students', 'Delete or archive students'),
(5, 'teachers.manage', 'teachers', 'Manage faculty records and subject assignments'),
(6, 'marks.view', 'marks', 'View examination marks'),
(7, 'marks.entry', 'marks', 'Enter and edit examination marks'),
(8, 'marks.lock', 'marks', 'Lock final marks submission'),
(9, 'attendance.view', 'attendance', 'View attendance registers'),
(10, 'attendance.mark', 'attendance', 'Mark daily class attendance'),
(11, 'attendance.import', 'attendance', 'Bulk biometric attendance import'),
(12, 'fines.view', 'fines', 'View student fines ledger'),
(13, 'fines.issue', 'fines', 'Issue penalty fines'),
(14, 'fines.pay', 'fines', 'Record fine payments'),
(15, 'fines.unpay', 'fines', 'Reverse payments or waive fines'),
(16, 'reports.dmc', 'reports', 'Generate official DMCs and transcripts'),
(17, 'reports.export', 'reports', 'Export Excel and CSV analytics'),
(18, 'system.backup', 'system', 'Create and restore database backups'),
(19, 'system.settings', 'system', 'Configure college policies and parameters');

-- 3. Map Role Permissions
-- Admin gets all permissions (1-19)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Principal gets view, marks, attendance, reports, audit
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 6), (2, 9), (2, 12), (2, 16), (2, 17);

-- HOD gets departmental management, marks view/lock, attendance view
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 5), (3, 6), (3, 8), (3, 9), (3, 16), (3, 17);

-- Teacher gets marks entry & attendance marking
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 6), (4, 7), (4, 9), (4, 10), (4, 16);

-- Accounts gets fines full management
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 1), (5, 12), (5, 13), (5, 14), (5, 15), (5, 17);

-- Student gets self view
INSERT INTO role_permissions (role_id, permission_id) VALUES
(6, 1), (6, 6), (6, 9), (6, 12), (6, 16);

-- Parent gets self ward view
INSERT INTO role_permissions (role_id, permission_id) VALUES
(7, 1), (7, 6), (7, 9), (7, 12), (7, 16);

-- 4. Insert Departments
INSERT INTO departments (id, code, name, hod_name, established_year, description) VALUES
(1, 'CS', 'Department of Computer Science & IT', 'Prof. Muhammad Irfan', 2001, 'Premier computing and data science education center in D.I. Khan.'),
(2, 'PHY', 'Department of Physics', 'Dr. Sajid Farooq', 1965, 'Experimental and theoretical physics laboratories and research.'),
(3, 'CHM', 'Department of Chemistry', 'Dr. Qaiser Mehmood', 1968, 'Organic, inorganic and analytical chemistry disciplines.'),
(4, 'MTH', 'Department of Mathematics', 'Prof. Abdul Ghaffar', 1958, 'Pure and applied mathematics with computational modeling.'),
(5, 'ENG', 'Department of English', 'Prof. Naimatullah Babar', 1952, 'English literature, linguistics, and communicative competencies.'),
(6, 'BOT', 'Department of Botany', 'Dr. Farhat Ullah', 1972, 'Plant biology, biodiversity, and regional agricultural flora.'),
(7, 'ZOO', 'Department of Zoology', 'Dr. Inamullah Khan', 1974, 'Animal genetics, physiology, and environmental ecosystems.');

-- 5. Insert Programs
INSERT INTO programs (id, department_id, code, name, duration_years, total_semesters) VALUES
(1, 1, 'BSCS', 'BS Computer Science (4-Year)', 4, 8),
(2, 2, 'BSPHY', 'BS Physics (4-Year)', 4, 8),
(3, 3, 'BSCHM', 'BS Chemistry (4-Year)', 4, 8),
(4, 4, 'BSMTH', 'BS Mathematics (4-Year)', 4, 8),
(5, 5, 'BSENG', 'BS English (4-Year)', 4, 8);

-- 6. Insert Classes (Sections)
INSERT INTO classes (id, program_id, semester, section, session, room_number) VALUES
(1, 1, 6, 'A', '2022-2026', 'CS Lab 1'),
(2, 1, 4, 'A', '2023-2027', 'Lecture Hall 4'),
(3, 1, 2, 'A', '2024-2028', 'Room 12'),
(4, 2, 6, 'A', '2022-2026', 'Physics Lab A'),
(5, 3, 6, 'A', '2022-2026', 'Chemistry Lab 2'),
(6, 4, 4, 'A', '2023-2027', 'Room 8'),
(7, 5, 6, 'A', '2022-2026', 'English Seminar Hall');

-- 7. Insert Teachers
INSERT INTO teachers (id, employee_no, name, designation, qualification, department_id, phone, email, hire_date, status) VALUES
(1, 'T-GDC1-001', 'Prof. Dr. Tariq Mahmood', 'Principal / Professor', 'Ph.D. Education Administration', 1, '0300-9876543', 'principal@gdc1dik.edu.pk', '2005-08-15', 'active'),
(2, 'T-GDC1-002', 'Prof. Muhammad Irfan', 'Associate Professor / HOD', 'M.Phil Computer Science', 1, '0333-9456789', 'irfan.cs@gdc1dik.edu.pk', '2010-02-01', 'active'),
(3, 'T-GDC1-003', 'Engr. Waqas Ahmad', 'Lecturer', 'MS Software Engineering', 1, '0345-7654321', 'waqas.ahmad@gdc1dik.edu.pk', '2016-09-10', 'active'),
(4, 'T-GDC1-004', 'Dr. Sajid Farooq', 'Associate Professor / HOD', 'Ph.D. Solid State Physics', 2, '0312-3456789', 'sajid.phy@gdc1dik.edu.pk', '2008-03-20', 'active'),
(5, 'T-GDC1-005', 'Dr. Qaiser Mehmood', 'Assistant Professor / HOD', 'Ph.D. Analytical Chemistry', 3, '0301-2345678', 'qaiser.chm@gdc1dik.edu.pk', '2012-11-15', 'active'),
(6, 'T-GDC1-006', 'Prof. Abdul Ghaffar', 'Assistant Professor / HOD', 'M.Phil Applied Mathematics', 4, '0334-8765432', 'ghaffar.mth@gdc1dik.edu.pk', '2011-04-12', 'active'),
(7, 'T-GDC1-007', 'Prof. Naimatullah Babar', 'Lecturer / HOD', 'M.A. English Literature', 5, '0346-5432109', 'babar.eng@gdc1dik.edu.pk', '2017-01-25', 'active');

-- 8. Insert Subjects
INSERT INTO subjects (id, code, name, credit_hours, department_id, program_id, semester, theory_marks, practical_marks, total_marks) VALUES
(1, 'CS-601', 'Database Systems', 4, 1, 1, 6, 70, 30, 100),
(2, 'CS-602', 'Software Engineering', 3, 1, 1, 6, 100, 0, 100),
(3, 'CS-603', 'Computer Networks', 4, 1, 1, 6, 70, 30, 100),
(4, 'CS-604', 'Web Technologies', 3, 1, 1, 6, 60, 40, 100),
(5, 'CS-605', 'Artificial Intelligence', 3, 1, 1, 6, 70, 30, 100),
(6, 'PHY-601', 'Quantum Mechanics II', 3, 2, 2, 6, 100, 0, 100),
(7, 'PHY-602', 'Nuclear Physics', 4, 2, 2, 6, 70, 30, 100),
(8, 'CHM-601', 'Organic Spectroscopy', 4, 3, 3, 6, 70, 30, 100),
(9, 'MTH-401', 'Differential Equations', 3, 4, 4, 4, 100, 0, 100),
(10, 'ENG-601', 'Modern Drama & Poetry', 3, 5, 5, 6, 100, 0, 100);

-- 9. Teacher Subject Assignments
INSERT INTO teacher_subjects (id, teacher_id, subject_id, class_id, academic_session) VALUES
(1, 3, 1, 1, '2022-2026'), -- Waqas Ahmad teaches Database Systems to BSCS-6A
(2, 2, 2, 1, '2022-2026'), -- Muhammad Irfan teaches Software Engineering to BSCS-6A
(3, 3, 4, 1, '2022-2026'), -- Waqas Ahmad teaches Web Technologies to BSCS-6A
(4, 4, 6, 4, '2022-2026'), -- Dr. Sajid teaches Quantum Mechanics to BSPHY-6A
(5, 5, 8, 5, '2022-2026'); -- Dr. Qaiser teaches Organic Spectroscopy to BSCHM-6A

-- 10. Insert Students
INSERT INTO students (id, roll_no, registration_no, name, father_name, cnic, gender, dob, phone, guardian_phone, email, address, district, department_id, program_id, class_id, semester, session, admission_date, status, biometric_id) VALUES
(1, 'GDC1-BSCS-22-01', 'GU/2022/BSCS/101', 'Muhammad Bilal', 'Tariq Mehmood', '12101-1234567-1', 'Male', '2003-04-12', '0300-1112233', '0300-9998877', 'bilal.gdc1@gmail.com', 'Mohallah Topanwala, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-001'),
(2, 'GDC1-BSCS-22-02', 'GU/2022/BSCS/102', 'Hamza Khan', 'Abdul Majeed', '12101-2345678-3', 'Male', '2002-11-20', '0313-2223344', '0313-8887766', 'hamza.k@gmail.com', 'Circular Road, Near Town Hall, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-002'),
(3, 'GDC1-BSCS-22-03', 'GU/2022/BSCS/103', 'Zeeshan Ali', 'Liaquat Ali', '12101-3456789-5', 'Male', '2003-01-15', '0345-3334455', '0345-7776655', 'zeeshan.ali@gmail.com', 'Main Bazaar, Paharpur', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-003'),
(4, 'GDC1-BSCS-22-04', 'GU/2022/BSCS/104', 'Asad Ullah', 'Nazar Muhammad', '12101-4567890-7', 'Male', '2003-08-05', '0333-4445566', '0333-6665544', 'asad.ullah@gmail.com', 'Paroa Road, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-004'),
(5, 'GDC1-BSCS-22-05', 'GU/2022/BSCS/105', 'Saad Farooq', 'Farooq Ahmad', '12101-5678901-9', 'Male', '2002-09-18', '0315-5556677', '0315-5554433', 'saad.f@gmail.com', 'Shorkot Road, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-005'),
(6, 'GDC1-BSCS-22-06', 'GU/2022/BSCS/106', 'Daniyal Qureshi', 'Munir Ahmad', '12101-6789012-1', 'Male', '2004-02-28', '0308-6667788', '0308-4443322', 'daniyal.q@gmail.com', 'Commissionary Bazar, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-006'),
(7, 'GDC1-BSCS-22-07', 'GU/2022/BSCS/107', 'Usman Tariq', 'Tariq Aziz', '12101-7890123-3', 'Male', '2003-06-10', '0321-7778899', '0321-3332211', 'usman.tariq@gmail.com', 'Chah Syed Munawar Shah, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-007'),
(8, 'GDC1-BSCS-22-08', 'GU/2022/BSCS/108', 'Faizan Ahmad', 'Ghulam Rasool', '12101-8901234-5', 'Male', '2002-12-14', '0342-8889900', '0342-2221100', 'faizan.ahmad@gmail.com', 'Kotla Saidan, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-008'),
(9, 'GDC1-BSCS-22-09', 'GU/2022/BSCS/109', 'Waqar Younis', 'Younis Khan', '12101-9012345-7', 'Male', '2003-03-22', '0304-9990011', '0304-1110099', 'waqar.younis@gmail.com', 'University Road, Gomal Town, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-009'),
(10, 'GDC1-BSCS-22-10', 'GU/2022/BSCS/110', 'Mian Shahmeer', 'Mian Khalid', '12101-0123456-9', 'Male', '2003-07-30', '0310-1010101', '0310-9090909', 'shahmeer@gmail.com', 'Cantt Area, D.I. Khan', 'Dera Ismail Khan', 1, 1, 1, 6, '2022-2026', '2022-09-15', 'active', 'BIO-010');

-- 11. Insert System Users (with matching bcrypt password: Admin@123)
-- Hash generated with salt 10 for password 'Admin@123'
INSERT INTO users (id, username, email, phone, password_hash, role_id, linked_student_id, linked_teacher_id, is_active) VALUES
(1, 'admin', 'admin@gdc1dik.edu.pk', '0300-1234567', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 1, NULL, NULL, 1),
(2, 'principal', 'principal@gdc1dik.edu.pk', '0300-9876543', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 2, NULL, 1, 1),
(3, 'hod_cs', 'irfan.cs@gdc1dik.edu.pk', '0333-9456789', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 3, NULL, 2, 1),
(4, 'teacher_waqas', 'waqas.ahmad@gdc1dik.edu.pk', '0345-7654321', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 4, NULL, 3, 1),
(5, 'accounts_aslam', 'accounts@gdc1dik.edu.pk', '0312-7654321', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 5, NULL, NULL, 1),
(6, 'student_bilal', 'bilal.gdc1@gmail.com', '0300-1112233', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 6, 1, NULL, 1),
(7, 'parent_tariq', 'tariq.parent@gmail.com', '0300-9998877', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 7, 1, NULL, 1);

-- 12. Insert Grade Scale (HEC / Gomal University Standard)
INSERT INTO grade_scale (id, letter_grade, grade_point, min_percentage, max_percentage, remarks) VALUES
(1, 'A+', 4.00, 85.00, 100.00, 'Outstanding Performance'),
(2, 'A',  3.70, 80.00, 84.99, 'Excellent Achievement'),
(3, 'B+', 3.30, 75.00, 79.99, 'Very Good'),
(4, 'B',  3.00, 70.00, 74.99, 'Good Standard'),
(5, 'C+', 2.70, 65.00, 69.99, 'Above Average'),
(6, 'C',  2.30, 60.00, 64.99, 'Average Standing'),
(7, 'D+', 2.00, 55.00, 59.99, 'Below Average'),
(8, 'D',  1.70, 50.00, 54.99, 'Marginal Pass'),
(9, 'F',  0.00, 0.00,  49.99, 'Fail / Inadequate');

-- 13. Insert Exams
INSERT INTO exams (id, name, exam_type, semester, weightage_percent, exam_date, max_marks) VALUES
(1, 'Midterm Exam - Spring 2026', 'midterm', 6, 30.00, '2026-03-25', 100.00),
(2, 'Final Exam - Spring 2026', 'final', 6, 50.00, '2026-06-10', 100.00),
(3, 'Sessional Assessment (Quizzes & Assignments)', 'quiz', 6, 20.00, '2026-05-15', 100.00);

-- 14. Enrollments for BSCS-6A Students in Database Systems (Subject 1)
INSERT INTO enrollments (student_id, subject_id, semester, academic_session) VALUES
(1, 1, 6, '2022-2026'),
(2, 1, 6, '2022-2026'),
(3, 1, 6, '2022-2026'),
(4, 1, 6, '2022-2026'),
(5, 1, 6, '2022-2026'),
(6, 1, 6, '2022-2026'),
(7, 1, 6, '2022-2026'),
(8, 1, 6, '2022-2026'),
(9, 1, 6, '2022-2026'),
(10, 1, 6, '2022-2026');

-- 15. Marks Records (Exam 1: Midterm)
INSERT INTO marks (student_id, subject_id, exam_id, obtained_marks, max_marks, entered_by_teacher_id, remarks) VALUES
(1, 1, 1, 88.00, 100.00, 3, 'Outstanding grasp of SQL and Relational Algebra'),
(2, 1, 1, 78.00, 100.00, 3, 'Good performance, needs to practice Normalization'),
(3, 1, 1, 42.00, 100.00, 3, 'At Risk: Struggling with ER modeling and queries'),
(4, 1, 1, 65.00, 100.00, 3, 'Satisfactory, average performance'),
(5, 1, 1, 91.00, 100.00, 3, 'Exceptional work in schema design'),
(6, 1, 1, 54.00, 100.00, 3, 'Below average, needs revision sessions'),
(7, 1, 1, 82.00, 100.00, 3, 'Very good analytical response'),
(8, 1, 1, 38.00, 100.00, 3, 'Critical: Failed midterm test'),
(9, 1, 1, 74.00, 100.00, 3, 'Above average score'),
(10, 1, 1, 85.00, 100.00, 3, 'High quality submission');

-- Sessional Marks (Exam 3)
INSERT INTO marks (student_id, subject_id, exam_id, obtained_marks, max_marks, entered_by_teacher_id, remarks) VALUES
(1, 1, 3, 92.00, 100.00, 3, 'All assignments submitted on time'),
(2, 1, 3, 80.00, 100.00, 3, 'Regular quiz participation'),
(3, 1, 3, 45.00, 100.00, 3, 'Missed 2 quizzes'),
(4, 1, 3, 70.00, 100.00, 3, 'Completed assignments'),
(5, 1, 3, 95.00, 100.00, 3, 'Top sessional performance');

-- 16. Calculated Cumulative Results
INSERT INTO results (student_id, semester, academic_session, total_credit_hours, obtained_marks, total_marks, percentage, gpa, cgpa, letter_grade, status, position_in_class) VALUES
(1, 5, '2022-2026', 18, 485.00, 550.00, 88.18, 3.85, 3.82, 'A+', 'Pass', 1),
(2, 5, '2022-2026', 18, 430.00, 550.00, 78.18, 3.25, 3.30, 'B+', 'Pass', 4),
(3, 5, '2022-2026', 18, 290.00, 550.00, 52.72, 1.85, 2.10, 'D', 'Probation', 10),
(4, 5, '2022-2026', 18, 380.00, 550.00, 69.09, 2.80, 2.95, 'C+', 'Pass', 7),
(5, 5, '2022-2026', 18, 492.00, 550.00, 89.45, 3.92, 3.88, 'A+', 'Pass', 2);

-- 17. Attendance Logs (Demonstrating varying attendance rates)
INSERT INTO attendance (student_id, subject_id, attendance_date, status, source) VALUES
-- Student 1: Bilal (High Attendance > 90%)
(1, 1, '2026-10-12', 'Present', 'manual'),
(1, 1, '2026-10-13', 'Present', 'manual'),
(1, 1, '2026-10-14', 'Present', 'biometric'),
(1, 1, '2026-10-15', 'Present', 'manual'),
(1, 1, '2026-10-16', 'Present', 'biometric'),
(1, 1, '2026-10-19', 'Present', 'manual'),
(1, 1, '2026-10-20', 'Present', 'manual'),
(1, 1, '2026-10-21', 'Present', 'biometric'),
-- Student 3: Zeeshan Ali (Low Attendance < 60% -> Triggering 75% warning)
(3, 1, '2026-10-12', 'Absent', 'manual'),
(3, 1, '2026-10-13', 'Absent', 'manual'),
(3, 1, '2026-10-14', 'Present', 'biometric'),
(3, 1, '2026-10-15', 'Absent', 'manual'),
(3, 1, '2026-10-16', 'Leave', 'manual'),
(3, 1, '2026-10-19', 'Absent', 'manual'),
(3, 1, '2026-10-20', 'Present', 'manual'),
(3, 1, '2026-10-21', 'Absent', 'biometric'),
-- Student 8: Faizan Ahmad (Critical Shortage)
(8, 1, '2026-10-12', 'Absent', 'manual'),
(8, 1, '2026-10-13', 'Absent', 'manual'),
(8, 1, '2026-10-14', 'Absent', 'manual'),
(8, 1, '2026-10-15', 'Absent', 'manual'),
(8, 1, '2026-10-16', 'Absent', 'manual'),
(8, 1, '2026-10-19', 'Present', 'manual'),
(8, 1, '2026-10-20', 'Absent', 'manual'),
(8, 1, '2026-10-21', 'Absent', 'biometric');

-- 18. Fines Management Records
INSERT INTO fines (id, fine_number, student_id, fine_type, amount, reason, status, issued_date, due_date, issued_by_user_id, paid_date) VALUES
(1, 'FN-2026-001', 3, 'attendance_shortage', 500.00, 'Attendance dropped below 75% in Database Systems', 'pending', '2026-10-15', '2026-10-25', 5, NULL),
(2, 'FN-2026-002', 8, 'attendance_shortage', 1000.00, 'Severe consecutive absenteeism without sanction', 'pending', '2026-10-18', '2026-10-28', 5, NULL),
(3, 'FN-2026-003', 2, 'library_overdue', 200.00, 'Overdue book: Modern Operating Systems 4th Ed', 'paid', '2026-10-05', '2026-10-15', 5, '2026-10-10 11:30:00'),
(4, 'FN-2026-004', 4, 'late_fee', 300.00, 'Late semester registration challan', 'reversed', '2026-10-01', '2026-10-10', 5, NULL);

-- 19. Fine Payments
INSERT INTO fine_payments (id, payment_receipt_no, fine_id, amount_paid, payment_method, received_by_user_id, notes) VALUES
(1, 'REC-2026-901', 3, 200.00, 'Cash', 5, 'Received in full by Senior Accounts Clerk');

-- 20. Audit Trail Logs
INSERT INTO audit_logs (user_id, action, entity_name, entity_id, ip_address, description) VALUES
(1, 'SYSTEM_INIT', 'System', 1, '127.0.0.1', 'College management system initialized with base seed dataset'),
(4, 'MARKS_ENTRY', 'marks', 1, '192.168.1.15', 'Entered Midterm Examination marks for BSCS-6A Database Systems'),
(5, 'FINE_ISSUED', 'fines', 1, '192.168.1.20', 'Issued attendance shortage fine of Rs. 500 to student GDC1-BSCS-22-03');

-- 21. College Circulars / Notices
INSERT INTO circulars (circular_no, title, content, target_audience, department_id, publish_date, is_pinned) VALUES
('CIR-2026/041', 'Mandatory 75% Attendance Requirement for Spring 2026 Finals', 'All enrolled students are notified that per HEC and Gomal University regulations, any student with less than 75% attendance will NOT be permitted to sit in final exams.', 'students', NULL, '2026-10-10', 1),
('CIR-2026/042', 'Submission of Midterm Examination Result Sheets', 'All faculty members are requested to complete midterm grading and upload marks onto the EduPulse portal by Friday.', 'teachers', 1, '2026-10-12', 1),
('CIR-2026/043', 'Annual Inter-Departmental Cricket Tournament 2026', 'Department trials will commence from next Monday at College Sports Ground. Interested students contact Director Physical Education.', 'all', NULL, '2026-10-15', 0);

-- 22. System Settings
INSERT INTO system_settings (setting_key, setting_value, category, description) VALUES
('college_name', 'Govt. Degree College No. 1, Dera Ismail Khan', 'general', 'Official institutional title'),
('affiliated_university', 'Gomal University, D.I. Khan / HED KP', 'general', 'Accreditation body'),
('min_attendance_threshold', '75', 'academic', 'Minimum percentage required to sit in final examinations'),
('passing_mark_percent', '50', 'academic', 'Passing benchmark percentage'),
('midterm_weight', '30', 'grading', 'Midterm percentage weightage'),
('final_weight', '50', 'grading', 'Final exam percentage weightage'),
('sessional_weight', '20', 'grading', 'Sessional quiz/assignment weightage'),
('currency_symbol', 'Rs.', 'finance', 'Pakistani Rupee currency display');
