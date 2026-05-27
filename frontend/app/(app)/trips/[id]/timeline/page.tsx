'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  CircleDollarSign,
  Calendar,
  ChevronLeft,
  Camera,
  Utensils,
  Mountain,
  Theater,
  ShoppingBag,
  Car,
  Hotel,
  Activity as ActivityIcon,
  Plane,
  ArrowRight,
  Bus,
  Train
} from 'lucide-react';
import {
  useTrips,
  useStops,
  useActivities,
} from '@/lib/hooks';

const ACTIVITY_ICONS: Record<string, any> = {
  sightseeing: Camera,
  Sightseeing: Camera,
  food: Utensils,
  Food: Utensils,
  adventure: Mountain,
  Adventure: Mountain,
  culture: Theater,
  Culture: Theater,
  shopping: ShoppingBag,
  Shopping: ShoppingBag,
  transport: Car,
  Transport: Car,
  accommodation: Hotel,
  Accommodation: Hotel,
};

const ACTIVITY_COLORS: Record<string, string> = {
  sightseeing: 'gold',
  Sightseeing: 'gold',
  food: 'emerald',
  Food: 'emerald',
  adventure: 'ruby',
  Adventure: 'ruby',
  culture: 'teal',
  Culture: 'teal',
  shopping: 'slate',
  Shopping: 'slate',
  transport: 'muted',
  Transport: 'muted',
  accommodation: 'cream',
  Accommodation: 'cream',
};

export default function TripTimeline() {
  const { id: tripId } = useParams() as { id: string };
  const router = useRouter();

  const { trips } = useTrips();
  const trip = trips.find(t => t.id === tripId);

  const { stops } = useStops(tripId);
  const { activities } = useActivities(tripId);

  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!trip) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <Plane className="w-16 h-16 text-muted mx-auto animate-pulse" />
        <p className="text-muted font-playfair text-xl">Loading your journey...</p>
      </div>
    </div>
  );

  // Calculate trip days
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Group activities by day
  const dayGroups = useMemo(() => {
    const groups: { day: number; date: Date; activities: typeof activities }[] = [];
    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      const dayStr = dayDate.toISOString().split('T')[0];

      const dayActivities = activities.filter(a => {
        if (a.date) return a.date === dayStr;
        return false;
      });

      groups.push({ day: i + 1, date: dayDate, activities: dayActivities });
    }
    return groups;
  }, [activities, totalDays, startDate]);

  const totalCost = activities.reduce((sum, a) => sum + a.cost, 0);
  const budgetPercent = trip.budget > 0 ? Math.min((totalCost / trip.budget) * 100, 100) : 0;

  const currencySymbol: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹'
  };
  const symbol = currencySymbol[trip.currency] || trip.currency;

  return (
    <div className="space-y-10 pb-32">
      {/* Header */}
      <div className="space-y-6 border-b border-slate/50 pb-8">
        <button
          onClick={() => router.push('/trips')}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Journeys
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Trip Timeline</p>
            <h1 className="font-playfair text-4xl md:text-5xl">{trip.emoji} {trip.name}</h1>
            <div className="flex items-center gap-6 text-sm text-muted">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {stops.length} Stop{stops.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {totalDays} Day{totalDays !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="w-72 glass-card p-5 rounded-2xl space-y-3">
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
              <span className="text-muted">Budget</span>
              <span className={totalCost > trip.budget ? 'text-ruby' : 'text-emerald'}>
                {symbol}{totalCost.toLocaleString()} / {symbol}{trip.budget.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-slate/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${totalCost > trip.budget ? 'bg-ruby' : 'bg-gradient-to-r from-gold to-gold-light'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stops Summary Chips */}
      {stops.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {stops.map((stop, i) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate/20 border border-slate/50 text-sm"
            >
              <MapPin className="w-3 h-3 text-gold" />
              <span className="font-medium">{stop.city}</span>
              <span className="text-muted text-xs">({stop.country})</span>
              {i < stops.length - 1 && <ArrowRight className="w-3 h-3 text-muted ml-1" />}
            </motion.div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent" />

        <div className="space-y-6">
          {dayGroups.map((group, idx) => {
            const isExpanded = expandedDay === null || expandedDay === group.day;
            const hasActivities = group.activities.length > 0;

            return (
              <motion.div
                key={group.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Day marker */}
                <div
                  className="flex items-start gap-6 cursor-pointer group"
                  onClick={() => setExpandedDay(expandedDay === group.day ? null : group.day)}
                >
                  {/* Circle on the line */}
                  <div className={`relative z-10 w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    hasActivities
                      ? 'bg-gold/10 border border-gold/40 text-gold shadow-lg shadow-gold/10'
                      : 'bg-slate/20 border border-slate/50 text-muted'
                  } ${isExpanded && hasActivities ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <span className="text-lg font-bold leading-none">{group.day}</span>
                    <span className="text-[8px] uppercase tracking-wider font-bold mt-0.5">Day</span>
                  </div>

                  {/* Day header */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium group-hover:text-gold transition-colors">
                          {group.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <p className="text-xs text-muted">
                          {hasActivities
                            ? `${group.activities.length} activit${group.activities.length !== 1 ? 'ies' : 'y'} planned`
                            : 'Free day — no activities scheduled'}
                        </p>
                      </div>
                      {hasActivities && (
                        <span className="text-xs text-gold font-bold">
                          {symbol}{group.activities.reduce((s, a) => s + a.cost, 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activities for this day */}
                <AnimatePresence>
                  {isExpanded && hasActivities && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-[5.5rem] mt-4 space-y-3 overflow-hidden"
                    >
                      {group.activities.map((activity, aIdx) => {
                        const IconComponent = ACTIVITY_ICONS[activity.type] || ActivityIcon;
                        const color = ACTIVITY_COLORS[activity.type] || 'muted';

                        // Parse transit info from the name
                        const transitMatch = activity.name.match(/\((.+)\)/);
                        const mainName = activity.name.replace(/\s*\(.+\)\s*$/, '');
                        const transitInfo = transitMatch ? transitMatch[1] : null;

                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: aIdx * 0.08 }}
                            className="p-5 rounded-2xl bg-slate/10 border border-slate/30 hover:border-gold/30 transition-all group"
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${color}/10 flex-shrink-0`}>
                                <IconComponent className={`w-5 h-5 text-${color}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="font-medium text-base group-hover:text-gold transition-colors">{mainName}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {activity.time || '—'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <CircleDollarSign className="w-3 h-3" /> {symbol}{activity.cost}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-widest font-bold bg-${color}/10 text-${color}`}>
                                        {activity.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Transit Info */}
                                {transitInfo && (
                                  <div className="flex items-start gap-2 mt-2 p-3 rounded-xl bg-teal/5 border border-teal/20">
                                    <Bus className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-teal leading-relaxed">{transitInfo}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* No activities state */}
      {activities.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate/20 flex items-center justify-center mx-auto border-2 border-dashed border-slate/50">
            <Plane className="w-10 h-10 text-muted" />
          </div>
          <h3 className="text-2xl font-playfair">No itinerary generated yet</h3>
          <p className="text-muted max-w-md mx-auto">
            Activities will appear here once the AI generates your trip plan. Go back to create a new trip to get started!
          </p>
        </div>
      )}
    </div>
  );
}
