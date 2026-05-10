'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// Global trigger function
export const toast = {
  success: (msg: string) => window.dispatchEvent(new CustomEvent('toast', { detail: { message: msg, type: 'success' } })),
  error: (msg: string) => window.dispatchEvent(new CustomEvent('toast', { detail: { message: msg, type: 'error' } })),
  info: (msg: string) => window.dispatchEvent(new CustomEvent('toast', { detail: { message: msg, type: 'info' } })),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const { message, type } = e.detail;
      const id = Math.random().toString(36).substring(7);
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl glass border-l-4 ${
              t.type === 'success' ? 'border-emerald shadow-emerald/20' : 
              t.type === 'error' ? 'border-ruby shadow-ruby/20' : 
              'border-gold shadow-gold/20'
            } shadow-2xl min-w-[300px]`}
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-ruby" />}
            {t.type === 'info' && <CheckCircle className="w-5 h-5 text-gold" />}
            
            <p className="text-sm font-medium text-cream flex-1">{t.message}</p>
            
            <button 
              onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
              className="text-muted hover:text-cream transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
