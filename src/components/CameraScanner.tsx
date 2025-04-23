'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { analyzeImage, drawDetections } from '../utils/imageAnalysis';
import { DetectionResult } from '../types/detection';

interface CameraScannerProps {
  mode: 'basic' | 'advanced' | 'ir';
  isScanning: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDetectionUpdateAction: (result: DetectionResult) => void;
  toggleScanningAction: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  mode,
  isScanning,
  videoRef,
  canvasRef,
  onDetectionUpdateAction,
  toggleScanningAction,
}) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const vidRef = videoRef || internalVideoRef;
  const animationFrameRef = useRef<number>(0);
  const lastResultRef = useRef<DetectionResult | null>(null);

  // Initialize camera on mount
  useEffect(() => {
    const startCamera = async () => {
      const videoEl = vidRef.current;
      if (!videoEl) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoEl.srcObject = stream;
        await videoEl.play();
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };
    startCamera();
    return () => {
      const stream = vidRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Restart or stop loop when scanning or mode changes
  useEffect(() => {
    if (isScanning) {
      startFrameLoop();
    } else {
      cancelAnimationFrame(animationFrameRef.current);
      clearOverlay();
      lastResultRef.current = null; // reset last result
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isScanning, mode]);

  // Frame capture → analyze → conditional update → draw
  const startFrameLoop = useCallback(() => {
    const loop = async () => {
      const video = vidRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result: DetectionResult = await analyzeImage(imageData, mode);

        // Only fire update if result changed
        const last = lastResultRef.current;
        if (!last || JSON.stringify(result) !== JSON.stringify(last)) {
          onDetectionUpdateAction(result);
          lastResultRef.current = result;
        }

        // Always draw current detections
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDetections(ctx, result.detections);
      } catch (error) {
        console.error('CameraScanner error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [mode, onDetectionUpdateAction, canvasRef]);

  const clearOverlay = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={vidRef}
        className="w-full h-full object-cover rounded-lg bg-black"
        hidden={!isScanning}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      <button
        onClick={toggleScanningAction}
        className="absolute bottom-4 left-4 p-3 bg-blue-500 text-white rounded-full shadow-lg"
      >
        {isScanning ? 'Stop' : 'Scan'}
      </button>
    </div>
  );
};
