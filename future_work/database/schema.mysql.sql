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
