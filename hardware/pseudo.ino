// ============================================================
// Office Device Monitor - ESP32 Firmware
// Room: Work Room 1 (Fan1, Fan2, Light1, Light2, Light3)
//
// Local Wokwi demo mode uses the potentiometer as a synthetic load level so the
// reported current visibly changes even though the simulator has no AC mains.
// Set DEMO_MODE to false for real-hardware use with a calibrated INA219.
// ============================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

// ---------- CONFIG ----------
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
const char* BACKEND_URL = "http://host.wokwi.internal:4000/api/devices/report";
const char* ROOM_ID = "work_room_1";
const unsigned long REPORT_INTERVAL_MS = 5000;

const bool DEMO_MODE = true;
const float MAINS_VOLTAGE = 220.0f;
const float DEMO_EXTRA_CURRENT_MA = 450.0f;
const unsigned long BUTTON_DEBOUNCE_MS = 50;
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 15000;

// ---------- PIN MAP ----------
const int RELAY_PINS[5] = {16, 17, 18, 19, 21};
const int LED_PINS[5] = {22, 23, 25, 26, 27};
const char* DEVICE_IDS[5] = {"fan1", "fan2", "light1", "light2", "light3"};
const char* DEVICE_TYPES[5] = {"fan", "fan", "light", "light", "light"};
const float RATED_WATTS[5] = {60.0, 60.0, 15.0, 15.0, 15.0};

const int BUTTON_PIN = 32;
const int POT_PIN = 34;

Adafruit_INA219 ina219;

bool deviceState[5] = {false, false, false, false, false};
unsigned long lastChanged[5] = {0, 0, 0, 0, 0};
unsigned long lastReport = 0;
bool sensorReady = false;

bool lastButtonReading = HIGH;
bool buttonStableState = HIGH;
unsigned long lastButtonChangeMs = 0;

bool potStableDeviceState = false;

// ---------- HELPERS ----------
void setDevice(int idx, bool on) {
  if (deviceState[idx] == on) {
    return;
  }

  deviceState[idx] = on;
  lastChanged[idx] = millis();
  digitalWrite(RELAY_PINS[idx], on ? LOW : HIGH);
  digitalWrite(LED_PINS[idx], on ? HIGH : LOW);
  Serial.printf("[%s] -> %s\n", DEVICE_IDS[idx], on ? "ON" : "OFF");
}

bool connectWiFi(unsigned long timeoutMs = WIFI_CONNECT_TIMEOUT_MS) {
  Serial.printf("Connecting to WiFi %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi connect timed out");
    return false;
  }

  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
  return true;
}

float readSimulatedCurrent_mA(float potLevel) {
  float totalWatts = 0.0f;
  for (int i = 0; i < 5; i++) {
    if (deviceState[i]) {
      totalWatts += RATED_WATTS[i];
    }
  }

  float deviceCurrent_mA = (totalWatts / MAINS_VOLTAGE) * 1000.0f;
  float demoCurrent_mA = deviceCurrent_mA + (potLevel * DEMO_EXTRA_CURRENT_MA);
  return demoCurrent_mA;
}

float readCurrent_mA(float potLevel) {
  if (DEMO_MODE) {
    return readSimulatedCurrent_mA(potLevel);
  }

  if (sensorReady) {
    float current_mA = ina219.getCurrent_mA();
    if (current_mA > 0.0f) {
      return current_mA;
    }
  }

  return readSimulatedCurrent_mA(potLevel);
}

float computeRoomWatts() {
  float totalWatts = 0.0f;
  for (int i = 0; i < 5; i++) {
    if (deviceState[i]) {
      totalWatts += RATED_WATTS[i];
    }
  }
  return totalWatts;
}

void reportState() {
  int potRaw = analogRead(POT_PIN);
  float potLevel = potRaw / 4095.0f;
  float measured_mA = readCurrent_mA(potLevel);
  float totalWatts = computeRoomWatts();

  StaticJsonDocument<1024> doc;
  doc["room"] = ROOM_ID;
  doc["timestamp"] = (unsigned long)(millis() / 1000);
  doc["measured_current_mA"] = measured_mA;
  doc["room_total_watts"] = totalWatts;
  doc["demo_mode"] = DEMO_MODE;
  doc["pot_level"] = potLevel;

  JsonArray devices = doc.createNestedArray("devices");
  for (int i = 0; i < 5; i++) {
    JsonObject d = devices.createNestedObject();
    d["id"] = DEVICE_IDS[i];
    d["type"] = DEVICE_TYPES[i];
    d["status"] = deviceState[i] ? "on" : "off";
    d["power_w"] = deviceState[i] ? RATED_WATTS[i] : 0.0;
    d["last_changed_ms"] = lastChanged[i];
  }

  String payload;
  serializeJson(doc, payload);
  Serial.println("Payload: " + payload);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping report");
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  Serial.printf("POST -> HTTP %d\n", code);

  if (code == 200) {
    String responseString = http.getString();
    StaticJsonDocument<1024> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, responseString);
    if (!error) {
      if (responseDoc.containsKey("commands")) {
        JsonArray commands = responseDoc["commands"].as<JsonArray>();
        for (JsonObject cmd : commands) {
          const char* cmdId = cmd["id"];
          const char* cmdStatus = cmd["status"];
          if (cmdId && cmdStatus) {
            bool turnOn = (strcmp(cmdStatus, "on") == 0);
            for (int i = 0; i < 5; i++) {
              if (strcmp(DEVICE_IDS[i], cmdId) == 0) {
                setDevice(i, turnOn);
                break;
              }
            }
          }
        }
      }
    } else {
      Serial.print("JSON parse error: ");
      Serial.println(error.c_str());
    }
  }
  http.end();
}

void handleButton() {
  bool reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonReading) {
    lastButtonChangeMs = millis();
    lastButtonReading = reading;
  }

  if ((millis() - lastButtonChangeMs) > BUTTON_DEBOUNCE_MS && reading != buttonStableState) {
    buttonStableState = reading;
    if (buttonStableState == LOW) {
      setDevice(0, !deviceState[0]);
    }
  }
}

void handlePotentiometer() {
  int potRaw = analogRead(POT_PIN);
  bool potOn = potRaw > 2048;

  if (potOn != potStableDeviceState) {
    potStableDeviceState = potOn;
    setDevice(2, potStableDeviceState);
  }
}

// ---------- SETUP ----------
void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  for (int i = 0; i < 5; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], HIGH);
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(POT_PIN, INPUT);

  Wire.begin(4, 5);
  sensorReady = ina219.begin();
  if (!sensorReady) {
    Serial.println("INA219 not found - check wiring");
  } else if (!DEMO_MODE) {
    ina219.setCalibration_32V_2A();
  }

  if (!connectWiFi(8000)) {
    Serial.println("Continuing in offline mode so local button tests still work");
  }
}

// ---------- LOOP ----------
void loop() {
  handleButton();
  handlePotentiometer();

  if (millis() - lastReport >= REPORT_INTERVAL_MS) {
    reportState();
    lastReport = millis();
  }
}