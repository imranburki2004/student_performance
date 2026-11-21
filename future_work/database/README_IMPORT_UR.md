# ڈیٹا بیس امپورٹ کرنے کی مکمل گائیڈ — Database Import Guide (Urdu)
**Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)**
*EduPulse DIK — Final Year Project*

---

Assalam-o-Alaikum! Yeh guide aapko apna database mukammal setup karne mein madad degi. Chaar (4) aasan tareeqay diye gaye hain — jo tareeqa aapke pas available ho usay follow karein:

---

## طریقہ نمبر 1: Method A — XAMPP + phpMyAdmin (سب سے آسان اور تجویز کردہ)

Agar aapke system mein **XAMPP** install hai:

1. **XAMPP Control Panel Kholein:**
   - "Apache" aur "MySQL" dono ke samne **Start** ka button dabayein (dono green ho jayenge).
2. **phpMyAdmin Kholein:**
   - Apne browser (Chrome/Edge) mein yeh address open karein:
     `http://localhost/phpmyadmin`
3. **Naya Database Banayein (New Database):**
   - Left side par **"New"** par click karein.
   - Database Name mein likhein: `student_dashboard`
   - Collation dropdown mein select karein: `utf8mb4_unicode_ci`
   - **"Create"** button dabayein.
4. **Complete SQL File Import Karein:**
   - Top menu par **"Import"** tab par click karein.
   - **"Choose File"** (یا Browse) dabayein aur project folder se yeh file select karein:
     `database/complete_import.sql`
   - Neeche scroll karke **"Go"** ya **"Import"** button click karein.
5. **Kamyabi ki Tasdeeq (Verification):**
   - Aapko green message nazar aayega: *"Import has been successfully finished"*.
   - Left side par `student_dashboard` ke andar 25 tables (`students`, `marks`, `attendance`, `fines`, waghaira) show hongay.

> [!TIP]
> **Agar phpMyAdmin mein "File too large" ka error aaye:**
> XAMPP Control Panel mein Apache ke samne **Config** $\to$ **php.ini** open karein aur yeh tabdeeli karke Apache restart karein:
> - `upload_max_filesize = 64M`
> - `post_max_size = 64M`
> - `max_execution_time = 300`

---

## طریقہ نمبر 2: Method B — MySQL Workbench

1. **MySQL Workbench Kholein** aur apna Local Instance (Port 3306) connect karein.
2. Top menu se **Server** $\to$ **Data Import** par click karein.
3. **"Import from Self-Contained File"** select karein aur project se `database/complete_import.sql` select karein.
4. **Default Target Schema** mein `student_dashboard` select ya new create karein.
5. Neeche right side par **"Start Import"** button dabayein.

---

## طریقہ نمبر 3: Method C — Command Line (CMD / PowerShell)

Agar aap terminal pasand karte hain:

```bash
# 1. MySQL terminal mein database banayein
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS student_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Complete SQL file import karein
mysql -u root -p student_dashboard < database/complete_import.sql
```

Tasdeeq karne ke liye:
```sql
USE student_dashboard;
SHOW TABLES;
SELECT COUNT(*) FROM students; -- 10+ students return hone chahiye
```

---

## طریقہ نمبر 4: Method D — SQLite (بغیر کسی سافٹ ویئر انسٹال کیے — زیرو سیٹ اپ)

Agar aapke system par MySQL ya XAMPP mojood nahi hai, to pareshan hone ki bilkul zaroorat nahi!
1. Project ke `.env` file ko open karein.
2. Pehli database line ko yun set karein:
   ```env
   DB_CLIENT=sqlite
   ```
3. Terminal mein setup chalayein:
   ```bash
   npm run setup
   ```
   *System automatic `database/student_dashboard.sqlite` file create kar lega aur tamam tables aur sample data foran load ho jayega!*

---

## ڈیفالٹ لاگ ان معلومات (Default Login Credentials)

Har role ke liye pehle se users bane hue hain. Sab ka default password **`Admin@123`** hai:

| Role | Username | Email | Password | Dashboard Features |
|---|---|---|---|---|
| **System Admin** | `admin` | `admin@gdc1dik.edu.pk` | `Admin@123` | Complete Control, Users, Backup, Settings |
| **Principal** | `principal` | `principal@gdc1dik.edu.pk` | `Admin@123` | College KPIs, Dept Comparison, Audit Log |
| **HOD (Computer Science)** | `hod_cs` | `irfan.cs@gdc1dik.edu.pk` | `Admin@123` | Dept Faculty, Semesters, Course Pass Rates |
| **Teacher (Lecturer)** | `teacher_waqas` | `waqas.ahmad@gdc1dik.edu.pk` | `Admin@123` | Marks Entry, Attendance Register, At-Risk |
| **Accounts Clerk** | `accounts_aslam` | `accounts@gdc1dik.edu.pk` | `Admin@123` | Fine Collection, Pay/Unpay, Receipts |
| **Student** | `student_bilal` | `bilal.gdc1@gmail.com` | `Admin@123` | Personal GPA, DMC/Transcript, Attendance % |
| **Parent** | `parent_tariq` | `tariq.parent@gmail.com` | `Admin@123` | Ward Report, Warning Notices, Fee Status |

---

## Troubleshooting Table (مسائل اور ان کے آسان حل)

| Error Message | Waja (Reason) | Aasan Hal (Solution) |
|---|---|---|
| **ECONNREFUSED 127.0.0.1:3306** | MySQL server band hai | XAMPP Control Panel mein MySQL ke samne **Start** ka button dabayein. |
| **Access denied for user 'root'@'localhost'** | Password ghalat hai | Agar aapke MySQL root ka koi password hai to `.env` mein `DB_PASSWORD=apna_password` likhein. Agar password nahi hai to khali chhor dein (`DB_PASSWORD=`). |
| **Unknown database 'student_dashboard'** | Database abhi nahi bana | phpMyAdmin mein pehle `student_dashboard` naam ka database create karein ya `complete_import.sql` run karein. |
| **Port 3306 in use by another program** | Port clash (e.g. Skype ya purana MySQL) | XAMPP MySQL Config $\to$ `my.ini` mein port 3307 kar dein aur `.env` mein `DB_PORT=3307` set karein. |
| **Foreign key constraint fails** | Tables ki tarteeb | Tables create karne se pehle SQL file ke start mein `SET FOREIGN_KEY_CHECKS = 0;` mojood hai, is liye humari `complete_import.sql` file istemal karein jismein yeh masla pehle se hal shuda hai. |
