'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RefreshCw, Eye, ShieldCheck, Activity } from 'lucide-react';

export const HealthConnectionCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check user's OS reduced-motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      setIsPaused(true);
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFFFFF');

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported or unavailable, visualizer in fallback mode', e);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd32f2f, 2.5, 50);
    pointLight.position.set(0, 4, 6);
    scene.add(pointLight);

    const softRedLight = new THREE.PointLight(0xb71c1c, 1.5, 30);
    softRedLight.position.set(-4, -2, 4);
    scene.add(softRedLight);

    // 4. Central Node: Secure Health Cloud Core (Icosahedron + Wireframe)
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const centralCore = new THREE.Mesh(coreGeo, coreMat);
    scene.add(centralCore);

    // Wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(1.75, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xd32f2f,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireCage = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireCage);

    // 5. Patient Node (Left) & Doctor Node (Right)
    const nodeGeo = new THREE.SphereGeometry(0.55, 32, 32);
    
    // Patient Node
    const patientMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      emissive: 0x8b0000,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const patientNode = new THREE.Mesh(nodeGeo, patientMat);
    patientNode.position.set(-4.2, 0, 0);
    scene.add(patientNode);

    // Doctor Node
    const doctorMat = new THREE.MeshStandardMaterial({
      color: 0x9a1b1b,
      emissive: 0x600000,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const doctorNode = new THREE.Mesh(nodeGeo, doctorMat);
    doctorNode.position.set(4.2, 0, 0);
    scene.add(doctorNode);

    // 6. Connecting Bezier Curves (Data Stream Channels)
    const curve1 = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-4.2, 0, 0),
      new THREE.Vector3(-2, 1.8, 1),
      new THREE.Vector3(0, 0, 0)
    );
    const curve2 = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, -1.8, -1),
      new THREE.Vector3(4.2, 0, 0)
    );

    const points1 = curve1.getPoints(50);
    const points2 = curve2.getPoints(50);

    const lineMat1 = new THREE.LineBasicMaterial({ color: 0xd32f2f, transparent: true, opacity: 0.4, linewidth: 2 });
    const lineMat2 = new THREE.LineBasicMaterial({ color: 0x9a1b1b, transparent: true, opacity: 0.4, linewidth: 2 });

    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points1), lineMat1);
    const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points2), lineMat2);
    scene.add(line1);
    scene.add(line2);

    // 7. Data Particles Flowing Along Curves
    const particleCount = 40;
    const particleGeo = new THREE.SphereGeometry(0.08, 16, 16);
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
        speed: 0.003 + Math.random() * 0.004,
        curve: targetCurve,
      });
    }

    // 8. Subtle Orbiting Ring
    const ringGeo = new THREE.RingGeometry(2.5, 2.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd32f2f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.8;
    scene.add(ring);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isPaused && !isReducedMotion) {
        const elapsedTime = clock.getElapsedTime();

        // Rotate central core
        centralCore.rotation.y = elapsedTime * 0.25;
        centralCore.rotation.x = elapsedTime * 0.15;
        wireCage.rotation.y = -elapsedTime * 0.15;
        wireCage.rotation.z = elapsedTime * 0.1;

        // Gentle floating node motion
        patientNode.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
        doctorNode.position.y = Math.cos(elapsedTime * 1.5) * 0.15;

        // Animate particles
        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;
          const pt = p.curve.getPoint(p.progress);
          p.mesh.position.copy(pt);
        });

        // Pulsate ring
        ring.rotation.z = elapsedTime * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;
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
    };
  }, [isPaused, isReducedMotion]);

  return (
    <div className="relative w-full h-[420px] rounded-2xl bg-white border border-red-100 shadow-health-md overflow-hidden flex flex-col justify-between">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Overlaid UI Annotations */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-red-100 shadow-sm flex items-center gap-2">
          <Activity size={16} className="text-red-600 animate-pulse" />
          <span className="text-xs font-bold text-gray-800 tracking-wide">
            3D HEALTH CONNECTION CORE
          </span>
        </div>
      </div>

      {/* Floating Node Labels */}
      <div className="absolute bottom-16 left-6 pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-md border border-red-200 text-[11px] font-bold text-red-700 shadow-sm">
          ● Patient Tele-Vitals Node
        </div>
      </div>

      <div className="absolute bottom-16 right-6 pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-md border border-slate-300 text-[11px] font-bold text-slate-800 shadow-sm">
          ● Doctor Clinical Workstation
        </div>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur px-3 py-1 rounded-lg border border-red-100 text-[11px] font-semibold text-emerald-700 flex items-center gap-1 shadow-sm">
          <ShieldCheck size={14} /> E2E Encrypted Data Stream
        </div>

        {/* Accessibility & Pause Controls */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg border border-gray-200 shadow-sm transition-all text-xs font-semibold flex items-center gap-1"
          title={isPaused ? 'Resume 3D animation' : 'Pause 3D animation'}
        >
          {isPaused ? <Play size={14} className="text-red-600" /> : <Pause size={14} />}
        </button>

        <button
          onClick={() => {
            setIsReducedMotion(!isReducedMotion);
            setIsPaused(!isReducedMotion);
          }}
          className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 ${
            isReducedMotion
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-white/90 hover:bg-white text-gray-600 border-gray-200'
          }`}
          title="Toggle Reduced Motion Accessibility Mode"
        >
          <Eye size={13} />
          <span>{isReducedMotion ? 'Motion Reduced' : 'Standard 3D'}</span>
        </button>
      </div>

      {/* Footer Info Strip */}
      <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>Synchronized Patient-to-Doctor Data Stream Active</span>
        </span>
        <span className="text-[11px] font-mono text-gray-400">Three.js WebGL Engine</span>
      </div>
    </div>
  );
};
