'use client';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  { text: "Traveloop completely reimagined how our family handles complex European itineraries. The cinematic timeline makes planning feel like directing a film.", author: "Elena R.", role: "Creative Director" },
  { text: "Unlike any other platform. It doesn't just manage bookings; it curates the emotional arc of our travels. Pure luxury in digital form.", author: "Marcus T.", role: "Global Exectuive" }
];

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-obsidian text-white relative">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
         {testimonials.map((test, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-10%" }}
               transition={{ duration: 1, delay: i * 0.3 }}
               className="glass p-12 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-colors duration-500"
            >
               <Quote className="text-white/10 w-16 h-16 mb-8 transform -translate-x-4 -translate-y-4 group-hover:text-gold/20 transition-colors duration-500" />
               <p className="font-playfair text-2xl leading-relaxed font-light mb-12 relative z-10 text-gray-200">
                 &quot;{test.text}&quot;
               </p>
               <div className="flex flex-col pt-6 border-t border-white/10 mt-auto">
                 <span className="font-sans text-white text-sm tracking-widest uppercase mb-1">{test.author}</span>
                 <span className="font-sans text-[10px] text-teal-500 tracking-widest uppercase">{test.role}</span>
               </div>
            </motion.div>
         ))}
      </div>
    </section>
  );
}
