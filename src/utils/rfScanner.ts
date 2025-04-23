import { RFSignal } from '../types/detection';

export const checkRFPermissions = async (): Promise<boolean> => {
  try {
    if (!('bluetooth' in navigator)) {
      throw new Error('Bluetooth not supported');
    }
    const result = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: []
    });
    return !!result;
  } catch (error) {
    console.error('RF permission error:', error);
    return false;
  }
};

export const scanRFSignals = async (): Promise<RFSignal[]> => {
  try {
    const hasPermission = await checkRFPermissions();
    if (!hasPermission) {
      throw new Error('RF scanning permission denied');
    }

    // Scan for nearby Bluetooth devices as potential camera signals
    const signals: RFSignal[] = [];
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true
    });

    if (device) {
      signals.push({
        location: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        },
        frequency: 2.4, // Bluetooth typically operates at 2.4GHz
        strength: -50 // Approximate signal strength in dBm
      });
    }

    return signals;
  } catch (error) {
    console.error('RF scanning error:', error);
    return [];
  }
};
