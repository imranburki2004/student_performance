/**
 * Lightweight LAN Multi-Computer Express Server
 * Student Performance & Attendance Analytics Platform
 * Govt. Degree College No. 1, D.I. Khan
 * 
 * Group 9: Multi-Computer LAN Access • Zero-SQL CSV Storage Engine
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Binds to all network interfaces for LAN multi-computer access

app.use(cors());
app.use(express.json());

// Path to data directory
const DATA_DIR = path.join(__dirname, '..', 'data');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ROOT_DIR = path.join(__dirname, '..');

// Serve static frontend assets
app.use(express.static(ROOT_DIR));
app.use('/public', express.static(PUBLIC_DIR));

// Helper to read CSV files
function readCsv(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = parts[idx]; });
    return obj;
  });
}

// ----------------------------------------------------
// REST API ENDPOINTS (READ / WRITE TO DATA/*.CSV)
// ----------------------------------------------------

// Health & Network Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    institution: 'Govt. Degree College No. 1, D.I. Khan',
    storageMode: 'Zero-SQL CSV Local Storage',
    lanIp: getLocalIpAddress()
  });
});

// Students Endpoint
app.get('/api/students', (req, res) => {
  try {
    const students = readCsv('students.csv');
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Attendance Punch Ledger Endpoint
app.get('/api/attendance', (req, res) => {
  try {
    const logs = readCsv('attendance.csv');
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance', (req, res) => {
  try {
    const { date, class_name, subject_code, student_id, student_name, status, marked_by } = req.body;
    const filePath = path.join(DATA_DIR, 'attendance.csv');
    const newId = Date.now();
    const row = `\n${newId},${date},"${class_name}","${subject_code}","${student_id}","${student_name}","${status}","${marked_by}","${new Date().toISOString()}"`;
    fs.appendFileSync(filePath, row, 'utf8');
    res.json({ success: true, message: 'Attendance record committed to data/attendance.csv' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Audit Trail Logs
app.get('/api/audit-logs', (req, res) => {
  try {
    const logs = readCsv('audit_logs.csv');
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// OPTIONAL FUTURE SQL EXPANSION ADAPTER STUB
// ----------------------------------------------------
class OptionalSQLAdapterStub {
  constructor() {
    this.name = 'OptionalSQLAdapterStub';
  }
  async query() {
    throw new Error('Optional future expansion stub. The platform operates 100% on zero-SQL CSV storage.');
  }
}

// Network IP Resolver
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start Server
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    const localIp = getLocalIpAddress();
    console.log(`=======================================================`);
    console.log(`Student Performance & Attendance Analytics Platform`);
    console.log(`Govt. Degree College No. 1, D.I. Khan`);
    console.log(`Storage: Zero-SQL Pure CSV Files (data/*.csv)`);
    console.log(`Local Access:   http://localhost:${PORT}`);
    console.log(`LAN Access:     http://${localIp}:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, readCsv, OptionalSQLAdapterStub };
