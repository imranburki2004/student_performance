-- ==============================================================================
-- EduPulse DIK - Govt. Degree College No. 1, Dera Ismail Khan
-- Comprehensive Realistic Seed Data (SQLite 3 Fallback Engine)
-- Default Password for all seed users: Admin@123
-- Bcrypt Hash: $2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe
-- ==============================================================================

-- 1. Roles
INSERT OR IGNORE INTO roles (id, name, display_name, description) VALUES
(1, 'admin', 'System Administrator', 'Full system access and maintenance'),
(2, 'principal', 'Principal / Executive', 'Executive oversight, college KPIs, audit trail'),
(3, 'hod', 'Head of Department', 'Departmental management, faculty monitoring, curriculum'),
(4, 'teacher', 'Faculty / Lecturer', 'Marks entry, class attendance, student feedback'),
(5, 'accounts', 'Accounts / Fine Clerk', 'Fine issuance, payment collection, fee ledgers'),
(6, 'student', 'Student', 'Personal performance, DMC, attendance, notices'),
(7, 'parent', 'Parent / Guardian', 'Wards performance, attendance warnings, fee status');

-- 2. Permissions
INSERT OR IGNORE INTO permissions (id, name, module, description) VALUES
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

-- 3. Role Permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 6), (2, 9), (2, 12), (2, 16), (2, 17),
(3, 1), (3, 5), (3, 6), (3, 8), (3, 9), (3, 16), (3, 17),
(4, 1), (4, 6), (4, 7), (4, 9), (4, 10), (4, 16),
(5, 1), (5, 12), (5, 13), (5, 14), (5, 15), (5, 17),
(6, 1), (6, 6), (6, 9), (6, 12), (6, 16),
(7, 1), (7, 6), (7, 9), (7, 12), (7, 16);

-- 4. Departments
INSERT OR IGNORE INTO departments (id, code, name, hod_name, established_year, description) VALUES
(1, 'CS', 'Department of Computer Science & IT', 'Prof. Muhammad Irfan', 2001, 'Premier computing and data science education center in D.I. Khan.'),
(2, 'PHY', 'Department of Physics', 'Dr. Sajid Farooq', 1965, 'Experimental and theoretical physics laboratories and research.'),
(3, 'CHM', 'Department of Chemistry', 'Dr. Qaiser Mehmood', 1968, 'Organic, inorganic and analytical chemistry disciplines.'),
(4, 'MTH', 'Department of Mathematics', 'Prof. Abdul Ghaffar', 1958, 'Pure and applied mathematics with computational modeling.'),
(5, 'ENG', 'Department of English', 'Prof. Naimatullah Babar', 1952, 'English literature, linguistics, and communicative competencies.'),
(6, 'BOT', 'Department of Botany', 'Dr. Farhat Ullah', 1972, 'Plant biology, biodiversity, and regional agricultural flora.'),
(7, 'ZOO', 'Department of Zoology', 'Dr. Inamullah Khan', 1974, 'Animal genetics, physiology, and environmental ecosystems.');

-- 5. Programs
INSERT OR IGNORE INTO programs (id, department_id, code, name, duration_years, total_semesters) VALUES
(1, 1, 'BSCS', 'BS Computer Science (4-Year)', 4, 8),
(2, 2, 'BSPHY', 'BS Physics (4-Year)', 4, 8),
(3, 3, 'BSCHM', 'BS Chemistry (4-Year)', 4, 8),
(4, 4, 'BSMTH', 'BS Mathematics (4-Year)', 4, 8),
(5, 5, 'BSENG', 'BS English (4-Year)', 4, 8);

-- 6. Classes
INSERT OR IGNORE INTO classes (id, program_id, semester, section, session, room_number) VALUES
(1, 1, 6, 'A', '2022-2026', 'CS Lab 1'),
(2, 1, 4, 'A', '2023-2027', 'Lecture Hall 4'),
(3, 1, 2, 'A', '2024-2028', 'Room 12'),
(4, 2, 6, 'A', '2022-2026', 'Physics Lab A'),
(5, 3, 6, 'A', '2022-2026', 'Chemistry Lab 2'),
(6, 4, 4, 'A', '2023-2027', 'Room 8'),
(7, 5, 6, 'A', '2022-2026', 'English Seminar Hall');

