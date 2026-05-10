'use client';

import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { useTrips } from '@/lib/hooks';
import Link from 'next/link';

export default function TimelinePage() {
  const { trips, isLoaded } = useTrips();

  if (!isLoaded) return null;

  // Safe date formatter
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date not set";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Date not set";
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  // Filter for upcoming/ongoing trips to show in timeline selection
  const activeTrips = trips.filter(t => t.status !== 'Draft').sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
  });

  return (
    <div className="space-y-8 md:space-y-12 pb-32">
      <div className="space-y-4">
        <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Scheduling</p>
        <h1 className="font-playfair text-3xl md:text-5xl font-light leading-tight">Global Timeline</h1>
        <p className="text-sm md:text-base text-muted max-w-2xl leading-relaxed">Visualize your upcoming adventures. Select a journey to view its detailed day-by-day itinerary and logistics.</p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {activeTrips.length > 0 ? (
          activeTrips.map((trip) => {
            const tripName = trip.name || "Untitled Journey";
            const tripEmoji = trip.emoji || "✈️";
            
            return (
              <Link key={trip.id} href={`/trips/${trip.id}/view`}>
                <motion.div
                  whileHover={{ x: 10, backgroundColor: 'rgba(201, 168, 76, 0.05)' }}
                  className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate/50 hover:border-gold/50 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto">
                    <div className="hidden lg:flex flex-col items-center min-w-[60px]">
                      <span className="text-xs font-bold text-gold">
                        {trip.startDate ? new Date(trip.startDate).getFullYear() || '—' : '—'}
                      </span>
                      <div className="w-[1px] h-10 bg-gradient-to-b from-gold/50 to-transparent my-2" />
                      <Clock className="w-4 h-4 text-muted" />
                    </div>
                    
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-slate/50 flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                      {tripEmoji}
                    </div>
                    
                    <div className="space-y-1 md:space-y-2 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-playfair text-xl md:text-2xl group-hover:text-gold transition-colors truncate">{tripName}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs md:text-sm text-muted">
                        <Calendar className="w-3.5 h-3.5 text-gold/50" />
                        <span className="font-medium whitespace-nowrap">
                          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate/10 pt-4 sm:pt-0">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] bg-slate/30 border border-slate/50 ${
                      trip.status === 'Ongoing' ? 'text-emerald border-emerald/30' : 'text-gold border-gold/30'
                    }`}>
                      {trip.status}
                    </span>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate/50 flex items-center justify-center group-hover:border-gold transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gold group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })
        ) : (
          <div className="py-20 md:py-32 px-6 flex flex-col items-center justify-center text-center space-y-8 glass-card rounded-[2.5rem] md:rounded-[3rem]">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate/20 flex items-center justify-center border-2 border-dashed border-slate/50">
              <Calendar className="w-8 h-8 md:w-10 md:h-10 text-muted opacity-40" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-playfair">No journeys planned yet</h2>
              <p className="text-xs md:text-sm text-muted max-w-sm mx-auto">Your global timeline will populate once you curate your first luxury travel experience.</p>
            </div>
            <Link href="/trips/new" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gold text-obsidian px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-gold-light transition-all shadow-xl shadow-gold/20">
                Create Your First Journey
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
