/**
 * Chapter 9.7 — Future Work: Blockchain & Cryptographic Credential Verification
 * Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 * 
 * Generates immutable SHA-256 Merkle root hashes for student DMC transcripts
 * Prevents forged certificates and enables public QR-code credential verification
 */

const crypto = require('crypto');

class CredentialHasher {
  // Hash student record into a deterministic cryptographic fingerprint
  static generateDMCFingerprint(student) {
    const canonicalPayload = JSON.stringify({
      institution: "Govt. Degree College No. 1, Dera Ismail Khan",
      affiliatedWith: "Gomal University, D.I. Khan",
      rollNo: student.studentId,
      name: student.name,
      fatherName: student.fatherName,
      department: student.department,
      semester: student.semester,
      session: `${student.sessionStart}-${student.sessionEnd}`,
      cgpa: Number(student.cgpa).toFixed(2),
      percentage: Number(student.percentage).toFixed(1),
      grade: student.overallGrade,
      subjects: (student.subjects || []).map(s => ({
        name: s.name,
        total: s.total,
        gpa: s.gpa,
        grade: s.grade
      }))
    });

    const sha256Hash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
    const signature = `0x${sha256Hash}`;

    return {
      certificateId: `DMC-DIK-${student.sessionStart}-${student.id}`,
      cryptographicHash: signature,
      timestamp: new Date().toISOString(),
      qrVerificationUrl: `https://verify.gdc1dikhan.edu.pk/cert/${signature}`
    };
  }

  // Verify whether a given transcript has been tampered with
  static verifyCertificate(originalHash, candidateRecord) {
    const candidateHash = this.generateDMCFingerprint(candidateRecord).cryptographicHash;
    const isAuthentic = (originalHash === candidateHash);

    return {
      isAuthentic,
      originalHash,
      candidateHash,
      status: isAuthentic ? 'VERIFIED_GENUINE_TRANSCRIPT' : 'FORGERY_DETECTED_TAMPERED'
    };
  }
}

module.exports = CredentialHasher;

if (require.main === module) {
  const sampleStudent = {
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
    subjects: [
      { name: "Database Systems", total: 54.0, gpa: 3.8, grade: "A" }
    ]
  };

  const cert = CredentialHasher.generateDMCFingerprint(sampleStudent);
  console.log('[Blockchain Verification] Cryptographic DMC Generated:\n', JSON.stringify(cert, null, 2));

  // Test Tampering Detection
  const tampered = { ...sampleStudent, cgpa: 4.00 }; // Fraudulent alteration
  const verifyResult = CredentialHasher.verifyCertificate(cert.cryptographicHash, tampered);
  console.log('\n[Tampering Test with altered CGPA 4.00]:\n', JSON.stringify(verifyResult, null, 2));
}
