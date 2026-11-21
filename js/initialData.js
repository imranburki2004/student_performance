/**
 * Default Seed Dataset for Student Performance Analytical Dashboard
 * Govt. Degree College No. 1, Dera Ismail Khan
 * Author: Imran (Roll No: CS-2210)
 * 
 * Matches Chapter 6 & Chapter 8 figures of the thesis.
 */

const INITIAL_STUDENTS = [
  {
    id: 1,
    studentId: "CS-2201",
    name: "Ali Raza",
    fatherName: "Muhammad Akram",
    department: "Computer Science",
    sessionStart: 2022,
    sessionEnd: 2026,
    semester: "Semester 4",
    cgpa: 4.00,
    percentage: 90.0,
    overallGrade: "A",
    riskStatus: "Excellent", // Excellent / Safe / At Risk / Danger
    totalUnpaidFine: 0,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 3.90 },
      { semester: "Semester 2", gpa: 3.95 },
      { semester: "Semester 3", gpa: 4.00 },
      { semester: "Semester 4", gpa: 4.00 }
    ],
    subjects: [
      { name: "Database Systems", teacher: "Engr. Waqas", sessional: 6.0, mid: 18.0, terminal: 35.0, total: 59.0, gpa: 4.0, grade: "A+", attendance: 95.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "Data Structures", teacher: "Prof. Irfan", sessional: 5.8, mid: 17.5, terminal: 34.0, total: 57.3, gpa: 4.0, grade: "A+", attendance: 92.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "Operating Systems", teacher: "Dr. Sajid", sessional: 5.5, mid: 17.0, terminal: 33.0, total: 55.5, gpa: 3.9, grade: "A", attendance: 90.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "Computer Networks", teacher: "Prof. Abdur Rehman", sessional: 5.7, mid: 17.2, terminal: 34.5, total: 57.4, gpa: 4.0, grade: "A+", attendance: 94.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 }
    ]
  },
  {
    id: 2,
    studentId: "CS-2210",
    name: "Imran Burki",
    fatherName: "Gulzar Ahmad",
    department: "Computer Science",
    sessionStart: 2022,
    sessionEnd: 2026,
    semester: "Semester 4",
    cgpa: 3.82,
    percentage: 86.4,
    overallGrade: "A",
    riskStatus: "Safe",
    totalUnpaidFine: 0,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 3.70 },
      { semester: "Semester 2", gpa: 3.75 },
      { semester: "Semester 3", gpa: 3.85 },
      { semester: "Semester 4", gpa: 3.82 }
    ],
    subjects: [
      { name: "Database Systems", teacher: "Engr. Waqas", sessional: 5.5, mid: 16.5, terminal: 32.0, total: 54.0, gpa: 3.8, grade: "A", attendance: 88.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "Web Technologies", teacher: "Prof. Irfan", sessional: 5.8, mid: 17.0, terminal: 33.5, total: 56.3, gpa: 4.0, grade: "A+", attendance: 91.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "Software Engineering", teacher: "Prof. Abdur Rehman", sessional: 5.2, mid: 16.0, terminal: 31.0, total: 52.2, gpa: 3.7, grade: "A", attendance: 86.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 }
    ]
  },
  {
    id: 3,
    studentId: "CS-2215",
    name: "Zeeshan Khan",
    fatherName: "Liaquat Ali",
    department: "Computer Science",
    sessionStart: 2022,
    sessionEnd: 2026,
    semester: "Semester 4",
    cgpa: 1.85,
    percentage: 54.0,
    overallGrade: "D",
    riskStatus: "At Risk / Danger",
    totalUnpaidFine: 2000,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 2.20 },
      { semester: "Semester 2", gpa: 2.05 },
      { semester: "Semester 3", gpa: 1.90 },
      { semester: "Semester 4", gpa: 1.85 }
    ],
    subjects: [
      { name: "Database Systems", teacher: "Engr. Waqas", sessional: 3.0, mid: 8.5, terminal: 16.0, total: 27.5, gpa: 1.7, grade: "D", attendance: 62.0, fineStatus: "Danger", unpaidFine: 1000, paidFine: 0 },
      { name: "Data Structures", teacher: "Prof. Irfan", sessional: 2.5, mid: 9.0, terminal: 15.0, total: 26.5, gpa: 1.5, grade: "D", attendance: 58.0, fineStatus: "Danger", unpaidFine: 1000, paidFine: 0 },
      { name: "Linear Algebra", teacher: "Dr. Asif", sessional: 3.5, mid: 10.0, terminal: 20.0, total: 33.5, gpa: 2.3, grade: "C", attendance: 78.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 }
    ]
  },
  {
    id: 4,
    studentId: "BOT-2301",
    name: "Usman Tariq",
    fatherName: "Tariq Mahmood",
    department: "Botany",
    sessionStart: 2023,
    sessionEnd: 2027,
    semester: "Semester 2",
    cgpa: 3.45,
    percentage: 78.5,
    overallGrade: "B+",
    riskStatus: "Safe",
    totalUnpaidFine: 0,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 3.40 },
      { semester: "Semester 2", gpa: 3.45 }
    ],
    subjects: [
      { name: "Plant Physiology", teacher: "Dr. Farhat", sessional: 5.0, mid: 15.0, terminal: 28.0, total: 48.0, gpa: 3.4, grade: "B+", attendance: 85.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "Cell Biology", teacher: "Prof. Nazir", sessional: 5.2, mid: 15.5, terminal: 29.0, total: 49.7, gpa: 3.5, grade: "B+", attendance: 88.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 }
    ]
  },
  {
    id: 5,
    studentId: "CHM-2204",
    name: "Faizan Ahmad",
    fatherName: "Ghulam Rasool",
    department: "Chemistry",
    sessionStart: 2022,
    sessionEnd: 2026,
    semester: "Semester 4",
    cgpa: 1.65,
    percentage: 49.0,
    overallGrade: "F",
    riskStatus: "At Risk / Danger",
    totalUnpaidFine: 3000,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 1.90 },
      { semester: "Semester 2", gpa: 1.80 },
      { semester: "Semester 3", gpa: 1.70 },
      { semester: "Semester 4", gpa: 1.65 }
    ],
    subjects: [
      { name: "Organic Chemistry", teacher: "Dr. Qaiser", sessional: 2.0, mid: 7.0, terminal: 15.0, total: 24.0, gpa: 0.0, grade: "F", attendance: 52.0, fineStatus: "Danger", unpaidFine: 1000, paidFine: 0 },
      { name: "Analytical Chemistry", teacher: "Dr. Bashir", sessional: 2.5, mid: 8.0, terminal: 17.0, total: 27.5, gpa: 1.7, grade: "D", attendance: 60.0, fineStatus: "Danger", unpaidFine: 1000, paidFine: 0 },
      { name: "Physical Chemistry", teacher: "Dr. Qaiser", sessional: 2.0, mid: 8.0, terminal: 16.0, total: 26.0, gpa: 1.5, grade: "D", attendance: 55.0, fineStatus: "Danger", unpaidFine: 1000, paidFine: 0 }
    ]
  },
  {
    id: 6,
    studentId: "ENG-2208",
    name: "Saad Farooq",
    fatherName: "Farooq Ahmad",
    department: "English",
    sessionStart: 2022,
    sessionEnd: 2026,
    semester: "Semester 4",
    cgpa: 3.75,
    percentage: 84.0,
    overallGrade: "A",
    riskStatus: "Safe",
    totalUnpaidFine: 0,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 3.65 },
      { semester: "Semester 2", gpa: 3.70 },
      { semester: "Semester 3", gpa: 3.80 },
      { semester: "Semester 4", gpa: 3.75 }
    ],
    subjects: [
      { name: "Classical Poetry", teacher: "Prof. Naimatullah", sessional: 5.4, mid: 16.2, terminal: 31.0, total: 52.6, gpa: 3.7, grade: "A", attendance: 90.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "English Linguistics", teacher: "Dr. Tahir", sessional: 5.6, mid: 16.8, terminal: 32.0, total: 54.4, gpa: 3.8, grade: "A", attendance: 88.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 }
    ]
  },
  {
    id: 7,
    studentId: "HPE-2305",
    name: "Daniyal Qureshi",
    fatherName: "Munir Ahmad",
    department: "HPE",
    sessionStart: 2023,
    sessionEnd: 2027,
    semester: "Semester 2",
    cgpa: 2.80,
    percentage: 68.0,
    overallGrade: "C+",
    riskStatus: "At Risk / Danger",
    totalUnpaidFine: 1000,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 2.85 },
      { semester: "Semester 2", gpa: 2.80 }
    ],
    subjects: [
      { name: "Sports Psychology", teacher: "Prof. Akhtar", sessional: 4.0, mid: 12.0, terminal: 23.0, total: 39.0, gpa: 2.7, grade: "C+", attendance: 72.0, fineStatus: "Danger", unpaidFine: 1000, paidFine: 0 },
      { name: "Physical Fitness", teacher: "Prof. Akhtar", sessional: 4.5, mid: 13.0, terminal: 25.0, total: 42.5, gpa: 2.9, grade: "C+", attendance: 80.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 }
    ]
  },
  {
    id: 8,
    studentId: "ISL-2202",
    name: "Mian Shahmeer",
    fatherName: "Mian Khalid",
    department: "Islamiat",
    sessionStart: 2022,
    sessionEnd: 2026,
    semester: "Semester 4",
    cgpa: 3.90,
    percentage: 88.0,
    overallGrade: "A+",
    riskStatus: "Excellent",
    totalUnpaidFine: 0,
    totalPaidFine: 0,
    semesterProgression: [
      { semester: "Semester 1", gpa: 3.85 },
      { semester: "Semester 2", gpa: 3.90 },
      { semester: "Semester 3", gpa: 3.92 },
      { semester: "Semester 4", gpa: 3.90 }
    ],
    subjects: [
      { name: "Quranic Sciences", teacher: "Dr. Hafizullah", sessional: 5.7, mid: 17.5, terminal: 34.0, total: 57.2, gpa: 4.0, grade: "A+", attendance: 96.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 },
      { name: "Hadith Studies", teacher: "Dr. Hafizullah", sessional: 5.8, mid: 17.6, terminal: 34.5, total: 57.9, gpa: 4.0, grade: "A+", attendance: 95.0, fineStatus: "Safe", unpaidFine: 0, paidFine: 0 }
    ]
  }
];

