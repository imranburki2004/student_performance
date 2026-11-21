/**
 * Future Work Interactive Suite — Master Simulator Logic
 * Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 */

// ========================================================
// TAB SWITCHER
// ========================================================
function switchFwTab(tabId) {
  document.querySelectorAll('.fw-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.fw-tab-content').forEach(tab => tab.classList.remove('active'));

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  const activeTab = document.getElementById(`tab-content-${tabId}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeTab) activeTab.classList.add('active');
}

// ========================================================
// 1. AI MACHINE LEARNING PREDICTION ENGINE
// ========================================================
function runAIPrediction() {
  const attend = parseFloat(document.getElementById('ai-input-attend').value) || 0;
  const sessional = parseFloat(document.getElementById('ai-input-sessional').value) || 0;
  const mid = parseFloat(document.getElementById('ai-input-mid').value) || 0;
  const terminal = parseFloat(document.getElementById('ai-input-term').value) || 0;
  const probation = parseInt(document.getElementById('ai-input-probation').value, 10) || 0;

  // Empirical Random Forest Feature Weightings:
  // Attendance (38.5%), Midterm (26.2%), Sessional (16.8%), Terminal (11.5%), Probation (7%)
  const totalMarks = sessional + mid + terminal;
  const marksPct = (totalMarks / 60) * 100;

  // Calculate Risk Score (0 = Completely Safe, 100 = Severe High Risk)
  let riskScore = 0;
  
  // Attendance factor (Threshold 75%)
  if (attend < 75) {
    riskScore += (75 - attend) * 1.6;
  }
  
  // Marks factor
  if (marksPct < 50) {
    riskScore += (50 - marksPct) * 1.1;
  } else if (marksPct < 65) {
    riskScore += (65 - marksPct) * 0.4;
  }

  // Historical probation factor
  if (probation === 1) riskScore += 18;

  riskScore = Math.min(Math.max(Math.round(riskScore), 4), 98);

  // Predicted GPA calculation
  let predictedGpa = (marksPct / 100) * 4.0;
  if (attend < 75) predictedGpa = Math.max(0, predictedGpa - 0.5); // Penalty for shortage
  predictedGpa = Math.min(Math.max(predictedGpa, 1.2), 4.0).toFixed(2);

  // Determine Class
  let classification = "Safe / High Performer";
  let classColor = "#10b981";
  let recommendations = [];

  if (riskScore >= 60 || attend < 75) {
    classification = "CRITICAL / AT-RISK (Dropout Danger)";
    classColor = "#ef4444";
    recommendations.push("🚨 Mandatory Parent Alert via SMS/WhatsApp Gateway");
    recommendations.push("⚠️ Attendance Fine of Rs. 1,000 imposed due to shortage (< 75%)");
    recommendations.push("📚 Assign 10 hours of remedial mentoring in Computer Science Lab");
  } else if (riskScore >= 30) {
    classification = "MODERATE RISK (Warning Zone)";
    classColor = "#f59e0b";
    recommendations.push("⚠️ Attendance borderline. Issue informal teacher notice.");
    recommendations.push("📝 Sessional improvement quizzes recommended before terminal exams.");
  } else {
    classification = "SAFE / EXCELLENT ACADEMIC STANDING";
    classColor = "#10b981";
    recommendations.push("✅ Student on track for First Division / Merit List.");
    recommendations.push("🎓 Eligible for Prime Minister's Laptop / Merit Scholarship Scheme.");
  }

  // Update UI Output
  document.getElementById('ai-res-score').innerText = `${riskScore}%`;
  document.getElementById('ai-res-score').style.color = classColor;
  document.getElementById('ai-res-class').innerText = classification;
  document.getElementById('ai-res-class').style.color = classColor;
  document.getElementById('ai-res-gpa').innerText = `${predictedGpa} / 4.00`;

  const recList = document.getElementById('ai-res-recs');
  recList.innerHTML = recommendations.map(r => `<li style="margin-bottom: 6px;">${r}</li>`).join('');
}

// ========================================================
// 2. AUTOMATED SMS & WHATSAPP GATEWAY SIMULATOR
// ========================================================
function sendSimulatedAlert(type) {
  const student = document.getElementById('sms-student-select').value;
  const lang = document.getElementById('sms-lang-select').value;
  const messagesArea = document.getElementById('sms-mockup-messages');

  let text = "";
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (type === 'ATTENDANCE_WARNING') {
    if (lang === 'ur') {
      text = `⚠️ انتہائی اہم اطلاع - گورنمنٹ ڈگری کالج نمبر 1 ڈیرہ اسماعیل خان:\nمحترم والدین، آپ کے بچے (${student}) کی حاضری 62% رہ گئی ہے۔ 75 فیصد سے کم حاضری پر 1,000 روپے جرمانہ اور امتحان سے روک دیا جائے گا۔ برائے مہربانی فوری HOD سے رابطہ کریں۔`;
    } else {
      text = `⚠️ ATTENDANCE WARNING - GDC No. 1 D.I. Khan:\nDear Parent, your ward (${student}) has only 62% attendance. Short attendance incurs Rs. 1,000 fine per short subject and exam debarment. Please contact the Department immediately.`;
    }
  } else if (type === 'FINE_NOTICE') {
    if (lang === 'ur') {
      text = `💳 فائن نوٹس - GDC No. 1 D.I. Khan:\nطالبعلم (${student}) پر حاضری شارٹ ہونے کی وجہ سے 1,000 روپے جرمانہ عائد کیا گیا ہے۔ 7 دن کے اندر آن لائن پورٹل یا کالج اکاؤنٹس کاؤنٹر پر جمع کروائیں۔`;
    } else {
      text = `💳 ACCOUNTS NOTICE - GDC No. 1 D.I. Khan:\nAttendance fine of Rs. 1,000 has been issued for student (${student}) due to shortage (< 75%). Please deposit via JazzCash or college counter.`;
    }
  } else if (type === 'RESULT_ALERT') {
    text = `🎓 RESULT PUBLISHED - GDC No. 1 D.I. Khan:\nSemester 4 examinations result declared for (${student}). CGPA: 3.82, Grade: A. Official DMC is now available for download.`;
  }

  const bubble = document.createElement('div');
  bubble.className = 'sms-bubble';
  bubble.innerHTML = `
    <div style="font-weight: 700; color: #0284c7; margin-bottom: 4px;">📲 GDC-DIKHAN SMS GATEWAY</div>
    <div style="white-space: pre-wrap;">${text}</div>
    <div class="sms-time">${now} • Delivered ✓✓</div>
  `;

  messagesArea.appendChild(bubble);
  messagesArea.scrollTop = messagesArea.scrollHeight;

  // Flash confirmation message
  const statusEl = document.getElementById('sms-delivery-status');
  if (statusEl) {
    statusEl.innerHTML = `✅ Dispatched via Twilio/WhatsApp API to +92-300-XXXXXXX (Message ID: MSG-DIK-${Math.floor(100000 + Math.random() * 900000)})`;
  }
}

// ========================================================
// 3. IOT BIOMETRIC & RFID ATTENDANCE SCANNER
// ========================================================
const RFID_CARDS = {
  'A1B2C3D4': { roll: 'CS-2201', name: 'Ali Raza', dept: 'Computer Science', attend: '95%' },
  'E5F6G7H8': { roll: 'CS-2210', name: 'Imran Burki', dept: 'Computer Science', attend: '88%' },
  '99AA88BB': { roll: 'CS-2215', name: 'Muhammad Bilal', dept: 'Computer Science', attend: '62%' }
};

function triggerRFIDTap(uid) {
  const target = document.getElementById('rfid-tap-target');
  const lcd = document.getElementById('rfid-lcd-screen');
  const logTbody = document.getElementById('rfid-log-tbody');

  target.classList.add('pulsing');
  lcd.innerHTML = `SCANNING...<br><small style="color: #fbbf24;">Reading UID: ${uid}</small>`;

  setTimeout(() => {
    target.classList.remove('pulsing');
    const student = RFID_CARDS[uid] || { roll: 'EXT-990', name: 'Visiting Student', dept: 'General', attend: '75%' };

    const isDanger = parseFloat(student.attend) < 75;
    const time = new Date().toLocaleTimeString();

    lcd.innerHTML = `
      <span style="color: #6ee7b7;">VERIFIED: ${student.roll}</span><br>
      <small style="color: #ffffff;">${student.name} (${student.attend})</small>
    `;

    // Prepend to event log
    const row = document.createElement('tr');
    row.style.background = isDanger ? '#fef2f2' : '#f0fdf4';
    row.innerHTML = `
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${time}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">${student.roll}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${student.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${student.dept}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
        <span style="padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; background: ${isDanger ? '#fee2e2' : '#dcfce7'}; color: ${isDanger ? '#ef4444' : '#15803d'};">
          ${isDanger ? 'DANGER (<75%)' : 'PRESENT'}
        </span>
      </td>
    `;
    logTbody.insertBefore(row, logTbody.firstChild);
  }, 400);
}

// ========================================================
// 4. DIGITAL PAYMENT GATEWAY (JazzCash / EasyPaisa)
// ========================================================
function processFinePayment() {
  const roll = document.getElementById('pay-student-roll').value;
  const name = document.getElementById('pay-student-name').value;
  const method = document.getElementById('pay-method-select').value;
  const phone = document.getElementById('pay-phone-input').value;
  const receiptTarget = document.getElementById('pay-receipt-target');

  if (!phone || phone.length < 10) {
    alert("Please enter a valid mobile account number (e.g. 03001234567).");
    return;
  }

  const txnId = `TXN-DIK-${Date.now().toString().slice(-8)}`;
  const rcptId = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleString();

  receiptTarget.style.display = 'block';
  receiptTarget.innerHTML = `
    <div class="receipt-paper">
      <div class="receipt-title">GOVT. DEGREE COLLEGE NO. 1, D.I. KHAN</div>
      <div style="text-align: center; font-size: 0.8rem; margin-bottom: 10px;">Official Digital Fee & Fine Deposit Receipt</div>
      <hr style="border: 0.5px dashed #d97706; margin-bottom: 10px;">
      
      <div><strong>Receipt No:</strong> ${rcptId}</div>
      <div><strong>Transaction ID:</strong> ${txnId}</div>
      <div><strong>Student Roll:</strong> ${roll} (${name})</div>
      <div><strong>Payment Provider:</strong> ${method}</div>
      <div><strong>Account No:</strong> ${phone}</div>
      <div><strong>Payment Purpose:</strong> Short Attendance Fine (Database Systems)</div>
      <div><strong>Fine Amount Paid:</strong> Rs. 1,000.00</div>
      <div><strong>Transaction Status:</strong> <span style="color: #047857; font-weight: bold;">PAID & SETTLED ✓</span></div>
      <div><strong>Payment Timestamp:</strong> ${dateStr}</div>
      
      <hr style="border: 0.5px dashed #d97706; margin: 10px 0;">
      <div style="text-align: center; font-size: 0.75rem;">
        Cryptographic Secure Hash: 8E79B2F...VERIFIED<br>
        *This is a computer-generated digital receipt. No signature required.*
      </div>
    </div>
  `;

  alert(`Payment Success! Rs. 1,000 received via ${method}.\nTransaction ID: ${txnId}\nStudent's fine status updated to Paid.`);
}

// ========================================================
// 5. BLOCKCHAIN & CRYPTOGRAPHIC DMC VERIFIER
// ========================================================
const SAMPLE_HASH_GENUINE = "0x7a89f92bc3e01d8f5619ca24e67d23a1e457f90c88b21e06917c0a894a28b5e1";

function verifyBlockchainHash() {
  const enteredHash = document.getElementById('bc-input-hash').value.trim();
  const resultBox = document.getElementById('bc-result-box');

  resultBox.style.display = 'block';

  if (enteredHash === SAMPLE_HASH_GENUINE) {
    resultBox.style.background = '#f0fdf4';
    resultBox.style.borderColor = '#86efac';
    resultBox.innerHTML = `
      <div style="color: #15803d; font-weight: 800; font-size: 1.1rem; margin-bottom: 6px;">
        🛡️ GENUINE & AUTHENTIC TRANSCRIPT VERIFIED
      </div>
      <div style="font-size: 0.85rem; color: #1e293b; line-height: 1.5;">
        <strong>Certificate ID:</strong> DMC-DIK-2022-CS-2210<br>
        <strong>Student:</strong> Imran Burki (Roll No: CS-2210)<br>
        <strong>Degree:</strong> BS in Computer Science (Session 2022-2026)<br>
        <strong>Institution:</strong> Govt. Degree College No. 1, D.I. Khan (Affiliated with Gomal University)<br>
        <strong>Final CGPA:</strong> 3.82 / 4.00 (Grade: A)<br>
        <strong>Cryptographic Ledger Status:</strong> Immutable Block #829,102 (Timestamp: Oct 2026)
      </div>
    `;
  } else {
    resultBox.style.background = '#fef2f2';
    resultBox.style.borderColor = '#fca5a5';
    resultBox.innerHTML = `
      <div style="color: #b91c1c; font-weight: 800; font-size: 1.1rem; margin-bottom: 6px;">
        ⚠️ WARNING: FORGERY OR TAMPERED DMC DETECTED!
      </div>
      <div style="font-size: 0.85rem; color: #7f1d1d; line-height: 1.5;">
        The hash submitted does NOT match the college cryptographic root ledger.<br>
        <strong>Reason:</strong> Marks, CGPA, or student information has been altered after official issuance.<br>
        <strong>Action:</strong> Transcript rejected. Incident logged in Academic Audit Registry.
      </div>
    `;
  }
}

function pasteGenuineHash() {
  document.getElementById('bc-input-hash').value = SAMPLE_HASH_GENUINE;
  verifyBlockchainHash();
}

function pasteTamperedHash() {
  document.getElementById('bc-input-hash').value = "0x9999999999999999999999999999999999999999999999999999999999999999";
  verifyBlockchainHash();
}

// Auto-run AI prediction on load
document.addEventListener('DOMContentLoaded', () => {
  runAIPrediction();
});
