'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { StarsCanvas } from './Stars';
import Image from 'next/image';
import { useRef } from 'react';

export function HeroSection() {
  const logoText = "TRAVELOOP ✈".split("");
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-obsidian">
      <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
        <StarsCanvas />
        
        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/15 via-obsidian/80 to-obsidian z-[-1]" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-obsidian to-transparent z-10" />

        {/* Map outline background image */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.15] mix-blend-screen transition-opacity duration-1000" 
          style={{ WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}
        >
           <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=3274&auto=format&fit=crop" fill alt="Map" className="object-cover" priority />
        </div>
      </motion.div>

      <div className="z-20 flex flex-col items-center max-w-5xl px-6 text-center mt-20">
        <div className="overflow-hidden mb-6 flex space-x-[2px] mt-10">
          {logoText.map((char, index) => (
             <motion.span
               key={index}
               initial={{ opacity: 0, y: 50, rotateX: -90 }}
               animate={{ opacity: 1, y: 0, rotateX: 0 }}
               transition={{ duration: 1.2, delay: 0.1 * index, ease: [0.215, 0.61, 0.355, 1] }}
               className="text-gold tracking-[0.3em] text-[10px] md:text-xs font-semibold uppercase font-sans text-glow"
             >
               {char === " " ? "\u00A0" : char}
             </motion.span>
          ))}
        </div>

        <motion.h1 
           initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
           animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
           transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
           className="font-playfair text-6xl md:text-8xl lg:text-[10rem] leading-[0.82] font-light mb-8 pt-4 glow-teal tracking-tighter"
         >
           Plan Journeys <br/> <span className="italic text-gray-300">Beyond Maps</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-gray-400 font-sans max-w-xl text-lg md:text-xl font-light mb-12 tracking-wide"
        >
          An immersive travel operating system designed for crafting cinematic adventures and intelligent trip planning across the globe.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <button className="relative overflow-hidden glass rounded-full px-8 py-4 font-sans text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] group border-gold/30">
             <span className="relative z-10 font-medium group-hover:text-black transition-colors duration-300">Start Exploring</span>
             <div className="absolute inset-0 w-full h-full bg-gold transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out z-0" />
          </button>
          
          <button className="text-xs font-sans tracking-widest uppercase text-gray-300 hover:text-white transition-colors duration-300 border-b border-transparent hover:border-white pb-1">
             Watch Experience
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-medium">Drag to move / Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent" />
      </motion.div>
    </section>
  );
}
