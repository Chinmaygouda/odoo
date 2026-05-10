'use client';

import { motion } from 'framer-motion';
import { Settings, ArrowRight, Plane } from 'lucide-react';
import { useTrips } from '@/lib/hooks';
import Link from 'next/link';

export default function BuilderPage() {
  const { trips, isLoaded } = useTrips();

  if (!isLoaded) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Workspace</p>
        <h1 className="font-playfair text-4xl md:text-5xl font-light">Itinerary Builder</h1>
        <p className="text-muted max-w-2xl">Select one of your curated journeys to refine its timeline, add experiences, and perfect the logistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}/builder`}>
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-[2rem] border border-slate/50 hover:border-gold/50 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate/50 flex items-center justify-center text-2xl">
                    {trip.emoji}
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl group-hover:text-gold transition-colors">{trip.name}</h3>
                    <p className="text-xs text-muted uppercase tracking-widest">{trip.status}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate/50">
                  <span className="text-[10px] uppercase tracking-widest text-muted">Open Builder</span>
                  <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate/20 flex items-center justify-center border-2 border-dashed border-slate/50">
              <Plane className="w-8 h-8 text-muted" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-playfair">No journeys to build</h2>
              <p className="text-muted max-w-sm mx-auto">Create your first travel plan to start using the luxury itinerary builder.</p>
            </div>
            <Link href="/trips/new">
              <button className="bg-gold text-obsidian px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gold-light transition-all">
                Create New Journey
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
