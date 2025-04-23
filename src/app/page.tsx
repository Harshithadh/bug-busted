'use client';

import { useState } from 'react';
import { CameraDetector } from '../components/CameraDetector';
import { DetectionResult } from '../types/detection';

export default function Home() {
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [scanMode, setScanMode] = useState<'basic' | 'advanced' | 'ir'>('basic');
  const [showSafetyTips, setShowSafetyTips] = useState(false);

  const handleDetectionUpdate = (result: DetectionResult) => {
    setDetectionResult(result);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Bug&Busted</h1>
          <p className="text-blue-100">Professional Camera Detection System</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Camera and Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <CameraDetector 
              mode={scanMode} 
              onDetectionUpdate={handleDetectionUpdate} 
            />
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Detection Results</h2>
            {detectionResult ? (
              <div className="space-y-4">
                {/* Scan Mode Info */}
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Current Mode: <span className="font-medium">{detectionResult.scanMode}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Last Update: {new Date(detectionResult.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {/* Detection Results */}
                {detectionResult.opticalDetection && (
                  <div className="p-4 bg-yellow-50 rounded-md">
                    <h3 className="text-lg font-medium text-yellow-900">⚠️ Camera Detected</h3>
                    <p className="text-yellow-700">
                      Potential hidden camera detected with {(detectionResult.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                )}

                {detectionResult.irDetection && (
                  <div className="p-4 bg-red-50 rounded-md">
                    <h3 className="text-lg font-medium text-red-900">🔴 IR Signal Detected</h3>
                    <p className="text-red-700">
                      Infrared signature detected - possible hidden camera indicator
                    </p>
                  </div>
                )}

                {/* Detailed Detections */}
                {detectionResult.detections.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h3 className="text-lg font-medium text-blue-900">Detection Details</h3>
                    <ul className="mt-2 space-y-2">
                      {detectionResult.detections.map((detection, index) => (
                        <li key={index} className="text-sm text-blue-700">
                          {detection.type === 'camera' ? '📷' : '🔴'} {detection.type.toUpperCase()} 
                          detected at position ({detection.location.x}, {detection.location.y})
                          <br />
                          Confidence: {(detection.confidence * 100).toFixed(1)}%
                          {detection.signalStrength && 
                            ` | Signal Strength: ${(detection.signalStrength * 100).toFixed(1)}%`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detectionResult.detections.length === 0 && (
                  <div className="p-4 bg-green-50 rounded-md">
                    <h3 className="text-lg font-medium text-green-900">✓ Area Clear</h3>
                    <p className="text-green-700">
                      No suspicious signals detected in current scan mode.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-600">No scan results yet. Start a scan to see results.</p>
              </div>
            )}
          </div>
        </div>

        {/* Safety Tips Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowSafetyTips(!showSafetyTips)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showSafetyTips ? 'Hide Safety Tips' : 'Show Safety Tips'}
          </button>
          {showSafetyTips && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Prevention Tips</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Regularly inspect your surroundings for suspicious objects</li>
                  <li>Be cautious of unfamiliar devices or equipment</li>
                  <li>Check for unusual holes or modifications in walls/ceilings</li>
                  <li>Use professional detection tools in high-risk areas</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-3">What to Do If You Find a Device</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Do not touch or move the device</li>
                  <li>Document its location and appearance</li>
                  <li>Contact local law enforcement</li>
                  <li>Preserve any evidence</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bug&Busted. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">
            This tool is for educational and security assessment purposes only.
          </p>
        </div>
      </footer>
    </main>
  );
}
