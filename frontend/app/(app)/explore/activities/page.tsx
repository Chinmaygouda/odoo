'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Utensils, 
  Mountain, 
  Theater, 
  ShoppingBag, 
  Car, 
  Plus, 
  Search, 
  Clock, 
  CircleDollarSign,
  X,
  ArrowRight,
  ChevronRight,
  Plane
} from 'lucide-react';
import { useTrips, useStops, useActivities } from '@/lib/hooks';
import { toast } from '@/components/Toast';

const CATEGORIES = [
  { id: 'sightseeing', label: 'Sightseeing', icon: Camera, emoji: '🏛️', color: 'gold' },
  { id: 'food', label: 'Dining', icon: Utensils, emoji: '🍜', color: 'emerald' },
  { id: 'adventure', label: 'Adventure', icon: Mountain, emoji: '🧗', color: 'ruby' },
  { id: 'culture', label: 'Culture', icon: Theater, emoji: '🎭', color: 'teal' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, emoji: '🛍️', color: 'slate' },
  { id: 'transport', label: 'Transport', icon: Car, emoji: '🚌', color: 'muted' },
];

const EXPLORE_ACTIVITIES = [
  { id: 'e1', name: 'Guided Louvre Tour', type: 'sightseeing', cost: 85, duration: 180, desc: 'A private walkthrough of the world\'s largest art museum, featuring the Mona Lisa.' },
  { id: 'e2', name: 'Sushi Omakase Experience', type: 'food', cost: 250, duration: 120, desc: 'A premium 18-course tasting menu prepared by a Michelin-starred master.' },
  { id: 'e3', name: 'Mount Everest Helicopter Tour', type: 'adventure', cost: 1200, duration: 240, desc: 'A breathtaking aerial journey over the highest peaks on Earth.' },
  { id: 'e4', name: 'Venice Opera House Gala', type: 'culture', cost: 180, duration: 150, desc: 'An evening of world-class music in the historic Teatro La Fenice.' },
  { id: 'e5', name: 'Dubai Mall VIP Shopping', type: 'shopping', cost: 0, duration: 300, desc: 'Personal shopping assistant and access to exclusive luxury lounges.' },
  { id: 'e6', name: 'Private Yacht Charter', type: 'transport', cost: 1500, duration: 480, desc: 'Full-day cruise along the Amalfi Coast with private crew and catering.' },
  { id: 'e7', name: 'Kyoto Tea Ceremony', type: 'culture', cost: 65, duration: 90, desc: 'Traditional Matcha preparation in a 400-year-old zen temple.' },
  { id: 'e8', name: 'Safari Night Drive', type: 'adventure', cost: 120, duration: 180, desc: 'Discover nocturnal wildlife in the heart of the Kruger National Park.' },
  { id: 'e9', name: 'Wine Tasting in Tuscany', type: 'food', cost: 95, duration: 150, desc: 'Sample vintage Chianti and local olive oils at a historic family estate.' },
  { id: 'e10', name: 'Northern Lights Expedition', type: 'adventure', cost: 140, duration: 300, desc: 'A guided hunt for the Aurora Borealis across the Icelandic tundra.' },
];