-- 7. Teachers
INSERT OR IGNORE INTO teachers (id, employee_no, name, designation, qualification, department_id, phone, email, hire_date, status) VALUES
(1, 'T-GDC1-001', 'Prof. Dr. Tariq Mahmood', 'Principal / Professor', 'Ph.D. Education Administration', 1, '0300-9876543', 'principal@gdc1dik.edu.pk', '2005-08-15', 'active'),
(2, 'T-GDC1-002', 'Prof. Muhammad Irfan', 'Associate Professor / HOD', 'M.Phil Computer Science', 1, '0333-9456789', 'irfan.cs@gdc1dik.edu.pk', '2010-02-01', 'active'),
(3, 'T-GDC1-003', 'Engr. Waqas Ahmad', 'Lecturer', 'MS Software Engineering', 1, '0345-7654321', 'waqas.ahmad@gdc1dik.edu.pk', '2016-09-10', 'active'),
(4, 'T-GDC1-004', 'Dr. Sajid Farooq', 'Associate Professor / HOD', 'Ph.D. Solid State Physics', 2, '0312-3456789', 'sajid.phy@gdc1dik.edu.pk', '2008-03-20', 'active'),
(5, 'T-GDC1-005', 'Dr. Qaiser Mehmood', 'Assistant Professor / HOD', 'Ph.D. Analytical Chemistry', 3, '0301-2345678', 'qaiser.chm@gdc1dik.edu.pk', '2012-11-15', 'active'),
(6, 'T-GDC1-006', 'Prof. Abdul Ghaffar', 'Assistant Professor / HOD', 'M.Phil Applied Mathematics', 4, '0334-8765432', 'ghaffar.mth@gdc1dik.edu.pk', '2011-04-12', 'active'),
(7, 'T-GDC1-007', 'Prof. Naimatullah Babar', 'Lecturer / HOD', 'M.A. English Literature', 5, '0346-5432109', 'babar.eng@gdc1dik.edu.pk', '2017-01-25', 'active');

-- 8. Subjects
INSERT OR IGNORE INTO subjects (id, code, name, credit_hours, department_id, program_id, semester, theory_marks, practical_marks, total_marks) VALUES
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

-- 9. Teacher Subjects Assignment
INSERT OR IGNORE INTO teacher_subjects (id, teacher_id, subject_id, class_id, academic_session) VALUES
(1, 3, 1, 1, '2022-2026'),
(2, 2, 2, 1, '2022-2026'),
(3, 3, 4, 1, '2022-2026'),
(4, 4, 6, 4, '2022-2026'),
(5, 5, 8, 5, '2022-2026');

-- 10. Students
INSERT OR IGNORE INTO students (id, roll_no, registration_no, name, father_name, cnic, gender, dob, phone, guardian_phone, email, address, district, department_id, program_id, class_id, semester, session, admission_date, status, biometric_id) VALUES
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

-- 11. System Users
INSERT OR IGNORE INTO users (id, username, email, phone, password_hash, role_id, linked_student_id, linked_teacher_id, is_active) VALUES
(1, 'admin', 'admin@gdc1dik.edu.pk', '0300-1234567', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 1, NULL, NULL, 1),
(2, 'principal', 'principal@gdc1dik.edu.pk', '0300-9876543', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 2, NULL, 1, 1),
(3, 'hod_cs', 'irfan.cs@gdc1dik.edu.pk', '0333-9456789', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 3, NULL, 2, 1),
(4, 'teacher_waqas', 'waqas.ahmad@gdc1dik.edu.pk', '0345-7654321', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 4, NULL, 3, 1),
(5, 'accounts_aslam', 'accounts@gdc1dik.edu.pk', '0312-7654321', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 5, NULL, NULL, 1),
(6, 'student_bilal', 'bilal.gdc1@gmail.com', '0300-1112233', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 6, 1, NULL, 1),
(7, 'parent_tariq', 'tariq.parent@gmail.com', '0300-9998877', '$2a$10$3euP0v8kKkK8Fj5D4R3tceGq9aYl1rJzGkZ3/P1sF9U7l1wzN4hxe', 7, 1, NULL, 1);

