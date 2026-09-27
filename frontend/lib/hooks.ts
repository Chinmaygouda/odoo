'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/app/lib/api';

// --- Types ---

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  city?: string;
  country?: string;
  currency: string;
  language: string;
}

export interface Stop {
  id: string;
  tripId: string;
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  notes?: string;
}

export interface Activity {
  id: string;
  stopId: string;
  tripId: string;
  name: string;
  type: 'sightseeing' | 'food' | 'adventure' | 'culture' | 'shopping' | 'transport' | 'accommodation' | 'other';
  cost: number;
  currency: string;
  duration: number; // minutes
  date: string;
  time: string;
  bookingRef?: string;
  isBooked: boolean;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  currency: string;
}

export interface ChecklistItem {
  id: string;
  tripId: string;
  category: string;
  label: string;
  isChecked: boolean;
}

export interface Note {
  id: string;
  tripId: string;
  stopId?: string;
  title: string;
  content: string;
  date: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  emoji: string;
  status: 'All' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Draft';
  description: string;
  shareToken: string;
  customMapUrl?: string;
  createdAt: number;
}

// --- Generic LocalStorage Hook ---

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
      setIsLoaded(true);
    } catch (error) {
      console.log(error);
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch a custom event so other hooks can update
        window.dispatchEvent(new Event('local-storage-update'));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  // Listen for updates from other tabs or same tab
  useEffect(() => {
    const handleUpdate = () => {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    };

    window.addEventListener('local-storage-update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('local-storage-update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [key]);

  return [storedValue, setValue, isLoaded] as const;
}

// --- Specific Hooks ---

export function useAuth() {
  const [user, setUser, isLoaded] = useLocalStorage<User | null>('tl_user', null);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);
  const updateProfile = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return { user, login, logout, updateProfile, isLoaded };
}

export function useTrips() {
  const [trips, setTrips, isLoaded] = useLocalStorage<Trip[]>('tl_trips', []);

  const addTrip = (trip: Trip) => setTrips([...trips, trip]);
  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(trips.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteTrip = (id: string) => {
    setTrips(trips.filter(t => t.id !== id));
    // Also delete associated data
    const stops = JSON.parse(localStorage.getItem('tl_stops') || '[]') as Stop[];
    localStorage.setItem('tl_stops', JSON.stringify(stops.filter(s => s.tripId !== id)));
    
    const activities = JSON.parse(localStorage.getItem('tl_activities') || '[]') as Activity[];
    localStorage.setItem('tl_activities', JSON.stringify(activities.filter(a => a.tripId !== id)));
    
    const expenses = JSON.parse(localStorage.getItem('tl_expenses') || '[]') as Expense[];
    localStorage.setItem('tl_expenses', JSON.stringify(expenses.filter(e => e.tripId !== id)));
    
    const checklist = JSON.parse(localStorage.getItem('tl_checklist') || '[]') as ChecklistItem[];
    localStorage.setItem('tl_checklist', JSON.stringify(checklist.filter(c => c.tripId !== id)));
    
    const notes = JSON.parse(localStorage.getItem('tl_notes') || '[]') as Note[];
    localStorage.setItem('tl_notes', JSON.stringify(notes.filter(n => n.tripId !== id)));
    
    window.dispatchEvent(new Event('local-storage-update'));
  };

  return { trips, addTrip, updateTrip, deleteTrip, isLoaded };
}

export function useStops(tripId?: string) {
  const [allStops, setAllStops, isLoaded] = useLocalStorage<Stop[]>('tl_stops', []);
  
  const stops = tripId ? allStops.filter(s => s.tripId === tripId) : allStops;

  const addStop = (stop: Stop) => setAllStops([...allStops, stop]);
  const updateStop = (id: string, updates: Partial<Stop>) => {
    setAllStops(allStops.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteStop = (id: string) => {
    setAllStops(allStops.filter(s => s.id !== id));
    // Associated activities
    const activities = JSON.parse(localStorage.getItem('tl_activities') || '[]') as Activity[];
    localStorage.setItem('tl_activities', JSON.stringify(activities.filter(a => a.stopId !== id)));
    window.dispatchEvent(new Event('local-storage-update'));
  };
  const reorderStops = (newStops: Stop[]) => {
    const otherStops = allStops.filter(s => s.tripId !== tripId);
    setAllStops([...otherStops, ...newStops]);
  };

  return { stops, addStop, updateStop, deleteStop, reorderStops, isLoaded };
}

export function useActivities(tripId?: string, stopId?: string) {
  const [allActivities, setAllActivities, isLoaded] = useLocalStorage<Activity[]>('tl_activities', []);
  
  const activities = allActivities.filter(a => {
    if (stopId) return a.stopId === stopId;
    if (tripId) return a.tripId === tripId;
    return true;
  });

  const addActivity = (activity: Activity) => setAllActivities([...allActivities, activity]);
  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setAllActivities(allActivities.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  const deleteActivity = (id: string) => setAllActivities(allActivities.filter(a => a.id !== id));

  return { activities, addActivity, updateActivity, deleteActivity, isLoaded };
}

export function useExpenses(tripId?: string) {
  const [allExpenses, setAllExpenses, isLoaded] = useLocalStorage<Expense[]>('tl_expenses', []);
  
  const expenses = tripId ? allExpenses.filter(e => e.tripId === tripId) : allExpenses;

  const addExpense = (expense: Expense) => setAllExpenses([...allExpenses, expense]);
  const deleteExpense = (id: string) => setAllExpenses(allExpenses.filter(e => e.id !== id));

  return { expenses, addExpense, deleteExpense, isLoaded };
}

export function useChecklist(tripId?: string) {
  const [allChecklist, setAllChecklist, isLoaded] = useLocalStorage<ChecklistItem[]>('tl_checklist', []);
  
  const checklist = tripId ? allChecklist.filter(c => c.tripId === tripId) : allChecklist;

  const addItem = (item: ChecklistItem) => setAllChecklist([...allChecklist, item]);
  const toggleItem = (id: string) => {
    setAllChecklist(allChecklist.map(c => c.id === id ? { ...c, isChecked: !c.isChecked } : c));
  };
  const deleteItem = (id: string) => setAllChecklist(allChecklist.filter(c => c.id !== id));

  return { checklist, addItem, toggleItem, deleteItem, isLoaded };
}

export function useNotes(tripId?: string) {
  const [allNotes, setAllNotes, isLoaded] = useLocalStorage<Note[]>('tl_notes', []);

  // Sync from backend on mount and when tripId changes
  useEffect(() => {
    async function syncNotes() {
      try {
        const endpoint = tripId && tripId !== 'All' 
          ? `/trips/${tripId}/journal` 
          : `/trips/journal/all`;
        const res = await apiFetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped: Note[] = data.map((entry: any) => ({
              id: entry.id.toString(),
              tripId: entry.trip_id.toString(),
              stopId: entry.stop_id ? entry.stop_id.toString() : undefined,
              title: entry.title,
              content: entry.body,
              date: entry.date
            }));
            
            // Merge with local notes or update
            setAllNotes(prev => {
              const existingIds = new Set(mapped.map(m => m.id));
              // Keep local notes that haven't synced yet (e.g. non-numeric ids)
              const unsynced = prev.filter(p => !existingIds.has(p.id) && isNaN(Number(p.id)));
              return [...mapped, ...unsynced];
            });
          }
        }
      } catch (err) {
        console.warn('Backend journal sync failed, relying on localStorage:', err);
      }
    }

    if (typeof window !== 'undefined') {
      syncNotes();
    }
  }, [tripId, setAllNotes]);

  const notes = tripId && tripId !== 'All' ? allNotes.filter(n => n.tripId === tripId) : allNotes;

  const addNote = async (note: Note) => {
    // 1. Optimistic update
    setAllNotes(prev => [note, ...prev]);

    // 2. Persist to backend if numeric tripId
    try {
      const tripIdNum = parseInt(note.tripId, 10);
      if (!isNaN(tripIdNum)) {
        const payload = {
          title: note.title,
          body: note.content,
          stop_id: note.stopId && !isNaN(parseInt(note.stopId)) ? parseInt(note.stopId) : null,
          tags: ""
        };
        const res = await apiFetch(`/trips/${tripIdNum}/journal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const saved = await res.json();
          // Update the optimistic entry with real server ID and date
          setAllNotes(prev => prev.map(n => n.id === note.id ? {
            ...n,
            id: saved.id.toString(),
            date: saved.date
          } : n));
        }
      }
    } catch (e) {
      console.warn('Failed to save journal entry to backend:', e);
    }
  };

  const deleteNote = async (id: string) => {
    const target = allNotes.find(n => n.id === id);
    setAllNotes(prev => prev.filter(n => n.id !== id));

    if (target && !isNaN(Number(id))) {
      try {
        const tripIdNum = parseInt(target.tripId, 10);
        if (!isNaN(tripIdNum)) {
          await apiFetch(`/trips/${tripIdNum}/journal/${id}`, {
            method: 'DELETE'
          });
        }
      } catch (e) {
        console.warn('Failed to delete journal entry from backend:', e);
      }
    }
  };

  return { notes, addNote, deleteNote, isLoaded };
}
