'use client';
import { motion } from 'framer-motion';
import { StarsCanvas } from './Stars';

export function FinalCTASection() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-obsidian">
      <StarsCanvas />
      
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-obsidian z-0" />
      
      <div className="relative z-10 text-center max-w-4xl px-6">
        <motion.p 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
           className="font-sans text-[10px] text-gold uppercase tracking-[0.4em] mb-6"
        >
           The Next Horizon
        </motion.p>
        
        <motion.h2 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1.5, delay: 0.2 }}
           className="font-playfair text-6xl md:text-8xl font-light leading-tight mb-12 glow-teal"
        >
           Your Journey <br/> <span className="italic text-gray-400">Begins Here</span>
        </motion.h2>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <button className="relative overflow-hidden border border-gold/40 rounded-full px-12 py-5 font-sans text-xs tracking-[0.2em] uppercase transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] group inline-flex items-center justify-center">
             <span className="relative z-10 text-gold group-hover:text-black font-semibold transition-colors duration-300">Request Access</span>
             <div className="absolute inset-0 w-full h-full bg-gold transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out z-0" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-charcoal text-white py-12 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-500">
          © 2026 TRAVELOOP INC.
        </div>
        <div className="flex gap-8 font-sans text-xs tracking-widest text-gray-400">
           <a href="#" className="hover:text-gold transition-colors duration-300">Twitter</a>
           <a href="#" className="hover:text-gold transition-colors duration-300">Instagram</a>
           <a href="#" className="hover:text-gold transition-colors duration-300">Awwards</a>
        </div>
      </div>
    </footer>
  );
}
