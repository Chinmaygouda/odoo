'use client';
import { motion } from 'framer-motion';

const stats = [
  { value: "142", label: "Countries Mapped" },
  { value: "8.5k", label: "Curated Experiences" },
  { value: "$2M+", label: "Journeys Managed" }
];

export function PremiumSection() {
  return (
    <section className="relative w-full py-40 overflow-hidden bg-obsidian text-center flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-10"
          src="https://cdn.pixabay.com/video/2021/08/04/83817-584738592_large.mp4" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-transparent to-obsidian" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <p className="font-sans text-[10px] text-gold uppercase tracking-[0.4em] mb-8">The Standard</p>
        <h2 className="font-playfair text-5xl md:text-7xl font-light leading-tight mb-16 glow-teal">
          Travel is an Art. <br/> <span className="italic text-gray-400">We Provide the Canvas.</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/10 pt-16">
          {stats.map((stat, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-10%" }}
               transition={{ duration: 0.8, delay: i * 0.2 }}
               className="flex flex-col items-center"
            >
               <span className="font-playfair text-5xl md:text-6xl text-white mb-4 block text-glow">{stat.value}</span>
               <span className="font-sans text-xs tracking-widest text-gray-500 uppercase">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
