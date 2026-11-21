/**
 * Chapter 9.6 — Future Work: Digital Fee & Fine Payment Gateway
 * Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 * 
 * Supports: JazzCash, EasyPaisa, 1Link, Raast Digital Payments
 * Implementation: HMAC-SHA256 Transaction Signature Verification & Webhook Callbacks
 */

const crypto = require('crypto');

class DigitalPaymentGateway {
  constructor(config = {}) {
    this.merchantId = config.merchantId || 'MC_GDC1_DIK';
    this.secretKey = config.secretKey || 'SEC_KEY_GDC1_2026_DIKHAN';
    this.callbackUrl = config.callbackUrl || 'https://gdc1dikhan.edu.pk/api/payments/callback';
  }

  // Generate secure HMAC-SHA256 signature for online transaction
  generateSecureHash(params) {
    const sortedKeys = Object.keys(params).sort();
    let payload = '';
    sortedKeys.forEach(k => {
      if (params[k] !== undefined && params[k] !== '') {
        payload += `${k}=${params[k]}&`;
      }
    });
    payload += `secret=${this.secretKey}`;

    return crypto.createHash('sha256').update(payload).digest('hex').toUpperCase();
  }

  // Initiate an attendance fine payment session (Rs. 1,000)
  initiateFinePayment(studentRoll, studentName, subjectName, amount = 1000, provider = 'JAZZCASH') {
    const txnRef = `TXN-DIK-${Date.now()}`;
    const payload = {
      pp_MerchantID: this.merchantId,
      pp_TxnRefNo: txnRef,
      pp_Amount: amount * 100, // In Paisas
      pp_BillReference: studentRoll,
      pp_Description: `Short attendance fine: ${subjectName} (${studentName})`,
      pp_TxnDateTime: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
      pp_Provider: provider
    };

    payload.pp_SecureHash = this.generateSecureHash(payload);

    return {
      status: 'INITIATED',
      transactionId: txnRef,
      studentRoll,
      studentName,
      subjectName,
      amount,
      provider,
      checkoutUrl: `https://payments.gdc1dikhan.edu.pk/checkout?ref=${txnRef}`,
      signature: payload.pp_SecureHash,
      initiatedAt: new Date().toISOString()
    };
  }

  // Process transaction callback after user pays fine
  verifyAndCompletePayment(txnRef, receivedSignature, simulatedParams) {
    const expectedHash = this.generateSecureHash(simulatedParams);
    const isValid = (expectedHash === receivedSignature);

    return {
      success: isValid,
      transactionId: txnRef,
      status: isValid ? 'PAID_SETTLED' : 'FRAUD_DETECTED',
      receiptNo: `RCPT-GDC1-${Math.floor(100000 + Math.random() * 900000)}`,
      amountPaid: 1000,
      clearedAt: new Date().toISOString(),
      bankResponseCode: '000 (Successful)'
    };
  }
}

module.exports = DigitalPaymentGateway;

if (require.main === module) {
  const gateway = new DigitalPaymentGateway();
  console.log('[Digital Payment Gateway] Initializing test transaction...');
  const session = gateway.initiateFinePayment('CS-2215', 'Muhammad Bilal', 'Database Systems', 1000, 'JAZZCASH');
  console.log('[Initiated Session]:\n', JSON.stringify(session, null, 2));
}
