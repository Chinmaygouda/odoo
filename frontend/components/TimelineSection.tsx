'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

const timeline = [
  { city: "Tokyo", time: "Day 01 - Arrival", img: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=2000&auto=format&fit=crop" },
  { city: "Kyoto", time: "Day 04 - Heritage", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop" },
  { city: "Osaka", time: "Day 08 - Culinary", img: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2000&auto=format&fit=crop" }
];

export function TimelineSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-32 bg-charcoal text-white relative">
      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-24">
           <h2 className="font-playfair text-4xl md:text-5xl font-light mb-4">A Cinematic Timeline</h2>
           <p className="font-sans text-gray-400 font-light text-sm md:text-base">Experience travel progression as a flowing narrative.</p>
        </div>

        <div className="relative pl-12 md:pl-24">
          {/* Animated Line */}
          <div className="absolute top-0 bottom-0 left-[15px] md:left-[27px] w-[1px] bg-white/10">
            <motion.div 
              style={{ height: lineHeight }} 
              className="w-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)] origin-top"
            />
          </div>

          {timeline.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mb-24 last:mb-0"
            >
              <div className="absolute -left-12 md:-left-24 top-2 w-4 h-4 rounded-full border-2 border-charcoal bg-gold shadow-[0_0_15px_rgba(212,175,55,0.8)] z-10" />
              
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="md:w-1/3">
                  <p className="font-sans text-[10px] text-teal-400 uppercase tracking-widest mb-1">{item.time}</p>
                  <h3 className="font-playfair text-3xl font-medium">{item.city}</h3>
                </div>
                
                <div className="md:w-2/3 h-64 md:h-80 w-full relative rounded-2xl overflow-hidden glass p-2 group cursor-pointer">
                   <div className="w-full h-full relative rounded-xl overflow-hidden">
                     <Image 
                       src={item.img} 
                       alt={item.city} 
                       fill 
                       className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                     />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
