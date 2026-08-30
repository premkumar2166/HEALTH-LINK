'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, Eye, EyeOff, Activity } from 'lucide-react';

export const Doctor3DClinicalVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setIsPaused(true);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 220;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current.replaceChildren(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for Doctor 3D Visualizer', e);
      return;
    }

    // Group to hold all 3D medical entities
    const group = new THREE.Group();
    scene.add(group);

    // Node 1: DOCTOR NODE (Red glowing octahedron)
    const docGeo = new THREE.OctahedronGeometry(1.8, 0);
    const docMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      roughness: 0.2,
      metalness: 0.6,
      wireframe: true,
    });
    const docMesh = new THREE.Mesh(docGeo, docMat);
    docMesh.position.x = -6.5;
    group.add(docMesh);

    // Node 2: HEALTHLINK CORE / SECURE VAULT (Icosahedron in center)
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xb71c1c,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.x = 0;
    group.add(coreMesh);

    // Core Outer Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xffcdd2,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    group.add(cageMesh);

    // Node 3: PATIENT PANEL NODE (Teal/Emerald Sphere)
    const patGeo = new THREE.DodecahedronGeometry(1.6, 0);
    const patMat = new THREE.MeshStandardMaterial({
      color: 0x00897b,
      roughness: 0.3,
      metalness: 0.5,
      wireframe: true,
    });
    const patMesh = new THREE.Mesh(patGeo, patMat);
    patMesh.position.x = 6.5;
    group.add(patMesh);

    // Connection Lines (Doctor <-> Core <-> Patient)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xd32f2f,
      transparent: true,
      opacity: 0.4,
    });

    const points1 = [new THREE.Vector3(-6.5, 0, 0), new THREE.Vector3(0, 0, 0)];
    const lineGeo1 = new THREE.BufferGeometry().setFromPoints(points1);
    const line1 = new THREE.Line(lineGeo1, lineMat);
    group.add(line1);

    const points2 = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(6.5, 0, 0)];
    const lineGeo2 = new THREE.BufferGeometry().setFromPoints(points2);
    const line2 = new THREE.Line(lineGeo2, lineMat);
    group.add(line2);

    // Data-Flow Particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * 13 - 6.5;
      particlePositions[i * 3] = t;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff5252,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.5, 50);
    pointLight.position.set(5, 8, 10);
    scene.add(pointLight);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isPaused) {
        const delta = clock.getDelta();
        docMesh.rotation.y += 0.015;
        docMesh.rotation.x += 0.008;

        coreMesh.rotation.y -= 0.01;
        coreMesh.rotation.z += 0.005;
        cageMesh.rotation.y += 0.006;

        patMesh.rotation.y += 0.012;
        patMesh.rotation.x -= 0.009;

        // Animate particles along the axis
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += 0.04;
          if (positions[i * 3] > 6.5) {
            positions[i * 3] = -6.5;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [isPaused, prefersReducedMotion]);

  return (
    <div className="relative w-full bg-white border border-gray-200 rounded-3xl p-5 shadow-sm overflow-hidden">
      {/* 3D Visualizer Header */}
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center font-bold">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Live Clinical Tele-Connection Core
            </h3>
            <span className="text-[10px] text-gray-500">
              Doctor ↔ Secure HEALTH DATA Vault ↔ Patient Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={11} /> 256-Bit E2EE
          </span>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-md text-[10px] font-medium"
            title={isPaused ? 'Resume Animation' : 'Pause Animation'}
          >
            {isPaused ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div
        ref={containerRef}
        className="w-full h-44 sm:h-52 flex items-center justify-center"
      />

      {/* Node Labels Overlay */}
      <div className="grid grid-cols-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 pt-1 border-t border-gray-100">
        <div className="text-[#D32F2F]">Doctor Node</div>
        <div className="text-gray-900">HEALTHLINK Core</div>
        <div className="text-emerald-700">Patient Vitals</div>
      </div>
    </div>
  );
};
