import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, Loader, MapPin } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import { attendanceService } from '../../services/attendanceService';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AttendanceCamera: React.FC = () => {
  const { user } = useAuthContext();
  const {
    videoRef,
    isActive,
    error,
    isCapturing,
    startCamera,
    stopCamera,
    capturePhoto,
    simulateFaceRecognition,
  } = useCamera();

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAttendance, setLastAttendance] = useState<any>(null);
  const [location, setLocation] = useState<string>('Unknown Location');

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => {
          setLocation('Location access denied');
        }
      );
    }

    // Check today's attendance
    if (user) {
      attendanceService.getTodayAttendance(user.id)
        .then(setLastAttendance)
        .catch(console.error);
    }
  }, [user]);

  const handleMarkAttendance = async () => {
    if (!user) return;

    try {
      setIsProcessing(true);

      // Capture photo
      const photoData = await capturePhoto();
      if (!photoData) {
        toast.error('Failed to capture photo');
        return;
      }

      // Simulate facial recognition
      const recognition = await simulateFaceRecognition(photoData);
      
      if (!recognition.success) {
        toast.error(recognition.message);
        return;
      }

      // Mark attendance
      const record = await attendanceService.markAttendance(user.id, location);
      setLastAttendance(record);

      const actionType = record.check_out_time ? 'Check-out' : 'Check-in';
      toast.success(`${actionType} successful! Confidence: ${recognition.confidence}%`);

    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAttendanceStatus = () => {
    if (!lastAttendance) return null;
    
    if (lastAttendance.check_out_time) {
      return {
        type: 'completed',
        message: 'Attendance completed for today',
        icon: CheckCircle,
        color: 'text-green-600',
      };
    }
    
    return {
      type: 'checked-in',
      message: 'Checked in - Ready for check-out',
      icon: CheckCircle,
      color: 'text-blue-600',
    };
  };

  const status = getAttendanceStatus();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h2>
        <p className="text-gray-600">Use facial recognition to record your attendance</p>
      </div>

      {status && (
        <div className={`flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg ${status.color}`}>
          <status.icon className="w-5 h-5" />
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {!isActive ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Camera className="w-16 h-16 text-gray-400" />
                <p className="text-gray-500 text-center">Camera access required for facial recognition</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Enable Camera
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {isActive && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-blue-400 rounded-lg"></div>
              <div className="absolute top-8 left-8 right-8">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                  Position your face within the frame
                </div>
              </div>
            </div>
          )}
        </div>

        {isActive && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Location: {location}</span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleMarkAttendance}
                disabled={isProcessing || isCapturing}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isProcessing || isCapturing ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                <span>
                  {isProcessing ? 'Processing...' : 
                   isCapturing ? 'Capturing...' :
                   lastAttendance?.check_out_time ? 'Already Completed' :
                   lastAttendance ? 'Mark Check-out' : 'Mark Check-in'}
                </span>
              </button>

              <button
                onClick={stopCamera}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Stop Camera
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCamera;