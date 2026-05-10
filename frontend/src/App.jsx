import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- CONSTANTS & MOCK DATA ---
const SCREENS = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  CREATE_TRIP: 'create_trip',
  MY_TRIPS: 'my_trips',
  ITINERARY_BUILDER: 'itinerary_builder',
  ITINERARY_VIEW: 'itinerary_view',
  CITY_SEARCH: 'city_search',
  ACTIVITY_SEARCH: 'activity_search',
  BUDGET: 'budget',
  CHECKLIST: 'checklist',
  PUBLIC_TRIP: 'public_trip',
  PROFILE: 'profile',
  JOURNAL: 'journal',
  ANALYTICS: 'analytics',
  INVOICE: 'invoice'
};

const TRIPS = [
  { id: 1, name: 'Amalfi Coast Dream', city: 'Positano, Italy', dates: 'June 12 - 20', budget: 4500, spent: 3200, color: '#C9A84C', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Tokyo Neon Nights', city: 'Tokyo, Japan', dates: 'Sept 5 - 15', budget: 6000, spent: 5800, color: '#2DD4BF', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Parisian Escape', city: 'Paris, France', dates: 'Oct 2 - 8', budget: 3500, spent: 1200, color: '#E85D75', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800' },
];

// --- UTILS ---
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

// --- GLOBAL OVERLAY COMPONENTS ---

const CursorFollower = () => {
  const dot = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (dot.current) {
        dot.current.style.left = e.clientX + 'px';
        dot.current.style.top = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={dot} id="cursor-follower" />;
};

const AmbientSoundToggle = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const toggle = () => {
    if (!on) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const freqs = [180, 240, 360];
      nodesRef.current = freqs.map(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.018, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        return { osc, gain };
      });
      setOn(true);
    } else {
      nodesRef.current.forEach(({ osc, gain }) => {
        gain.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.3);
        setTimeout(() => osc.stop(), 500);
      });
      nodesRef.current = [];
      setOn(false);
    }
  };
  return (
    <button onClick={toggle} title={on ? 'Mute ambience' : 'Play ambience'} style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
      background: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(201,168,76,0.3)', borderRadius: '50%',
      width: '44px', height: '44px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxShadow: on ? '0 0 12px rgba(201,168,76,0.3)' : 'none'
    }}>{on ? '🔊' : '🔇'}</button>
  );
};

const GoldParticles = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
    {Array.from({ length: 18 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        bottom: `${Math.random() * 30}%`,
        left: `${Math.random() * 100}%`,
        width: `${2 + Math.random() * 3}px`,
        height: `${2 + Math.random() * 3}px`,
        borderRadius: '50%',
        background: i % 3 === 0 ? 'var(--teal)' : 'var(--gold)',
        opacity: 0.6 + Math.random() * 0.4,
        animation: `particleFloat ${4 + Math.random() * 6}s ${Math.random() * 4}s infinite ease-in`,
        '--drift': `${(Math.random() - 0.5) * 60}px`
      }} />
    ))}
  </div>
);

const FogLayer = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', bottom: 0, left: '-10%', width: '120%', height: '200px',
      background: 'linear-gradient(0deg, rgba(10,10,15,0.9) 0%, transparent 100%)',
      animation: 'fogDrift 12s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', top: 0, left: '-5%', width: '110%', height: '180px',
      background: 'linear-gradient(180deg, rgba(10,10,15,0.7) 0%, transparent 100%)',
      animation: 'fogDriftReverse 15s ease-in-out infinite'
    }} />
  </div>
);

// --- SHARED COMPONENTS ---

