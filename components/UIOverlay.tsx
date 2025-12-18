import React from 'react';
import { AppState, GestureType } from '../types';

interface UIOverlayProps {
  appState: AppState;
  currentGesture: GestureType;
  selectedStudentName?: string;
  onReset: () => void;
  onManualTrigger: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  appState, 
  currentGesture, 
  selectedStudentName, 
  onReset,
  onManualTrigger
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-black/60 backdrop-blur-md p-6 rounded-xl border-l-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            24数媒2<span className="text-white">点名系统</span>.AI
          </h1>
          <p className="text-cyan-200/60 mt-2 font-mono text-sm">
            SYSTEM STATUS: <span className={appState === AppState.IDLE ? "text-green-400" : "text-yellow-400"}>{appState}</span>
          </p>
        </div>

        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-right">
           <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Gesture Control</h3>
           <div className="flex flex-col gap-2">
             <div className={`flex items-center justify-end gap-2 ${currentGesture === GestureType.OPEN_PALM ? 'text-green-400' : 'text-gray-500'}`}>
                <span>OPEN PALM</span>
                <div className={`w-2 h-2 rounded-full ${currentGesture === GestureType.OPEN_PALM ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-gray-700'}`} />
             </div>
             <div className={`flex items-center justify-end gap-2 ${currentGesture === GestureType.CLOSED_FIST ? 'text-red-400' : 'text-gray-500'}`}>
                <span>CLOSED FIST</span>
                <div className={`w-2 h-2 rounded-full ${currentGesture === GestureType.CLOSED_FIST ? 'bg-red-400 shadow-[0_0_10px_#f87171]' : 'bg-gray-700'}`} />
             </div>
           </div>
        </div>
      </div>

      {/* Center Action / Content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl text-center pointer-events-auto">
        {appState === AppState.IDLE && (
          <div className="animate-pulse">
            <h2 className="text-2xl text-white/80 font-light mb-4">Ready to select a student</h2>
            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg inline-block border border-white/10">
              <p className="text-cyan-300 text-lg">Raise <span className="font-bold">OPEN PALM</span> to Spin</p>
              <p className="text-xs text-gray-400 mt-2">or click below</p>
            </div>
            <br />
            <button 
                onClick={onManualTrigger}
                className="mt-6 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(8,145,178,0.5)]"
            >
                MANUAL SPIN
            </button>
          </div>
        )}

        {appState === AppState.SPINNING && (
          <div>
             <h2 className="text-6xl font-black text-white italic tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
               SPINNING...
             </h2>
             <p className="mt-4 text-xl text-red-300 bg-black/50 inline-block px-4 py-2 rounded">
               Make a <span className="font-bold">FIST</span> to STOP!
             </p>
          </div>
        )}

        {appState === AppState.SELECTED && selectedStudentName && (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center mt-32">
             <div className="bg-black/40 backdrop-blur-md p-10 rounded-3xl border-2 border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.3)] transform hover:scale-105 transition-transform duration-300">
                <p className="text-xl text-yellow-200 font-mono mb-4 uppercase tracking-widest">Selected Student</p>
                <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  {selectedStudentName}
                </h1>
             </div>

            <button 
              onClick={onReset}
              className="mt-12 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white font-bold tracking-wider transition-all hover:scale-105"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-white/20 text-xs font-mono">
        POWERED BY REACT THREE FIBER
      </div>
    </div>
  );
};