-- 12. Grade Scale
INSERT OR IGNORE INTO grade_scale (id, letter_grade, grade_point, min_percentage, max_percentage, remarks) VALUES
(1, 'A+', 4.00, 85.00, 100.00, 'Outstanding Performance'),
(2, 'A',  3.70, 80.00, 84.99, 'Excellent Achievement'),
(3, 'B+', 3.30, 75.00, 79.99, 'Very Good'),
(4, 'B',  3.00, 70.00, 74.99, 'Good Standard'),
(5, 'C+', 2.70, 65.00, 69.99, 'Above Average'),
(6, 'C',  2.30, 60.00, 64.99, 'Average Standing'),
(7, 'D+', 2.00, 55.00, 59.99, 'Below Average'),
(8, 'D',  1.70, 50.00, 54.99, 'Marginal Pass'),
(9, 'F',  0.00, 0.00,  49.99, 'Fail / Inadequate');

-- 13. Exams
INSERT OR IGNORE INTO exams (id, name, exam_type, semester, weightage_percent, exam_date, max_marks) VALUES
(1, 'Midterm Exam - Spring 2026', 'midterm', 6, 30.00, '2026-03-25', 100.00),
(2, 'Final Exam - Spring 2026', 'final', 6, 50.00, '2026-06-10', 100.00),
(3, 'Sessional Assessment (Quizzes & Assignments)', 'quiz', 6, 20.00, '2026-05-15', 100.00);

-- 14. Enrollments
INSERT OR IGNORE INTO enrollments (student_id, subject_id, semester, academic_session) VALUES
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

-- 15. Marks
INSERT OR IGNORE INTO marks (student_id, subject_id, exam_id, obtained_marks, max_marks, entered_by_teacher_id, remarks) VALUES
(1, 1, 1, 88.00, 100.00, 3, 'Outstanding grasp of SQL and Relational Algebra'),
(2, 1, 1, 78.00, 100.00, 3, 'Good performance, needs to practice Normalization'),
(3, 1, 1, 42.00, 100.00, 3, 'At Risk: Struggling with ER modeling and queries'),
(4, 1, 1, 65.00, 100.00, 3, 'Satisfactory, average performance'),
(5, 1, 1, 91.00, 100.00, 3, 'Exceptional work in schema design'),
(6, 1, 1, 54.00, 100.00, 3, 'Below average, needs revision sessions'),
(7, 1, 1, 82.00, 100.00, 3, 'Very good analytical response'),
(8, 1, 1, 38.00, 100.00, 3, 'Critical: Failed midterm test'),
(9, 1, 1, 74.00, 100.00, 3, 'Above average score'),
(10, 1, 1, 85.00, 100.00, 3, 'High quality submission'),
(1, 1, 3, 92.00, 100.00, 3, 'All assignments submitted on time'),
(2, 1, 3, 80.00, 100.00, 3, 'Regular quiz participation'),
(3, 1, 3, 45.00, 100.00, 3, 'Missed 2 quizzes'),
(4, 1, 3, 70.00, 100.00, 3, 'Completed assignments'),
(5, 1, 3, 95.00, 100.00, 3, 'Top sessional performance');

-- 16. Results
INSERT OR IGNORE INTO results (student_id, semester, academic_session, total_credit_hours, obtained_marks, total_marks, percentage, gpa, cgpa, letter_grade, status, position_in_class) VALUES
(1, 5, '2022-2026', 18, 485.00, 550.00, 88.18, 3.85, 3.82, 'A+', 'Pass', 1),
(2, 5, '2022-2026', 18, 430.00, 550.00, 78.18, 3.25, 3.30, 'B+', 'Pass', 4),
(3, 5, '2022-2026', 18, 290.00, 550.00, 52.72, 1.85, 2.10, 'D', 'Probation', 10),
(4, 5, '2022-2026', 18, 380.00, 550.00, 69.09, 2.80, 2.95, 'C+', 'Pass', 7),
(5, 5, '2022-2026', 18, 492.00, 550.00, 89.45, 3.92, 3.88, 'A+', 'Pass', 2);

