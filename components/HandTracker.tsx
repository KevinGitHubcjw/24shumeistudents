import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { GestureType } from '../types';

interface HandTrackerProps {
  onGestureDetect: (gesture: GestureType) => void;
  isProcessing: boolean;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onGestureDetect, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const lastGestureRef = useRef<GestureType>(GestureType.NONE);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
        
        try {
            handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
              },
              runningMode: "VIDEO",
              numHands: 1
            });
        } catch (gpuError) {
             console.warn("GPU delegate failed, falling back to CPU", gpuError);
             handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "CPU"
              },
              runningMode: "VIDEO",
              numHands: 1
            });
        }

        setLoading(false);
        startWebcam();
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
      }
    };

    setupMediaPipe();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const startWebcam = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    } catch (err) {
      console.error("Webcam error:", err);
      setPermissionError(true);
    }
  };

  const predictWebcam = async () => {
    if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if(!ctx) return;

    // Fix canvas size to match video
    if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    
    if (video.currentTime > 0) {
      const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.landmarks) {
        const drawingUtils = new DrawingUtils(ctx);
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2
          });
          drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
          
          detectGesture(landmarks);
        }
      }
      ctx.restore();
    }

    requestAnimationFrame(predictWebcam);
  };

  const detectGesture = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return;

    // Simple gesture logic based on fingertip vs base positions
    // Thumb: 4, Index: 8, Middle: 12, Ring: 16, Pinky: 20
    // Bases: 2, 5, 9, 13, 17
    
    const isFingerUp = (tipIdx: number, baseIdx: number) => {
      return landmarks[tipIdx].y < landmarks[baseIdx].y; // y is inverted in screen space (0 is top)
    };

    const indexUp = isFingerUp(8, 5);
    const middleUp = isFingerUp(12, 9);
    const ringUp = isFingerUp(16, 13);
    const pinkyUp = isFingerUp(20, 17);
    
    // Very basic heuristics
    let currentGesture = GestureType.NONE;

    if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
      currentGesture = GestureType.CLOSED_FIST;
    } else if (indexUp && middleUp && ringUp && pinkyUp) {
      currentGesture = GestureType.OPEN_PALM;
    } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
      currentGesture = GestureType.VICTORY;
    }

    // Debounce/Throttle output to parent
    if (currentGesture !== lastGestureRef.current) {
        lastGestureRef.current = currentGesture;
        onGestureDetect(currentGesture);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 w-48 h-36 bg-black/50 rounded-lg overflow-hidden border border-white/20 shadow-lg backdrop-blur-md">
       <video ref={videoRef} className="absolute w-full h-full object-cover opacity-60" autoPlay playsInline muted />
       <canvas ref={canvasRef} className="absolute w-full h-full object-cover" />
       
       {loading && (
         <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
           Loading Model...
         </div>
       )}
       {permissionError && (
         <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400 text-center p-2">
           Camera denied.
         </div>
       )}
       <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-center text-white/80 font-mono">
          STATUS: {lastGestureRef.current.toUpperCase()}
       </div>
    </div>
  );
};