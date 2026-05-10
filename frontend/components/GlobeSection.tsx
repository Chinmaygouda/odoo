'use client';
// @ts-nocheck
import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Float } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

function ActiveFlights() {
  const flightPaths = useMemo(() => {
    const paths = [];
    for (let i = 0; i < 25; i++) {
      // Generate random points on the sphere
      const vOrigin = new THREE.Vector3().randomDirection().multiplyScalar(2.8);
      const vDest = new THREE.Vector3().randomDirection().multiplyScalar(2.8);
      // Create a curve that arcs above the surface
      const midPoint = vOrigin.clone().lerp(vDest, 0.5).normalize().multiplyScalar(3.6);
      const curve = new THREE.QuadraticBezierCurve3(vOrigin, midPoint, vDest);
      paths.push(curve.getPoints(30));
    }
    return paths;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.1; // Rotate opposite to globe
    }
  });

  return (
    <group ref={groupRef}>
      {flightPaths.map((points, i) => (
        <mesh key={i}>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 20, 0.012, 8, false]} />
          <meshBasicMaterial color="#2dd4bf" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Glowing dots at destinations */}
      {flightPaths.map((points, i) => (
        <mesh key={`dot-${i}`} position={points[points.length - 1]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
      ))}
    </group>
  );
}

function FuturisticGlobe({ isTracking }: { isTracking: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state: any, delta: number) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (isTracking ? 0.2 : 0.05);
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (materialRef.current && isTracking) {
      // Pulse emissive color when tracking
      materialRef.current.emissiveIntensity = 0.2 + Math.abs(Math.sin(state.clock.elapsedTime * 2)) * 0.5;
    } else if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[2.8, 64, 64]}>
          <meshStandardMaterial
            ref={materialRef}
            color="#020202"
            emissive={isTracking ? "#2dd4bf" : "#004040"}
            emissiveIntensity={0.2}
            wireframe
            transparent
            opacity={0.3}
          />
        </Sphere>
        {/* Inner solid sphere */}
        <Sphere args={[2.7, 64, 64]}>
          <meshBasicMaterial color="#000000" />
        </Sphere>
        
        {isTracking && <ActiveFlights />}
        
        {/* Orbiting rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.22, 64]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={isTracking ? 0.6 : 0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, Math.PI/4, 0]}>
          <ringGeometry args={[3.5, 3.52, 64]} />
          <meshBasicMaterial color="#008080" transparent opacity={isTracking ? 0.5 : 0.2} side={THREE.DoubleSide} />
        </mesh>
      </Float>
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={isTracking ? 2 : 1} color="#D4AF37" />
      <pointLight position={[-10, -10, -10]} intensity={isTracking ? 3 : 2} color="#008080" />
    </group>
  );
}

export function GlobeSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative w-full h-[120vh] bg-obsidian flex flex-col items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isTracking ? 'from-teal-900/30' : 'from-teal-900/10'} via-obsidian to-obsidian transition-colors duration-1000`} />
      
      <motion.div style={{ scale, opacity }} className="absolute inset-0 z-0">
         <Canvas camera={{ position: [0, 0, 8] }}>
            <FuturisticGlobe isTracking={isTracking} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isTracking} autoRotateSpeed={0.5} />
         </Canvas>
      </motion.div>

      {/* Centered Content over Globe */}
      <div className="absolute z-10 w-full max-w-4xl mx-auto px-6 pointer-events-none flex flex-col items-center justify-between h-full py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="pointer-events-auto"
        >
          <p className="text-gold font-sans text-xs tracking-[0.3em] uppercase mb-4 mt-8">Global Intelligence</p>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light leading-snug mb-6 glow-teal">
            Navigate the World <br/> in 3D Space.
          </h2>
          <p className="text-gray-400 font-sans font-light leading-relaxed max-w-xl mx-auto">
            Interact with our proprietary spatial mapping engine. Visualize distances, routes, and connections previously hidden on flat maps.
          </p>
        </motion.div>

        {/* Live Tracking Button - Centered at bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          className="pointer-events-auto mb-16"
        >
          <button 
            onClick={() => setIsTracking(!isTracking)}
            className={`glass-card px-8 py-5 rounded-2xl inline-block text-center relative overflow-hidden group transition-all duration-500 hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] ${isTracking ? 'bg-teal-900/40 border-teal-500/50 shadow-[0_0_40px_rgba(45,212,191,0.5)]' : ''}`}
          >
            <div className={`absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out ${isTracking ? 'bg-teal-500/20 translate-x-0' : 'bg-gold/10'}`} />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-red-500 animate-pulse' : 'bg-teal-400'}`} />
                <p className={`font-sans text-sm tracking-widest font-bold uppercase ${isTracking ? 'text-teal-300' : 'text-white'}`}>
                  {isTracking ? 'Live Tracking Active' : 'Initiate Live Tracking'}
                </p>
              </div>
              <p className="text-gray-300 font-sans text-xs font-light">
                {isTracking ? 'Monitoring Global Expeditions...' : '42 Luxury Expeditions Currently Active'}
              </p>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
