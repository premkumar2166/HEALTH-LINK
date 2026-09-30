"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Torus, Line, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Fallback UI if WebGL is unavailable or crashes
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border border-dashed rounded-lg p-8">
          <div className="text-4xl mb-4">🕸️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">HEALTHLINK Network</h3>
          <p className="text-gray-500 text-center max-w-sm">3D Visualization is currently unavailable. Your browser may not support WebGL, but all standard portal features remain fully operational.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Check for reduced motion
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setTimeout(() => setReduced(mediaQuery.matches), 0);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return reduced;
}

const Node = ({ position, label, color }: { position: [number, number, number], label: string, color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();
  
  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </Sphere>
      <Html position={[0, -0.8, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded shadow-sm border border-gray-100 whitespace-nowrap text-gray-800">
          {label}
        </div>
      </Html>
    </group>
  );
};

const NetworkScene = () => {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Responsive scale based on viewport width
  const scale = Math.min(1, viewport.width / 10);

  // Nodes setup
  const nodes = [
    { label: 'PATIENT', pos: [-3, 1, 0] as [number, number, number], color: '#3b82f6' }, // Blue
    { label: 'DOCTOR', pos: [3, 1, 0] as [number, number, number], color: '#10b981' },  // Emerald
    { label: 'HOSPITAL', pos: [0, -3, 0] as [number, number, number], color: '#f59e0b' },// Amber
  ];

  useFrame((state) => {
    if (reducedMotion) return;
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = time * 0.2;
      ringRef.current.rotation.y = time * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = -time * 0.15;
      ringRef2.current.rotation.y = -time * 0.25;
    }
  });

  // Cross shape (Healthcare inspired)
  const crossMaterial = new THREE.MeshBasicMaterial({ color: '#ef4444' }); // Red
  
  return (
    <group scale={scale}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />
      
      <group ref={groupRef}>
        {/* Central Transparent Glass Sphere */}
        <Sphere args={[1.5, 64, 64]}>
          <meshPhysicalMaterial 
            color="#ffffff" 
            transmission={0.9} 
            opacity={1} 
            metalness={0.1} 
            roughness={0.1} 
            ior={1.5} 
            thickness={0.5} 
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>

        {/* Central Red Healthcare Cross inside sphere */}
        <group scale={0.5}>
          <mesh material={crossMaterial}>
            <boxGeometry args={[1, 0.3, 0.3]} />
          </mesh>
          <mesh material={crossMaterial}>
            <boxGeometry args={[0.3, 1, 0.3]} />
          </mesh>
        </group>

        {/* Orbit Rings */}
        <Torus ref={ringRef} args={[2.5, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#e5e7eb" transparent opacity={0.3} />
        </Torus>
        <Torus ref={ringRef2} args={[3.5, 0.01, 16, 100]} rotation={[Math.PI / 4, 0, 0]}>
          <meshBasicMaterial color="#d1d5db" transparent opacity={0.2} />
        </Torus>

        {/* Outer Nodes */}
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <Node position={node.pos} label={node.label} color={node.color} />
            {/* Connecting Data Paths */}
            <Line 
              points={[[0,0,0], node.pos]} 
              color={node.color} 
              lineWidth={1.5}
              transparent
              opacity={0.4}
            />
          </React.Fragment>
        ))}
      </group>

      {/* Subtle Particles */}
      {!reducedMotion && (
        <Stars radius={10} depth={20} count={300} factor={4} saturation={0} fade speed={1} />
      )}
    </group>
  );
};

export function Network3D() {
  return (
    <div className="w-full h-full min-h-[400px] relative bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200" role="img" aria-label="Interactive 3D network visualization showing connections between Patient, Doctor, and Hospital">
      <div className="sr-only">A 3D visualization showing three nodes: Patient (Blue), Doctor (Emerald), and Hospital (Amber) connected by data paths around a central glowing sphere.</div>
      <ErrorBoundary>
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 2]} // Optimize for mobile retina
        >
          <NetworkScene />
        </Canvas>
      </ErrorBoundary>
      {/* Fallback CSS Glow/Overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-xl shadow-inner z-10 bg-gradient-to-tr from-transparent via-transparent to-red-500/5 mix-blend-overlay"></div>
    </div>
  );
}
