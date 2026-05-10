'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, Github, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { toast } from '@/components/Toast';

// ─── Destination ring items ───
const ringDestinations = [
  'TOKYO', 'PARIS', 'BALI', 'SANTORINI', 'REYKJAVIK',
  'MARRAKECH', 'KYOTO', 'AMALFI', 'PETRA', 'HAVANA',
  'PRAGUE', 'CAPE TOWN', 'DUBAI', 'MACHU PICCHU', 'MALDIVES',
];

// ─── Canvas: Portal particle system ───
function PortalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;
    const t = Date.now() * 0.001;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    ctx.clearRect(0, 0, w, h);

    // ── Star field ──
    for (let i = 0; i < 120; i++) {
      const seed = i * 97.53;
      const sx = ((seed * 7.31) % w);
      const sy = ((seed * 3.89) % h);
      const flicker = Math.sin(t * 2 + seed) * 0.3 + 0.5;
      const size = (seed % 3) * 0.4 + 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flicker * 0.3})`;
      ctx.fill();
    }

    // ── Portal ring glow ──
    const portalR = Math.min(w, h) * 0.32;
    const portalGlow = ctx.createRadialGradient(cx, cy, portalR * 0.7, cx, cy, portalR * 1.3);
    portalGlow.addColorStop(0, 'rgba(212, 175, 55, 0)');
    portalGlow.addColorStop(0.4, `rgba(212, 175, 55, ${0.03 + Math.sin(t) * 0.01})`);
    portalGlow.addColorStop(0.7, `rgba(45, 212, 191, ${0.02 + Math.sin(t * 1.3) * 0.01})`);
    portalGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, portalR * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = portalGlow;
    ctx.fill();

    // ── Portal ring (double) ──
    for (let ring = 0; ring < 2; ring++) {
      const rOff = ring * 12;
      ctx.beginPath();
      for (let a = 0; a <= 360; a += 1) {
        const rad = (a * Math.PI) / 180;
        const wobble = Math.sin(rad * 6 + t * 0.8 + ring) * 3 + Math.sin(rad * 11 - t * 0.5) * 2;
        const r = portalR + rOff + wobble;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = ring === 0
        ? `rgba(212, 175, 55, ${0.25 + Math.sin(t) * 0.1})`
        : `rgba(45, 212, 191, ${0.15 + Math.sin(t * 1.2) * 0.08})`;
      ctx.lineWidth = ring === 0 ? 1.5 : 0.8;
      ctx.stroke();
    }

    // ── Streaming particles toward center ──
    for (let i = 0; i < 80; i++) {
      const seed = i * 137.508 + 42;
      const lifeT = ((t * 0.3 + seed * 0.01) % 1); // 0→1 lifecycle
      const startAngle = (seed % 360) * (Math.PI / 180);
      const startDist = portalR * 1.8 + (seed % 100);

      // Lerp from edge toward portal ring
      const dist = startDist * (1 - lifeT * 0.7);
      const angle = startAngle + lifeT * 0.3;
      const px = cx + dist * Math.cos(angle);
      const py = cy + dist * Math.sin(angle);

      const alpha = lifeT < 0.1 ? lifeT * 10 : lifeT > 0.8 ? (1 - lifeT) * 5 : 1;
      const size = 1 + (1 - lifeT) * 1.5;

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0
        ? `rgba(212, 175, 55, ${alpha * 0.5})`
        : `rgba(45, 212, 191, ${alpha * 0.4})`;
      ctx.fill();
    }

    // ── Inner portal shimmer ──
    const shimmerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, portalR * 0.9);
    shimmerGrad.addColorStop(0, `rgba(212, 175, 55, ${0.02 + Math.sin(t * 1.5) * 0.01})`);
    shimmerGrad.addColorStop(0.5, `rgba(45, 212, 191, ${0.01})`);
    shimmerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, portalR * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = shimmerGrad;
    ctx.fill();

    // ── Mouse-reactive light ──
    const lightGrad = ctx.createRadialGradient(mx * w, my * h, 0, mx * w, my * h, 200);
    lightGrad.addColorStop(0, 'rgba(212, 175, 55, 0.03)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(mx * w, my * h, 200, 0, Math.PI * 2);
    ctx.fillStyle = lightGrad;
    ctx.fill();

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
  );
}

// ─── Orbiting destination names ───
function OrbitRing() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ perspective: 1000 }}
    >
      {ringDestinations.map((name, i) => {
        const angle = (i / ringDestinations.length) * 360;
        const rad = (angle * Math.PI) / 180;
        // Position on elliptical orbit
        const rx = 42; // % from center
        const ry = 38;
        const x = 50 + rx * Math.cos(rad);
        const y = 50 + ry * Math.sin(rad);

        return (
          <motion.span
            key={name}
            className="absolute font-mono text-[9px] tracking-[0.4em] whitespace-nowrap"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              color: i % 2 === 0 ? 'rgba(212, 175, 55, 0.25)' : 'rgba(45, 212, 191, 0.2)',
            }}
          >
            {name}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

// ─── Main page ───
export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoaded } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (isLoaded && user) router.push('/dashboard');
  }, [user, isLoaded, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    try {
      if (isLogin) {
        const users = JSON.parse(localStorage.getItem('tl_registered_users') || '[]');
        const found = users.find((u: any) => u.email === email && u.password === password);
        if (found) {
          login({ id: found.id, name: found.name, email: found.email, currency: 'USD', language: 'en' });
          toast.success(`Welcome back, ${found.name}`);
          router.push('/dashboard');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        const users = JSON.parse(localStorage.getItem('tl_registered_users') || '[]');
        if (users.find((u: any) => u.email === email)) { toast.error('User already exists'); setIsLoading(false); return; }
        const newUser = { id: Math.random().toString(36).substring(7), name, email, password };
        localStorage.setItem('tl_registered_users', JSON.stringify([...users, newUser]));
        login({ id: newUser.id, name: newUser.name, email: newUser.email, currency: 'USD', language: 'en' });
        toast.success('Account created successfully');
        router.push('/dashboard');
      }
    } catch { toast.error('Authentication failed'); }
    finally { setIsLoading(false); }
  };

  const continueAsGuest = () => {
    login({ id: 'guest', name: 'Guest Traveler', email: 'guest@traveloop.com', currency: 'USD', language: 'en' });
    toast.info('Logged in as Guest');
    router.push('/dashboard');
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#030306]" />;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030306]">
      {/* Canvas background */}
      <PortalCanvas />

      {/* Orbiting destination names */}
      <OrbitRing />

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,3,6,0.85)_100%)]" />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
            <span className="text-gold text-sm">✈</span>
          </div>
          <span className="font-mono text-[10px] text-gold/60 tracking-[0.4em] uppercase">Traveloop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-mono text-[9px] text-teal-400/50 tracking-[0.3em]">SECURE GATEWAY</span>
        </div>
      </motion.div>

      {/* ─── Central floating card ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        {/* Card glow */}
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-gold/10 via-transparent to-teal-500/10 blur-xl opacity-60" />

        <div className="relative rounded-[2rem] border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl p-10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          {/* Decorative corner accents */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold/20 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold/20 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold/20 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold/20 rounded-br-lg" />

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="font-mono text-[9px] tracking-[0.5em] text-teal-400/50 uppercase mb-3">
                {isLogin ? 'Identity Verification' : 'New Traveler Registration'}
              </p>
              <h1 className="font-playfair text-4xl font-light text-cream/90 mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Journey'}
              </h1>
              <p className="text-[13px] text-white/30 font-light">
                {isLogin
                  ? 'Enter your credentials to access your expeditions.'
                  : 'Create your account and begin exploring.'}
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-mono ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold/60 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required={!isLogin}
                      placeholder="Your name"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-12 pr-4 text-cream/90 text-sm placeholder:text-white/15 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all duration-300"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-mono ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold/60 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="traveler@luxury.com"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-12 pr-4 text-cream/90 text-sm placeholder:text-white/15 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-mono">Password</label>
                {isLogin && (
                  <button type="button" className="text-[9px] uppercase tracking-wider text-gold/50 hover:text-gold transition-colors">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold/60 transition-colors" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-12 pr-12 text-cream/90 text-sm placeholder:text-white/15 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-4 rounded-xl font-mono text-[11px] uppercase tracking-[0.3em] font-bold overflow-hidden transition-all duration-500 disabled:opacity-50 group mt-2"
            >
              {/* Button bg gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold via-gold to-amber-500 opacity-90 group-hover:opacity-100 transition-opacity" />
              {/* Shine sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <span className="relative z-10 flex items-center justify-center gap-2 text-[#030306]">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#030306]/30 border-t-[#030306] rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Initiate Access' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/[0.06]" />
            <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/20">or</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/[0.06]" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all text-[11px] text-white/50 hover:text-white/80 font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all text-[11px] text-white/50 hover:text-white/80 font-medium">
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          {/* Toggle + Guest */}
          <div className="mt-7 text-center space-y-4">
            <p className="text-[13px] text-white/30">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gold/80 font-semibold ml-1.5 hover:text-gold transition-colors hover:underline decoration-gold/30 underline-offset-4"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            <button
              onClick={continueAsGuest}
              className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/20 hover:text-teal-400/60 transition-colors duration-300"
            >
              Continue as Guest →
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-8"
      >
        <span className="font-mono text-[8px] text-white/15 tracking-[0.3em]">256-BIT ENCRYPTION</span>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span className="font-mono text-[8px] text-white/15 tracking-[0.3em]">SOC2 COMPLIANT</span>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span className="font-mono text-[8px] text-white/15 tracking-[0.3em]">GDPR READY</span>
      </motion.div>
    </div>
  );
}
