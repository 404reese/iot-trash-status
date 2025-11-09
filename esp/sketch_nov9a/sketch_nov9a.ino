#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Reese Galaxy";
const char* password = "galaxy123";

// API endpoint - update with your actual server IP/URL
const char* serverURL = "http://10.32.140.189:3000/api/data";

// Ultrasonic sensor pins - Using GPIO 12 and 14
const int trigPin = 12;
const int echoPin = 14;

// Trash can dimensions
const float TRASH_HEIGHT = 25.0; // cm
const float SENSOR_HEIGHT = 25.0; // Distance from sensor to bottom of trash can

// Sound speed in cm/us
const float SOUND_SPEED = 0.034;

void setup() {
  Serial.begin(115200);
  
  // Initialize ultrasonic sensor pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Measure distance
  float distance = measureDistance();
  
  if (distance > 0 && distance < 500) { // Valid range check
    // Calculate fill level
    float fillLevel = calculateFillLevel(distance);
    
    // Send data to server
    sendToServer(fillLevel, distance);
  } else {
    Serial.println("Invalid distance measurement");
  }
  
  delay(5000); // Wait 5 seconds between measurements
}

float measureDistance() {
  // Clear trig pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Set trig pin HIGH for 10 microseconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read echo pin, returns the sound wave travel time in microseconds
  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    Serial.println("Measurement timeout");
    return -1;
  }
  
  // Calculate distance
  float distance = duration * SOUND_SPEED / 2;
  
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  return distance;
}

float calculateFillLevel(float distance) {
  // Calculate empty space from sensor to trash surface
  float emptySpace = distance;
  
  // Calculate filled height
  float filledHeight = SENSOR_HEIGHT - emptySpace;
  
  // Ensure filled height is within bounds
  if (filledHeight < 0) filledHeight = 0;
  if (filledHeight > TRASH_HEIGHT) filledHeight = TRASH_HEIGHT;
  
  // Calculate fill level percentage
  float fillLevel = (filledHeight / TRASH_HEIGHT) * 100;
  
  Serial.print("Filled Height: ");
  Serial.print(filledHeight);
  Serial.print(" cm, Fill Level: ");
  Serial.print(fillLevel);
  Serial.println("%");
  
  return fillLevel;
}

void sendToServer(float fillLevel, float distance) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    DynamicJsonDocument doc(1024);
    doc["fillLevel"] = round(fillLevel * 10) / 10.0; // Round to 1 decimal
    doc["distance"] = round(distance * 10) / 10.0;   // Round to 1 decimal
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.print("Sending data: ");
    Serial.println(jsonString);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Data sent successfully!");
      String response = http.getString();
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("❌ HTTP Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected - Attempting reconnect");
    WiFi.reconnect();
  }
}