// Helper to generate comprehensive student cohort list across departments and sessions
function generateFullStudentList() {
  const depts = [
    { name: "Computer Science", code: "CS", icon: "CS" },
    { name: "Software Engineering", code: "SE", icon: "SE" },
    { name: "Information Technology", code: "IT", icon: "IT" },
    { name: "Artificial Intelligence", code: "AI", icon: "AI" },
    { name: "Data Science", code: "DS", icon: "DS" },
    { name: "Cyber Security", code: "CYS", icon: "CYS" },
    { name: "Electrical Engineering", code: "EE", icon: "EE" },
    { name: "Civil Engineering", code: "CE", icon: "CE" },
    { name: "Mechanical Engineering", code: "ME", icon: "ME" },
    { name: "Business Administration", code: "BBA", icon: "BBA" },
    { name: "Accounting and Finance", code: "AF", icon: "AF" },
    { name: "Mathematics", code: "MATH", icon: "MATH" },
    { name: "Physics", code: "PHYS", icon: "PHYS" },
    { name: "Chemistry", code: "CHM", icon: "CHEM" },
    { name: "Botany", code: "BOT", icon: "BOT" },
    { name: "English", code: "ENG", icon: "ENG" },
    { name: "Islamiat", code: "ISL", icon: "ISL" },
    { name: "Health and Physical Education", code: "HPE", icon: "HPE" },
    { name: "Economics", code: "ECON", icon: "ECON" },
    { name: "Statistics", code: "STAT", icon: "STAT" },
    { name: "Education", code: "EDU", icon: "EDU" }
  ];

  const deptSubjects = {
    "Computer Science": ["Database Systems", "Data Structures", "Operating Systems", "Computer Networks"],
    "Software Engineering": ["Software Architecture", "Agile Development", "Software Testing", "DevOps Engineering"],
    "Information Technology": ["Web Technologies", "Cloud Computing", "Network Administration", "IT Infrastructure"],
    "Artificial Intelligence": ["Machine Learning", "Deep Learning", "Computer Vision", "Natural Language Processing"],
    "Data Science": ["Data Mining", "Statistical Modeling", "Big Data Analytics", "Python for Data Science"],
    "Cyber Security": ["Ethical Hacking", "Cryptography", "Network Security", "Digital Forensics"],
    "Electrical Engineering": ["Circuit Analysis", "Electromagnetic Fields", "Digital Signal Processing", "Power Systems"],
    "Civil Engineering": ["Structural Mechanics", "Hydraulics", "Geotechnical Engineering", "Concrete Design"],
    "Mechanical Engineering": ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing Processes"],
    "Business Administration": ["Principles of Management", "Marketing Strategy", "Financial Accounting", "Organizational Behavior"],
    "Accounting and Finance": ["Corporate Finance", "Auditing", "Taxation Laws", "Managerial Accounting"],
    "Mathematics": ["Linear Algebra", "Calculus IV", "Differential Equations", "Numerical Analysis"],
    "Physics": ["Quantum Mechanics", "Electrodynamics", "Solid State Physics", "Classical Mechanics"],
    "Chemistry": ["Organic Chemistry", "Physical Chemistry", "Inorganic Chemistry", "Analytical Chemistry"],
    "Botany": ["Plant Physiology", "Cell Biology", "Genetics & Evolution", "Ecology"],
    "English": ["Classical Poetry", "English Linguistics", "Literary Criticism", "Drama & Prose"],
    "Islamiat": ["Hadith Studies", "Quranic Sciences", "Islamic Jurisprudence", "Arabic Grammar"],
    "Health and Physical Education": ["Sports Psychology", "Physical Fitness & Health", "Biomechanics in Sports", "Exercise Physiology"],
    "Economics": ["Microeconomics", "Macroeconomics", "Econometrics", "Development Economics"],
    "Statistics": ["Probability Theory", "Sampling Techniques", "Biostatistics", "Statistical Inference"],
    "Education": ["Curriculum Development", "Educational Psychology", "Classroom Management", "Assessment & Evaluation"]
  };

  const firstNames = [
    "Muhammad Hamza", "Muhammad Bilal", "Asad Ullah", "Haris Farooq", "Farhan Ali",
    "Rizwan Ahmad", "Salman Tariq", "Kamran Khan", "Noman Akhtar", "Kashif Mehmood",
    "Ahsan Raza", "Talha Zubair", "Adeel Minhas", "Mohsin Ali", "Babar Azam",
    "Junaid Khan", "Omair Farooq", "Shahzad Iqbal", "Arslan Tariq", "Zain Ul Abideen",
    "Tayyab Rehman", "Waleed Ahmad", "Shahrukh Khan", "Faheem Abbas", "Waqar Younis",
    "Shoaib Akhtar", "Haider Ali", "Danish Kaneria", "Sarfaraz Ahmad", "Shadab Khan",
    "Shaheen Afridi", "Naseem Shah", "Haris Rauf", "Fakhar Zaman", "Mohammad Rizwan",
    "Iftikhar Ahmad", "Shan Masood", "Saim Ayub", "Aamir Jamal", "Abdullah Shafique",
    "Khurram Shahzad", "Usama Mir", "Mohammad Nawaz", "Hasan Ali", "Sajid Khan",
    "Noman Ali", "Zahid Mehmood", "Kamran Ghulam", "Mehran Mumtaz", "Arshad Iqbal"
  ];

  const fatherNames = [
    "Muhammad Akram", "Gulzar Ahmad", "Liaquat Ali", "Tariq Mahmood", "Ghulam Rasool",
    "Farooq Ahmad", "Munir Ahmad", "Khalid Mehmood", "Aslam Khan", "Anwar Ul Haq",
    "Bashir Ahmad", "Sultan Mehmood", "Iqbal Hussain", "Abdul Ghafoor", "Nazir Ahmad",
    "Hafizullah Khan", "Akhtar Mehmood", "Qaiser Abbas", "Tahir Bilal", "Rashid Minhas",
    "Zahid Hussain", "Irfan Ullah", "Naimatullah Khan", "Mushtaq Ahmad", "Zafar Iqbal"
  ];

  const facultyNames = [
    "Prof. Abdur Rehman", "Dr. Sajid Khan", "Engr. Waqas Ahmad", "Dr. Irfan Ullah",
    "Prof. Tariq Bilal", "Prof. Nisar Ahmad", "Dr. Farhat Ullah", "Prof. Naimatullah",
    "Prof. Qasim Ali", "Dr. Muhammad Aslam", "Dr. Amina Bibi", "Prof. Munir Ahmad"
  ];

  const sessions = [
    { start: 2021, end: 2025, batch: "Batch 25", sem: "Semester 8", shift: "Morning" },
    { start: 2022, end: 2026, batch: "Batch 26", sem: "Semester 4", shift: "Morning" },
    { start: 2023, end: 2027, batch: "Batch 27", sem: "Semester 2", shift: "Evening" },
    { start: 2024, end: 2028, batch: "Batch 28", sem: "Semester 1", shift: "Morning" }
  ];

  const list = [...INITIAL_STUDENTS];
  let curId = 9;

  // Generate students across all departments and sessions
  depts.forEach((deptObj, dIdx) => {
    sessions.forEach((sess, sIdx) => {
      for (let k = 0; k < 3; k++) {
        const isCoreStudentSlot = (deptObj.name === "Computer Science" && sess.batch === "Batch 26" && k < 3) ||
                                  (deptObj.name === "Botany" && sess.batch === "Batch 27" && k === 0) ||
                                  (deptObj.name === "Chemistry" && sess.batch === "Batch 26" && k === 0) ||
                                  (deptObj.name === "English" && sess.batch === "Batch 26" && k === 0) ||
                                  (deptObj.name === "Health and Physical Education" && sess.batch === "Batch 27" && k === 0) ||
                                  (deptObj.name === "Islamiat" && sess.batch === "Batch 26" && k === 0);
        if (isCoreStudentSlot) {
          continue;
        }

        const studentNum = curId++;
        const isAtRisk = (studentNum % 5 === 0);
        const isHigh = (!isAtRisk && studentNum % 2 === 0);

        const cgpa = isAtRisk ? parseFloat((1.45 + (studentNum % 6) * 0.14).toFixed(2))
                              : isHigh ? parseFloat((3.40 + (studentNum % 6) * 0.10).toFixed(2))
                                       : parseFloat((2.55 + (studentNum % 6) * 0.13).toFixed(2));

        const attend = isAtRisk ? (52 + (studentNum % 20)) : (76 + (studentNum % 23));
        const unpaidFine = isAtRisk ? (1000 * (1 + (studentNum % 2))) : 0;
        const nameIdx = (studentNum + dIdx) % firstNames.length;
        const fIdx = (studentNum + sIdx) % fatherNames.length;
        const sectionLetter = k % 2 === 0 ? "A" : "B";
        const contactNum = `03${(studentNum % 4) + 1}${studentNum % 9}-${String(1000000 + studentNum * 3456).slice(0, 7)}`;

        const subs = (deptSubjects[deptObj.name] || ["Core Subject I", "Core Subject II", "Elective Subject"]).map((sName, subIdx) => {
          const subAttend = isAtRisk && subIdx === 0 ? (attend - 4) : attend;
          const subDanger = subAttend < 75;
          const subGpa = Math.min(4.0, Math.max(0.0, parseFloat((cgpa + (subIdx % 2 === 0 ? 0.1 : -0.1)).toFixed(1))));
          const sessional = parseFloat((subGpa * 1.45).toFixed(1));
          const mid = parseFloat((subGpa * 4.3).toFixed(1));
          const terminal = parseFloat((subGpa * 8.6).toFixed(1));
          const total = parseFloat((sessional + mid + terminal).toFixed(1));
          const grade = subGpa >= 3.7 ? "A+" : subGpa >= 3.0 ? "A" : subGpa >= 2.0 ? "B" : "D";

          return {
            name: sName,
            teacher: facultyNames[(studentNum + subIdx) % facultyNames.length],
            sessional: Math.min(6.0, sessional),
            mid: Math.min(18.0, mid),
            terminal: Math.min(36.0, terminal),
            total: Math.min(60.0, total),
            gpa: subGpa,
            grade: grade,
            attendance: subAttend,
            fineStatus: subDanger ? "Danger" : "Safe",
            unpaidFine: subDanger ? 1000 : 0,
            paidFine: 0
          };
        });

        list.push({
          id: studentNum,
          studentId: `${deptObj.code}-${sess.start.toString().slice(2)}${String(studentNum).padStart(2, '0')}`,
          name: firstNames[nameIdx],
          fatherName: fatherNames[fIdx],
          contact: contactNum,
          department: deptObj.name,
          deptCode: deptObj.code,
          session: `${sess.start}-${sess.end}`,
          batch: sess.batch,
          sessionStart: sess.start,
          sessionEnd: sess.end,
          section: `${deptObj.code}-${sectionLetter}`,
          semester: sess.sem,
          cgpa: Math.min(cgpa, 4.0),
          percentage: parseFloat((cgpa * 23.5).toFixed(1)),
          overallGrade: cgpa >= 3.7 ? "A+" : cgpa >= 3.0 ? "A" : cgpa >= 2.0 ? "B" : "D",
          riskStatus: isAtRisk ? "At Risk / Danger" : isHigh ? "High Performer" : "Medium Performer",
          totalUnpaidFine: unpaidFine,
          totalPaidFine: 0,
          semesterProgression: [
            { semester: "Semester 1", gpa: parseFloat(Math.max(1.5, cgpa - 0.2).toFixed(2)) },
            { semester: "Semester 2", gpa: parseFloat(Math.max(1.5, cgpa - 0.1).toFixed(2)) },
            { semester: "Semester 3", gpa: cgpa },
            { semester: "Semester 4", gpa: cgpa }
          ],
          subjects: subs
        });
      }
    });
  });

  return list;
}

// Universal Global & Module Exports
if (typeof window !== 'undefined') {
  window.INITIAL_STUDENTS = INITIAL_STUDENTS;
  window.generateFullStudentList = generateFullStudentList;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_STUDENTS, generateFullStudentList };
}
