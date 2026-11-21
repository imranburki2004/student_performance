/**
 * Chapter 9.3 — Future Work: Automated SMS & WhatsApp Parent Alert Gateway
 * Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 * 
 * Dispatcher Service for Twilio SMS, WhatsApp Business API & Local GSM Modems
 */

const https = require('https');

// Templates in both English and Urdu (Nastaliq transliterated)
const ALERT_TEMPLATES = {
  ATTENDANCE_WARNING_EN: (name, roll, dept, subject, attend) =>
    `URGENT NOTICE - Govt. Degree College No. 1, D.I. Khan:\nDear Parent, your ward ${name} (${roll}, ${dept}) has only ${attend}% attendance in ${subject}. Threshold is 75%. Short attendance incurs Rs. 1,000 fine and exam debarment. Please contact HOD.`,

  ATTENDANCE_WARNING_UR: (name, roll, dept, subject, attend) =>
    `انتہائی اہم اطلاع - گورنمنٹ ڈگری کالج نمبر 1 ڈیرہ اسماعیل خان:\nمحترم والدین، آپ کے بچے ${name} (${roll}) کی حاضری مضمون ${subject} میں صرف ${attend}% ہے۔ 75 فیصد سے کم حاضری پر 1,000 روپے جرمانہ اور امتحان سے روک دیا جائے گا۔ برائے مہربانی فوری کالج سے رابطہ کریں۔`,

  FINE_ISSUED_EN: (name, roll, amount, reason) =>
    `ACCOUNTS NOTICE - GDC No. 1 D.I. Khan:\nAn academic fine of Rs. ${amount} has been issued for student ${name} (${roll}) due to: ${reason}. Please deposit at the college accounts counter or via online portal within 7 days.`,

  EXAM_DMC_PUBLISHED: (name, roll, semester, cgpa, grade) =>
    `ACADEMIC RESULT - GDC No. 1 D.I. Khan:\nOfficial DMC for ${name} (${roll}) for ${semester} is declared. CGPA: ${cgpa}, Grade: ${grade}. View online at college portal.`
};

class NotificationService {
  constructor(config = {}) {
    this.provider = config.provider || 'SIMULATOR'; // 'TWILIO' | 'WHATSAPP_CLOUD' | 'SIMULATOR'
    this.apiKey = config.apiKey || 'MOCK_KEY_GDC1_DIK';
    this.senderId = config.senderId || 'GDC-DIKHAN';
  }

  async sendSMS(phoneNumber, messageContent) {
    console.log(`[SMS Gateway] Queuing SMS to ${phoneNumber} via ${this.provider}...`);
    
    // In production, execute HTTPS POST request to Twilio / WhatsApp Cloud API
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = {
          success: true,
          messageId: `MSG-DIK-${Math.floor(100000 + Math.random() * 900000)}`,
          recipient: phoneNumber,
          provider: this.provider,
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
          content: messageContent
        };
        console.log(`[SMS Gateway] Dispatched successfully! Message ID: ${response.messageId}`);
        resolve(response);
      }, 400);
    });
  }

  async sendWhatsAppAlert(parentPhone, studentDetails) {
    const { name, rollNo, department, subject, attendance } = studentDetails;
    const bodyText = ALERT_TEMPLATES.ATTENDANCE_WARNING_EN(name, rollNo, department, subject, attendance);
    return await this.sendSMS(parentPhone, bodyText);
  }
}

module.exports = {
  NotificationService,
  ALERT_TEMPLATES
};

// Standalone execution test
if (require.main === module) {
  const service = new NotificationService();
  service.sendWhatsAppAlert('+923001234567', {
    name: 'Muhammad Bilal',
    rollNo: 'CS-2215',
    department: 'Computer Science',
    subject: 'Database Systems',
    attendance: 62.0
  }).then(res => {
    console.log('\n[Test Execution Output]:\n', JSON.stringify(res, null, 2));
  });
}
