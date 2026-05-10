'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export function StorySection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative w-full py-32 md:py-48 bg-obsidian text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-0 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent rotate-45 transform origin-left" />
         <div className="absolute bottom-1/4 right-0 w-[500px] h-[1px] bg-gradient-to-l from-transparent via-teal-500/50 to-transparent -rotate-45 transform origin-right" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        {/* Left text content */}
        <motion.div style={{ opacity, y: y2 }} className="flex flex-col justify-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-6">The Journey</p>
          <h2 className="font-playfair text-4xl md:text-6xl font-light leading-snug mb-8">
            Curate Every Moment with <span className="italic text-gray-400">Absolute Precision.</span>
          </h2>
          <p className="font-sans text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-md">
            Design your itinerary unconstrained by typical map boundaries. Layer experiences, manage premium bookings, and weave cinematic travels exactly how you envision them.
          </p>
        </motion.div>

        {/* Right imagery / layered cards */}
        <motion.div style={{ y: y1 }} className="relative h-[600px] w-full mt-12 md:mt-0">
           {/* Card 1 */}
           <motion.div 
             className="absolute top-0 right-0 w-3/4 h-[400px] glass-card rounded-2xl overflow-hidden z-10"
             whileHover={{ y: -10, rotate: -2 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
           >
             <Image src="https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000&auto=format&fit=crop" alt="Luxury Travel" fill className="object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div>
                  <p className="text-gold font-sans text-xs tracking-widest uppercase mb-2">Santorini Route</p>
                  <p className="font-playfair text-2xl">Azure Horizons</p>
                </div>
             </div>
           </motion.div>

           {/* Card 2 */}
           <motion.div 
             className="absolute bottom-0 left-0 w-2/3 h-[300px] glass-card rounded-2xl overflow-hidden z-20 shadow-2xl"
             whileHover={{ y: -10, rotate: 2 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
           >
             <Image src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2000&auto=format&fit=crop" alt="Paris" fill className="object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-6">
                <div>
                  <p className="text-teal-400 font-sans text-xs tracking-widest uppercase mb-2">City Escapes</p>
                  <p className="font-playfair text-xl">The Midnight Walk</p>
                </div>
             </div>
           </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
