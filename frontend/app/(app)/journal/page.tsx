'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  MapPin, 
  Calendar, 
  MoreVertical,
  X,
  NotebookPen
} from 'lucide-react';
import { useTrips, useStops, useNotes, Note } from '@/lib/hooks';
import { toast } from '@/components/Toast';

export default function JournalPage() {
  const { trips } = useTrips();
  const { stops: allStops } = useStops();
  const { notes: allNotes, addNote, deleteNote } = useNotes();
  
  const [selectedTripId, setSelectedTripId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Form State
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tripId: trips[0]?.id || '',
    stopId: '',
  });

  const filteredNotes = useMemo(() => {
    return allNotes
      .filter(n => {
        const matchesTrip = selectedTripId === 'All' || n.tripId === selectedTripId;
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             n.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTrip && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allNotes, selectedTripId, searchQuery]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.tripId) return;

    addNote({
      id: Math.random().toString(36).substring(7),
      tripId: newNote.tripId,
      stopId: newNote.stopId || undefined,
      title: newNote.title,
      content: newNote.content,
      date: new Date().toISOString()
    });

    setNewNote({ ...newNote, title: '', content: '', stopId: '' });
    setIsAddingNote(false);
    toast.success('Memory captured in your journal.');
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Chronicles</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-light">Trip <span className="italic">Journal</span></h1>
        </div>

        <button 
          onClick={() => setIsAddingNote(true)}
          className="bg-gold hover:bg-gold-light text-obsidian px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-gold/20"
        >
          <Plus className="w-5 h-5" /> New Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters */}
        <aside className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gold">Filter by Journey</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedTripId('All')}
                className={`text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  selectedTripId === 'All' ? 'bg-gold/10 text-gold font-bold' : 'text-muted hover:text-cream'
                }`}
              >
                All Entries
              </button>
              {trips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    selectedTripId === trip.id ? 'bg-gold/10 text-gold font-bold' : 'text-muted hover:text-cream'
                  }`}
                >
                  {trip.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
            />
          </div>
        </aside>

        {/* Notes Feed */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => {
                const trip = trips.find(t => t.id === note.tripId);
                const stop = allStops.find(s => s.id === note.stopId);
                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-8 rounded-[2.5rem] group hover:border-gold/30 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <BookOpen className="w-24 h-24" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-playfair group-hover:text-gold transition-colors">{note.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-muted">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(note.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1 text-gold"><MapPin className="w-3 h-3" /> {trip?.name}</span>
                            {stop && <span className="flex items-center gap-1 text-teal">📍 {stop.city}</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => { deleteNote(note.id); toast.success('Entry removed.'); }}
                          className="text-muted hover:text-ruby opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <p className="text-cream/70 leading-relaxed max-w-2xl whitespace-pre-wrap">{note.content}</p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                <NotebookPen className="w-16 h-16 text-muted" />
                <div className="space-y-1">
                  <h3 className="text-2xl font-playfair italic">Start writing about your adventures</h3>
                  <p className="text-sm">Every journey has a story worth telling.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Note Modal */}
      <AnimatePresence>
        {isAddingNote && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingNote(false)}
              className="absolute inset-0 bg-obsidian/90 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-[3rem] p-10 shadow-2xl border-gold/30"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-playfair">Journal Entry</h3>
                <button onClick={() => setIsAddingNote(false)} className="text-muted hover:text-cream">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    required
                    placeholder="e.g., A rainy afternoon at the Louvre"
                    className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Relate to Journey</label>
                    <select 
                      value={newNote.tripId}
                      onChange={(e) => setNewNote({ ...newNote, tripId: e.target.value, stopId: '' })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 appearance-none focus:border-gold outline-none transition-all"
                    >
                      {trips.map(t => (
                        <option key={t.id} value={t.id} className="bg-ink">{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Specific Stop (Optional)</label>
                    <select 
                      value={newNote.stopId}
                      onChange={(e) => setNewNote({ ...newNote, stopId: e.target.value })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 appearance-none focus:border-gold outline-none transition-all"
                    >
                      <option value="" className="bg-ink">None</option>
                      {allStops.filter(s => s.tripId === newNote.tripId).map(s => (
                        <option key={s.id} value={s.id} className="bg-ink">{s.city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Content</label>
                  <textarea 
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    required
                    rows={6}
                    placeholder="Capture your thoughts..."
                    className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gold hover:bg-gold-light text-obsidian font-bold py-4 rounded-2xl transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                >
                  Save to Chronicles
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
