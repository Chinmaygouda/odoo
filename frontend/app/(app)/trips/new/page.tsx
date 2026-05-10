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
  Plus,
  Lock,
  Minus,
  ChevronDown,
  Search
} from 'lucide-react';
import { useTrips, useStops, Trip, Stop } from '@/lib/hooks';
import { toast } from '@/components/Toast';

const EMOJIS = ['✈️', '🏝️', '🏔️', '🏙️', '🚢', '🏯', '🏜️', '🌋', '🏕️', '🛤️', '🎡', '🎢', '⛲', '🎨', '🎭', '🏰', '🗿', '🗽', '🗼', '⛩️'];

const POPULAR_CITIES = [
  { name: 'Paris', country: 'France' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Bali', country: 'Indonesia' },
  { name: 'New York', country: 'USA' },
  { name: 'London', country: 'United Kingdom' },
  { name: 'Rome', country: 'Italy' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Bangkok', country: 'Thailand' },
  { name: 'Istanbul', country: 'Turkey' },
  { name: 'Amsterdam', country: 'Netherlands' },
  { name: 'Prague', country: 'Czech Republic' },
  { name: 'Vienna', country: 'Austria' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Melbourne', country: 'Australia' },
  { name: 'Cape Town', country: 'South Africa' },
  { name: 'Marrakech', country: 'Morocco' },
  { name: 'Santorini', country: 'Greece' },
  { name: 'Maldives', country: 'Maldives' },
  { name: 'Phuket', country: 'Thailand' },
  { name: 'Hong Kong', country: 'China' },
  { name: 'Seoul', country: 'South Korea' },
  { name: 'Mumbai', country: 'India' },
  { name: 'Delhi', country: 'India' },
  { name: 'Bangalore', country: 'India' },
  { name: 'Hyderabad', country: 'India' },
  { name: 'Chennai', country: 'India' },
  { name: 'Kolkata', country: 'India' },
  { name: 'Ahmedabad', country: 'India' },
  { name: 'Pune', country: 'India' },
  { name: 'Goa', country: 'India' },
  { name: 'Jaipur', country: 'India' },
  { name: 'Udaipur', country: 'India' },
  { name: 'Agra', country: 'India' },
  { name: 'Varanasi', country: 'India' },
  { name: 'Kochi', country: 'India' },
  { name: 'Amritsar', country: 'India' },
  { name: 'Chandigarh', country: 'India' },
  { name: 'Leh', country: 'India' },
  { name: 'Srinagar', country: 'India' },
  { name: 'Shimla', country: 'India' },
  { name: 'Manali', country: 'India' },
  { name: 'Mysuru', country: 'India' },
  { name: 'Hampi', country: 'India' },
  { name: 'Pondicherry', country: 'India' },
  { name: 'Madurai', country: 'India' },
  { name: 'Surat', country: 'India' },
  { name: 'Indore', country: 'India' },
  { name: 'Lucknow', country: 'India' },
  { name: 'Bhopal', country: 'India' },
  { name: 'Jodhpur', country: 'India' },
  { name: 'Rishikesh', country: 'India' },
  { name: 'Darjeeling', country: 'India' },
  { name: 'Colombo', country: 'Sri Lanka' },
  { name: 'Kathmandu', country: 'Nepal' },
  { name: 'Lisbon', country: 'Portugal' },
  { name: 'Madrid', country: 'Spain' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Munich', country: 'Germany' },
  { name: 'Florence', country: 'Italy' },
  { name: 'Venice', country: 'Italy' },
  { name: 'Milan', country: 'Italy' },
  { name: 'Cairo', country: 'Egypt' },
  { name: 'Nairobi', country: 'Kenya' },
  { name: 'Lagos', country: 'Nigeria' },
  { name: 'Zanzibar', country: 'Tanzania' },
  { name: 'Buenos Aires', country: 'Argentina' },
  { name: 'Rio de Janeiro', country: 'Brazil' },
  { name: 'Mexico City', country: 'Mexico' },
  { name: 'Cancun', country: 'Mexico' },
  { name: 'Vancouver', country: 'Canada' },
  { name: 'Toronto', country: 'Canada' },
  { name: 'Los Angeles', country: 'USA' },
  { name: 'San Francisco', country: 'USA' },
  { name: 'Miami', country: 'USA' }
];

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
    <div className="fixed inset-0 z-[60] bg-obsidian flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-slate/50 px-4 md:px-8 flex items-center justify-between bg-ink shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={() => router.back()} className="text-muted hover:text-cream transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-sm md:text-xl font-playfair tracking-wider whitespace-nowrap">Curate Journey</h1>
            <div className="flex gap-1.5 mt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 w-6 md:w-8 rounded-full ${step >= i ? 'bg-gold' : 'bg-slate'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-3 md:px-6 py-2 text-xs md:text-sm text-muted hover:text-cream font-medium"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="bg-gold hover:bg-gold-light text-obsidian px-4 md:px-8 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4 hidden md:block" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="bg-gold hover:bg-gold-light text-obsidian px-4 md:px-8 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2"
            >
              Finish <Check className="w-4 h-4 hidden md:block" />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-obsidian/50 no-scrollbar">
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
                  <h2 className="text-3xl md:text-4xl font-playfair">Essentials</h2>
                  <p className="text-sm text-muted">Define the base of your luxury travel experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Journey Name</label>
                      <input 
                        type="text" 
                        value={tripInfo.name}
                        onChange={(e) => setTripInfo({ ...tripInfo, name: e.target.value })}
                        placeholder="e.g., The Aegean Odyssey"
                        className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:outline-none focus:border-gold transition-all text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Start Date</label>
                        <input 
                          type="date" 
                          value={tripInfo.startDate}
                          onChange={(e) => setTripInfo({ ...tripInfo, startDate: e.target.value })}
                          className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:outline-none focus:border-gold transition-all text-sm [color-scheme:dark]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">End Date</label>
                        <input 
                          type="date" 
                          value={tripInfo.endDate}
                          onChange={(e) => setTripInfo({ ...tripInfo, endDate: e.target.value })}
                          className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:outline-none focus:border-gold transition-all text-sm [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Budget Allocation</label>
                      <div className="relative">
                        <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                        <input 
                          type="number" 
                          value={tripInfo.budget}
                          onChange={(e) => setTripInfo({ ...tripInfo, budget: parseFloat(e.target.value) })}
                          className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Journey Icon</label>
                      <div className="flex flex-wrap gap-2 p-3 md:p-4 bg-slate/20 border border-slate/50 rounded-2xl">
                        {EMOJIS.map(e => (
                          <button 
                            key={e}
                            onClick={() => setTripInfo({ ...tripInfo, emoji: e })}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl hover:bg-gold/20 transition-all ${tripInfo.emoji === e ? 'bg-gold/30 border border-gold/50' : ''}`}
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
                  <h2 className="text-3xl md:text-4xl font-playfair">Destinations</h2>
                  <p className="text-sm text-muted">Map out your path. Layer cities and unique locations.</p>
                </div>

                <div className="space-y-6">
                  {stops.map((stop, i) => (
                    <div key={stop.id} className="glass-card p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center gap-6 relative">
                      <div className="hidden md:block text-muted">
                        <GripVertical className="w-5 h-5 cursor-grab" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
                        {/* Searchable City Dropdown */}
                        <div className="space-y-1 relative">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">City</label>
                          <div className="relative group/city">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted group-focus-within/city:text-gold transition-colors" />
                            <input 
                              type="text" 
                              value={stop.city}
                              onChange={(e) => handleStopChange(stop.id!, 'city', e.target.value)}
                              placeholder="Search city..."
                              className="w-full bg-slate/40 border border-slate/50 rounded-xl pl-9 pr-3 py-2.5 focus:border-gold outline-none transition-all text-sm"
                            />
                            
                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 right-0 mt-2 bg-obsidian border border-slate/50 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-focus-within/city:opacity-100 group-focus-within/city:visible transition-all z-[100] max-h-60 overflow-y-auto no-scrollbar">
                              {POPULAR_CITIES
                                .filter(c => c.name.toLowerCase().includes((stop.city || '').toLowerCase()))
                                .map(city => (
                                  <button
                                    key={city.name}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleStopChange(stop.id!, 'city', city.name);
                                      handleStopChange(stop.id!, 'country', city.country);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-gold hover:text-obsidian transition-colors border-b border-slate/50 last:border-0"
                                  >
                                    <span className="font-bold">{city.name}</span>
                                    <span className="text-[10px] uppercase ml-2 opacity-60 tracking-tighter">{city.country}</span>
                                  </button>
                                ))
                              }
                            </div>
                          </div>
                        </div>

                        {/* Read-only Country */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">Country</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted/50" />
                            <input 
                              type="text" 
                              value={stop.country}
                              readOnly
                              placeholder="Auto-filled"
                              className="w-full bg-slate/20 border border-slate/50 rounded-xl pl-8 pr-3 py-2.5 outline-none text-sm text-muted/80 cursor-not-allowed italic"
                            />
                          </div>
                        </div>

                        {/* Styled Arrival Date */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">Arrival</label>
                          <div className="relative group/date">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted group-focus-within/date:text-gold transition-colors pointer-events-none" />
                            <input 
                              type="date" 
                              value={stop.arrivalDate}
                              onChange={(e) => handleStopChange(stop.id!, 'arrivalDate', e.target.value)}
                              className="w-full bg-slate/40 border border-slate/50 rounded-xl pl-9 pr-3 py-2.5 focus:border-gold outline-none transition-all text-sm [color-scheme:dark]"
                            />
                          </div>
                        </div>

                        {/* Night Stepper */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted ml-1">Nights</label>
                          <div className="flex items-center bg-slate/40 border border-slate/50 rounded-xl overflow-hidden h-[42px]">
                            <button 
                              type="button"
                              onClick={() => handleStopChange(stop.id!, 'nights', Math.max(1, (stop.nights || 1) - 1))}
                              className="flex-1 h-full flex items-center justify-center hover:bg-gold/10 text-muted hover:text-gold transition-all border-r border-slate/50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input 
                              type="number" 
                              value={stop.nights}
                              onChange={(e) => handleStopChange(stop.id!, 'nights', parseInt(e.target.value) || 1)}
                              className="w-12 bg-transparent text-center text-sm font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button 
                              type="button"
                              onClick={() => handleStopChange(stop.id!, 'nights', (stop.nights || 1) + 1)}
                              className="flex-1 h-full flex items-center justify-center hover:bg-gold/10 text-muted hover:text-gold transition-all border-l border-slate/50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRemoveStop(stop.id!)}
                        className="absolute md:relative top-6 right-6 md:top-auto md:right-auto text-muted hover:text-ruby transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <button 
                    onClick={handleAddStop}
                    className="w-full py-5 border-2 border-dashed border-slate/50 rounded-[2rem] text-sm text-muted hover:text-gold hover:border-gold/50 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Add Destination Stop</span>
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
                className="space-y-12"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-3xl md:text-4xl font-playfair">Review Journey</h2>
                  <p className="text-sm text-muted">Final confirmation of your curated adventure.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Summary Donut */}
                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-64 md:h-64 -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate/30" />
                      <motion.circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" 
                        className="text-gold"
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * 0.75) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl md:text-4xl">{tripInfo.emoji}</span>
                      <p className="text-xl md:text-2xl font-bold mt-2">${tripInfo.budget.toLocaleString()}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Budget</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="glass-card p-6 rounded-3xl space-y-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Journey Title</p>
                        <p className="text-xl font-playfair text-gold">{tripInfo.name || 'Untitled Journey'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Duration</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gold/50" />
                            <p className="text-[10px] md:text-xs leading-tight">
                              {tripInfo.startDate ? new Date(tripInfo.startDate).toLocaleDateString() : '—'} <br/> 
                              {tripInfo.endDate ? new Date(tripInfo.endDate).toLocaleDateString() : '—'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Stops</p>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-teal/50" />
                            <p className="text-sm font-medium">{stops.length} locations</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Sequence</p>
                      <div className="space-y-3">
                        {stops.map((s, i) => (
                          <div key={s.id} className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-slate/50 flex items-center justify-center text-[10px] font-bold text-gold border border-slate/50">
                              {i + 1}
                            </div>
                            <span className="font-medium">{s.city || '...'}, {s.country || '...'}</span>
                            <span className="text-muted ml-auto text-xs">{s.nights} nights</span>
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
