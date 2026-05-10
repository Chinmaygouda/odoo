'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Map as MapIcon, 
  Clock, 
  CircleDollarSign, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Calendar,
  NotebookPen
} from 'lucide-react';
import { useAuth, useTrips, useStops, useExpenses, Trip } from '@/lib/hooks';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const { trips } = useTrips();
  const { stops: allStops } = useStops();
  const { expenses: allExpenses } = useExpenses();

  // --- Real Stats Calculation ---
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const countries = new Set(allStops.map(s => s.country)).size;
    
    let totalDays = 0;
    trips.forEach(t => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      totalDays += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    });

    const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0);

    return [
      { label: 'Total Trips', value: totalTrips, icon: MapIcon, color: 'gold' },
      { label: 'Countries', value: countries, icon: Plane, color: 'teal' },
      { label: 'Days Traveled', value: totalDays, icon: Clock, color: 'gold' },
      { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: CircleDollarSign, color: 'emerald' },
    ];
  }, [trips, allStops, allExpenses]);

  // --- Upcoming Trip Countdown ---
  const upcomingTrip = useMemo(() => {
    const now = new Date();
    return trips
      .filter(t => new Date(t.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  }, [trips]);

  const daysUntil = useMemo(() => {
    if (!upcomingTrip) return null;
    const now = new Date();
    const start = new Date(upcomingTrip.startDate);
    return Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, [upcomingTrip]);

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Section */}
      <section className="relative h-64 md:h-80 rounded-[3rem] overflow-hidden group">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-slate to-obsidian">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(201,168,76,0.15)_0%,transparent_70%)]" 
          />
        </div>

        <div className="relative h-full flex flex-col justify-center px-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Welcome Back</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-light">
              Good morning, <span className="italic">{user?.name.split(' ')[0]}</span>
            </h1>
          </motion.div>
          <p className="text-muted max-w-md text-sm md:text-base">
            Your next adventure awaits. You have {trips.length} active journeys and {upcomingTrip ? `${daysUntil} days until your next trip.` : 'no upcoming trips planned.'}
          </p>
        </div>

        {/* Quick Action FABs */}
        <div className="absolute right-8 bottom-8 flex gap-3">
          <Link href="/trips/new">
            <button className="w-14 h-14 rounded-2xl bg-gold hover:bg-gold-light text-obsidian flex items-center justify-center shadow-xl shadow-gold/20 transition-all hover:scale-110 active:scale-95 group/btn">
              <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-500" />
            </button>
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl group hover:border-gold/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-slate/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}`} />
            </div>
            <p className="text-2xl font-bold tracking-tight mb-1">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest text-muted font-bold">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Trips */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-playfair">Recent Journeys</h2>
            <Link href="/trips" className="text-xs uppercase tracking-widest text-gold hover:text-gold-light flex items-center gap-2 group">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.length > 0 ? (
              trips.slice(0, 4).map((trip) => (
                <div className="glass-card p-6 rounded-3xl hover:border-gold/40 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl">{trip.emoji}</span>
                  </div>
                  <div className="space-y-4">
                    <Link href={`/trips/${trip.id}/view`} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate flex items-center justify-center text-lg">{trip.emoji}</span>
                      <h3 className="font-medium group-hover:text-gold transition-colors">{trip.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald" />
                          <span>{trip.status}</span>
                        </div>
                      </div>
                      <Link href={`/trips/${trip.id}/builder`}>
                        <button className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light font-bold">
                          Builder
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 glass border-dashed rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate/30 flex items-center justify-center">
                  <Plane className="w-8 h-8 text-muted" />
                </div>
                <div className="space-y-1">
                  <p className="text-cream font-medium">No trips planned yet</p>
                  <p className="text-muted text-sm">Start your first luxury experience today.</p>
                </div>
                <Link href="/trips/new">
                  <button className="text-xs uppercase tracking-widest bg-gold text-obsidian px-6 py-3 rounded-full font-bold hover:bg-gold-light transition-all">
                    Create Trip
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Trending Destinations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">Editorial Picks</h2>
          <div className="space-y-4">
            {[
              { city: 'Santorini', country: 'Greece', gradient: 'from-blue-600/20 to-teal-400/20' },
              { city: 'Kyoto', country: 'Japan', gradient: 'from-ruby/20 to-gold/20' },
              { city: 'Amalfi', country: 'Italy', gradient: 'from-emerald/20 to-blue-400/20' },
            ].map((dest) => (
              <div key={dest.city} className={`h-32 rounded-3xl bg-gradient-to-br ${dest.gradient} border border-slate/50 p-6 flex flex-col justify-end group cursor-pointer hover:border-gold/30 transition-all`}>
                <p className="text-xs uppercase tracking-widest text-gold font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">{dest.country}</p>
                <h3 className="text-xl font-playfair group-hover:text-gold transition-colors">{dest.city}</h3>
              </div>
            ))}
          </div>
          
          <div className="glass-card p-6 rounded-3xl bg-gold/5 border-gold/20">
            <div className="flex items-center gap-3 mb-4">
              <NotebookPen className="w-5 h-5 text-gold" />
              <h3 className="font-playfair text-lg text-gold">Travel Tip</h3>
            </div>
            <p className="text-sm text-cream/70 leading-relaxed italic">
              "The world is a book and those who do not travel read only one page." - St. Augustine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
