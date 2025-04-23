// First, create the camera types
export interface CameraLocation {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;  // Optional confidence score for each detection
}

export interface RFSignal {
  location: CameraLocation;
  strength: number;
  frequency?: number;
} 