import { opticalDetection, rfDetection, analyzeImage } from '../utils/imageAnalysis';

// Example usage in your component
const handleDetection = async (imageData: ImageData) => {
  // For complete analysis
  const results = await analyzeImage(imageData, 'advanced');
  
  // Or for individual detection methods
  const opticalResults = await opticalDetection(imageData);
  const rfResults = await rfDetection();
  
  // Handle the results...
}; 