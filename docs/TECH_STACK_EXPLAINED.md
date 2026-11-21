# Technology Stack Explained — EduPulse DIK
**Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)**
*Final Year Project — Student Performance Dashboard & Analytics System*

---

Yeh document project ke تمام technical components ko aasan Roman Urdu aur English mein explain karta hai taake FYP viva mein examiner ke kisi bhi sawal ka foran itminaan-bakhsh jawab diya ja sake.

---

## 1. Authentication & Security

### JWT (JSON Web Tokens)
- **Urdu:** JWT aik secure digital token hai jo user ke login hone par server generate karta hai taake user ko bar bar password enter na karna pare.
- **Why used:** Session-less authentication provide karta hai, jis se server par load kam hota hai aur multi-device login asaan ho jata hai.
- **Where used:** `server/middleware/auth.js` aur client-side `public/js/auth.js` mein API requests ke `Authorization: Bearer <token>` header mein.

### Bcrypt
- **Urdu:** Bcrypt aik cryptographic hashing algorithm hai jo passwords ko encrypt karke unreadable format mein mehfooz karta hai.
- **Why used:** Agar khuda-na-khwasta database leak bhi ho jaye to kisi user ka actual password decode na kiya ja sake.
- **Where used:** User registration, password change, aur login verification routes (`server/controllers/authController.js`).

### Helmet
- **Urdu:** Helmet Express.js ka security guard hai jo HTTP response headers ko secure banata hai.
- **Why used:** Clickjacking, cross-site scripting (XSS), aur MIME sniffing jaise web hamlon se portal ko bachata hai.
- **Where used:** `server/app.js` ke top middleware chain mein.

### CORS (Cross-Origin Resource Sharing)
- **Urdu:** CORS aik security rule hai jo control karta hai ke kon si websites ya domains hamari college API ko access kar sakti hain.
- **Why used:** Unauthorized websites ko hamare server se confidential data churane se rokne ke liye.
- **Where used:** `server/app.js` mein environment-controlled origins ke sath.

### Express Rate Limit
- **Urdu:** Rate limiter aik system hai jo kisi aik computer se aane wali requests ki taadad par limit lagata hai.
- **Why used:** Brute-force login attacks aur DDoS overloading se server ko mehfooz rakhne ke liye.
- **Where used:** Auth endpoints (`/api/v1/auth/login`) aur general API routes par.

---

## 2. Database & Data Access

### MySQL 8 / MariaDB
- **Urdu:** MySQL dunya ka sab se maqbool relational database management system hai jo data ko structured tables mein save karta hai.
- **Why used:** Enterprise-grade reliability, ACID compliance, complex relational queries (students, marks, attendance, fines), aur fast indexing.
- **Where used:** Production database (`database/schema.mysql.sql` aur `server/db/adapters/mysql.js`).

### SQLite (Zero-Setup Fallback)
- **Urdu:** SQLite aik lightweight, single-file serverless database hai jise chalane ke liye kisi alag software ya XAMPP ki zaroorat nahi hoti.
- **Why used:** Project ko kisi bhi computer par bina MySQL install kiye instant demo aur evaluation ke liye chalana.
- **Where used:** Local development fallback (`database/student_dashboard.sqlite` aur `server/db/adapters/sqlite.js`).

---

## 3. Reporting & File Processing

### PDFKit & PDFKit-Table
- **Urdu:** PDFKit aik Node.js library hai jo code ke zariye automatic high-quality PDF files aur official documents create karti hai.
- **Why used:** College ke official Detailed Marks Certificates (DMCs), Transcripts, Attendance Sheets, aur Fine Slips ko printable A4 format mein generate karna.
- **Where used:** `server/services/pdfService.js` aur `/api/v1/reports/transcript/:id/pdf`.

### ExcelJS & Fast-CSV
- **Urdu:** Yeh libraries Excel (.xlsx) aur CSV sheets ko read aur write karne ke liye istemal hoti hain.
- **Why used:** Teachers ke liye bulk marks upload, biometric attendance log import, aur administration ke liye complete data export.
- **Where used:** `server/services/excelService.js`, `server/services/csvService.js`, aur biometric import routes.

---

## 4. Notifications & Scheduling

### Nodemailer
- **Urdu:** Nodemailer Node.js se automated emails send karne ka module hai.
- **Why used:** Attendance short hone par student aur walidain ko warning notice, fee fine slip, aur password reset links bhejne ke liye.
- **Where used:** `server/services/notificationService.js`.

### Node-Cron
- **Urdu:** Node-cron aik automatic time-scheduler hai jo specific waqt par background jobs chalata hai bina kisi insani interference ke.
- **Why used:** Rozana raat 2:00 baje database ka auto-backup lena aur har subah at-risk students ki automatic list tayyar karna.
- **Where used:** `server/jobs/cronJobs.js`.

---

## 5. Frontend & UI/UX

### Vanilla JavaScript (ES2022 Modules)
- **Urdu:** Yeh baghair kisi heavy framework (jaise React ya Angular) ke modern, tez tareen native JavaScript hai.
- **Why used:** Zero build steps, instant load time, maximum speed, aur final year project evaluation mein core concepts ki clear presentation.
- **Where used:** Tamam client-side screens (`public/js/`).

### Chart.js
- **Urdu:** Chart.js aik dynamic charting library hai jo data ko khoobsurat visual graphs mein convert karti hai.
- **Why used:** Student GPA trends, class attendance radar, subject difficulty index, aur department comparisons ko visual dikhana.
- **Where used:** Tamam 9 dashboards ke analytics panels (`public/js/components/chart-wrapper.js`).

### PWA (Progressive Web App - Service Worker & Manifest)
- **Urdu:** PWA aik aisi technology hai jis se web application mobile par native Android/iOS app ki tarah install ho sakti hai aur offline bhi khul sakti hai.
- **Why used:** Students aur teachers apne mobile phone par bina play store ke "Add to Home Screen" karke dashboard chala saken.
- **Where used:** `public/manifest.webmanifest` aur `public/service-worker.js`.

---

## 6. DevOps & Hosting

### Docker & Docker-Compose
- **Urdu:** Docker application aur uske database ko aik isolated container box mein pack kar deta hai jo har operating system par aik jaisa chalta hai.
- **Why used:** "Mere PC par chal raha tha, examiner ke PC par nahi chal raha" wale maslay ko 100% khatam karna.
- **Where used:** `Dockerfile` aur `docker-compose.yml`.

### PM2 Process Manager
- **Urdu:** PM2 background production process manager hai jo server crash hone par use foran automatic restart kar deta hai.
- **Why used:** 24/7 uptime aur multi-core CPU cluster performance ke liye.
- **Where used:** `ecosystem.config.js`.
