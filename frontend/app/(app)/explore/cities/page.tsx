'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Plus, 
  ChevronRight, 
  Globe, 
  Map as MapIcon,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useTrips, useStops, Trip } from '@/lib/hooks';
import { toast } from '@/components/Toast';

const CITIES = [
  { id: '1', name: 'Paris', country: 'France', region: 'Europe', budget: 4, popularity: 98, desc: 'The City of Light, synonymous with romance, high fashion, and world-class culinary art.', activities: ['Louvre', 'Eiffel Tower', 'Seine Cruise'], gradient: 'from-blue-600/30 to-indigo-900/40' },
  { id: '2', name: 'Tokyo', country: 'Japan', region: 'Asia', budget: 4, popularity: 95, desc: 'A neon-lit metropolis where ancient tradition meets futuristic innovation.', activities: ['Shibuya', 'Shinjuku', 'Tsukiji Market'], gradient: 'from-red-600/30 to-pink-900/40' },
  { id: '3', name: 'New York', country: 'USA', region: 'Americas', budget: 5, popularity: 97, desc: 'The world\'s most vibrant hub of finance, culture, and iconic skyscrapers.', activities: ['Central Park', 'Times Square', 'Broadway'], gradient: 'from-slate-600/30 to-blue-900/40' },
  { id: '4', name: 'Santorini', country: 'Greece', region: 'Europe', budget: 5, popularity: 92, desc: 'Sun-drenched white buildings overlooking the sapphire Aegean Sea.', activities: ['Oia Sunset', 'Black Sand Beach', 'Caldera Boat Tour'], gradient: 'from-cyan-500/30 to-blue-600/40' },
  { id: '5', name: 'Bali', country: 'Indonesia', region: 'Asia', budget: 2, popularity: 94, desc: 'An island paradise of lush jungles, sacred temples, and spiritual retreats.', activities: ['Ubud Rice Fields', 'Uluwatu Temple', 'Seminyak'], gradient: 'from-emerald-500/30 to-teal-700/40' },
  { id: '6', name: 'Rome', country: 'Italy', region: 'Europe', budget: 3, popularity: 96, desc: 'An open-air museum of ancient history, Renaissance art, and soulful cuisine.', activities: ['Colosseum', 'Vatican', 'Trevi Fountain'], gradient: 'from-orange-500/30 to-red-700/40' },
  { id: '7', name: 'Dubai', country: 'UAE', region: 'Middle East', budget: 5, popularity: 90, desc: 'A desert oasis of architectural superlatives and luxury shopping.', activities: ['Burj Khalifa', 'Desert Safari', 'Palm Jumeirah'], gradient: 'from-gold/30 to-orange-900/40' },
  { id: '8', name: 'London', country: 'UK', region: 'Europe', budget: 4, popularity: 95, desc: 'A global powerhouse where regal heritage meets contemporary dynamism.', activities: ['Big Ben', 'British Museum', 'Soho'], gradient: 'from-blue-700/30 to-slate-900/40' },
  { id: '9', name: 'Barcelona', country: 'Spain', region: 'Europe', budget: 3, popularity: 93, desc: 'Gaudí\'s masterpiece city, blending Gothic charm with Mediterranean energy.', activities: ['Sagrada Família', 'Park Güell', 'Las Ramblas'], gradient: 'from-yellow-600/30 to-orange-800/40' },
  { id: '10', name: 'Bangkok', country: 'Thailand', region: 'Asia', budget: 2, popularity: 91, desc: 'A sensory explosion of street food, ornate shrines, and vibrant canals.', activities: ['Grand Palace', 'Wat Arun', 'Street Food Tour'], gradient: 'from-purple-600/30 to-pink-900/40' },
  { id: '11', name: 'Cape Town', country: 'South Africa', region: 'Africa', budget: 3, popularity: 88, desc: 'Breathtaking landscapes where Table Mountain meets the Atlantic coast.', activities: ['Table Mountain', 'Robben Island', 'Boulders Beach'], gradient: 'from-green-600/30 to-blue-900/40' },
  { id: '12', name: 'Sydney', country: 'Australia', region: 'Oceania', budget: 4, popularity: 89, desc: 'The sunny jewel of the Pacific, famous for its harbor and surf lifestyle.', activities: ['Opera House', 'Bondi Beach', 'Harbour Bridge'], gradient: 'from-blue-500/30 to-cyan-800/40' },
  { id: '13', name: 'Cairo', country: 'Egypt', region: 'Africa', budget: 2, popularity: 85, desc: 'The gateway to the Nile and the timeless majesty of the Giza Pyramids.', activities: ['Pyramids', 'Egyptian Museum', 'Khan el-Khalili'], gradient: 'from-amber-700/30 to-orange-950/40' },
  { id: '14', name: 'Amsterdam', country: 'Netherlands', region: 'Europe', budget: 3, popularity: 92, desc: 'A web of historic canals, world-class art, and cycling culture.', activities: ['Rijksmuseum', 'Anne Frank House', 'Canal Cruise'], gradient: 'from-red-500/30 to-orange-600/40' },
  { id: '15', name: 'Kyoto', country: 'Japan', region: 'Asia', budget: 4, popularity: 94, desc: 'The cultural heart of Japan, home to zen gardens and geisha tradition.', activities: ['Fushimi Inari', 'Arashiyama Bamboo Grove', 'Kinkaku-ji'], gradient: 'from-pink-400/30 to-rose-900/40' },
  { id: '16', name: 'Rio de Janeiro', country: 'Brazil', region: 'Americas', budget: 3, popularity: 87, desc: 'A vibrant city framed by dramatic mountains and golden beaches.', activities: ['Christ the Redeemer', 'Sugarloaf Mountain', 'Copacabana'], gradient: 'from-green-500/30 to-yellow-600/40' },
  { id: '17', name: 'Reykjavik', country: 'Iceland', region: 'Europe', budget: 5, popularity: 86, desc: 'The gateway to otherworldly volcanic landscapes and Northern Lights.', activities: ['Blue Lagoon', 'Golden Circle', 'Hallgrímskirkja'], gradient: 'from-blue-400/30 to-purple-800/40' },
  { id: '18', name: 'Singapore', country: 'Singapore', region: 'Asia', budget: 4, popularity: 93, desc: 'A garden city blending ultra-modern architecture with diverse heritage.', activities: ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa'], gradient: 'from-red-600/30 to-slate-900/40' },
  { id: '19', name: 'Venice', country: 'Italy', region: 'Europe', budget: 5, popularity: 91, desc: 'A floating labyrinth of Renaissance palazzos and winding canals.', activities: ['St. Marks Square', 'Grand Canal Gondola', 'Doge\'s Palace'], gradient: 'from-teal-600/30 to-blue-900/40' },
  { id: '20', name: 'Machu Picchu', country: 'Peru', region: 'Americas', budget: 4, popularity: 95, desc: 'The lost city of the Incas, perched high in the mystical Andes Mountains.', activities: ['Inca Trail', 'Sacred Valley', 'Cusco'], gradient: 'from-emerald-700/30 to-stone-900/40' },
];

export default function CityExplore() {
  const router = useRouter();
  const { trips } = useTrips();
  const { addStop } = useStops();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeBudget, setActiveBudget] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedCityForAdd, setSelectedCityForAdd] = useState<typeof CITIES[0] | null>(null);

  const placeholders = ['Paris...', 'Tokyo...', 'Bali...', 'New York...', 'Santorini...'];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const filteredCities = useMemo(() => {
    return CITIES.filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           city.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = activeRegion === 'All' || city.region === activeRegion;
      const matchesBudget = activeBudget === 0 || city.budget === activeBudget;
      return matchesSearch && matchesRegion && matchesBudget;
    });
  }, [searchQuery, activeRegion, activeBudget]);

  const handleAddToTrip = (tripId: string) => {
    if (!selectedCityForAdd) return;

    addStop({
      id: Math.random().toString(36).substring(7),
      tripId: tripId,
      city: selectedCityForAdd.name,
      country: selectedCityForAdd.country,
      arrivalDate: new Date().toISOString().split('T')[0],
      departureDate: new Date().toISOString().split('T')[0],
      nights: 2
    });

    toast.success(`${selectedCityForAdd.name} added to your journey.`);
    setSelectedCityForAdd(null);
    router.push(`/trips/${tripId}/builder`);
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Search Hero */}
      <section className="relative h-96 flex flex-col items-center justify-center text-center space-y-8 overflow-hidden rounded-[3rem] bg-ink">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.15)_0%,transparent_70%)] animate-pulse" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl px-6">
          <p className="text-gold uppercase tracking-[0.6em] text-[10px] font-bold">The Explorer</p>
          <h1 className="text-4xl md:text-6xl font-playfair leading-tight">Where should your <span className="italic">soul travel next?</span></h1>
          
          <div className="relative group w-full max-w-lg mx-auto pt-4">
            <Search className="absolute left-6 top-1/2 mt-2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${placeholders[placeholderIndex]}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-obsidian border border-slate/50 rounded-3xl py-5 pl-16 pr-8 text-cream placeholder:text-muted focus:outline-none focus:border-gold transition-all shadow-2xl"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters */}
        <aside className="space-y-10">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gold">By Region</h3>
            <div className="flex flex-col gap-2">
              {['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East'].map(region => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`text-left px-4 py-2 rounded-xl text-sm transition-all ${
                    activeRegion === region ? 'bg-gold/10 text-gold font-bold' : 'text-muted hover:text-cream'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gold">Budget Level</h3>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setActiveBudget(level)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                    activeBudget === level ? 'bg-gold border-gold text-obsidian font-bold' : 'border-slate/50 text-muted hover:border-gold/50'
                  }`}
                >
                  {level === 0 ? 'All' : level}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted italic">Scale of 1 (Economy) to 5 (Ultra-Luxury)</p>
          </div>
        </aside>

        {/* City Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCities.map((city) => (
                <motion.div
                  key={city.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card rounded-[2.5rem] overflow-hidden group flex flex-col h-[480px]"
                >
                  <div className={`h-48 bg-gradient-to-br ${city.gradient} relative flex items-center justify-center overflow-hidden`}>
                    <h4 className="text-5xl font-playfair text-white/20 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-700 scale-150 group-hover:scale-100">{city.name}</h4>
                    <div className="absolute top-6 left-6 px-4 py-1 rounded-full bg-obsidian/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gold">
                      {city.country}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-3xl font-playfair">{city.name}</h3>
                      <div className="flex text-gold">
                        {Array.from({ length: city.budget }).map((_, i) => (
                          <DollarSign key={i} className="w-4 h-4" />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted leading-relaxed flex-1">{city.desc}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {city.activities.map(act => (
                        <span key={act} className="px-3 py-1 rounded-full bg-slate/30 text-[10px] uppercase tracking-widest font-bold text-cream/70">
                          {act}
                        </span>
                      ))}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-slate/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${city.popularity}%` }} />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted">Trending</span>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedCityForAdd(city)}
                        className="bg-gold hover:bg-gold-light text-obsidian px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        Add to Trip <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add to Trip Modal */}
      <AnimatePresence>
        {selectedCityForAdd && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCityForAdd(null)}
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
                  <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Adding to Journey</p>
                  <h3 className="text-2xl font-playfair">{selectedCityForAdd.name}</h3>
                </div>
                <button onClick={() => setSelectedCityForAdd(null)} className="text-muted hover:text-cream">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted">Select which of your luxury journeys you'd like to add this destination to:</p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                  {trips.length > 0 ? (
                    trips.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => handleAddToTrip(trip.id)}
                        className="w-full p-4 rounded-2xl bg-slate/20 border border-slate/50 hover:border-gold/50 transition-all text-left flex items-center gap-4 group"
                      >
                        <span className="text-2xl">{trip.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-gold transition-colors">{trip.name}</p>
                          <p className="text-xs text-muted">{new Date(trip.startDate).toLocaleDateString()}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center space-y-4">
                      <p className="text-muted italic">You haven't curated any journeys yet.</p>
                      <button 
                        onClick={() => router.push('/trips/new')}
                        className="text-xs uppercase tracking-widest text-gold font-bold border-b border-gold/30 pb-1"
                      >
                        Create Your First Journey
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
