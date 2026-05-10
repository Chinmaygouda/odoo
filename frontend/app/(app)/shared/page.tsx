'use client';

import { motion } from 'framer-motion';
import { Globe, Share2, Shield, Eye } from 'lucide-react';
import { useTrips } from '@/lib/hooks';
import Link from 'next/link';

export default function SharedPage() {
  const { trips, isLoaded } = useTrips();

  if (!isLoaded) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Connectivity</p>
        <h1 className="font-playfair text-4xl md:text-5xl font-light">Shared Journeys</h1>
        <p className="text-muted max-w-2xl">Manage your public itinerary links and collaborative travel plans. All shared journeys are protected with unique access tokens.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[2.5rem] border border-slate/50 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-32 h-32 text-gold" />
          </div>
          <h2 className="text-2xl font-playfair">Active Shares</h2>
          <div className="space-y-4">
            {trips.length > 0 ? (
              trips.slice(0, 3).map(trip => (
                <div key={trip.id} className="flex items-center justify-between p-4 bg-slate/20 rounded-2xl border border-slate/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{trip.emoji}</span>
                    <span className="text-sm font-medium">{trip.name}</span>
                  </div>
                  <Link href={`/shared/${trip.shareToken}`} target="_blank">
                    <button className="p-2 hover:bg-gold/10 rounded-lg text-gold transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted italic">No journeys shared yet.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] border border-slate/50 bg-gold/5 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center">
            <Share2 className="w-10 h-10 text-gold" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-playfair">Invite Collaborators</h3>
            <p className="text-muted text-sm max-w-[280px]">Share your luxury travel plans with friends or family with a single link.</p>
          </div>
          <Link href="/trips">
            <button className="bg-gold text-obsidian px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gold-light transition-all shadow-lg shadow-gold/20">
              Go to Archives
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
