# System Administrator & Operational Maintenance Guide
**EduPulse DIK — Govt. Degree College No. 1, Dera Ismail Khan**

---

This guide provides technical instructions for the college IT administrator.

---

## 1. System Architecture & Port Allocation
- **Web Application Server:** Node.js Express running on port `3000` (bound to `0.0.0.0` for LAN distribution).
- **Database Server:** MySQL 8 / MariaDB on standard port `3306` (or fallback to SQLite in `./database/student_dashboard.sqlite`).
- **Health Check Monitor:** Accessible via `http://localhost:3000/health`.

---

## 2. Routine Maintenance & Automated Backups

### Taking a Database Backup:
Run the backup script manually anytime:
```bash
npm run backup
```
This generates a timestamped snapshot in `database/backups/` (e.g., `backup-mysql-2026-10-21.sql`).

### Restoring from a Backup:
```bash
npm run restore
```
By default, this restores the most recent snapshot from `database/backups/`. To restore a specific snapshot:
```bash
npm run restore backup-mysql-2026-10-21.sql
```

---

## 3. LAN Access Configuration (College Wi-Fi / Computer Labs)

To allow other computers on the college local network to access the portal:
1. Open PowerShell and check your local IP:
   ```powershell
   ipconfig
   ```
   *(Look for IPv4 Address, e.g. `192.168.1.15`).*
2. Open Windows Firewall Port 3000:
   ```powershell
   New-NetFirewallRule -DisplayName "EduPulse DIK Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```
3. Any computer connected to the same college Wi-Fi can now open:
   `http://192.168.1.15:3000`

---

## 4. Resetting Admin Password
If the admin password is forgotten, run the password reset utility:
```bash
node scripts/setup.js
```
This resets the default `admin` credentials to `Admin@123`.
