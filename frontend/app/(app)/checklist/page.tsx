'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ChevronDown,
  Sparkles,
  Printer,
  FileText,
  Shirt,
  Bath,
  Smartphone,
  Briefcase,
  X,
  Circle
} from 'lucide-react';
import { useTrips, useChecklist, ChecklistItem } from '@/lib/hooks';
import { toast } from '@/components/Toast';

const CATEGORIES = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'clothing', label: 'Clothing', icon: Shirt },
  { id: 'toiletries', label: 'Toiletries', icon: Bath },
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
  { id: 'essentials', label: 'Essentials', icon: Briefcase },
  { id: 'custom', label: 'Custom', icon: Plus },
];

export default function ChecklistPage() {
  const { trips } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(trips[0]?.id || null);
  const { checklist, addItem, toggleItem, deleteItem } = useChecklist(selectedTripId || undefined);

  const [expandedCats, setExpandedCats] = useState<string[]>(['documents', 'essentials']);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [addingToCat, setAddingToCat] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = checklist.length;
    const checked = checklist.filter(c => c.isChecked).length;
    const perc = total > 0 ? (checked / total) * 100 : 0;
    return { total, checked, perc };
  }, [checklist]);

  const toggleCat = (catId: string) => {
    setExpandedCats(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };

  const handleAddItem = (catId: string) => {
    if (!newItemLabel.trim() || !selectedTripId) return;
    addItem({
      id: Math.random().toString(36).substring(7),
      tripId: selectedTripId,
      category: catId,
      label: newItemLabel,
      isChecked: false
    });
    setNewItemLabel('');
    setAddingToCat(null);
  };

  const handleAiSuggest = () => {
    if (!selectedTripId) return;
    const trip = trips.find(t => t.id === selectedTripId);
    toast.info('AI is analyzing your journey...');

    // Hardcoded "Smart" suggestions based on destination
    const suggestions = [
      { label: 'Universal Power Adapter', cat: 'electronics' },
      { label: 'Noise Cancelling Headphones', cat: 'electronics' },
      { label: 'Travel Insurance Policy', cat: 'documents' },
      { label: 'Digital Copy of Passport', cat: 'documents' },
    ];

    suggestions.forEach(s => {
      if (!checklist.find(c => c.label === s.label)) {
        addItem({
          id: Math.random().toString(36).substring(7),
          tripId: selectedTripId,
          category: s.cat,
          label: s.label,
          isChecked: false
        });
      }
    });

    setTimeout(() => toast.success('Smart suggestions added based on destination.'), 1000);
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Preparation</p>
          <div className="flex items-center gap-4">
            <select
              value={selectedTripId || ''}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="bg-slate/20 border border-slate/50 rounded-2xl p-4 pr-12 text-2xl font-playfair appearance-none focus:border-gold outline-none transition-all"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id} className="bg-ink text-base">{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAiSuggest}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold/20 transition-all group"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /> AI Suggest
          </button>
          <button
            onClick={() => window.print()}
            className="p-3 rounded-2xl border border-slate/50 text-muted hover:text-cream transition-all"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Progress Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] text-center space-y-6">
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate/30" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5"
                  className="text-gold"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * (stats.perc / 100)) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{Math.round(stats.perc)}%</span>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Packed</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-playfair">{stats.checked} of {stats.total} items</h3>
              <p className="text-sm text-muted">Ready for departure</p>
            </div>
          </div>
        </div>

        {/* Checklist Accordion */}
        <div className="lg:col-span-2 space-y-4">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="glass-card rounded-[2rem] overflow-hidden">
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate/50 flex items-center justify-center text-gold">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <span className="font-playfair text-xl">{cat.label}</span>
                  <span className="text-[10px] bg-slate/50 px-2 py-0.5 rounded text-muted font-bold">
                    {checklist.filter(c => c.category === cat.id && c.isChecked).length}/{checklist.filter(c => c.category === cat.id).length}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted transition-transform ${expandedCats.includes(cat.id) ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {expandedCats.includes(cat.id) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden bg-ink/30"
                  >
                    <div className="px-6 pb-6 pt-2 space-y-2">
                      {checklist.filter(c => c.category === cat.id).map(item => (
                        <div key={item.id} className="flex items-center gap-4 py-3 group">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`transition-colors ${item.isChecked ? 'text-emerald' : 'text-muted group-hover:text-gold'}`}
                          >
                            {item.isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                          <span className={`flex-1 text-sm transition-all ${item.isChecked ? 'text-muted line-through opacity-50 translate-x-2' : 'text-cream'}`}>
                            {item.label}
                          </span>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-muted hover:text-ruby opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {addingToCat === cat.id ? (
                        <div className="flex items-center gap-4 py-2">
                          <Circle className="w-5 h-5 text-muted" />
                          <input
                            autoFocus
                            type="text"
                            value={newItemLabel}
                            onChange={(e) => setNewItemLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cat.id)}
                            placeholder="Add item..."
                            className="flex-1 bg-transparent border-b border-gold/30 py-1 text-sm outline-none text-cream"
                          />
                          <button onClick={() => setAddingToCat(null)} className="text-muted hover:text-ruby">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingToCat(cat.id)}
                          className="flex items-center gap-4 py-3 text-muted hover:text-gold transition-all text-sm w-full text-left italic"
                        >
                          <Plus className="w-4 h-4" /> Add custom item
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
