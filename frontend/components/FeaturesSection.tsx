'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  { title: "Itinerary Builder", desc: "Drag-and-drop days, events, and reservations into a seamless timeline.", icon: "01", href: "/trips" },
  { title: "Wealth Planner", desc: "Forecast and manage expenditures with multi-currency intelligent conversion.", icon: "02", href: "/budget" },
  { title: "Cinematic Journal", desc: "Immortalize experiences in a rich media format that looks like editorial magazines.", icon: "03", href: "/journal" },
  { title: "Shared Voyages", desc: "Collaborate with travel partners in real-time, assigning roles and tasks.", icon: "04", href: "/explore/cities" },
  { title: "Concierge AI", desc: "Tailored recommendations powered by models trained on luxury hospitality.", icon: "05", href: "/analytics" },
  { title: "Digital Vault", desc: "Encrypted storage for passports, visas, and critical travel documentation.", icon: "06", href: "/checklist" }
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-obsidian text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 flex flex-col md:flex-row md:justify-between md:items-end border-b border-white/10 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1 }}
          >
            <p className="font-sans text-[10px] text-teal-400 uppercase tracking-[0.3em] mb-4">Ecosystem</p>
            <h2 className="font-playfair text-4xl md:text-6xl font-light">
              Tools Designed for<br/>
              <span className="italic text-gray-400">The Modern Explorer</span>
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="md:max-w-sm text-gray-400 font-sans font-light mt-8 md:mt-0 text-sm md:text-base"
          >
            We abstracted away the friction of travel planning, leaving only the joy of anticipation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div 
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
              className="flex"
            >
              <Link href={feat.href} className="flex-1">
                <div className="glass p-10 flex flex-col h-full relative overflow-hidden group cursor-pointer hover:-translate-y-2 transition-transform duration-500 rounded-2xl">
                  <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 text-white/5 font-playfair text-9xl font-bold transition-all duration-700 group-hover:text-gold/10 group-hover:translate-x-0 group-hover:translate-y-0">
                    {feat.icon}
                  </div>
                  <div className="relative z-10 flex-1">
                    <span className="font-sans text-gold/80 text-xs tracking-widest font-semibold block mb-8">
                      {feat.icon.padStart(2, '0')}
                    </span>
                    <h3 className="font-playfair text-2xl font-medium mb-4">{feat.title}</h3>
                    <p className="font-sans text-gray-400 font-light text-sm leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-gold/50 to-transparent transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-in-out" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
