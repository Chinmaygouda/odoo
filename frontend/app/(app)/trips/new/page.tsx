'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  MapPin, 
  Calendar, 
  CircleDollarSign,
  GripVertical,
  Trash2,
  Plus
} from 'lucide-react';
import { useTrips, useStops, Trip, Stop } from '@/lib/hooks';
import { toast } from '@/components/Toast';

const EMOJIS = ['✈️', '🏝️', '🏔️', '🏙️', '🚢', '🏯', '🏜️', '🌋', '🏕️', '🛤️', '🎡', '🎢', '⛲', '🎨', '🎭', '🏰', '🗿', '🗽', '🗼', '⛩️'];

export default function NewTrip() {
  const router = useRouter();
  const { addTrip } = useTrips();
  const { addStop } = useStops();
  const [step, setStep] = useState(1);
  
  // --- Step 1 State ---
  const [tripInfo, setTripInfo] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: 0,
    currency: 'USD',
    emoji: '✈️',
    description: '',
    status: 'Draft' as const
  });

  // --- Step 2 State ---
  const [stops, setStops] = useState<Partial<Stop>[]>([
    { id: '1', city: '', country: '', arrivalDate: '', departureDate: '', nights: 1 }
  ]);

  const handleAddStop = () => {
    setStops([...stops, { id: Math.random().toString(36).substring(7), city: '', country: '', arrivalDate: '', departureDate: '', nights: 1 }]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length > 1) setStops(stops.filter(s => s.id !== id));
  };

  const handleStopChange = (id: string, field: keyof Stop, value: any) => {
    setStops(stops.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = () => {
    const tripId = Math.random().toString(36).substring(7);
    const shareToken = Math.random().toString(36).substring(10);
    
    const newTrip: Trip = {
      ...tripInfo,
      id: tripId,
      shareToken,
      createdAt: Date.now(),
      status: 'Upcoming'
    };

    addTrip(newTrip);
    
    stops.forEach(s => {
      addStop({
        ...s as Stop,
        id: Math.random().toString(36).substring(7),
        tripId
      });
    });

    toast.success('Your journey has been curated.');
    router.push('/trips');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-obsidian flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-slate/50 px-8 flex items-center justify-between bg-ink">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="text-muted hover:text-cream transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-playfair tracking-wider">Curate New Journey</h1>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 w-8 rounded-full ${step >= i ? 'bg-gold' : 'bg-slate'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-sm text-muted hover:text-cream font-medium"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="bg-gold hover:bg-gold-light text-obsidian px-8 py-2 rounded-full font-bold transition-all flex items-center gap-2"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="bg-gold hover:bg-gold-light text-obsidian px-8 py-2 rounded-full font-bold transition-all flex items-center gap-2"
            >
              Complete Journey <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-12 bg-obsidian/50">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-4xl font-playfair">Essentials</h2>
                  <p className="text-muted">Define the base of your luxury travel experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-muted font-bold ml-1">Journey Name</label>
                      <input 
                        type="text" 
                        value={tripInfo.name}
                        onChange={(e) => setTripInfo({ ...tripInfo, name: e.target.value })}
                        placeholder="e.g., The Aegean Odyssey"
                        className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:outline-none focus:border-gold transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted font-bold ml-1">Start Date</label>
                        <input 
                          type="date" 
                          value={tripInfo.startDate}
                          onChange={(e) => setTripInfo({ ...tripInfo, startDate: e.target.value })}
                          className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:outline-none focus:border-gold transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted font-bold ml-1">End Date</label>
                        <input 
                          type="date" 
                          value={tripInfo.endDate}
                          onChange={(e) => setTripInfo({ ...tripInfo, endDate: e.target.value })}
                          className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:outline-none focus:border-gold transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-muted font-bold ml-1">Budget Allocation</label>
                      <div className="relative">
                        <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                        <input 
                          type="number" 
                          value={tripInfo.budget}
                          onChange={(e) => setTripInfo({ ...tripInfo, budget: parseFloat(e.target.value) })}
                          className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-muted font-bold ml-1">Journey Icon</label>
                      <div className="flex flex-wrap gap-2 p-4 bg-slate/20 border border-slate/50 rounded-2xl">
                        {EMOJIS.map(e => (
                          <button 
                            key={e}
                            onClick={() => setTripInfo({ ...tripInfo, emoji: e })}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl hover:bg-gold/20 transition-all ${tripInfo.emoji === e ? 'bg-gold/30 border border-gold/50' : ''}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-4xl font-playfair">Destinations</h2>
                  <p className="text-muted">Map out your path. Layer cities and unique locations.</p>
                </div>

                <div className="space-y-4">
                  {stops.map((stop, i) => (
                    <div key={stop.id} className="glass-card p-6 rounded-3xl flex items-center gap-6">
                      <div className="text-muted">
                        <GripVertical className="w-5 h-5 cursor-grab" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">City</label>
                          <input 
                            type="text" 
                            value={stop.city}
                            onChange={(e) => handleStopChange(stop.id!, 'city', e.target.value)}
                            placeholder="Paris"
                            className="w-full bg-slate/40 border border-slate/50 rounded-xl px-3 py-2 focus:border-gold outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">Country</label>
                          <input 
                            type="text" 
                            value={stop.country}
                            onChange={(e) => handleStopChange(stop.id!, 'country', e.target.value)}
                            placeholder="France"
                            className="w-full bg-slate/40 border border-slate/50 rounded-xl px-3 py-2 focus:border-gold outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">Arrival</label>
                          <input 
                            type="date" 
                            value={stop.arrivalDate}
                            onChange={(e) => handleStopChange(stop.id!, 'arrivalDate', e.target.value)}
                            className="w-full bg-slate/40 border border-slate/50 rounded-xl px-3 py-2 focus:border-gold outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">Nights</label>
                          <input 
                            type="number" 
                            value={stop.nights}
                            onChange={(e) => handleStopChange(stop.id!, 'nights', parseInt(e.target.value))}
                            className="w-full bg-slate/40 border border-slate/50 rounded-xl px-3 py-2 focus:border-gold outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRemoveStop(stop.id!)}
                        className="text-muted hover:text-ruby transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <button 
                    onClick={handleAddStop}
                    className="w-full py-4 border-2 border-dashed border-slate/50 rounded-3xl text-muted hover:text-gold hover:border-gold/50 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Add New Destination Stop</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-4xl font-playfair">Review Journey</h2>
                  <p className="text-muted">Final confirmation of your curated adventure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  {/* Summary Donut */}
                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate/30" />
                      <motion.circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" 
                        className="text-gold"
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * 0.75) }} // Simulated data
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl">{tripInfo.emoji}</span>
                      <p className="text-2xl font-bold mt-2">${tripInfo.budget.toLocaleString()}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Total Budget</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card p-6 rounded-3xl space-y-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Journey Title</p>
                        <p className="text-xl font-playfair text-gold">{tripInfo.name}</p>
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Duration</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gold" />
                            <p className="text-sm">{new Date(tripInfo.startDate).toLocaleDateString()} - {new Date(tripInfo.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Destinations</p>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-teal" />
                            <p className="text-sm">{stops.length} stops curated</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Itinerary Sequence</p>
                      <div className="space-y-2">
                        {stops.map((s, i) => (
                          <div key={s.id} className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-slate flex items-center justify-center text-[10px] font-bold text-gold">
                              {i + 1}
                            </div>
                            <span>{s.city}, {s.country}</span>
                            <span className="text-muted ml-auto">{s.nights} nights</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
