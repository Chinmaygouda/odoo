'use client';

import { useState, useEffect } from 'react';
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
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { apiFetch } from '@/app/lib/api';
import { useTrips, useStops, Trip, Stop } from '@/lib/hooks';
import { toast } from '@/components/Toast';

const EMOJIS = ['✈️', '🏝️', '🏔️', '🏙️', '🚢', '🏯', '🏜️', '🌋', '🏕️', '🛤️', '🎡', '🎢', '⛲', '🎨', '🎭', '🏰', '🗿', '🗽', '🗼', '⛩️'];

function CityAutocomplete({ value, onChange, placeholder, onSelectCountry }: { value: string, onChange: (val: string) => void, placeholder: string, onSelectCountry?: (country: string) => void }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(value)}&format=json&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch (e) { }
    }, 500);
    return () => clearTimeout(delay);
  }, [value]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="w-full bg-slate/40 border border-slate/50 rounded-xl px-3 py-2 focus:border-gold outline-none transition-all text-sm"
      />
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-ink border border-gold/30 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((s, idx) => {
              const parts = s.display_name.split(', ');
              const country = parts[parts.length - 1];
              const city = s.name || parts[0];
              return (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gold/20 cursor-pointer text-sm text-cream transition-colors border-b border-slate/10 last:border-0"
                  onClick={() => {
                    onChange(city);
                    if (onSelectCountry) onSelectCountry(country);
                    setSuggestions([]);
                  }}
                >
                  {city} <span className="text-muted text-[10px] ml-1">({country})</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NewTrip() {
  const router = useRouter();
  const { addTrip } = useTrips();
  const { addStop } = useStops();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);

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
  const [startLocation, setStartLocation] = useState({ city: '', country: '' });
  const [stops, setStops] = useState<Partial<Stop>[]>([
    { id: '1', city: '', country: '', arrivalDate: '', departureDate: '', nights: 1 }
  ]);

  const handleAddStop = () => {
    // default arrival date to previous stop's estimated departure or trip's start date
    const lastStop = stops[stops.length - 1];
    let newArrivalDate = tripInfo.startDate;
    if (lastStop && lastStop.arrivalDate && lastStop.nights) {
      const d = new Date(lastStop.arrivalDate);
      d.setDate(d.getDate() + lastStop.nights);
      newArrivalDate = d.toISOString().split('T')[0];
    }
    setStops([...stops, { id: Math.random().toString(36).substring(7), city: '', country: '', arrivalDate: newArrivalDate, departureDate: '', nights: 1 }]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length > 1) setStops(stops.filter(s => s.id !== id));
  };

  const handleStopChange = (id: string, field: keyof Stop, value: any) => {
    setStops(stops.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleMoveStopUp = (index: number) => {
    if (index === 0) return;
    const newStops = [...stops];
    const temp = newStops[index - 1];
    newStops[index - 1] = newStops[index];
    newStops[index] = temp;
    setStops(newStops);
  };

  const handleMoveStopDown = (index: number) => {
    if (index === stops.length - 1) return;
    const newStops = [...stops];
    const temp = newStops[index + 1];
    newStops[index + 1] = newStops[index];
    newStops[index] = temp;
    setStops(newStops);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!tripInfo.name) {
        setValidationError('A trip with no name? 🥺 What should I whisper to you when we arrive?');
        return;
      }
      if (!tripInfo.startDate) {
        setValidationError('Don\'t tease me with "someday". 😉 Pick a start date so we can mark our calendars!');
        return;
      }
      if (!tripInfo.endDate) {
        setValidationError('Are we running away forever? 🏃 Give me an end date so I know when to bring you back.');
        return;
      }
      if (!tripInfo.budget || tripInfo.budget <= 0) {
        setValidationError('Running on love and fresh air? 💸 Let\'s put a tiny budget on this just in case!');
        return;
      }
      if (new Date(tripInfo.endDate) < new Date(tripInfo.startDate)) {
        setValidationError('Time traveler alert! 🕰️ You can\'t end your trip before it even starts. Let\'s fix those dates.');
        return;
      }

      // Auto populate first stop arrival date from trip start date if empty
      if (stops[0].arrivalDate === '') {
        const newStops = [...stops];
        newStops[0].arrivalDate = tripInfo.startDate;
        setStops(newStops);
      }
    } else if (step === 2) {
      if (!startLocation.city) {
        setValidationError('Playing hide and seek? 🙈 I need your starting city so I know where to pick you up!');
        return;
      }
      if (!startLocation.country) {
        setValidationError('Just the city? 🌍 Tell me your starting country so I don\'t end up on the wrong continent!');
        return;
      }
      if (stops.some(s => !s.city)) {
        setValidationError('A secret destination? 🤫 Please tell me the city you want to explore!');
        return;
      }
      if (stops.some(s => !s.country)) {
        setValidationError('Which country is that in? 🗺️ Give me the country so I can chart the perfect course for us.');
        return;
      }
    }
    setStep(step + 1);
  };

  const getAuthToken = async (): Promise<string | null> => {
    let token = localStorage.getItem('access_token');
    if (!token) {
      // Silently get a guest token
      const res = await apiFetch('/auth/guest-session', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        token = data.access_token;
        localStorage.setItem('access_token', token!);
      }
    }
    return token;
  };

  const handleSubmit = async () => {
    try {
      const startPoint = `${startLocation.city}, ${startLocation.country}`;
      const destinationCity = stops[0]?.city || "Unknown";
      const destinationCountry = stops[0]?.country || "Unknown";

      const payload = {
        name: tripInfo.name || `Trip to ${destinationCity}`,
        start_point: startPoint,
        destination_city: destinationCity,
        destination_country: destinationCountry,
        start_date: tripInfo.startDate ? new Date(tripInfo.startDate).toISOString() : new Date().toISOString(),
        end_date: tripInfo.endDate ? new Date(tripInfo.endDate).toISOString() : new Date().toISOString(),
        budget: tripInfo.budget,
        currency: tripInfo.currency
      };

      // 1. Get token (silently creates guest session if none exists)
      let token = await getAuthToken();

      let response = await apiFetch('/trips/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      // If token expired, silently refresh and retry once
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        token = await getAuthToken();
        response = await apiFetch('/trips/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`Backend Error: ${errorText}`);
      }

      const generatedTrip = await response.json();
      const frontendTripId = generatedTrip.id.toString();

      // 2. Save Trip to localStorage hooks
      const existingTrips = JSON.parse(localStorage.getItem('tl_trips') || '[]');
      const newTrip: Trip = {
        id: frontendTripId,
        name: generatedTrip.name,
        startDate: generatedTrip.start_date,
        endDate: generatedTrip.end_date,
        budget: generatedTrip.budget,
        currency: generatedTrip.currency,
        emoji: tripInfo.emoji,
        description: `An AI curated trip to ${destinationCity}`,
        status: 'Upcoming',
        shareToken: generatedTrip.share_token || Math.random().toString(36).substring(10),
        createdAt: Date.now()
      };
      localStorage.setItem('tl_trips', JSON.stringify([...existingTrips, newTrip]));

      // 3. Save Stops
      const existingStops = JSON.parse(localStorage.getItem('tl_stops') || '[]');
      const stopId = generatedTrip.stops && generatedTrip.stops[0] ? generatedTrip.stops[0].id.toString() : Math.random().toString(36).substring(7);
      const newStop: Stop = {
        id: stopId,
        tripId: frontendTripId,
        city: destinationCity,
        country: destinationCountry,
        arrivalDate: generatedTrip.start_date,
        departureDate: generatedTrip.end_date,
        nights: Math.ceil((new Date(generatedTrip.end_date).getTime() - new Date(generatedTrip.start_date).getTime()) / (1000 * 60 * 60 * 24)) || 1
      };
      localStorage.setItem('tl_stops', JSON.stringify([...existingStops, newStop]));

      // 4. Save AI Activities
      const backendActivities = generatedTrip.stops && generatedTrip.stops[0] && generatedTrip.stops[0].activities ? generatedTrip.stops[0].activities : [];
      if (backendActivities.length > 0) {
        const existingActivities = JSON.parse(localStorage.getItem('tl_activities') || '[]');
        const frontendActivities = backendActivities.map((a: any, index: number) => {
          const tripStart = new Date(generatedTrip.start_date);
          tripStart.setDate(tripStart.getDate() + (index % newStop.nights));
          return {
            id: a.id.toString(),
            tripId: frontendTripId,
            stopId: stopId,
            name: a.name,
            type: a.type || 'sightseeing',
            cost: a.cost,
            currency: generatedTrip.currency,
            duration: 120,
            date: tripStart.toISOString().split('T')[0],
            time: new Date(a.time).toTimeString().substring(0, 5) || '10:00',
            isBooked: false
          };
        });
        localStorage.setItem('tl_activities', JSON.stringify([...existingActivities, ...frontendActivities]));
      }

      toast.success('Your AI journey has been curated.');
      window.dispatchEvent(new Event('local-storage-update'));
      router.push(`/trips/${frontendTripId}/timeline`);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'AI Generation failed. Check backend connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-obsidian flex flex-col">
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              className="bg-ink border-2 border-gold/50 rounded-[3rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(201,168,76,0.15)] text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto bg-slate/20 rounded-full flex items-center justify-center text-4xl border border-gold/30">
                😅
              </div>
              <h3 className="text-2xl font-playfair text-gold">Oops! Hold on a second...</h3>
              <p className="text-cream text-sm leading-relaxed">
                {validationError}
              </p>
              <button
                onClick={() => setValidationError(null)}
                className="w-full py-4 bg-gold hover:bg-gold-light text-obsidian rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-gold/20"
              >
                My Bad, I'll Fix It!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              onClick={handleNextStep}
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
                      <div className="flex gap-2">
                        <select
                          value={tripInfo.currency}
                          onChange={(e) => setTripInfo({ ...tripInfo, currency: e.target.value })}
                          className="w-24 bg-slate/20 border border-slate/50 rounded-2xl px-4 py-4 focus:outline-none focus:border-gold transition-all appearance-none cursor-pointer text-center text-sm font-bold"
                        >
                          <option value="USD" className="text-obsidian">USD</option>
                          <option value="EUR" className="text-obsidian">EUR</option>
                          <option value="GBP" className="text-obsidian">GBP</option>
                          <option value="JPY" className="text-obsidian">JPY</option>
                          <option value="INR" className="text-obsidian">INR</option>
                        </select>
                        <div className="relative flex-1">
                          <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                          <input
                            type="number"
                            value={Number.isNaN(tripInfo.budget) || tripInfo.budget === 0 ? '' : tripInfo.budget}
                            onChange={(e) => setTripInfo({ ...tripInfo, budget: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold transition-all"
                          />
                        </div>
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

                <div className="space-y-6">
                  {/* Start Location */}
                  <div className="space-y-2 mb-8">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted font-bold ml-1">Start Place (Only One)</label>
                    <div className="glass-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 z-50">
                        <label className="text-[10px] uppercase font-bold text-muted ml-1">City</label>
                        <CityAutocomplete
                          value={startLocation.city}
                          onChange={(v) => setStartLocation({ ...startLocation, city: v })}
                          onSelectCountry={(c) => setStartLocation(prev => ({ ...prev, country: c }))}
                          placeholder="e.g. New York"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted ml-1">Country</label>
                        <input
                          type="text"
                          value={startLocation.country}
                          onChange={(e) => setStartLocation({ ...startLocation, country: e.target.value })}
                          placeholder="e.g. USA"
                          className="w-full bg-slate/40 border border-slate/50 rounded-xl px-3 py-2 focus:border-gold outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="text-xs uppercase tracking-[0.2em] text-muted font-bold ml-1">Destination Places</label>
                  <div className="space-y-4">
                    {stops.map((stop, i) => (
                      <div key={stop.id} className="glass-card p-6 rounded-3xl flex items-center gap-6">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleMoveStopUp(i)}
                            disabled={i === 0}
                            className={`p-1 rounded-md transition-colors ${i === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gold/20 text-muted hover:text-gold'}`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveStopDown(i)}
                            disabled={i === stops.length - 1}
                            className={`p-1 rounded-md transition-colors ${i === stops.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gold/20 text-muted hover:text-gold'}`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                          <div className="space-y-1 z-40">
                            <label className="text-[10px] uppercase font-bold text-muted ml-1">City</label>
                            <CityAutocomplete
                              value={stop.city || ''}
                              onChange={(v) => handleStopChange(stop.id!, 'city', v)}
                              onSelectCountry={(c) => handleStopChange(stop.id!, 'country', c)}
                              placeholder="Paris"
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
