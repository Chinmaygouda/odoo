'use client';
// @ts-nocheck
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Float } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

function FuturisticGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[2.8, 64, 64]}>
          <meshStandardMaterial
            ref={materialRef}
            color="#020202"
            emissive="#004040"
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
        
        {/* Orbiting particles/rings placeholder */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.22, 64]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, Math.PI/4, 0]}>
          <ringGeometry args={[3.5, 3.52, 64]} />
          <meshBasicMaterial color="#008080" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      </Float>
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#008080" />
    </group>
  );
}

export function GlobeSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative w-full h-[120vh] bg-obsidian flex items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-obsidian to-obsidian" />
      
      <motion.div style={{ scale, opacity }} className="absolute inset-0 z-0">
         <Canvas camera={{ position: [0, 0, 8] }}>
            <FuturisticGlobe />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
         </Canvas>
      </motion.div>

      <div className="absolute z-10 w-full max-w-7xl mx-auto px-6 pointer-events-none flex flex-col justify-between h-full py-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="max-w-md pointer-events-auto"
        >
          <p className="text-gold font-sans text-xs tracking-[0.3em] uppercase mb-4">Global Intelligence</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-light leading-snug mb-6 glow-teal">
            Navigate the World <br/> in 3D Space.
          </h2>
          <p className="text-gray-400 font-sans font-light leading-relaxed">
            Interact with our proprietary spatial mapping engine. Visualize distances, routes, and connections previously hidden on flat maps.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          className="self-end max-w-xs text-right pointer-events-auto"
        >
          <div className="glass-card p-6 rounded-2xl inline-block text-left relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
            <p className="text-white font-sans text-sm tracking-widest font-medium mb-1 relative z-10">Live Tracking</p>
            <p className="text-gray-400 font-sans text-xs font-light relative z-10">42 Luxury Expeditions Active</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
