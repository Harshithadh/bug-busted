import { Detection } from '../types/detection';

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detections: Detection[]
): void {
  detections.forEach(detection => {
    const { x, y } = detection.location;
    
    // Draw detection circle with pulse effect
    const baseRadius = 15;
    const pulseRadius = baseRadius + (Math.sin(Date.now() / 200) * 3);
    
    // Outer pulse
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = detection.type === 'ir' 
      ? 'rgba(255,0,0,0.3)' 
      : 'rgba(0,255,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Main circle
    ctx.beginPath();
    ctx.arc(x, y, baseRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = detection.type === 'ir' ? '#ff0000' : '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Confidence indicator
    ctx.beginPath();
    ctx.arc(x, y, baseRadius * detection.confidence, 0, 2 * Math.PI);
    ctx.fillStyle = `${detection.type === 'ir' ? 'rgba(255,0,0,' : 'rgba(0,255,0,'}${detection.confidence})`;
    ctx.fill();

    // Label
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    const label = `${detection.type.toUpperCase()} (${(detection.confidence * 100).toFixed(0)}%)`;
    const textWidth = ctx.measureText(label).width;
    
    ctx.strokeText(label, x - textWidth/2, y - baseRadius - 5);
    ctx.fillText(label, x - textWidth/2, y - baseRadius - 5);
  });
} 