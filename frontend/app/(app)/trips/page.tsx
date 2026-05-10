'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Map as MapIcon, 
  Calendar, 
  Users, 
  Share2, 
  Trash2, 
  ExternalLink,
  Settings,
  Plane,
  CircleDollarSign
} from 'lucide-react';
import { useTrips, Trip } from '@/lib/hooks';
import Link from 'next/link';
import { toast } from '@/components/Toast';

const filters = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Draft'] as const;

export default function MyTrips() {
  const { trips, deleteTrip } = useTrips();
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesFilter = activeFilter === 'All' || trip.status === activeFilter;
      const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [trips, activeFilter, searchQuery]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteTrip(id);
      toast.success('Journey removed from archives.');
    }
  };

  const handleShare = (shareToken: string) => {
    const url = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard.');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Archives</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-light">Your Journeys</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search journeys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate/20 border border-slate/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-gold transition-all w-64"
            />
          </div>
          
          <Link href="/trips/new">
            <button className="bg-gold hover:bg-gold-light text-obsidian px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-gold/10">
              <Plus className="w-5 h-5" />
              New Journey
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === filter 
                ? 'bg-gold text-obsidian shadow-lg shadow-gold/20' 
                : 'bg-slate/20 text-muted hover:text-cream border border-slate/50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredTrips.map((trip) => (
            <motion.div
              key={trip.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              className="glass-card rounded-[2.5rem] p-8 group relative overflow-hidden flex flex-col h-[400px]"
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-slate/50 border border-slate/50 ${
                  trip.status === 'Ongoing' ? 'text-emerald border-emerald/30' :
                  trip.status === 'Upcoming' ? 'text-gold border-gold/30' :
                  'text-muted'
                }`}>
                  {trip.status}
                </span>
              </div>

              {/* Background Glow */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-[80px] group-hover:bg-gold/10 transition-colors" />

              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-slate/50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {trip.emoji}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-playfair group-hover:text-gold transition-colors">{trip.name}</h3>
                  <div className="flex items-center gap-3 text-muted text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Progress Circle (Simple SVG) */}
                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate/30" />
                      <circle 
                        cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" 
                        className="text-gold"
                        strokeDasharray="125.6"
                        strokeDashoffset="31.4" // Placeholder for budget usage
                      />
                    </svg>
                    <CircleDollarSign className="absolute w-4 h-4 text-gold/50" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Budget Status</p>
                    <p className="text-sm font-medium">On Track • ${trip.budget.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-8 flex items-center justify-between border-t border-slate/50">
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleShare(trip.shareToken)}
                    className="p-3 rounded-xl hover:bg-slate/50 text-muted hover:text-gold transition-all"
                    title="Share Itinerary"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(trip.id, trip.name)}
                    className="p-3 rounded-xl hover:bg-slate/50 text-muted hover:text-ruby transition-all"
                    title="Delete Journey"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <Link href={`/trips/${trip.id}/builder`}>
                    <button className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate/50 hover:bg-slate/50 transition-all">
                      Builder
                    </button>
                  </Link>
                  <Link href={`/trips/${trip.id}/view`}>
                    <button className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-gold text-obsidian hover:bg-gold-light transition-all shadow-lg shadow-gold/10">
                      View
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTrips.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="w-32 h-32 rounded-full bg-slate/20 flex items-center justify-center border-2 border-dashed border-slate/50">
              <Plane className="w-12 h-12 text-muted rotate-[-15deg]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-playfair">No journeys found</h2>
              <p className="text-muted max-w-sm">The world is waiting for your curated experiences. Start planning your next adventure.</p>
            </div>
            <Link href="/trips/new">
              <button className="bg-gold text-obsidian px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold-light transition-all shadow-xl shadow-gold/20">
                Curate New Trip
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