const ProgressRing = ({ progress, size = 100, strokeWidth = 8, color = 'var(--gold)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size}>
      <circle
        stroke="rgba(255,255,255,0.05)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round' }}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

const DonutChart = ({ data, size = 200, thickness = 20 }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = -90;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((item, i) => {
        const angle = (item.value / total) * 360;
        const radius = (size - thickness) / 2;
        const x1 = size / 2 + radius * Math.cos((currentAngle * Math.PI) / 180);
        const y1 = size / 2 + radius * Math.sin((currentAngle * Math.PI) / 180);
        const x2 = size / 2 + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
        const y2 = size / 2 + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
        const largeArc = angle > 180 ? 1 : 0;
        
        const pathData = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        `;
        
        const prevAngle = currentAngle;
        currentAngle += angle;
        
        return (
          <path
            key={i}
            d={pathData}
            fill="none"
            stroke={item.color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

const AuroraBlobs = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: -1, pointerEvents: 'none' }}>
    <div style={{
      position: 'absolute', top: '-10%', left: '10%', width: '40vw', height: '40vw',
      background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)',
      opacity: 0.15, filter: 'blur(80px)', animation: 'aurora 8s infinite alternate'
    }} />
    <div style={{
      position: 'absolute', bottom: '10%', right: '10%', width: '35vw', height: '35vw',
      background: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)',
      opacity: 0.1, filter: 'blur(80px)', animation: 'aurora 10s infinite alternate-reverse'
    }} />
  </div>
);

const WorldMapWatermark = () => (
  <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: 'auto', opacity: 0.04, zIndex: -1, pointerEvents: 'none' }} viewBox="0 0 1000 500">
    <path fill="currentColor" d="M150,200 Q200,150 250,200 T350,200 T450,200 T550,200 T650,200 T750,200 T850,200" stroke="var(--muted)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
    {/* Simplified dots for map effect */}
    {Array.from({ length: 50 }).map((_, i) => (
      <circle key={i} cx={Math.random() * 1000} cy={Math.random() * 500} r="1.5" fill="var(--muted)" />
    ))}
  </svg>
);

const TiltCard = ({ children, className = "", style = {} }) => {
  const cardRef = useRef(null);
  const shimmerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 15;
    const rotateY = (x - centerX) / 15;

    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    if (shimmerRef.current) {
      shimmerRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.2) 0%, transparent 60%)`;
      shimmerRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg)`;
    if (shimmerRef.current) {
      shimmerRef.current.style.opacity = '0';
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass ${className}`}
      style={{ 
        position: 'relative', 
        transition: 'transform 0.1s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        ...style 
      }}
    >
      <div 
        ref={shimmerRef}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none', borderRadius: 'inherit', zIndex: 2,
          opacity: 0, transition: 'opacity 0.4s ease'
        }}
      />
      {children}
    </div>
  );
};

