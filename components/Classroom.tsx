import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Stars, Trail, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Student, AppState } from '../types';

interface ClassroomProps {
  students: Student[];
  appState: AppState;
  selectedStudentId: number | null;
}

interface StudentMeshProps {
  student: Student;
  isSelected: boolean;
  isDimmed: boolean;
  isSpinning: boolean;
}

const StudentMesh: React.FC<StudentMeshProps> = ({ 
  student, 
  isSelected, 
  isDimmed,
  isSpinning
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);
  
  // Random offset for float animation to make them look organic
  const floatSpeed = useMemo(() => 0.5 + Math.random(), []);
  const floatRotation = useMemo(() => 0.5 + Math.random(), []);
  const initialPos = useMemo(() => new THREE.Vector3(...student.position), [student.position]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isSelected) {
        // Move to center
        meshRef.current.position.lerp(new THREE.Vector3(0, 0, 2), delta * 4);
        meshRef.current.scale.lerp(new THREE.Vector3(2, 2, 2), delta * 4);
        // Rotate the selected student for effect
        meshRef.current.rotation.y += delta;
      } else if (isSpinning) {
        // While spinning, maintain sphere shape but maybe jitter or pulse?
        // Actually the group spins, so individual meshes can just look excited
        meshRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 10) * 0.2);
        // Reset position to formation if returning from selection
        meshRef.current.position.lerp(initialPos, delta * 5);
      } else {
        // Return to formation
        meshRef.current.position.lerp(initialPos, delta * 2);
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2);
        meshRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  return (
    <group>
      <Float
        speed={isSelected ? 0 : (isSpinning ? 10 : floatSpeed)} 
        rotationIntensity={isSelected ? 0 : floatRotation} 
        floatIntensity={isSelected ? 0 : 1}
      >
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial 
            color={isSelected ? "#FFD700" : (isDimmed ? "#444" : student.color)} 
            emissive={isSelected ? "#FFA500" : "#000"}
            emissiveIntensity={isSelected ? 2 : 0}
            roughness={0.2}
            metalness={0.8}
          />
          {isSelected && (
            <pointLight distance={5} intensity={5} color="#FFD700" />
          )}
        </mesh>
      </Float>
      
      {/* Name Label */}
      <group ref={textRef} position={isSelected ? [0, -1, 2] : student.position} visible={!isDimmed || isSelected}>
        <Html center distanceFactor={15} transform sprite className={`${isSelected ? 'z-50' : 'z-0'}`}>
          <div className={`
             px-2 py-1 rounded-md text-center font-bold select-none transition-all duration-300
             ${isSelected 
               ? 'bg-yellow-500 text-black text-4xl shadow-[0_0_30px_rgba(255,215,0,0.6)] border-4 border-white' 
               : 'bg-black/40 text-white text-sm border border-white/20 backdrop-blur-sm'}
          `}>
            {student.name}
          </div>
        </Html>
      </group>
    </group>
  );
};

export const Classroom: React.FC<ClassroomProps> = ({ students, appState, selectedStudentId }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (appState === AppState.SPINNING) {
        groupRef.current.rotation.y += delta * 5; // Fast spin
        groupRef.current.rotation.x += delta * 2;
      } else if (appState === AppState.SELECTING) {
        groupRef.current.rotation.y += delta * 0.5; // Slow down
      } else if (appState === AppState.SELECTED) {
         // Stop rotation or slowly drift
         groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta);
         groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta);
      } else {
         // Idle drift
         groupRef.current.rotation.y += delta * 0.1;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <group ref={groupRef}>
        {students.map((student) => (
          <StudentMesh 
            key={student.id} 
            student={student} 
            isSelected={appState === AppState.SELECTED && selectedStudentId === student.id}
            isSpinning={appState === AppState.SPINNING}
            isDimmed={appState === AppState.SELECTED && selectedStudentId !== student.id}
          />
        ))}
      </group>
    </>
  );
};