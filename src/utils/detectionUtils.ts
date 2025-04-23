import { Location } from '../types/detection';

export const REFLECTION_THRESHOLD = 0.8;
export const IR_THRESHOLD = 0.7;
export const MIN_CONFIDENCE = 0.6;

export function createLocation(x: number, y: number): Location {
  return {
    x,
    y,
    width: 20,
    height: 20
  };
}

export function calculateConfidence(value: number, threshold: number): number {
  return Math.max(0, Math.min(1, (value - threshold) / (1 - threshold)));
} 