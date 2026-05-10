'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDollarSign, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Trash2, 
  ChevronDown,
  AlertTriangle,
  ArrowUpRight,
  Receipt,
  PieChart as PieChartIcon,
  X
} from 'lucide-react';
import { useTrips, useExpenses, Expense } from '@/lib/hooks';
import { toast } from '@/components/Toast';

const CATEGORIES = [
  { value: 'transport', label: 'Transport', color: '#C9A84C' },
  { value: 'food', label: 'Dining', color: '#2DD4BF' },
  { value: 'accommodation', label: 'Stay', color: '#E8C96A' },
  { value: 'sightseeing', label: 'Sightseeing', color: '#6B6B7A' },
  { value: 'shopping', label: 'Shopping', color: '#E85D75' },
  { value: 'other', label: 'Other', color: '#10B981' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'JPY', symbol: '¥', rate: 151.45 },
  { code: 'INR', symbol: '₹', rate: 83.31 },
];

export default function BudgetAnalysis() {
  const { trips } = useTrips();
  const { expenses: allExpenses, addExpense, deleteExpense } = useExpenses();
  
  const [selectedTripId, setSelectedTripId] = useState<string | null>(trips[0]?.id || null);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const tripExpenses = allExpenses.filter(e => e.tripId === selectedTripId);

  // --- Calculations ---
  const totals = useMemo(() => {
    const total = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = CATEGORIES.map(cat => ({
      ...cat,
      amount: tripExpenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0)
    }));
    return { total, byCategory };
  }, [tripExpenses]);

  const isOverBudget = selectedTrip ? totals.total > selectedTrip.budget : false;

  // Form State
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'other',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) return;

    addExpense({
      ...newExpense as Expense,
      id: Math.random().toString(36).substring(7),
      tripId: selectedTripId,
      currency: 'USD'
    });

    setNewExpense({ description: '', amount: 0, category: 'other', date: new Date().toISOString().split('T')[0] });
    setIsAddingExpense(false);
    toast.success('Expense logged successfully.');
  };

  // --- Chart Data ---
  const donutPaths = useMemo(() => {
    let currentAngle = 0;
    return totals.byCategory.filter(c => c.amount > 0).map(cat => {
      const percentage = cat.amount / (totals.total || 1);
      const angle = percentage * 360;
      const path = {
        ...cat,
        startAngle: currentAngle,
        endAngle: currentAngle + angle
      };
      currentAngle += angle;
      return path;
    });
  }, [totals]);

  const convert = (amount: number) => (amount * currency.rate).toLocaleString(undefined, { minimumFractionDigits: 2 });

  if (!selectedTrip && trips.length > 0) {
     setSelectedTripId(trips[0].id);
  }

  return (
    <div className="space-y-12 pb-32">
      {/* Budget Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Financials</p>
          <div className="flex items-center gap-4">
            <div className="relative group min-w-[300px]">
              <select 
                value={selectedTripId || ''} 
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 pr-12 text-2xl font-playfair appearance-none focus:border-gold outline-none transition-all"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id} className="bg-ink text-base">{t.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex bg-slate/20 p-1 rounded-2xl border border-slate/50">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => setCurrency(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currency.code === c.code ? 'bg-gold text-obsidian' : 'text-muted hover:text-cream'}`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {isOverBudget && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-[2rem] bg-ruby/10 border-2 border-ruby/30 flex items-center gap-6 shadow-2xl shadow-ruby/10 animate-pulse"
        >
          <div className="w-12 h-12 rounded-2xl bg-ruby text-white flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-ruby uppercase tracking-widest text-xs">Over Budget Alert</h3>
            <p className="text-cream/80 text-sm">You have exceeded your curated budget for this journey by {currency.symbol}{convert(totals.total - selectedTrip!.budget)}.</p>
          </div>
        </motion.div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Visual Charts */}
        <div className="lg:col-span-2 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Donut Chart */}
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-64 h-64 -rotate-90">
                {donutPaths.length > 0 ? donutPaths.map((p, i) => {
                  const x1 = 50 + 40 * Math.cos((p.startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((p.startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((p.endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((p.endAngle * Math.PI) / 180);
                  const largeArcFlag = p.endAngle - p.startAngle <= 180 ? 0 : 1;
                  return (
                    <motion.path
                      key={p.value}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      d={`M ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                      fill="none"
                      stroke={p.color}
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                  );
                }) : (
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1A1A28" strokeWidth="12" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold">{currency.symbol}{convert(totals.total)}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Total Spent</p>
              </div>
            </div>

            {/* Category Bars */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gold">Breakdown</h3>
              <div className="space-y-5">
                {totals.byCategory.map(cat => {
                  const perc = totals.total > 0 ? (cat.amount / totals.total) * 100 : 0;
                  return (
                    <div key={cat.value} className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted">{cat.label}</span>
                        <span>{currency.symbol}{convert(cat.amount)}</span>
                      </div>
                      <div className="h-1.5 bg-slate/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${perc}%` }}
                          style={{ backgroundColor: cat.color }}
                          className="h-full rounded-full" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simple Expense Log */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-playfair">Expense Log</h2>
              <button 
                onClick={() => setIsAddingExpense(true)}
                className="text-[10px] md:text-xs uppercase tracking-widest text-gold hover:text-gold-light font-bold flex items-center gap-2 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> Log Expense
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              {tripExpenses.length > 0 ? tripExpenses.map(exp => (
                <div key={exp.id} className="glass-card p-4 md:p-5 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gold/30 transition-all">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate/50 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm md:text-base text-cream">{exp.description}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] md:text-xs text-muted">
                        <span className="uppercase tracking-widest font-bold text-gold/80">{exp.category}</span>
                        <span>•</span>
                        <span>{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate/10 pt-3 sm:pt-0 w-full sm:w-auto">
                    <span className="font-bold text-lg md:text-xl text-cream">
                      {currency.symbol}{convert(exp.amount)}
                    </span>
                    <button 
                      onClick={() => { deleteExpense(exp.id); toast.success('Expense removed.'); }}
                      className="p-2 -mr-2 text-muted hover:text-ruby transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="glass-card p-12 rounded-[2rem] text-center text-muted italic opacity-50 flex flex-col items-center justify-center">
                  <Receipt className="w-12 h-12 mb-4 opacity-50" />
                  <p>No expenses logged for this journey.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <aside className="space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gold">Summary</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-emerald" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Average Daily</p>
                  <p className="text-xl font-bold">{currency.symbol}{convert(totals.total / (selectedTrip ? 5 : 1))}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Top Category</p>
                  <p className="text-xl font-bold capitalize">{totals.byCategory.sort((a, b) => b.amount - a.amount)[0]?.label || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-ink/50 border-gold/10 space-y-4">
            <div className="flex items-center gap-2 text-gold">
              <Receipt className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-widest">Travel Tip</h4>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Always keep a reserve of 10-15% for unexpected premium experiences or local finds.
            </p>
          </div>
        </aside>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAddingExpense && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingExpense(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-[3rem] p-10 shadow-2xl border-gold/30"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-playfair">Log Expense</h3>
                <button onClick={() => setIsAddingExpense(false)} className="text-muted hover:text-cream">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Description</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                    placeholder="e.g., Dinner at Jules Verne"
                    className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Amount ($)</label>
                    <input 
                      type="number" 
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                      required
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Category</label>
                    <div className="relative">
                      <select 
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 appearance-none focus:border-gold outline-none transition-all"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value} className="bg-ink">{cat.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Date</label>
                  <input 
                    type="date" 
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    required
                    className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gold hover:bg-gold-light text-obsidian font-bold py-4 rounded-2xl transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                >
                  Log Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

