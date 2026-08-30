'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Patient3DHealthBadge: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    const width = containerRef.current.clientWidth || 280;
    const height = containerRef.current.clientHeight || 140;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Ambient and Point Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd32f2f, 2, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // Central pulsing heart / shield mesh
    const torusGeometry = new THREE.TorusGeometry(0.8, 0.12, 16, 64);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0xb71c1c,
      emissiveIntensity: 0.2,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);

    // Orbiting data particles representing telemetry
    const particleCount = 24;
    const particleGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff5252 });
    const particleGroup = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.15;
      p.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 0.4);
      particleGroup.add(p);
    }
    scene.add(particleGroup);

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        torus.rotation.x = Math.sin(elapsedTime * 0.8) * 0.3;
        torus.rotation.y = elapsedTime * 0.5;
        particleGroup.rotation.z = -elapsedTime * 0.6;
        particleGroup.rotation.y = elapsedTime * 0.3;

        // Subtle pulsing scale
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.05;
        torus.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 280;
      const h = containerRef.current.clientHeight || 140;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-red-50/50 via-white to-red-50/50 border border-red-100">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-700/80 bg-white/80 px-3 py-0.5 rounded-full border border-red-200 backdrop-blur-xs">
          Live Encrypted Telehealth Core
        </span>
      </div>
    </div>
  );
};