export default function ActivityExplore() {
  const { trips } = useTrips();
  const { stops: allStops } = useStops();
  const { addActivity } = useActivities();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedActivityForAdd, setSelectedActivityForAdd] = useState<typeof EXPLORE_ACTIVITIES[0] | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const filteredActivities = useMemo(() => {
    return EXPLORE_ACTIVITIES.filter(act => {
      const matchesSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           act.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || act.type === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleAddActivity = (tripId: string, stopId: string) => {
    if (!selectedActivityForAdd) return;

    addActivity({
      id: Math.random().toString(36).substring(7),
      tripId: tripId,
      stopId: stopId,
      name: selectedActivityForAdd.name,
      type: selectedActivityForAdd.type as any,
      cost: selectedActivityForAdd.cost,
      currency: 'USD',
      duration: selectedActivityForAdd.duration,
      date: '',
      time: '10:00',
      isBooked: false
    });

    toast.success(`${selectedActivityForAdd.name} added to your itinerary.`);
    setSelectedActivityForAdd(null);
    setSelectedTripId(null);
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="space-y-2">
        <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Experiences</p>
        <h1 className="font-playfair text-4xl md:text-5xl font-light">Curated <span className="italic">Activities</span></h1>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 group ${
              activeCategory === cat.id 
                ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5' 
                : 'bg-slate/20 border-slate/50 hover:border-gold/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              activeCategory === cat.id ? `bg-gold text-obsidian` : `bg-slate/50 text-muted group-hover:text-${cat.color}`
            }`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${activeCategory === cat.id ? 'text-gold' : 'text-muted'}`}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Results */}
      <div className="space-y-8">
        <div className="relative group max-w-lg">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate/20 border border-slate/50 rounded-3xl py-4 pl-16 pr-8 text-cream placeholder:text-muted focus:outline-none focus:border-gold transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((act) => {
              const catInfo = CATEGORIES.find(c => c.id === act.type);
              return (
                <motion.div
                  key={act.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-8 rounded-[2.5rem] flex flex-col h-full group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate/40`}>
                      {catInfo?.emoji}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-${catInfo?.color}/10 text-${catInfo?.color}`}>
                      {act.type}
                    </span>
                  </div>

                  <h3 className="text-2xl font-playfair mb-3 group-hover:text-gold transition-colors">{act.name}</h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">{act.desc}</p>

                  <div className="mt-8 pt-6 border-t border-slate/50 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-muted text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.floor(act.duration / 60)}h {act.duration % 60 > 0 ? `${act.duration % 60}m` : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gold text-xs font-bold">
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        <span>{act.cost > 0 ? `$${act.cost}` : 'Contact'}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedActivityForAdd(act)}
                      className="w-10 h-10 rounded-full bg-gold hover:bg-gold-light text-obsidian flex items-center justify-center transition-all shadow-lg shadow-gold/10"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Add to Trip/Stop Modal */}
      <AnimatePresence>
        {selectedActivityForAdd && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedActivityForAdd(null); setSelectedTripId(null); }}
              className="absolute inset-0 bg-obsidian/90 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-[3rem] p-10 shadow-2xl border-gold/30"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Curating Experience</p>
                  <h3 className="text-2xl font-playfair">{selectedActivityForAdd.name}</h3>
                </div>
                <button onClick={() => { setSelectedActivityForAdd(null); setSelectedTripId(null); }} className="text-muted hover:text-cream">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {!selectedTripId ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted">Which journey is this experience for?</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                      {trips.length > 0 ? (
                        trips.map(trip => (
                          <button
                            key={trip.id}
                            onClick={() => setSelectedTripId(trip.id)}
                            className="w-full p-4 rounded-2xl bg-slate/20 border border-slate/50 hover:border-gold/50 transition-all text-left flex items-center gap-4 group"
                          >
                            <span className="text-2xl">{trip.emoji}</span>
                            <div className="flex-1">
                              <p className="font-medium group-hover:text-gold transition-colors">{trip.name}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                          </button>
                        ))
                      ) : (
                        <p className="text-center py-8 text-muted italic">No journeys curated yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setSelectedTripId(null)} className="text-gold hover:text-gold-light">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                      <p className="text-sm text-muted">Select destination stop:</p>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                      {allStops.filter(s => s.tripId === selectedTripId).length > 0 ? (
                        allStops.filter(s => s.tripId === selectedTripId).map(stop => (
                          <button
                            key={stop.id}
                            onClick={() => handleAddActivity(selectedTripId, stop.id)}
                            className="w-full p-4 rounded-2xl bg-slate/20 border border-slate/50 hover:border-gold/50 transition-all text-left flex items-center gap-4 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate/40 flex items-center justify-center text-xs">📍</div>
                            <div className="flex-1">
                              <p className="font-medium group-hover:text-gold transition-colors">{stop.city}</p>
                              <p className="text-[10px] text-muted uppercase tracking-widest">{new Date(stop.arrivalDate).toLocaleDateString()}</p>
                            </div>
                            <Plus className="w-4 h-4 text-gold" />
                          </button>
                        ))
                      ) : (
                        <p className="text-center py-8 text-muted italic">This journey has no stops defined.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
