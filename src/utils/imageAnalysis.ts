  import * as tf from '@tensorflow/tfjs';
  import { Detection, DetectionResult, Location } from '../types/detection';

  // Detection constants
  const BRIGHTNESS_THRESHOLD = 0.8;
  const MIN_CONFIDENCE = 0.6;
  const DETECTION_SIZE = 20;
  const IR_THRESHOLD = 0.7;
  const SAMPLE_STEP = 4;        // sample every 4px → ~16× fewer reads

  export async function analyzeImage(
    imageData: ImageData,
    mode: 'basic' | 'advanced' | 'ir'
  ): Promise<DetectionResult> {
    const { data, width, height } = imageData;
    const detections: Detection[] = [];
    // Looser threshold in IR mode, tighter in Basic
    const threshold = mode === 'basic' ? 240 : mode === 'advanced' ? 220 : 200;

    try {
      for (let y = 0; y < height; y += SAMPLE_STEP) {
        for (let x = 0; x < width; x += SAMPLE_STEP) {
          const idx = (y * width + x) * 4;
          const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
          if (brightness <= threshold) continue;

          const confidence = (brightness - threshold) / (255 - threshold);
          
          // Clustering: skip if there's already a detection nearby
          let merged = false;
          for (const det of detections) {
            const dx = det.location.x - x;
            const dy = det.location.y - y;
            if (Math.hypot(dx, dy) < DETECTION_SIZE) {
              // Keep the stronger one
              if (confidence > det.confidence) {
                det.location = { 
                  x, 
                  y, 
                  width: DETECTION_SIZE, 
                  height: DETECTION_SIZE 
                };
                det.confidence = confidence;
              }
              merged = true;
              break;
            }
          }

          if (!merged) {
            detections.push({
                type: mode === 'ir' ? 'ir' : 'camera',
                location: {
                    x,
                    y,
                    width: DETECTION_SIZE,
                    height: DETECTION_SIZE
                },
                confidence,
                time: undefined
            });
          }
        }
      }

      const maxConf = detections.length
        ? Math.max(...detections.map(d => d.confidence))
        : 0;

      return {
        detections,
        timestamp: Date.now(),
        confidence: maxConf,
        opticalDetection: detections.some(d => d.type === 'camera'),
        irDetection: detections.some(d => d.type === 'ir'),
        scanMode: mode,
      };

    } catch (error) {
      console.error('Analysis error:', error);
      return {
        detections: [],
        timestamp: Date.now(),
        confidence: 0,
        opticalDetection: false,
        irDetection: false,
        scanMode: mode,
      };
    }
  }

  async function detectBrightSpots(tensor: tf.Tensor3D): Promise<Array<{ x: number; y: number; confidence: number }>> {
    const spots: Array<{ x: number; y: number; confidence: number }> = [];

    try {
      const grayscale = tf.tidy(() => {
        // Use proper RGB weights for grayscale conversion
        const weights = [0.2989, 0.5870, 0.1140];
        return tf.dot(tensor, weights);
      });

      const data = await grayscale.data();
      const [height, width] = grayscale.shape;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const brightness = data[y * width + x];
          if (brightness > BRIGHTNESS_THRESHOLD) {
            spots.push({
              x,
              y,
              confidence: Math.min(1, brightness)
            });
          }
        }
      }

      grayscale.dispose();
      return spots;

    } catch (error) {
      console.error('Bright spot detection error:', error);
      return [];
    }
  }

  async function detectIRSignatures(tensor: tf.Tensor3D): Promise<Array<{ x: number; y: number; intensity: number }>> {
    const signatures: Array<{ x: number; y: number; intensity: number }> = [];

    try {
      // Convert to grayscale focusing on IR wavelengths
      const irChannel = tf.tidy(() => {
        // Weights emphasizing IR wavelengths
        const weights = [0.1, 0.1, 0.8]; // More weight on blue channel for IR
        return tf.dot(tensor, weights);
      });

      const data = await irChannel.data();
      const [height, width] = irChannel.shape;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const intensity = data[y * width + x];
          if (intensity > IR_THRESHOLD) {
            signatures.push({
              x,
              y,
              intensity: Math.min(1, intensity)
            });
          }
        }
      }

      irChannel.dispose();
      return signatures;

    } catch (error) {
      console.error('IR signature detection error:', error);
      return [];
    }
  }

  // Helper function to visualize detections (can be used in your component)
  export function drawDetections(
    ctx: CanvasRenderingContext2D, 
    detections: Detection[]
  ) {
    ctx.lineWidth = 2;
    
    detections.forEach(det => {
      const { x, y, width, height } = det.location;
      
      // Color based on type and confidence
      const alpha = 0.3 + (det.confidence * 0.7); // 0.3 to 1.0
      ctx.strokeStyle = det.type === 'ir' 
        ? `rgba(0, 255, 255, ${alpha})` // cyan for IR
        : `rgba(0, 255, 0, ${alpha})`; // green for camera
      
      // Draw detection box
      ctx.strokeRect(x - width/2, y - height/2, width, height);
      
      // Draw confidence indicator
      const barWidth = 30;
      const barHeight = 4;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillRect(
        x - barWidth/2,
        y + height/2 + 5,
        barWidth * det.confidence,
        barHeight
      );
    });
  }
