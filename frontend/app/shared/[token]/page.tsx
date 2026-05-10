'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  Plane,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function SharedItineraryView() {
  const { token } = useParams() as { token: string };
  
  // In a real app, this would fetch from an API
  // Here we'll try to find it in localStorage if the user is on the same machine,
  // or show a beautiful "Shared Journey" template if not.
  const trips = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tl_trips') || '[]') : [];
  const trip = trips.find((t: any) => t.shareToken === token);
  
  // Mock data for public view if not found (to demonstrate the UI)
  const displayTrip = trip || {
    name: "A Parisian Spring Odyssey",
    emoji: "✈️",
    startDate: "2024-05-15",
    endDate: "2024-05-22",
    description: "A curated journey through the heart of the City of Light.",
    curator: "Julian Vance"
  };

  const mockStops = [
    { city: 'Paris', country: 'France', nights: 4, date: 'May 15' },
    { city: 'Nice', country: 'France', nights: 3, date: 'May 19' }
  ];

  return (
    <div className="min-h-screen bg-obsidian text-cream font-inter selection:bg-gold/30">
      {/* Public Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-slate/50 bg-ink/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
            <Plane className="text-obsidian w-4 h-4" />
          </div>
          <span className="font-playfair text-lg tracking-[0.2em] font-light">TRAVELOOP</span>
        </div>
        
        <Link href="/login">
          <button className="text-xs uppercase tracking-widest text-gold hover:text-gold-light font-bold flex items-center gap-2 group">
            Curate Your Own <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
          </button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-20 space-y-24">
        {/* Shared Hero */}
        <section className="text-center space-y-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-[2.5rem] bg-gold/10 border border-gold/20 flex items-center justify-center text-6xl mx-auto shadow-2xl shadow-gold/5"
          >
            {displayTrip.emoji}
          </motion.div>
          
          <div className="space-y-4">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold uppercase tracking-[0.6em] text-[10px] font-bold"
            >
              Shared Journey
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-playfair leading-tight"
            >
              {displayTrip.name}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 text-muted pt-4"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{new Date(displayTrip.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <span className="opacity-30">•</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Curated by {displayTrip.curator || 'Private Traveler'}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Public Timeline */}
        <section className="space-y-12">
          <div className="relative space-y-16">
            <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-slate/50" />
            
            {mockStops.map((stop, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-20"
              >
                <div className="absolute left-0 top-0 w-14 h-14 rounded-2xl bg-ink border border-gold/30 flex items-center justify-center z-10 text-xl">
                  📍
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gold font-bold">{stop.date}</p>
                    <h2 className="text-3xl font-playfair">{stop.city}, <span className="italic text-muted font-light">{stop.country}</span></h2>
                    <p className="text-sm text-muted">{stop.nights} nights in the city</p>
                  </div>
                  
                  <div className="p-6 rounded-[2rem] bg-slate/20 border border-slate/50">
                    <p className="text-sm text-cream/70 leading-relaxed italic">
                      "Exploring the hidden courtyards and artisan boutiques that define the soul of {stop.city}."
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="pt-20 border-t border-slate/50">
          <div className="glass-card p-12 rounded-[3rem] text-center space-y-8 bg-gradient-to-br from-gold/10 to-transparent">
            <div className="space-y-3">
              <h2 className="text-4xl font-playfair">Inspired by this journey?</h2>
              <p className="text-muted max-w-md mx-auto">Traveloop is the ultimate operating system for crafting luxury itineraries and cinematic travel experiences.</p>
            </div>
            <Link href="/login">
              <button className="bg-gold text-obsidian px-10 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 active:scale-95">
                Start Curating Your Story
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-20 text-center opacity-30 border-t border-slate/50">
        <p className="font-playfair text-xl tracking-[0.6em] font-light">TRAVELOOP</p>
        <p className="text-[10px] uppercase tracking-widest mt-4">The Art of Luxury Journey Planning</p>
      </footer>
    </div>
  );
}
