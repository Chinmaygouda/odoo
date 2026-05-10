'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Printer, 
  Calendar, 
  MapPin, 
  Clock, 
  CircleDollarSign,
  ChevronLeft,
  LayoutList,
  CalendarDays,
  ExternalLink,
  Plane,
  ArrowRight
} from 'lucide-react';
import { useTrips, useStops, useActivities } from '@/lib/hooks';
import { toast } from '@/components/Toast';

export default function ItineraryView() {
  const { id: tripId } = useParams() as { id: string };
  const router = useRouter();
  
  const { trips } = useTrips();
  const trip = trips.find(t => t.id === tripId);
  
  const { stops } = useStops(tripId);
  const { activities } = useActivities(tripId);

  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  if (!trip) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/shared/${trip.shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Itinerary link copied to clipboard.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-12 pb-32 print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate/50 pb-8 print:hidden">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Journeys
          </button>
          
          <div className="space-y-2">
            <h1 className="font-playfair text-5xl tracking-tight leading-tight">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium">{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal" />
                <span className="text-sm font-medium">{stops.length} destinations curated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate/20 p-1 rounded-2xl border border-slate/50">
            <button 
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'timeline' ? 'bg-gold text-obsidian' : 'text-muted hover:text-cream'}`}
            >
              <LayoutList className="w-4 h-4" /> Timeline
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-gold text-obsidian' : 'text-muted hover:text-cream'}`}
            >
              <CalendarDays className="w-4 h-4" /> Calendar
            </button>
          </div>
          
          <button 
            onClick={handleShare}
            className="p-3 rounded-2xl border border-slate/50 hover:bg-slate/20 transition-all group"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-muted group-hover:text-gold" />
          </button>
          <button 
            onClick={handlePrint}
            className="p-3 rounded-2xl border border-slate/50 hover:bg-slate/20 transition-all group"
            title="Print"
          >
            <Printer className="w-5 h-5 text-muted group-hover:text-cream" />
          </button>
        </div>
      </div>

      {/* Main Itinerary Content */}
      <div className="max-w-4xl mx-auto">
        {viewMode === 'timeline' ? (
          <div className="relative space-y-12">
            {/* Vertical Line */}
            <div className="absolute left-[31px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-gold via-slate/50 to-gold opacity-30" />

            {stops.map((stop, stopIdx) => (
              <div key={stop.id} className="relative pl-20 group">
                {/* City Node */}
                <div className="absolute left-0 top-0 w-16 h-16 rounded-[1.5rem] bg-ink border-2 border-gold flex items-center justify-center z-10 shadow-[0_0_20px_rgba(201,168,76,0.2)] group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl">📍</span>
                </div>

                <div className="space-y-8">
                  {/* City Header */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Stop {stopIdx + 1}</p>
                    <h2 className="text-4xl font-playfair">{stop.city}, <span className="italic text-muted font-light">{stop.country}</span></h2>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(stop.arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {stop.nights} nights in {stop.city}</span>
                    </div>
                  </div>

                  {/* Activities for this stop */}
                  <div className="grid gap-4">
                    {activities.filter(a => a.stopId === stop.id).map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-card p-6 rounded-[2rem] flex items-center gap-6 group/item hover:border-gold/30 transition-all"
                      >
                        <div className="text-2xl grayscale group-hover/item:grayscale-0 transition-all duration-500">
                          {activity.type === 'food' ? '🍜' : 
                           activity.type === 'sightseeing' ? '🏛️' : 
                           activity.type === 'adventure' ? '🧗' : 
                           activity.type === 'culture' ? '🎭' : 
                           activity.type === 'shopping' ? '🛍️' : 
                           activity.type === 'transport' ? '🚌' : 
                           activity.type === 'accommodation' ? '🏨' : '✨'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-lg">{activity.name}</h4>
                            {activity.isBooked && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald/10 text-emerald text-[9px] uppercase tracking-widest font-bold">Confirmed</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                            <span>{activity.time}</span>
                            <span className="opacity-30">•</span>
                            <span>{activity.duration} mins</span>
                            {activity.cost > 0 && (
                              <>
                                <span className="opacity-30">•</span>
                                <span className="text-gold font-medium">${activity.cost}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {activities.filter(a => a.stopId === stop.id).length === 0 && (
                      <div className="p-8 border border-dashed border-slate/50 rounded-[2rem] text-center opacity-40">
                        <p className="text-sm italic">No activities planned for this destination yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transition Arrow to next stop */}
                {stopIdx < stops.length - 1 && (
                  <div className="py-8 flex justify-center opacity-20">
                    <Plane className="w-6 h-6 rotate-90 text-gold" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 glass-card rounded-[3rem] opacity-60">
            <CalendarDays className="w-16 h-16 text-gold mb-4" />
            <h3 className="text-2xl font-playfair">Calendar View Coming Soon</h3>
            <p className="text-muted max-w-sm">We are refining the luxury calendar experience. For now, please use the Timeline view.</p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="pt-20 text-center opacity-20 flex flex-col items-center gap-4">
        <div className="h-[1px] w-32 bg-gold" />
        <p className="font-playfair text-xl tracking-[0.5em] font-light">TRAVELOOP</p>
      </div>
    </div>
  );
}
