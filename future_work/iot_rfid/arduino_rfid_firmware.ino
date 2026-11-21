/*
 * Chapter 9.4 — Future Work: IoT Biometric & RFID Attendance Terminal
 * Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
 * Author: Imran (Roll No: CS-2210) | Supervisor: Prof. Abdur Rehman
 * 
 * Hardware:
 *   - ESP32 / Arduino Uno Microcontroller
 *   - MFRC522 RFID Card Reader (SPI Interface)
 *   - R307 Optical Fingerprint Scanner (UART RX/TX Interface)
 *   - 16x2 I2C LCD Display & Piezo Buzzer
 */

#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define SS_PIN 5
#define RST_PIN 22
#define BUZZER_PIN 15
#define LED_GREEN 12
#define LED_RED 13

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("GDC #1 D.I. KHAN");
  lcd.setCursor(0, 1);
  lcd.print("Tap Card / Thumb");
  
  Serial.println("{\"status\":\"READY\",\"terminalId\":\"GDC1-CS-TERM-01\",\"msg\":\"IoT Terminal Active\"}");
}

void loop() {
  // Check for new RFID Card
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // Extract Card UID
  String uidString = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uidString += (rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(rfid.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  // Audio/Visual Feedback
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(120);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_GREEN, LOW);

  // Output structured JSON payload over Serial / WiFi to College Web Dashboard
  Serial.print("{\"event\":\"ATTENDANCE_TAP\",\"terminal\":\"ROOM_CS_LAB1\",\"cardUid\":\"");
  Serial.print(uidString);
  Serial.print("\",\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Card Scanned!");
  lcd.setCursor(0, 1);
  lcd.print(uidString);

  delay(1500);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("GDC #1 D.I. KHAN");
  lcd.setCursor(0, 1);
  lcd.print("Tap Card / Thumb");

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}
