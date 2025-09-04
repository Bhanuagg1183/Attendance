import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !isActive) return null;

    setIsCapturing(true);

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Simulate facial recognition processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return photoData;
      }
      
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isActive]);

  const simulateFaceRecognition = useCallback(async (imageData: string): Promise<{
    success: boolean;
    confidence: number;
    message: string;
  }> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate recognition result (90% success rate)
    const success = Math.random() > 0.1;
    const confidence = success ? Math.random() * 20 + 80 : Math.random() * 30 + 40;
    
    return {
      success,
      confidence: Math.round(confidence),
      message: success 
        ? `Face recognized with ${Math.round(confidence)}% confidence`
        : 'Face not recognized. Please try again.'
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    isCapturing,
    startCamera,
    stopCamera,
    capturePhoto,
    simulateFaceRecognition,
  };
};