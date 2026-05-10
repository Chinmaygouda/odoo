'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className={`glass-card rounded-full px-8 py-3 flex items-center justify-between transition-all duration-500 ${
          isScrolled ? 'bg-ink/80 backdrop-blur-xl border-slate/50 shadow-2xl' : 'bg-transparent border-transparent'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Plane className="text-obsidian w-4 h-4" />
            </div>
            <span className="font-playfair text-lg tracking-[0.2em] font-light text-cream group-hover:text-gold transition-colors">
              TRAVELOOP
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {['Experience', 'Ecosystem', 'Archives', 'Testimonials'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-[10px] uppercase tracking-[0.3em] text-muted hover:text-gold transition-colors font-bold"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/login">
              <button className="text-[10px] uppercase tracking-[0.3em] text-muted hover:text-gold transition-colors font-bold">
                Sign In
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="bg-gold hover:bg-gold-light text-obsidian px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all shadow-lg shadow-gold/10">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-muted hover:text-gold transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full p-8 md:hidden"
          >
            <div className="glass-card rounded-[2rem] p-8 space-y-8 flex flex-col items-center text-center">
              <nav className="flex flex-col gap-6">
                {['Experience', 'Ecosystem', 'Archives', 'Testimonials'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`}
                    className="text-sm uppercase tracking-[0.2em] text-muted hover:text-gold font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </nav>
              <div className="w-full h-[1px] bg-slate/50" />
              <div className="flex flex-col w-full gap-4">
                <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-4 rounded-2xl border border-slate/50 text-xs uppercase tracking-widest font-bold">
                    Sign In
                  </button>
                </Link>
                <Link href="/dashboard" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-4 rounded-2xl bg-gold text-obsidian text-xs uppercase tracking-widest font-bold">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
