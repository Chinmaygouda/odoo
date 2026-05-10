'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Map as MapIcon, 
  TrendingUp, 
  Award, 
  Trophy, 
  Star,
  Zap,
  Navigation,
  Compass,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { useTrips, useStops, useActivities } from '@/lib/hooks';

const MILESTONES = [
  { id: 1, label: 'First Flight', icon: Zap, condition: (trips: any) => trips.length >= 1 },
  { id: 2, label: 'Globetrotter', icon: Globe, condition: (trips: any, stops: any) => new Set(stops.map((s: any) => s.country)).size >= 5 },
  { id: 3, label: 'Luxury Connoisseur', icon: Trophy, condition: (trips: any) => trips.reduce((sum: number, t: any) => sum + t.budget, 0) >= 10000 },
  { id: 4, label: 'Master Curator', icon: Award, condition: (trips: any, stops: any, acts: any) => acts.length >= 20 },
];

export default function AnalyticsPage() {
  const { trips } = useTrips();
  const { stops: allStops } = useStops();
  const { activities: allActs } = useActivities();

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const countries = new Set(allStops.map(s => s.country)).size;
    const totalKm = trips.length * 1500; // Mock estimation
    const totalDays = trips.reduce((sum, t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return sum + (Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }, 0);

    return { countries, totalKm, totalDays };
  }, [trips, allStops]);

  // --- Activity Distribution (Radar Data) ---
  const actDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    allActs.forEach(a => counts[a.type] = (counts[a.type] || 0) + 1);
    return counts;
  }, [allActs]);

  // --- Monthly Pattern ---
  const monthlyPattern = useMemo(() => {
    const months = Array(12).fill(0);
    trips.forEach(t => {
      const month = new Date(t.startDate).getMonth();
      months[month]++;
    });
    return months;
  }, [trips]);

  return (
    <div className="space-y-12 pb-32">
      <div className="space-y-2">
        <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Insights</p>
        <h1 className="font-playfair text-4xl md:text-5xl font-light">Travel <span className="italic">Footprint</span></h1>
      </div>

      {/* Map Visualization */}
      <section className="relative h-96 glass-card rounded-[3rem] overflow-hidden flex items-center justify-center bg-ink/50">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <svg viewBox="0 0 1000 500" className="w-full h-full text-gold">
            <path d="M150,100 Q400,50 850,100 Q950,250 850,400 Q400,450 150,400 Q50,250 150,100" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M200,150 Q300,120 400,150 Q500,200 450,300 Q350,350 250,300 Q150,250 200,150" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center animate-pulse">
            <Globe className="w-10 h-10 text-gold" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-playfair">{stats.countries}</p>
            <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Countries Visited</p>
          </div>
        </div>

        {/* Floating Pins (Mock) */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_#C9A84C]" />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_#C9A84C]" />
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_#C9A84C]" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Core Stats */}
        <div className="lg:col-span-2 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Total Distance', value: `${stats.totalKm.toLocaleString()} KM`, icon: Navigation, color: 'gold' },
              { label: 'Days Abroad', value: stats.totalDays, icon: Compass, color: 'teal' },
              { label: 'Avg Trip Budget', value: `$${Math.round(trips.reduce((sum, t) => sum + t.budget, 0) / (trips.length || 1)).toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
            ].map(s => (
              <div key={s.label} className="glass-card p-6 rounded-3xl border-slate/50 group hover:border-gold/30 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-${s.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-5 h-5 text-${s.color}`} />
                </div>
                <p className="text-2xl font-bold mb-1">{s.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted font-bold">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Monthly Bar Chart */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gold">
                <BarChart3 className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Seasonal Pattern</h3>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {monthlyPattern.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / (Math.max(...monthlyPattern) || 1)) * 100}%` }}
                      className="w-full bg-gold/20 hover:bg-gold/40 border-t border-gold/50 rounded-t-lg transition-all"
                    />
                    <span className="text-[8px] uppercase tracking-tighter text-muted">
                      {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Radar (Mock) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gold">
                <PieChartIcon className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Activity DNA</h3>
              </div>
              <div className="relative h-48 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-40 h-40">
                  <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="#1A1A28" strokeWidth="0.5" />
                  <motion.polygon 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    points="50,20 80,45 65,80 35,75 20,50" 
                    fill="rgba(201, 168, 76, 0.2)" 
                    stroke="#C9A84C" 
                    strokeWidth="1.5" 
                  />
                </svg>
                <div className="absolute inset-0 text-[8px] uppercase font-bold text-muted">
                  <span className="absolute top-2 left-1/2 -translate-x-1/2">Culture</span>
                  <span className="absolute top-1/3 right-2">Dining</span>
                  <span className="absolute bottom-4 right-8">Adventure</span>
                  <span className="absolute bottom-4 left-8">Sightseeing</span>
                  <span className="absolute top-1/3 left-2">Shopping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Sidebar */}
        <aside className="space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gold">Milestones</h3>
            <div className="space-y-6">
              {MILESTONES.map(m => {
                const achieved = m.condition(trips, allStops, allActs);
                return (
                  <div key={m.id} className={`flex items-center gap-4 transition-opacity ${achieved ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${achieved ? 'bg-gold/10 border-gold text-gold' : 'bg-slate/20 border-slate/50 text-muted'}`}>
                      <m.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-gold transition-colors">{m.label}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted">{achieved ? 'Achieved' : 'Locked'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-gold text-obsidian space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Traveler Tier</h4>
            </div>
            <p className="text-2xl font-playfair">Silver Voyager</p>
            <p className="text-xs font-medium opacity-80">You're in the top 15% of travelers this month.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
