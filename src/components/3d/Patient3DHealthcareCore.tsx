'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Eye, ShieldCheck, Activity, Heart, Stethoscope, User } from 'lucide-react';

interface Patient3DHealthcareCoreProps {
  height?: number | string;
  showControls?: boolean;
}

export const Patient3DHealthcareCore: React.FC<Patient3DHealthcareCoreProps> = ({
  height = 360,
  showControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check user's OS reduced-motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setIsReducedMotion(true);
        setIsPaused(true);
      }

      const handleChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
        if (e.matches) setIsPaused(true);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const canvasHeight = typeof height === 'number' ? height : container.clientHeight || 360;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFFFFF');

    const camera = new THREE.PerspectiveCamera(48, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLightRed = new THREE.PointLight(0xd32f2f, 3.2, 50);
    pointLightRed.position.set(0, 3, 5);
    scene.add(pointLightRed);

    const deepRedLight = new THREE.PointLight(0xb71c1c, 1.8, 40);
    deepRedLight.position.set(-3, -2, 4);
    scene.add(deepRedLight);

    // 4. Central Node: Secure Health Cloud Core (Icosahedron + Wireframe cage)
    const coreGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    const centralCore = new THREE.Mesh(coreGeo, coreMat);
    scene.add(centralCore);

    // Wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(1.58, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xd32f2f,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireCage = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireCage);

    // Inner Glowing Pulsing Heart
    const innerHeartGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const innerHeartMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      emissive: 0xb71c1c,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const innerHeart = new THREE.Mesh(innerHeartGeo, innerHeartMat);
    scene.add(innerHeart);

    // 5. Patient Node (Left) & Doctor Node (Right)
    const nodeGeo = new THREE.SphereGeometry(0.48, 32, 32);

    // Patient Node (Primary Red)
    const patientMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      emissive: 0x8b0000,
      emissiveIntensity: 0.5,
      roughness: 0.25,
    });
    const patientNode = new THREE.Mesh(nodeGeo, patientMat);
    patientNode.position.set(-3.6, 0, 0);
    scene.add(patientNode);

    // Doctor Node (Deep Red)
    const doctorMat = new THREE.MeshStandardMaterial({
      color: 0xb71c1c,
      emissive: 0x5a0000,
      emissiveIntensity: 0.5,
      roughness: 0.25,
    });
    const doctorNode = new THREE.Mesh(nodeGeo, doctorMat);
    doctorNode.position.set(3.6, 0, 0);
    scene.add(doctorNode);

    // 6. Connected Bezier Curves (Data Stream Channels)
    const curve1 = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-3.6, 0, 0),
      new THREE.Vector3(-1.8, 1.4, 0.8),
      new THREE.Vector3(0, 0, 0)
    );
    const curve2 = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.8, -1.4, -0.8),
      new THREE.Vector3(3.6, 0, 0)
    );

    const points1 = curve1.getPoints(40);
    const points2 = curve2.getPoints(40);

    const lineMat1 = new THREE.LineBasicMaterial({ color: 0xd32f2f, transparent: true, opacity: 0.45, linewidth: 2 });
    const lineMat2 = new THREE.LineBasicMaterial({ color: 0xb71c1c, transparent: true, opacity: 0.45, linewidth: 2 });

    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points1), lineMat1);
    const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points2), lineMat2);
    scene.add(line1);
    scene.add(line2);

    // 7. Flowing Red Data Particles
    const particleCount = 36;
    const particleGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f });

    const particles: { mesh: THREE.Mesh; progress: number; speed: number; curve: THREE.QuadraticBezierCurve3 }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const pMesh = new THREE.Mesh(particleGeo, particleMat);
      const isFirstHalf = i < particleCount / 2;
      const targetCurve = isFirstHalf ? curve1 : curve2;
      const progress = Math.random();
      const pos = targetCurve.getPoint(progress);
      pMesh.position.copy(pos);
      scene.add(pMesh);

      particles.push({
        mesh: pMesh,
        progress,
        speed: 0.0035 + Math.random() * 0.004,
        curve: targetCurve,
      });
    }

    // 8. Subtle Orbiting Ring
    const ringGeo = new THREE.RingGeometry(2.1, 2.15, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd32f2f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.6;
    scene.add(ring);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isPaused && !isReducedMotion) {
        const elapsedTime = clock.getElapsedTime();

        // Rotate central core
        centralCore.rotation.y = elapsedTime * 0.2;
        centralCore.rotation.x = elapsedTime * 0.12;
        wireCage.rotation.y = -elapsedTime * 0.15;
        wireCage.rotation.z = elapsedTime * 0.08;

        // Inner heart pulse
        const pulse = 1 + Math.sin(elapsedTime * 3) * 0.08;
        innerHeart.scale.set(pulse, pulse, pulse);

        // Gentle floating node motion
        patientNode.position.y = Math.sin(elapsedTime * 1.4) * 0.12;
        doctorNode.position.y = Math.cos(elapsedTime * 1.4) * 0.12;

        // Animate flowing data particles
        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;
          const pt = p.curve.getPoint(p.progress);
          p.mesh.position.copy(pt);
        });

        // Pulsate ring
        ring.rotation.z = elapsedTime * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = typeof height === 'number' ? height : container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerHeartGeo.dispose();
      innerHeartMat.dispose();
      nodeGeo.dispose();
      patientMat.dispose();
      doctorMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [isPaused, isReducedMotion, height]);

  return (
    <div className="relative w-full rounded-2xl bg-white border border-red-100 shadow-sm overflow-hidden flex flex-col justify-between" style={{ height }}>
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Badge */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg border border-red-100 shadow-xs flex items-center gap-1.5">
          <Activity size={13} className="text-[#D32F2F] animate-pulse" />
          <span className="text-[11px] font-extrabold text-gray-800 tracking-wide">
            LIVE HEALTH DATA STREAM
          </span>
        </div>
      </div>

      {/* Node Annotations */}
      <div className="absolute bottom-11 left-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-md border border-red-200 text-[10px] font-bold text-red-700 shadow-xs flex items-center gap-1">
          <User size={11} className="text-[#D32F2F]" />
          <span>Patient</span>
        </div>
      </div>

      <div className="absolute bottom-11 right-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-md border border-gray-200 text-[10px] font-bold text-gray-800 shadow-xs flex items-center gap-1">
          <Stethoscope size={11} className="text-[#B71C1C]" />
          <span>Doctor</span>
        </div>
      </div>

      {/* Top Right Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 bg-white/90 hover:bg-white text-gray-700 hover:text-[#D32F2F] rounded-lg border border-gray-200 shadow-xs transition-all text-xs"
            title={isPaused ? 'Resume 3D animation' : 'Pause 3D animation'}
            aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
          >
            {isPaused ? <Play size={12} className="text-[#D32F2F]" /> : <Pause size={12} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsReducedMotion(!isReducedMotion);
              setIsPaused(!isReducedMotion);
            }}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all shadow-xs flex items-center gap-1 ${
              isReducedMotion
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white/90 hover:bg-white text-gray-600 border-gray-200'
            }`}
            title="Toggle Reduced Motion Accessibility Mode"
            aria-label="Toggle reduced motion"
          >
            <Eye size={11} />
            <span>{isReducedMotion ? 'Motion Off' : '3D Active'}</span>
          </button>
        </div>
      )}

      {/* Bottom Info Strip */}
      <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-100 px-3 py-1.5 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] animate-ping" />
          <span>Encrypted Synchronized Bridge</span>
        </span>
        <span className="flex items-center gap-1 font-semibold text-emerald-700">
          <ShieldCheck size={12} /> HIPAA Standard
        </span>
      </div>
    </div>
  );
};