const MagneticButton = ({ children, onClick, className = "", style = {} }) => {
  const btnRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btnRef.current.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  };

  const handleMouseLeave = () => {
    if (btnRef.current) btnRef.current.style.transform = `translate(0, 0)`;
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-btn ${className}`}
      style={{
        padding: '12px 24px',
        borderRadius: '12px',
        border: 'none',
        background: 'var(--gold)',
        color: 'var(--obsidian)',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        ...style
      }}
    >
      {children}
    </button>
  );
};

// --- SCREENS ---

const LoginScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const logoText = "TRAVELOOP";
  
  const handleSubmit = () => {
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('traveloop_users') || '[]');

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials.');
      }
    } else {
      if (users.find(u => u.email === email)) {
        setError('User already exists.');
        return;
      }
      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('traveloop_users', JSON.stringify(users));
      onLogin(newUser);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Panel - 55% */}
      <div style={{ flex: '55', position: 'relative', background: 'var(--obsidian)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <AuroraBlobs />
        <WorldMapWatermark />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: 'var(--gold)', marginBottom: '1rem', display: 'flex' }}>
          {logoText.split('').map((char, i) => (
            <span key={i} style={{ animation: `logoReveal 0.6s ease-out ${i * 0.1}s forwards`, opacity: 0 }}>{char}</span>
          ))}
          <span style={{ animation: `logoReveal 0.6s ease-out ${logoText.length * 0.1}s forwards`, opacity: 0, marginLeft: '12px' }}>✈</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '400px', lineHeight: '1.6', animation: 'fadeUp 1s ease-out 1s forwards', opacity: 0 }}>
          Experience the art of luxury journey planning. Your atlas, reimagined.
        </p>
      </div>

      {/* Right Panel - 45% */}
      <div style={{ flex: '45', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', padding: '40px', overflowY: 'auto' }}>
        <div className="glass stagger-item" style={{ width: '100%', maxWidth: '420px', padding: '48px', animationDelay: '0.2s' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '2rem' }}>
            {isLogin ? 'Welcome Back' : 'Join the Elite'}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && <div style={{ color: 'var(--ruby)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
            
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--slate)', padding: '12px 0', color: 'var(--cream)', outline: 'none' }} 
                />
              </div>
            )}
            
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--slate)', padding: '12px 0', color: 'var(--cream)', outline: 'none' }} 
              />
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--slate)', padding: '12px 0', color: 'var(--cream)', outline: 'none' }} 
              />
            </div>
            
            <MagneticButton onClick={handleSubmit} style={{ marginTop: '12px' }}>
              {isLogin ? 'Enter Dashboard' : 'Create Account'}
            </MagneticButton>
            
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span style={{ color: 'var(--muted)' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
            
            <button 
              onClick={() => onLogin({ name: 'Guest' })}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', marginTop: '12px' }}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardScreen = ({ userName }) => {
  const stats = [
    { label: 'Completed Trips', value: 24, icon: '🌍' },
    { label: 'Upcoming Stops', value: 12, icon: '📍' },
    { label: 'Travel Hours', value: 840, icon: '⏱' },
    { label: 'Total Budget', value: 12500, icon: '💰', prefix: '$' },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ position: 'relative', marginBottom: '60px', minHeight: '180px' }}>
        <AuroraBlobs />
        <GoldParticles />
        <FogLayer />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="stagger-item" style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', marginBottom: '1rem' }}>Good morning, {userName}</h1>
          <p className="stagger-item" style={{ color: 'var(--muted)', animationDelay: '0.1s' }}>Your next adventure to Amalfi starts in 12 days.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '60px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass stagger-item" style={{ padding: '24px', animationDelay: `${0.2 + i * 0.1}s` }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '12px', display: 'block' }}>{stat.icon}</span>
            <h3 style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</h3>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)' }}>
              {stat.prefix}<Counter end={stat.value} />
            </div>
          </div>
        ))}
      </div>

      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Active Journeys</h2>
          <button style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, cursor: 'pointer' }}>View All</button>
        </div>
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px', paddingRight: '20px' }}>
          {TRIPS.map((trip, i) => (
            <TiltCard key={trip.id} className="stagger-item" style={{ flex: '0 0 380px', height: '480px', padding: '0', overflow: 'hidden', animationDelay: `${0.4 + i * 0.1}s` }}>
              <div style={{ height: '240px', background: `url(${trip.image}) center/cover` }} />
              <div style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{trip.city}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: '8px 0' }}>{trip.name}</h3>
                <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>{trip.dates}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '20px' }}>
                    <div style={{ height: '4px', background: 'var(--slate)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--gold)', width: `${(trip.spent / trip.budget) * 100}%` }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '8px', display: 'block' }}>
                      ${trip.spent.toLocaleString()} / ${trip.budget.toLocaleString()} spent
                    </span>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    →
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 50 }}>
        <MagneticButton style={{ width: '64px', height: '64px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 12px 24px rgba(201,168,76,0.3)' }}>
          +
        </MagneticButton>
      </div>
    </div>
  );
};

const CreateTripScreen = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [stops, setStops] = useState(['Positano', 'Amalfi', 'Ravello']);
  
  return (
    <div className="glass" style={{ position: 'fixed', top: 0, right: 0, width: '600px', height: '100vh', z_index: 100, padding: '60px', animation: 'slideRight 0.5s reverse' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', background: s <= step ? 'var(--gold)' : 'var(--slate)', borderRadius: '2px', transition: 'background 0.3s' }} />
          ))}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>Create New Trip</h2>
      </div>

      {step === 1 && (
        <div className="stagger-item">
          <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Trip Name</label>
          <input className="glass" style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid var(--slate)', borderRadius: '12px', color: 'var(--cream)', marginBottom: '32px' }} placeholder="e.g. Italian Riviera Explorer" />
          
          <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Budget</label>
          <input type="number" className="glass" style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid var(--slate)', borderRadius: '12px', color: 'var(--cream)', marginBottom: '32px' }} placeholder="$5,000" />
          
          <MagneticButton onClick={() => setStep(2)}>Continue to Stops</MagneticButton>
        </div>
      )}

      {step === 2 && (
        <div className="stagger-item">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {stops.map((stop, i) => (
              <div key={i} draggable className="glass" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
                <span>{i + 1}. {stop}</span>
                <span>☰</span>
              </div>
            ))}
            <button style={{ background: 'transparent', border: '1px dashed var(--muted)', padding: '16px', color: 'var(--muted)', borderRadius: '12px' }}>+ Add Stop</button>
          </div>
          <MagneticButton onClick={() => setStep(3)}>Final Review</MagneticButton>
        </div>
      )}

      {step === 3 && (
        <div className="stagger-item" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '40px' }}>
            <DonutChart data={[{ value: 60, color: 'var(--gold)' }, { value: 40, color: 'var(--teal)' }]} />
            <h3 style={{ marginTop: '20px', fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Trip Summary</h3>
            <p style={{ color: 'var(--muted)' }}>3 Stops • 12 Days • $5,000 Budget</p>
          </div>
          <MagneticButton onClick={onComplete}>Launch Trip ✈</MagneticButton>
        </div>
      )}
    </div>
  );
};

const MyTripsScreen = () => {
  const [activeTab, setActiveTab] = useState('all');
  const tabs = [['all','All Trips'],['active','Active'],['past','Past']];
  return (
  <div style={{ padding: '40px' }}>
    <h1 className="stagger-item" style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '32px' }}>My Journeys</h1>
    <div className="tab-row">
      {tabs.map(([id, label]) => (
        <button key={id} className={`tab-btn${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
      {TRIPS.map((trip, i) => (
        <TiltCard key={trip.id} className="stagger-item tilt-card-wrapper" style={{ height: '420px', padding: '0', overflow: 'hidden', animationDelay: `${i * 0.1}s`, position: 'relative' }}>
          <div style={{ height: '220px', background: `url(${trip.image}) center/cover` }} />
          <div style={{ padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '24px' }}>
              <ProgressRing progress={(trip.spent / trip.budget) * 100} size={80} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '4px' }}>{trip.name}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{trip.city}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--teal)', border: '1px solid var(--teal)', padding: '2px 8px', borderRadius: '4px' }}>{trip.dates}</span>
          </div>
          <div className="trip-card-overlay">
            <MagneticButton style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}>View Itinerary →</MagneticButton>
          </div>
        </TiltCard>
      ))}
    </div>
  </div>
);};


