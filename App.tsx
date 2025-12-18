import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Classroom } from './components/Classroom';
import { HandTracker } from './components/HandTracker';
import { UIOverlay } from './components/UIOverlay';
import { AppState, GestureType, Student } from './types';
import { INITIAL_STUDENTS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.NONE);

  // Sound effects refs
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const selectAudio = useRef<HTMLAudioElement | null>(null);
  
  // Use a ref for audio context initialization if needed, but simple Audio is fine for this
  useEffect(() => {
    // Simple synthesized beeps could be used, or placeholder logic. 
    // For this demo, we'll just handle logic without external audio assets to ensure runnability.
  }, []);

  const handleGestureDetect = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);
  }, []);

  // State Machine Logic driven by gestures
  useEffect(() => {
    if (appState === AppState.IDLE) {
      if (currentGesture === GestureType.OPEN_PALM) {
        startSpinning();
      }
    } else if (appState === AppState.SPINNING) {
      if (currentGesture === GestureType.CLOSED_FIST || currentGesture === GestureType.VICTORY) {
        selectWinner();
      }
    }
  }, [currentGesture, appState]);

  const startSpinning = () => {
    setAppState(AppState.SPINNING);
    setSelectedStudentId(null);
  };

  const selectWinner = async () => {
    setAppState(AppState.SELECTING);
    
    // Simulate deceleration for drama
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      const winner = students[randomIndex];
      
      setSelectedStudentId(winner.id);
      setAppState(AppState.SELECTED);
    }, 1500);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setSelectedStudentId(null);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <Classroom 
            students={students} 
            appState={appState} 
            selectedStudentId={selectedStudentId} 
          />
          {/* Only allow manual orbit controls when idle to look around */}
          <OrbitControls 
            enableZoom={false} 
            autoRotate={appState === AppState.IDLE} 
            autoRotateSpeed={0.5}
            enabled={appState !== AppState.SPINNING} // Disable interaction during spin
          />
        </Canvas>
      </div>

      {/* Hand Tracking Input */}
      <HandTracker 
        onGestureDetect={handleGestureDetect} 
        isProcessing={true} 
      />

      {/* UI Layer */}
      <UIOverlay 
        appState={appState}
        currentGesture={currentGesture}
        selectedStudentName={students.find(s => s.id === selectedStudentId)?.name}
        onReset={handleReset}
        onManualTrigger={() => appState === AppState.IDLE ? startSpinning() : selectWinner()}
      />
    </div>
  );
};
export default App;