'use client';

import { useState, useEffect } from 'react';
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
  ArrowRight,
  Map as MapIcon,
  Upload,
  Trash2,
  Image as ImageIcon,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useTrips, useStops, useActivities } from '@/lib/hooks';
import { apiFetch, API_BASE } from '@/app/lib/api';
import { toast } from '@/components/Toast';

export default function ItineraryView() {
  const { id: tripId } = useParams() as { id: string };
  const router = useRouter();
  
  const { trips, updateTrip } = useTrips();
  const trip = trips.find(t => t.id === tripId);
  
  const { stops } = useStops(tripId);
  const { activities } = useActivities(tripId);

  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'map'>('timeline');
  const [customMapUrl, setCustomMapUrl] = useState<string | null>(trip?.customMapUrl || null);
  const [isUploadingMap, setIsUploadingMap] = useState(false);

  useEffect(() => {
    if (trip?.customMapUrl) {
      setCustomMapUrl(trip.customMapUrl);
    }
  }, [trip?.customMapUrl]);

  if (!trip) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/shared/${trip.shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Itinerary link copied to clipboard.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingMap(true);
    try {
      const res = await apiFetch(`/trips/${tripId}/custom-map`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = data.custom_map_url.startsWith('http')
          ? data.custom_map_url
          : `${API_BASE}${data.custom_map_url}`;
        
        setCustomMapUrl(fullUrl);
        updateTrip(tripId, { customMapUrl: fullUrl });
        toast.success('Custom Journey Map uploaded successfully.');
      } else {
        const err = await res.text();
        toast.error('Failed to upload map: ' + err);
      }
    } catch (err: any) {
      toast.error('Error uploading map image: ' + err.message);
    } finally {
      setIsUploadingMap(false);
    }
  };

  const handleDeleteMap = async () => {
    try {
      await apiFetch(`/trips/${tripId}/custom-map`, { method: 'DELETE' });
      setCustomMapUrl(null);
      updateTrip(tripId, { customMapUrl: undefined });
      toast.success('Custom map removed.');
    } catch (err) {
      toast.error('Could not remove custom map.');
    }
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
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-gold text-obsidian' : 'text-muted hover:text-cream'}`}
            >
              <MapIcon className="w-4 h-4" /> Journey Map
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
        ) : viewMode === 'map' ? (
          <div className="space-y-8">
            {customMapUrl ? (
              <div className="glass-card rounded-[3rem] p-8 border border-gold/30 space-y-6 relative overflow-hidden shadow-2xl">
                {/* Header Controls for Map */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate/50">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Curated Route Map</p>
                    <h3 className="text-2xl font-playfair">Custom Voyage Roadmap</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-slate/30 hover:bg-slate/50 text-cream px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-slate/50 transition-all">
                      <Upload className="w-3.5 h-3.5 text-gold" />
                      {isUploadingMap ? 'Uploading...' : 'Replace Map'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleMapUpload}
                        disabled={isUploadingMap}
                      />
                    </label>
                    <button 
                      onClick={handleDeleteMap}
                      className="p-2 rounded-xl hover:bg-ruby/20 text-muted hover:text-ruby border border-slate/50 transition-all"
                      title="Remove Map"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Map Image Viewer */}
                <div className="relative w-full rounded-[2rem] overflow-hidden border border-slate/50 bg-ink/80 flex items-center justify-center min-h-[420px]">
                  <img 
                    src={customMapUrl} 
                    alt="Custom Journey Map" 
                    className="w-full h-auto max-h-[650px] object-contain rounded-[2rem]"
                  />
                </div>

                {/* Waypoint Sequence */}
                <div className="pt-4 space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-muted font-bold">Route Waypoints & Destinations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {stops.map((stop, idx) => (
                      <div key={stop.id} className="p-4 rounded-2xl bg-slate/20 border border-slate/50 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{stop.city}</p>
                          <p className="text-[11px] text-muted truncate">{stop.country} • {stop.nights} nights</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-[3rem] p-12 border border-slate/50 text-center space-y-6 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gold/10 border-2 border-dashed border-gold/30 flex items-center justify-center">
                  <MapIcon className="w-10 h-10 text-gold animate-pulse" />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h3 className="text-3xl font-playfair">Custom Journey Map</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    Upload your own illustrated travel roadmap, route infographic, or customized journey map to personalize your voyage archives.
                  </p>
                </div>

                <label className="cursor-pointer bg-gold hover:bg-gold-light text-obsidian px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-gold/20 hover:scale-105 active:scale-95">
                  <Upload className="w-4 h-4" />
                  {isUploadingMap ? 'Uploading Roadmap...' : 'Upload Roadmap Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleMapUpload}
                    disabled={isUploadingMap}
                  />
                </label>

                <p className="text-[11px] text-muted tracking-wider">
                  Supported formats: PNG, JPG, WEBP, SVG • High-resolution images recommended
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 glass-card rounded-[3rem] opacity-60">
            <CalendarDays className="w-16 h-16 text-gold mb-4" />
            <h3 className="text-2xl font-playfair">Calendar View Coming Soon</h3>
            <p className="text-muted max-w-sm">We are refining the luxury calendar experience. For now, please use the Timeline or Journey Map view.</p>
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

