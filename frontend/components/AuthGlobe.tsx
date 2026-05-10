'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const destinations = [
  { city: 'Tokyo', code: 'TYO', lat: '35.67°N', lng: '139.65°E' },
  { city: 'Paris', code: 'CDG', lat: '48.85°N', lng: '2.35°E' },
  { city: 'Santorini', code: 'JTR', lat: '36.39°N', lng: '25.46°E' },
  { city: 'Bali', code: 'DPS', lat: '8.34°S', lng: '115.09°E' },
  { city: 'Reykjavik', code: 'KEF', lat: '64.14°N', lng: '21.94°W' },
];

// Canvas-based particle wormhole
function WormholeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;
    const time = Date.now() * 0.001;

    ctx.clearRect(0, 0, w, h);

    // --- Concentric radar rings ---
    for (let i = 0; i < 8; i++) {
      const r = 40 + i * 45;
      const pulseOffset = Math.sin(time * 0.8 + i * 0.5) * 0.15;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.06 + pulseOffset})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // --- Radar sweep ---
    const sweepAngle = time * 0.4;
    const sweepGrad = ctx.createConicalGradient
      ? null
      : ctx.createLinearGradient(cx, cy, cx + 300 * Math.cos(sweepAngle), cy + 300 * Math.sin(sweepAngle));

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sweepAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 350, -0.15, 0.15);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 350, 0);
    grad.addColorStop(0, 'rgba(45, 212, 191, 0.0)');
    grad.addColorStop(0.5, 'rgba(45, 212, 191, 0.04)');
    grad.addColorStop(1, 'rgba(45, 212, 191, 0.12)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // --- Topographic contour lines ---
    for (let j = 0; j < 5; j++) {
      ctx.beginPath();
      const baseR = 80 + j * 60;
      for (let a = 0; a <= 360; a += 2) {
        const rad = (a * Math.PI) / 180;
        const noise = Math.sin(rad * 3 + time + j) * 15 + Math.sin(rad * 7 - time * 0.5) * 8;
        const r = baseR + noise;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.08 - j * 0.012})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // --- Floating particles ---
    for (let i = 0; i < 60; i++) {
      const seed = i * 137.508;
      const angle = time * 0.1 + seed;
      const dist = 50 + (seed % 280);
      const drift = Math.sin(time * 0.5 + seed) * 20;
      const x = cx + (dist + drift) * Math.cos(angle);
      const y = cy + (dist + drift) * Math.sin(angle);
      const size = 0.5 + (seed % 2);
      const alpha = 0.15 + Math.sin(time + seed) * 0.15;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0
        ? `rgba(45, 212, 191, ${alpha})`
        : `rgba(212, 175, 55, ${alpha})`;
      ctx.fill();
    }

    // --- Central beacon ---
    const beaconPulse = Math.sin(time * 2) * 0.3 + 0.7;
    const beaconGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    beaconGrad.addColorStop(0, `rgba(212, 175, 55, ${0.3 * beaconPulse})`);
    beaconGrad.addColorStop(0.5, `rgba(212, 175, 55, ${0.1 * beaconPulse})`);
    beaconGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = beaconGrad;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${0.6 + beaconPulse * 0.4})`;
    ctx.fill();

    // --- Crosshairs ---
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 350);
    ctx.lineTo(cx, cy + 350);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 350, cy);
    ctx.lineTo(cx + 350, cy);
    ctx.stroke();

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}

function DestinationTicker() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx(p => (p + 1) % destinations.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const d = destinations[idx];

  return (
    <div className="absolute top-10 right-10 z-10 text-right">
      <AnimatePresence mode="wait">
        <motion.div
          key={d.city}
          initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-1"
        >
          <p className="font-mono text-[8px] tracking-[0.5em] text-teal-400/50 uppercase">
            Scanning Destination
          </p>
          <div className="flex items-baseline gap-3 justify-end">
            <h3 className="font-playfair text-4xl text-cream/70 font-light italic">
              {d.city}
            </h3>
            <span className="font-mono text-xs text-gold/60 font-bold">{d.code}</span>
          </div>
          <div className="flex gap-4 justify-end font-mono text-[9px] text-gold/30 tracking-widest">
            <span>{d.lat}</span>
            <span>{d.lng}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Scan line */}
      <motion.div
        className="mt-3 ml-auto h-[1px] bg-gradient-to-l from-teal-400/40 to-transparent"
        animate={{ width: ['0%', '100%', '60%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ maxWidth: 200 }}
      />
    </div>
  );
}

function StatusBar() {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toISOString().slice(11, 19));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 1 }}
      className="absolute bottom-10 left-10 z-10 space-y-3"
    >
      {/* Live clock */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <p className="font-mono text-[10px] text-teal-400/60 tracking-[0.3em]">
          SYSTEM ONLINE
        </p>
      </div>
      <p className="font-mono text-2xl text-cream/30 tracking-[0.15em] font-light tabular-nums">
        {time}
      </p>

      {/* Telemetry rows */}
      <div className="space-y-1 mt-4">
        {[
          { label: 'ALT', value: '36,000', unit: 'ft' },
          { label: 'SPD', value: '487', unit: 'kn' },
          { label: 'HDG', value: '074', unit: '°' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + i * 0.2 }}
            className="flex items-baseline gap-2"
          >
            <span className="font-mono text-[8px] text-gold/30 tracking-[0.3em] w-8">
              {item.label}
            </span>
            <span className="font-mono text-[11px] text-cream/40 tabular-nums">
              {item.value}
            </span>
            <span className="font-mono text-[8px] text-gold/20">
              {item.unit}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function MiniPassport() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 6 }}
      animate={{ opacity: 1, y: 0, rotate: 3 }}
      transition={{ duration: 1.2, delay: 2, ease: 'easeOut' }}
      className="absolute bottom-12 right-10 z-10"
    >
      <div className="w-36 border border-gold/15 rounded-lg p-3 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-3 h-3 rounded-full border border-gold/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-gold/60" />
          </div>
          <p className="font-mono text-[7px] text-gold/40 tracking-[0.4em] uppercase">Passport</p>
        </div>
        <div className="space-y-1.5">
          <div className="h-[0.5px] bg-gold/10 w-full" />
          <div className="h-[0.5px] bg-gold/10 w-4/5" />
          <div className="h-[0.5px] bg-gold/10 w-3/5" />
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-4 bg-gold/5 rounded-[2px]"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </div>
        <p className="font-mono text-[6px] text-gold/20 mt-2 text-center tracking-[0.3em]">
          MRZ DATA ENCRYPTED
        </p>
      </div>
    </motion.div>
  );
}

export function AuthGlobe() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#050508]">
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)] z-[1] pointer-events-none" />
      
      {/* Canvas animation layer */}
      <WormholeCanvas />
      
      {/* UI overlays */}
      <DestinationTicker />
      <StatusBar />
      <MiniPassport />
      
      {/* Scanline effect */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }}
      />
    </div>
  );
}
