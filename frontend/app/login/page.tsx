'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth, User } from '@/lib/hooks';
import { toast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoaded } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [user, isLoaded, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    try {
      if (isLogin) {
        // Simple login logic with localStorage
        const users = JSON.parse(localStorage.getItem('tl_registered_users') || '[]');
        const existingUser = users.find((u: any) => u.email === email && u.password === password);
        
        if (existingUser) {
          login({
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            currency: 'USD',
            language: 'en'
          });
          toast.success(`Welcome back, ${existingUser.name}`);
          router.push('/dashboard');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        // Signup logic
        const users = JSON.parse(localStorage.getItem('tl_registered_users') || '[]');
        if (users.find((u: any) => u.email === email)) {
          toast.error('User already exists');
          setIsLoading(false);
          return;
        }

        const newUser = {
          id: Math.random().toString(36).substring(7),
          name,
          email,
          password
        };
        
        localStorage.setItem('tl_registered_users', JSON.stringify([...users, newUser]));
        
        login({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          currency: 'USD',
          language: 'en'
        });
        toast.success('Account created successfully');
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    login({
      id: 'guest',
      name: 'Guest Traveler',
      email: 'guest@traveloop.com',
      currency: 'USD',
      language: 'en'
    });
    toast.info('Logged in as Guest');
    router.push('/dashboard');
  };

  if (!isLoaded) return <div className="min-h-screen bg-obsidian" />;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-obsidian overflow-hidden">
      {/* Left Panel: Visuals */}
      <div className="relative hidden md:flex items-center justify-center p-12 bg-ink overflow-hidden">
        {/* Animated Aurora Blobs */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gold/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, -60, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal/10 rounded-full blur-[100px]" 
          />
        </div>

        {/* World Map SVG Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 1000 500" className="w-full max-w-[800px] text-cream">
            <path d="M150,100 Q400,50 850,100 Q950,250 850,400 Q400,450 150,400 Q50,250 150,100" fill="currentColor" fillOpacity="0.1" />
            <path d="M200,150 Q300,120 400,150 Q500,200 450,300 Q350,350 250,300 Q150,250 200,150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
            <circle cx="300" cy="200" r="4" fill="currentColor" className="animate-pulse" />
            <circle cx="700" cy="150" r="4" fill="currentColor" className="animate-pulse" />
            <circle cx="500" cy="350" r="4" fill="currentColor" className="animate-pulse" />
          </svg>
        </div>

        <div className="relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-flex p-5 rounded-[2rem] bg-gold shadow-2xl shadow-gold/20"
          >
            <Plane className="w-12 h-12 text-obsidian" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="font-playfair text-6xl tracking-[0.4em] font-light flex items-center justify-center">
              {"TRAVELOOP".split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>
            <p className="text-muted tracking-[0.3em] uppercase text-sm font-light">Experience the art of journey</p>
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex items-center justify-center p-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[40px] -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
            
            <div className="mb-10">
              <h2 className="text-3xl font-playfair mb-3">
                {isLogin ? 'Welcome Back' : 'Join Traveloop'}
              </h2>
              <p className="text-muted text-sm">
                {isLogin 
                  ? 'Access your luxury itineraries and curated experiences.' 
                  : 'Start your journey into high-end travel planning.'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                        placeholder="Enter your full name"
                        autoComplete="off"
                        className="w-full bg-slate/30 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 text-cream placeholder:text-muted focus:outline-none focus:border-gold/50 focus:bg-slate/50 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      autoComplete="off"
                      className="w-full bg-slate/30 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 text-cream placeholder:text-muted focus:outline-none focus:border-gold/50 focus:bg-slate/50 transition-all"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold">Password</label>
                  {isLogin && <button type="button" className="text-[10px] uppercase tracking-tighter text-gold hover:text-gold-light transition-colors">Forgot?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="w-full bg-slate/30 border border-slate/50 rounded-2xl py-4 pl-12 pr-12 text-cream placeholder:text-muted focus:outline-none focus:border-gold/50 focus:bg-slate/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={!isLogin}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className="w-full bg-slate/30 border border-slate/50 rounded-2xl py-4 pl-12 pr-12 text-cream placeholder:text-muted focus:outline-none focus:border-gold/50 focus:bg-slate/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gold hover:bg-gold-light text-obsidian font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4 text-muted">
              <div className="h-[1px] flex-1 bg-slate/50" />
              <span className="text-[10px] uppercase tracking-widest">or continue with</span>
              <div className="h-[1px] flex-1 bg-slate/50" />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <button className="flex items-center justify-center gap-2 py-4 border border-slate/50 rounded-2xl hover:bg-slate/20 transition-all text-sm font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setName('');
                }}
                className="text-gold font-bold ml-2 hover:underline decoration-gold/30 underline-offset-4"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            
            <button 
              onClick={continueAsGuest}
              className="mt-6 w-full text-center text-[10px] uppercase tracking-[0.3em] text-muted hover:text-gold transition-colors font-bold"
            >
              Continue as Guest Traveler
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