const ItineraryBuilderScreen = () => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ flex: '0 0 400px', borderRight: '1px solid var(--slate)', padding: '40px', overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '32px' }}>Stops</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '19px', top: '20px', bottom: '20px', width: '2px', background: 'linear-gradient(180deg, var(--gold), var(--teal))', zIndex: 0 }} />
        {['Paris', 'Lyon', 'Nice'].map((stop, i) => (
          <div key={i} className="glass stagger-item" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1, animationDelay: `${i * 0.1}s` }}>
            <div className="timeline-dot" />
            <span style={{ fontWeight: 600 }}>{stop}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ flex: 1, padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Day 1 Activities</h2>
        <button className="glass" style={{ padding: '8px 16px', color: 'var(--gold)', border: 'none' }}>+ Add Activity</button>
      </div>
      <div style={{ display: 'grid', gap: '16px' }}>
        {[
          { time: '09:00', label: 'Eiffel Tower Sunrise', cost: 25, type: 'Sightseeing' },
          { time: '12:30', label: 'Lunch at Le Meurice', cost: 120, type: 'Dining' },
          { time: '15:00', label: 'Louvre Museum Guided Tour', cost: 45, type: 'Culture' }
        ].map((act, i) => (
          <div key={i} className="glass stagger-item" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: `${0.3 + i * 0.1}s` }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{act.time}</span>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>{act.label}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'var(--slate)', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>{act.type}</span>
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)' }}>${act.cost}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ItineraryViewScreen = () => (
  <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
    <header style={{ marginBottom: '60px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '12px' }}>France Itinerary</h1>
      <p style={{ color: 'var(--muted)' }}>June 12 - 20 • 3 Cities • $4,500 Budget</p>
    </header>

    <div style={{ position: 'relative', paddingLeft: '40px' }}>
      <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'var(--slate)' }} />
      {[
        { city: 'Paris', days: 'Day 1-3', activities: 12 },
        { city: 'Lyon', days: 'Day 4-6', activities: 8 },
        { city: 'Nice', days: 'Day 7-9', activities: 10 }
      ].map((stop, i) => (
        <div key={i} className="stagger-item" style={{ marginBottom: '40px', position: 'relative', animationDelay: `${i * 0.1}s` }}>
          <div style={{ position: 'absolute', left: '-26px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gold)', border: '4px solid var(--obsidian)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '8px' }}>{stop.city}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{stop.days} • {stop.activities} activities planned</p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div className="glass" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Morning: Sightseeing at landmark</span>
              <span style={{ color: 'var(--emerald)' }}>✓ Booked</span>
            </div>
            <div className="glass" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Evening: Dinner at local restaurant</span>
              <span style={{ color: 'var(--gold)' }}>$ Pending</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CitySearchScreen = () => {
  const cities = ['Search cities, countries, experiences...', 'Paris, France...', 'Kyoto, Japan...', 'Santorini, Greece...', 'Reykjavik, Iceland...'];
  const [phIdx, setPhIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhIdx(p => (p + 1) % cities.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
  <div style={{ padding: '40px' }}>
    <div style={{ textAlign: 'center', marginBottom: '80px', paddingTop: '60px', position: 'relative' }}>
      <AuroraBlobs />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', marginBottom: '24px' }}>Where to next?</h1>
      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
        <input className="glass" style={{ width: '100%', padding: '24px 32px', fontSize: '1.2rem', color: 'var(--cream)', border: '1px solid rgba(201,168,76,0.3)', outline: 'none', background: 'rgba(17,17,24,0.8)' }} placeholder={cities[phIdx]} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
      {[
        { name: 'Kyoto', country: 'Japan', cost: '$$$', tags: ['History', 'Nature'] },
        { name: 'Santorini', country: 'Greece', cost: '$$$$', tags: ['Luxury', 'View'] },
        { name: 'Reykjavik', country: 'Iceland', cost: '$$$', tags: ['Adventure', 'Cold'] },
      ].map((city, i) => (
        <TiltCard key={i} className="stagger-item" style={{ padding: '28px', animationDelay: `${i * 0.1}s` }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '4px' }}>{city.name}</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>{city.country} • {city.cost}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {city.tags.map(tag => (
              <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--teal)', border: '1px solid var(--teal)', padding: '3px 10px', borderRadius: '20px' }}>{tag}</span>
            ))}
          </div>
        </TiltCard>
      ))}
    </div>
  </div>
);};

const ActivitySearchScreen = () => (
  <div style={{ padding: '40px' }}>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '32px' }}>Experiences in Paris</h1>
    <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', overflowX: 'auto', paddingBottom: '12px' }}>
      {['Sightseeing', 'Food & Drink', 'Adventure', 'Culture', 'Shopping'].map(cat => (
        <button key={cat} className="glass" style={{ padding: '12px 24px', whiteSpace: 'nowrap', border: 'none', color: 'var(--cream)', cursor: 'pointer' }}>{cat}</button>
      ))}
    </div>
    <div style={{ display: 'grid', gap: '20px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass stagger-item" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', animationDelay: `${i * 0.1}s` }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '12px', background: 'var(--slate)' }} className="shimmer-skeleton" />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '8px' }}>Authentic Macaron Workshop</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Learn the art of French pastry from a master chef in the heart of Le Marais.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>$85 / person</span>
              <MagneticButton style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Add to Trip</MagneticButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BudgetScreen = () => (
  <div style={{ padding: '40px' }}>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '48px' }}>Budget Analysis</h1>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '60px' }}>
      <div className="glass" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <DonutChart data={[
          { value: 40, color: 'var(--gold)' },
          { value: 25, color: 'var(--teal)' },
          { value: 15, color: 'var(--ruby)' },
          { value: 20, color: 'var(--emerald)' }
        ]} size={240} thickness={30} />
        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
          {[
            { label: 'Flights', value: '$1,200', color: 'var(--gold)' },
            { label: 'Hotels', value: '$850', color: 'var(--teal)' },
            { label: 'Dining', value: '$450', color: 'var(--ruby)' },
            { label: 'Activities', value: '$600', color: 'var(--emerald)' }
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{item.label}:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px', border: '1px solid var(--ruby)', animation: 'pulse 2s infinite' }}>
          <h3 style={{ color: 'var(--ruby)', marginBottom: '8px' }}>Budget Alert</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Dining expenses in Paris are 15% higher than projected. Consider adjusting your daily limit.</p>
        </div>
        <div className="glass" style={{ padding: '24px', flex: 1 }}>
          <h3 style={{ marginBottom: '24px' }}>Spending Trends</h3>
          {[
            { label: 'Accommodation', progress: 75, color: 'var(--teal)' },
            { label: 'Transport', progress: 45, color: 'var(--gold)' },
            { label: 'Food', progress: 90, color: 'var(--ruby)' }
          ].map(bar => (
            <div key={bar.label} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span>{bar.label}</span>
                <span>{bar.progress}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--slate)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${bar.progress}%`, background: bar.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ChecklistScreen = () => {
  const [items, setItems] = useState([
    { id: 1, text: 'Passport & Visas', checked: true },
    { id: 2, text: 'Travel Insurance', checked: false },
    { id: 3, text: 'Universal Power Adapter', checked: true },
    { id: 4, text: 'Noise Cancelling Headphones', checked: false },
    { id: 5, text: 'Offline Maps Downloaded', checked: false },
  ]);
  const toggle = (id) => setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  const progress = (items.filter(i => i.checked).length / items.length) * 100;
  const checkedCount = items.filter(i => i.checked).length;
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '60px' }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing progress={progress} size={150} strokeWidth={12} />
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)' }}>{Math.round(progress)}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>packed</div>
          </div>
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>Essentials</h1>
          <p style={{ color: 'var(--muted)' }}>{checkedCount} of {items.length} items packed</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, i) => (
          <div key={item.id} onClick={() => toggle(item.id)}
            className="glass stagger-item"
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', animationDelay: `${i * 0.1}s`, transition: 'opacity 0.3s, transform 0.3s' }}>
            <div style={{ position: 'relative', width: '24px', height: '24px', flexShrink: 0 }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid var(--gold)',
                background: item.checked ? 'var(--gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.25s' }}>
                {item.checked && <span style={{ color: 'var(--obsidian)', fontSize: '14px', fontWeight: 700 }}>✓</span>}
              </div>
              {item.checked && <div style={{ position: 'absolute', inset: 0, borderRadius: '6px', background: 'rgba(201,168,76,0.4)', animation: 'checkBurst 0.4s forwards' }} />}
            </div>
            <span style={{ fontSize: '1.1rem', textDecoration: item.checked ? 'line-through' : 'none',
              color: item.checked ? 'var(--muted)' : 'var(--cream)', transition: 'all 0.3s' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PublicItineraryScreen = () => (
  <div style={{ padding: '40px', background: 'var(--obsidian)', minHeight: '100vh' }}>
    <div style={{ background: 'var(--gold)', color: 'var(--obsidian)', padding: '12px', textAlign: 'center', fontWeight: 700, borderRadius: '8px', marginBottom: '40px' }}>
      You are viewing a shared itinerary. <a>Copy this trip to your atlas →</a>
    </div>
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', marginBottom: '12px' }}>Mediterranean Odyssey</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '60px' }}>Curated by Julian • 14 Days • Luxury Budget</p>
      <ItineraryViewScreen />
      <div style={{ textAlign: 'center', marginTop: '80px', borderTop: '1px solid var(--slate)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>TRAVELOOP ✈</h2>
      </div>
    </div>
  </div>
);

const ProfileScreen = () => (
  <div style={{ padding: '40px' }}>
    <div style={{ height: '240px', background: 'linear-gradient(135deg, var(--gold) 0%, var(--teal) 100%)', borderRadius: '24px', position: 'relative', marginBottom: '80px' }}>
      <div style={{ position: 'absolute', bottom: '-40px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: 'var(--slate)', border: '4px solid var(--obsidian)', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: 'url(https://i.pravatar.cc/300) center/cover' }} />
      </div>
    </div>
    <div style={{ paddingLeft: '40px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '8px' }}>Julian Alexander</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '40px' }}>Elite Traveler • 42 Countries Visited</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
        {[
          { label: 'Total Spent', value: '$84,200' },
          { label: 'Miles Covered', value: '124.5k' },
          { label: 'Unique Cities', value: '158' }
        ].map(stat => (
          <div key={stat.label} className="glass" style={{ padding: '24px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{stat.label}</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: '32px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '24px' }}>Account Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['Display Name', 'Email Address', 'Currency (USD)', 'Language (English)'].map(field => (
            <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--slate)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--muted)' }}>{field}</span>
              <span style={{ fontWeight: 600 }}>Edit →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TripJournalScreen = () => (
  <div style={{ padding: '40px' }}>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '40px' }}>Travel Journal</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
      <div className="glass stagger-item" style={{ padding: '24px', border: '1px dashed rgba(201,168,76,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--muted)', cursor: 'pointer', minHeight: '200px' }}>
        <span style={{ fontSize: '2.5rem', color: 'var(--gold)' }}>✎</span>
        <span style={{ fontFamily: 'var(--font-display)' }}>Write a new entry</span>
      </div>
      {[
        { date: 'June 14', title: 'Sunset at Amalfi', text: 'The light hitting the cliffs was unlike anything I have ever seen. Pure gold.', tag: 'Positano' },
        { date: 'June 12', title: 'First Day in Italy', text: 'Finally arrived. The espresso here is life-changing.', tag: 'Rome' }
      ].map((note, i) => (
        <div key={i} className="glass journal-card stagger-item" style={{ padding: '28px', animationDelay: `${i * 0.1}s` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>{note.date}</span>
            <span style={{ background: 'rgba(45,212,191,0.1)', color: 'var(--teal)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(45,212,191,0.3)' }}>{note.tag}</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '12px' }}>{note.title}</h3>
          <p style={{ color: 'var(--muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>{note.text}</p>
        </div>
      ))}
    </div>
  </div>
);


const AnalyticsDashboardScreen = () => (
  <div style={{ padding: '40px' }}>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '48px' }}>Platform Insights</h1>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
      {[
        { label: 'Active Users', value: '12.4k', icon: '👥' },
        { label: 'Trips Planned', value: '84.2k', icon: '✈' },
        { label: 'Total Revenue', value: '$2.4M', icon: '💎' },
        { label: 'Health Score', value: '98%', icon: '⚡' }
      ].map((stat, i) => (
        <div key={i} className="glass stagger-item" style={{ padding: '24px', animationDelay: `${i * 0.1}s` }}>
          <span style={{ fontSize: '1.5rem', marginBottom: '12px', display: 'block' }}>{stat.icon}</span>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{stat.label}</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
      <div className="glass" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '32px' }}>Monthly Trip Volume</h3>
        <svg width="100%" height="200" style={{ overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke="var(--gold)"
            strokeWidth="3"
            points="0,150 100,120 200,160 300,80 400,100 500,40"
            style={{ strokeDasharray: '1000', strokeDashoffset: '1000', animation: 'shimmer 2s forwards' }}
          />
          <path d="M0,150 L100,120 L200,160 L300,80 L400,100 L500,40 L500,200 L0,200 Z" fill="url(#grad)" opacity="0.1" />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="glass" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '32px' }}>Top Destinations</h3>
        {[
          { city: 'Tokyo', val: 85 },
          { city: 'Paris', val: 72 },
          { city: 'Rome', val: 64 },
          { city: 'London', val: 58 }
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{item.city}</span>
              <span style={{ color: 'var(--muted)' }}>{item.val}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--slate)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.val}%`, background: 'var(--teal)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ExpenseInvoiceScreen = () => (
  <div style={{ padding: '80px', maxWidth: '900px', margin: '0 auto', background: 'var(--cream)', color: 'var(--obsidian)', minHeight: '100vh' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '80px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>TRAVELOOP ✈</h1>
        <p style={{ opacity: 0.6 }}>Luxury Atlas Series</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Invoice</h3>
        <p style={{ opacity: 0.6 }}>#INV-2024-001</p>
        <p style={{ opacity: 0.6 }}>June 24, 2024</p>
      </div>
    </div>

    <div style={{ marginBottom: '60px' }}>
      <p style={{ fontWeight: 700 }}>Billed to:</p>
      <p>Julian Alexander</p>
      <p>123 Luxury Lane, Geneva</p>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '60px' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--obsidian)' }}>
          <th style={{ textAlign: 'left', padding: '12px 0' }}>Description</th>
          <th style={{ textAlign: 'right', padding: '12px 0' }}>Qty</th>
          <th style={{ textAlign: 'right', padding: '12px 0' }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {[
          { desc: 'Business Class Flights (GVA - NRT)', qty: 2, price: '$4,200' },
          { desc: 'Luxury Ryokan Stay - 5 Nights', qty: 1, price: '$3,500' },
          { desc: 'Private Tour Guide - Kyoto', qty: 3, price: '$900' }
        ].map((item, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <td style={{ padding: '16px 0' }}>{item.desc}</td>
            <td style={{ textAlign: 'right', padding: '16px 0' }}>{item.qty}</td>
            <td style={{ textAlign: 'right', padding: '16px 0' }}>{item.price}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div style={{ textAlign: 'right', marginLeft: 'auto', width: '300px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span>Subtotal:</span>
        <span>$8,600.00</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span>Service Fee (5%):</span>
        <span>$430.00</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.4rem', borderTop: '2px solid var(--obsidian)', paddingTop: '12px' }}>
        <span>Total:</span>
        <span>$9,030.00</span>
      </div>
    </div>

    <button onClick={() => window.print()} style={{ marginTop: '80px', padding: '12px 24px', background: 'var(--obsidian)', color: 'var(--cream)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
      Download PDF
    </button>
  </div>
);

const Counter = ({ end }) => {
  const count = useCounter(end);
  return <>{count.toLocaleString()}</>;
};

// --- APP ROOT ---

const NavItem = ({ id, label, icon, currentScreen, setScreen, isCollapsed }) => (
  <button
    onClick={() => setScreen(id)}
    className={`sidebar-nav-btn${currentScreen === id ? ' active' : ''}`}
  >
    <span style={{ fontSize: '1.2rem', minWidth: '28px', flexShrink: 0 }}>{icon}</span>
    {!isCollapsed && <span style={{ marginLeft: '10px', whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
  </button>
);

const App = () => {
  const [screen, setScreen] = useState(SCREENS.LOGIN);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setScreen(SCREENS.DASHBOARD);
  };

  if (screen === SCREENS.LOGIN) {
    return (
      <>
        <CursorFollower />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  const sidebarWidth = isSidebarCollapsed ? '80px' : '280px';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--obsidian)' }}>
      <CursorFollower />
      <AmbientSoundToggle />
      {/* Sidebar - glassmorphism */}
      <aside style={{ 
        width: sidebarWidth,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(201,168,76,0.1)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 200,
        position: 'fixed',
        left: 0, top: 0,
        height: '100vh'
      }}>
        <div style={{ padding: '32px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {isSidebarCollapsed ? 'T' : 'TRAVELOOP ✈'}
          </h2>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <NavItem id={SCREENS.DASHBOARD} label="Dashboard" icon="🏠" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.CREATE_TRIP} label="New Trip" icon="✨" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.MY_TRIPS} label="My Trips" icon="✈" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.ITINERARY_BUILDER} label="Builder" icon="🛠" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.ITINERARY_VIEW} label="Timeline" icon="⏳" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.CITY_SEARCH} label="Explore" icon="🔍" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.ACTIVITY_SEARCH} label="Activities" icon="🎭" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.BUDGET} label="Budget" icon="💰" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.CHECKLIST} label="Checklist" icon="📋" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.PUBLIC_TRIP} label="Shared" icon="🌐" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.JOURNAL} label="Journal" icon="📓" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.ANALYTICS} label="Analytics" icon="📈" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.PROFILE} label="Profile" icon="👤" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
          <NavItem id={SCREENS.INVOICE} label="Invoice" icon="📄" currentScreen={screen} setScreen={setScreen} isCollapsed={isSidebarCollapsed} />
        </nav>

        <div 
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center' }}
        >
          <span style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.4s' }}>
            «
          </span>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        marginLeft: sidebarWidth,
        minHeight: '100vh',
        overflowX: 'hidden',
        padding: '2rem',
        transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div key={screen} className="page-enter">
          {screen === SCREENS.DASHBOARD && <DashboardScreen userName={currentUser?.name || 'Julian'} />}
          {screen === SCREENS.MY_TRIPS && <MyTripsScreen />}
          {screen === SCREENS.ITINERARY_BUILDER && <ItineraryBuilderScreen />}
          {screen === SCREENS.ITINERARY_VIEW && <ItineraryViewScreen />}
          {screen === SCREENS.CITY_SEARCH && <CitySearchScreen />}
          {screen === SCREENS.ACTIVITY_SEARCH && <ActivitySearchScreen />}
          {screen === SCREENS.BUDGET && <BudgetScreen />}
          {screen === SCREENS.CHECKLIST && <ChecklistScreen />}
          {screen === SCREENS.PUBLIC_TRIP && <PublicItineraryScreen />}
          {screen === SCREENS.PROFILE && <ProfileScreen />}
          {screen === SCREENS.JOURNAL && <TripJournalScreen />}
          {screen === SCREENS.ANALYTICS && <AnalyticsDashboardScreen />}
          {screen === SCREENS.INVOICE && <ExpenseInvoiceScreen />}
          {screen === SCREENS.CREATE_TRIP && <CreateTripScreen onComplete={() => setScreen(SCREENS.MY_TRIPS)} />}
          
          {![SCREENS.DASHBOARD, SCREENS.MY_TRIPS, SCREENS.ITINERARY_BUILDER, SCREENS.ITINERARY_VIEW, SCREENS.CITY_SEARCH, SCREENS.ACTIVITY_SEARCH, SCREENS.BUDGET, SCREENS.CHECKLIST, SCREENS.PUBLIC_TRIP, SCREENS.PROFILE, SCREENS.JOURNAL, SCREENS.ANALYTICS, SCREENS.INVOICE, SCREENS.CREATE_TRIP].includes(screen) && (
            <div style={{ padding: '100px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>{screen.replace('_', ' ').toUpperCase()}</h2>
              <p style={{ color: 'var(--muted)', marginTop: '20px' }}>This screen is being meticulously crafted...</p>
              <div className="shimmer-skeleton" style={{ width: '300px', height: '200px', margin: '40px auto', borderRadius: '16px' }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
