/**
 * Chapter 9.5 — Future Work: Cross-Platform Student & Parent Mobile App
 * Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 * 
 * Framework: React Native (Expo) / iOS & Android
 * Features:
 *   - Live Attendance Eligibility Gauge (< 75% Fine Warning)
 *   - Digital Student Smart ID Card with QR Verification
 *   - Semester GPA Progression Tracker
 *   - Instant Push Notifications for Exam DMC & Fees
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';

export default function StudentPortalApp() {
  const [student, setStudent] = useState({
    name: 'Imran Burki',
    rollNo: 'CS-2210',
    department: 'Computer Science',
    semester: 'Semester 4',
    session: '2022-2026',
    cgpa: 3.82,
    attendance: 88.5,
    unpaidFine: 0
  });

  const isAttendanceEligible = student.attendance >= 75.0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0e2238" />

      {/* College Header */}
      <View style={styles.header}>
        <Text style={styles.collegeName}>Govt. Degree College No. 1, D.I. Khan</Text>
        <Text style={styles.subTitle}>Student Academic Mobile Portal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Student Digital Identity Card */}
        <View style={styles.idCard}>
          <View style={styles.idHeader}>
            <Text style={styles.idHeaderText}>STUDENT SMART ID</Text>
            <Text style={styles.badgeText}>{student.session}</Text>
          </View>
          <View style={styles.idBody}>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentRoll}>Roll No: {student.rollNo}</Text>
            <Text style={styles.studentDept}>{student.department} • {student.semester}</Text>
          </View>
        </View>

        {/* Academic Eligibility Meters */}
        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Cumulative CGPA</Text>
            <Text style={[styles.metricVal, { color: '#0284c7' }]}>{student.cgpa}</Text>
            <Text style={styles.metricSub}>Scale 0.0 - 4.0</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Attendance Ratio</Text>
            <Text style={[styles.metricVal, { color: isAttendanceEligible ? '#10b981' : '#ef4444' }]}>
              {student.attendance}%
            </Text>
            <Text style={styles.metricSub}>
              {isAttendanceEligible ? 'Eligible for Exam' : 'DANGER: Fine Imposed'}
            </Text>
          </View>
        </View>

        {/* Outstanding Fine Notice */}
        <View style={[styles.noticeCard, { borderColor: student.unpaidFine > 0 ? '#ef4444' : '#10b981' }]}>
          <Text style={styles.noticeTitle}>
            {student.unpaidFine > 0 ? '⚠️ Attendance Fine Due' : '✅ Clear Financial Standing'}
          </Text>
          <Text style={styles.noticeDesc}>
            {student.unpaidFine > 0 
              ? `You have Rs. ${student.unpaidFine} short-attendance fine pending. Pay via JazzCash/EasyPaisa.`
              : 'No outstanding fines detected. All examination clearances active.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.btnText}>📄 View Detailed Marks Certificate (DMC)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#1e293b' }]}>
          <Text style={styles.btnText}>📲 Download Digital Offline ID</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#0e2238', padding: 18, alignItems: 'center' },
  collegeName: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  subTitle: { color: '#94a3b8', fontSize: 12, marginTop: 3 },
  content: { padding: 16 },
  idCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#f59e0b',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2
  },
  idHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  idHeaderText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  badgeText: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11 },
  studentName: { fontSize: 20, fontWeight: '800', color: '#0e2238' },
  studentRoll: { fontSize: 14, fontWeight: '600', color: '#0284c7', marginTop: 2 },
  studentDept: { fontSize: 13, color: '#64748b', marginTop: 4 },
  metricGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metricBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    width: '48%',
    alignItems: 'center'
  },
  metricLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  metricVal: { fontSize: 26, fontWeight: '800', marginVertical: 4 },
  metricSub: { fontSize: 11, color: '#94a3b8' },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 16
  },
  noticeTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  noticeDesc: { fontSize: 12, color: '#475569', lineHeight: 18 },
  primaryBtn: {
    backgroundColor: '#0284c7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  btnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 }
});
