/**
 * Chapter 9.4 — Serial to WebSockets Attendance Bridge
 * Govt. Degree College No. 1, Dera Ismail Khan
 * Connects Arduino/ESP32 hardware scanner to browser-based dashboard
 */

const http = require('http');

class RFIDBridge {
  constructor(port = 8080) {
    this.port = port;
    this.clients = [];
    console.log(`[IoT Bridge] Initializing attendance listener service on port ${port}...`);
  }

  // Simulated student RFID card database
  static CARD_LOOKUP = {
    'A1B2C3D4': { id: 1, roll: 'CS-2201', name: 'Ali Raza', dept: 'Computer Science' },
    'E5F6G7H8': { id: 2, roll: 'CS-2210', name: 'Imran Burki', dept: 'Computer Science' },
    '99AA88BB': { id: 15, roll: 'CS-2215', name: 'Muhammad Bilal', dept: 'Computer Science' }
  };

  simulateCardSwipe(uid) {
    const student = RFIDBridge.CARD_LOOKUP[uid] || { id: 99, roll: 'UNKNOWN', name: 'Guest Student', dept: 'General' };
    const scanEvent = {
      event: 'CARD_SCANNED',
      uid: uid,
      studentId: student.roll,
      studentName: student.name,
      department: student.dept,
      status: 'PRESENT',
      timestamp: new Date().toLocaleTimeString(),
      gate: 'CS Lab 1 Entrance'
    };

    console.log(`[IoT Bridge] >> Card Tapped: ${uid} | Student: ${student.name} (${student.roll})`);
    return scanEvent;
  }
}

module.exports = RFIDBridge;

if (require.main === module) {
  const bridge = new RFIDBridge();
  console.log('[IoT Bridge] Waiting for hardware events...');
  const testScan = bridge.simulateCardSwipe('E5F6G7H8');
  console.log('[Scan Event Result]:\n', JSON.stringify(testScan, null, 2));
}
