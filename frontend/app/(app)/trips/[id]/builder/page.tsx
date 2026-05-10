'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Clock, 
  CircleDollarSign, 
  Calendar, 
  Trash2, 
  ChevronRight,
  Utensils,
  Camera,
  Mountain,
  Theater,
  ShoppingBag,
  Car,
  Hotel,
  Activity as ActivityIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  X
} from 'lucide-react';
import { 
  useTrips, 
  useStops, 
  useActivities, 
  Stop, 
  Activity 
} from '@/lib/hooks';
import { toast } from '@/components/Toast';

const ACTIVITY_TYPES = [
  { value: 'sightseeing', label: 'Sightseeing', icon: Camera, color: 'gold' },
  { value: 'food', label: 'Dining', icon: Utensils, color: 'emerald' },
  { value: 'adventure', label: 'Adventure', icon: Mountain, color: 'ruby' },
  { value: 'culture', label: 'Culture', icon: Theater, color: 'teal' },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'slate' },
  { value: 'transport', label: 'Transport', icon: Car, color: 'muted' },
  { value: 'accommodation', label: 'Stay', icon: Hotel, color: 'cream' },
  { value: 'other', label: 'Other', icon: ActivityIcon, color: 'muted' },
] as const;

export default function ItineraryBuilder() {
  const { id: tripId } = useParams() as { id: string };
  const router = useRouter();
  
  const { trips } = useTrips();
  const trip = trips.find(t => t.id === tripId);
  
  const { stops, deleteStop, reorderStops } = useStops(tripId);
  const { activities, addActivity, deleteActivity, updateActivity } = useActivities(tripId);

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  
  // Form State
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: '',
    type: 'sightseeing',
    cost: 0,
    duration: 60,
    time: '10:00',
    isBooked: false
  });

  const selectedStop = stops.find(s => s.id === selectedStopId) || stops[0];

  useMemo(() => {
    if (stops.length > 0 && !selectedStopId) {
      setSelectedStopId(stops[0].id);
    }
  }, [stops, selectedStopId]);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStopId) return;

    const activity: Activity = {
      ...newActivity as Activity,
      id: Math.random().toString(36).substring(7),
      tripId: tripId,
      stopId: selectedStopId,
      date: selectedStop!.arrivalDate,
      currency: trip?.currency || 'USD'
    };

    addActivity(activity);
    setNewActivity({ name: '', type: 'sightseeing', cost: 0, duration: 60, time: '10:00', isBooked: false });
    setIsAddingActivity(false);
    toast.success('Activity added to itinerary.');
  };

  const totalCost = activities.reduce((sum, a) => sum + a.cost, 0);
  const budgetProgress = trip ? Math.min((totalCost / trip.budget) * 100, 100) : 0;

  if (!trip) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-8">
      {/* Builder Header */}
      <div className="flex items-end justify-between border-b border-slate/50 pb-6">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Journeys
          </button>
          <div className="space-y-1">
            <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Itinerary Builder</p>
            <h1 className="font-playfair text-4xl">{trip.name}</h1>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {stops.length} Stops</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(trip.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
            <span className="text-muted">Budget Utilized</span>
            <span className={totalCost > trip.budget ? 'text-ruby' : 'text-emerald'}>${totalCost.toLocaleString()} / ${trip.budget.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-slate/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${budgetProgress}%` }}
              className={`h-full ${totalCost > trip.budget ? 'bg-ruby' : 'bg-gold'}`} 
            />
          </div>
        </div>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Left: Stops List */}
        <div className="w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-muted">Stops List</h3>
            <button className="text-gold hover:text-gold-light"><Plus className="w-4 h-4" /></button>
          </div>
          
          <Reorder.Group 
            axis="y" 
            values={stops} 
            onReorder={reorderStops}
            className="flex-1 overflow-y-auto no-scrollbar space-y-3"
          >
            {stops.map((stop) => (
              <Reorder.Item 
                key={stop.id} 
                value={stop}
                className={`cursor-pointer transition-all ${selectedStopId === stop.id ? 'z-10' : 'z-0'}`}
              >
                <div 
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
                    selectedStopId === stop.id 
                      ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5' 
                      : 'bg-slate/20 border-slate/50 hover:border-slate'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    selectedStopId === stop.id ? 'bg-gold text-obsidian' : 'bg-slate/50 text-muted'
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${selectedStopId === stop.id ? 'text-gold' : 'text-cream'}`}>{stop.city}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider">{stop.country}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted transition-transform ${selectedStopId === stop.id ? 'rotate-90 text-gold' : ''}`} />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Right: Activities Panel */}
        <div className="flex-1 glass-card rounded-[2.5rem] flex flex-col overflow-hidden">
          {selectedStop ? (
            <>
              <div className="p-8 border-b border-slate/50 flex items-center justify-between bg-ink/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-gold/10 flex items-center justify-center text-2xl">
                    📍
                  </div>
                  <div>
                    <h2 className="text-3xl font-playfair">{selectedStop.city}, {selectedStop.country}</h2>
                    <p className="text-sm text-muted">{new Date(selectedStop.arrivalDate).toLocaleDateString()} — {selectedStop.nights} Nights</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddingActivity(true)}
                  className="bg-gold hover:bg-gold-light text-obsidian px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-gold/10"
                >
                  <Plus className="w-5 h-5" />
                  Add Activity
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {activities.filter(a => a.stopId === selectedStopId).length > 0 ? (
                      activities.filter(a => a.stopId === selectedStopId).map((activity) => {
                        const typeInfo = ACTIVITY_TYPES.find(t => t.value === activity.type);
                        return (
                          <motion.div
                            key={activity.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-5 rounded-3xl bg-slate/20 border border-slate/50 hover:border-gold/30 transition-all flex items-center gap-6 group"
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${typeInfo?.color}/10`}>
                              {typeInfo && <typeInfo.icon className={`w-6 h-6 text-${typeInfo.color}`} />}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-lg">{activity.name}</h4>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-widest font-bold bg-${typeInfo?.color}/10 text-${typeInfo?.color}`}>
                                  {activity.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.time} • {activity.duration}m</span>
                                <span className="flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> ${activity.cost}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => updateActivity(activity.id, { isBooked: !activity.isBooked })}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                  activity.isBooked ? 'bg-emerald/20 border-emerald text-emerald' : 'border-slate/50 text-muted hover:border-gold/50'
                                }`}
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => deleteActivity(activity.id)}
                                className="w-10 h-10 rounded-full flex items-center justify-center border border-slate/50 text-muted hover:text-ruby hover:border-ruby/50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="py-20 text-center space-y-4 opacity-50">
                        <ActivityIcon className="w-12 h-12 text-muted mx-auto" />
                        <p className="text-muted italic">No activities planned for this stop yet.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
              <MapPin className="w-16 h-16 text-muted mb-4" />
              <h3 className="text-2xl font-playfair">Select a stop to begin</h3>
              <p className="text-muted">Plan your daily activities for each destination in your journey.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {isAddingActivity && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingActivity(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl glass-card rounded-[3rem] p-10 shadow-2xl border-gold/20"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-playfair">New Activity</h3>
                <button onClick={() => setIsAddingActivity(false)} className="text-muted hover:text-cream">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddActivity} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold">Activity Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    required
                    placeholder="e.g., Louvre Museum Guided Tour"
                    className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold">Type</label>
                    <div className="relative">
                      <select 
                        value={newActivity.type}
                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
                        className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all appearance-none"
                      >
                        {ACTIVITY_TYPES.map(t => (
                          <option key={t.value} value={t.value} className="bg-ink">{t.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold">Cost</label>
                    <div className="relative">
                      <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                      <input 
                        type="number" 
                        value={newActivity.cost}
                        onChange={(e) => setNewActivity({ ...newActivity, cost: parseFloat(e.target.value) })}
                        className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold">Time</label>
                    <input 
                      type="time" 
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold">Duration (min)</label>
                    <input 
                      type="number" 
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gold hover:bg-gold-light text-obsidian font-bold py-4 rounded-2xl transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                >
                  Confirm Activity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
