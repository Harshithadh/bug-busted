'use client';

import React, { useRef, useState, useEffect } from 'react';
import { DetectionResult, Detection, Location } from '../types/detection';
import { CameraScanner } from './CameraScanner';

const SCAN_MODES = [
  { value: 'basic' as const, label: 'Basic Scan', icon: '🔍' },
  { value: 'advanced' as const, label: 'Advanced Scan', icon: '🎯' },
  { value: 'ir' as const, label: 'IR Detection', icon: '🌡️' }
] as const;

// Fake detection generator
const generateFakeDetection = (mode: typeof SCAN_MODES[number]['value']): Detection => {
  const location: Location = {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    width: 20,
    height: 20
  };

  return {
    type: mode === 'ir' ? 'ir' : 'camera',
    location,
    confidence: 60 + Math.floor(Math.random() * 40), // Random confidence between 60-100
    time: new Date().toISOString() // Add required time property
  };
};

export const CameraDetector: React.FC = () => {
  const [scanMode, setScanMode] = useState<typeof SCAN_MODES[number]['value']>('basic');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<(Detection & { id: string; time: string })[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Handle mode changes
  const handleModeChange = (newMode: typeof scanMode) => {
    setScanMode(newMode);
    if (isScanning) {
      setIsScanning(false);
      setResults([]); // Clear results when changing modes
    }
  };

  // Simulate detections while scanning
  useEffect(() => {
    if (isScanning) {
      // Add initial detection immediately
      const initialDetection = generateFakeDetection(scanMode);
      setResults([{
        ...initialDetection,
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString()
      }]);

      // Add new detections periodically
      intervalRef.current = setInterval(() => {
        const shouldDetect = Math.random() > 0.3; // 70% chance of detection
        
        if (shouldDetect) {
          const newDetection = generateFakeDetection(scanMode);
          setResults(prev => {
            const newResults = [...prev, {
              ...newDetection,
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString()
            }];
            // Keep only last 5 results
            return newResults.slice(-5);
          });
        }
      }, 2000); // New detection every 2 seconds
    } else {
      // Clear interval when stopping scan
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isScanning, scanMode]);

  return (
    <div className="container mx-auto p-4">
      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {SCAN_MODES.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => handleModeChange(value)}
            className={`
              p-4 rounded-lg transition-all duration-300
              ${scanMode === value 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-gray-100 hover:bg-gray-200'}
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Scanner */}
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
          <CameraScanner
            mode={scanMode}
            isScanning={isScanning}
            canvasRef={canvasRef}
            onDetectionUpdateAction={() => {}} // We're using simulated results
            toggleScanningAction={() => {
              setIsScanning(prev => !prev);
              if (!isScanning) {
                setResults([]); // Clear results when starting new scan
              }
            }}
          />
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-lg p-4 shadow-lg">
          {results.length === 0 ? (
            <p className="text-gray-500">No scan results yet. Start a scan to see results.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Live Scan Results</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {isScanning ? 'Scanning...' : 'Scan Complete'}
                </span>
              </div>
              <ul className="space-y-2">
                {results.map((result) => (
                  <li 
                    key={result.id}
                    className="p-3 bg-gray-50 rounded-lg flex justify-between items-center animate-fadeIn"
                  >
                    <div>
                      <span className="font-medium">
                        {result.type === 'camera' ? '📷' : '🌡️'} {result.type.toUpperCase()}
                      </span>
                      <div className="text-sm text-gray-500">
                        Location: ({result.location.x}, {result.location.y})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(result.confidence)}% confidence
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.time}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS or style block
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