-- 17. Attendance
INSERT OR IGNORE INTO attendance (student_id, subject_id, attendance_date, status, source) VALUES
(1, 1, '2026-10-12', 'Present', 'manual'),
(1, 1, '2026-10-13', 'Present', 'manual'),
(1, 1, '2026-10-14', 'Present', 'biometric'),
(1, 1, '2026-10-15', 'Present', 'manual'),
(1, 1, '2026-10-16', 'Present', 'biometric'),
(1, 1, '2026-10-19', 'Present', 'manual'),
(1, 1, '2026-10-20', 'Present', 'manual'),
(1, 1, '2026-10-21', 'Present', 'biometric'),
(3, 1, '2026-10-12', 'Absent', 'manual'),
(3, 1, '2026-10-13', 'Absent', 'manual'),
(3, 1, '2026-10-14', 'Present', 'biometric'),
(3, 1, '2026-10-15', 'Absent', 'manual'),
(3, 1, '2026-10-16', 'Leave', 'manual'),
(3, 1, '2026-10-19', 'Absent', 'manual'),
(3, 1, '2026-10-20', 'Present', 'manual'),
(3, 1, '2026-10-21', 'Absent', 'biometric'),
(8, 1, '2026-10-12', 'Absent', 'manual'),
(8, 1, '2026-10-13', 'Absent', 'manual'),
(8, 1, '2026-10-14', 'Absent', 'manual'),
(8, 1, '2026-10-15', 'Absent', 'manual'),
(8, 1, '2026-10-16', 'Absent', 'manual'),
(8, 1, '2026-10-19', 'Present', 'manual'),
(8, 1, '2026-10-20', 'Absent', 'manual'),
(8, 1, '2026-10-21', 'Absent', 'biometric');

-- 18. Fines
INSERT OR IGNORE INTO fines (id, fine_number, student_id, fine_type, amount, reason, status, issued_date, due_date, issued_by_user_id, paid_date) VALUES
(1, 'FN-2026-001', 3, 'attendance_shortage', 500.00, 'Attendance dropped below 75% in Database Systems', 'pending', '2026-10-15', '2026-10-25', 5, NULL),
(2, 'FN-2026-002', 8, 'attendance_shortage', 1000.00, 'Severe consecutive absenteeism without sanction', 'pending', '2026-10-18', '2026-10-28', 5, NULL),
(3, 'FN-2026-003', 2, 'library_overdue', 200.00, 'Overdue book: Modern Operating Systems 4th Ed', 'paid', '2026-10-05', '2026-10-15', 5, '2026-10-10 11:30:00'),
(4, 'FN-2026-004', 4, 'late_fee', 300.00, 'Late semester registration challan', 'reversed', '2026-10-01', '2026-10-10', 5, NULL);

-- 19. Payments
INSERT OR IGNORE INTO fine_payments (id, payment_receipt_no, fine_id, amount_paid, payment_method, received_by_user_id, notes) VALUES
(1, 'REC-2026-901', 3, 200.00, 'Cash', 5, 'Received in full by Senior Accounts Clerk');

-- 20. Circulars
INSERT OR IGNORE INTO circulars (circular_no, title, content, target_audience, department_id, publish_date, is_pinned) VALUES
('CIR-2026/041', 'Mandatory 75% Attendance Requirement for Spring 2026 Finals', 'All enrolled students are notified that per HEC and Gomal University regulations, any student with less than 75% attendance will NOT be permitted to sit in final exams.', 'students', NULL, '2026-10-10', 1),
('CIR-2026/042', 'Submission of Midterm Examination Result Sheets', 'All faculty members are requested to complete midterm grading and upload marks onto the EduPulse portal by Friday.', 'teachers', 1, '2026-10-12', 1),
('CIR-2026/043', 'Annual Inter-Departmental Cricket Tournament 2026', 'Department trials will commence from next Monday at College Sports Ground. Interested students contact Director Physical Education.', 'all', NULL, '2026-10-15', 0);

-- 21. Settings
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, category, description) VALUES
('college_name', 'Govt. Degree College No. 1, Dera Ismail Khan', 'general', 'Official institutional title'),
('affiliated_university', 'Gomal University, D.I. Khan / HED KP', 'general', 'Accreditation body'),
('min_attendance_threshold', '75', 'academic', 'Minimum percentage required to sit in final examinations'),
('passing_mark_percent', '50', 'academic', 'Passing benchmark percentage'),
('midterm_weight', '30', 'grading', 'Midterm percentage weightage'),
('final_weight', '50', 'grading', 'Final exam percentage weightage'),
('sessional_weight', '20', 'grading', 'Sessional quiz/assignment weightage'),
('currency_symbol', 'Rs.', 'finance', 'Pakistani Rupee currency display');
