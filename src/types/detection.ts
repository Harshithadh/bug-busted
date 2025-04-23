import { ReactNode } from "react";

// Single source of truth for all detection-related types
export interface Location {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Now supports both camera (optical) and IR detections
export interface Detection {
  time: ReactNode;
  type: 'camera' | 'ir';
  location: Location;
  confidence: number;
}

export interface DetectionResult {
  detections: Detection[];
  timestamp: number;             // epoch ms
  confidence: number;            // highest confidence among detections
  opticalDetection: boolean;     // any camera detection
  irDetection: boolean;          // any IR detection
  scanMode: 'basic' | 'advanced' | 'ir';
}

export interface IRSignature {
  location: Location;
  intensity: number;
}

export interface RFSignal {
  location: Location;
  strength: number;
  frequency?: number;
  deviceName?: string;            // optional device name from BLE scan
}

export interface DetectedPoint {
  type: 'lens' | 'ir_led' | 'camera' | 'rf';
  location: Location;
  confidence: number;
}
