'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Mail, Lock, User as UserIcon, ArrowRight, Github } from 'lucide-react';
import { useAuth, User } from '@/lib/hooks';
import { toast } from '@/components/Toast';
import { AuthGlobe } from '@/components/AuthGlobe';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoaded } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
        // Call backend login API
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('access_token', data.access_token);
          
          // Get user details
          const userResp = await fetch('http://127.0.0.1:8000/users/me', {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
          });
          const userData = await userResp.json();
          
          login({
            id: userData.id.toString(),
            name: userData.email.split('@')[0],
            email: userData.email,
            currency: 'USD',
            language: 'en'
          });
          toast.success('Login successful');
          router.push('/dashboard');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        // Call backend register API
        const response = await fetch('http://127.0.0.1:8000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            display_name: name
          })
        });
        
        if (response.ok) {
          toast.success('Account created! Please log in.');
          setIsLogin(true); // Switch to login view
        } else {
          const err = await response.json();
          toast.error(err.detail || 'Failed to create account');
        }
      }
    } catch (err) {
      toast.error('Network error. Is backend running?');
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

        {/* Cinematic 3D Globe Background */}
        <AuthGlobe />

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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        placeholder="John Doe"
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
                    placeholder="traveler@luxury.com"
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate/30 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 text-cream placeholder:text-muted focus:outline-none focus:border-gold/50 focus:bg-slate/50 transition-all"
                  />
                </div>
              </div>

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

            <div className="flex flex-col gap-4 mt-6 items-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await fetch('http://127.0.0.1:8000/auth/google', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ token: credentialResponse.credential })
                    });
                    
                    if (res.ok) {
                      const data = await res.json();
                      localStorage.setItem('access_token', data.access_token);
                      
                      const userResp = await fetch('http://127.0.0.1:8000/users/me', {
                        headers: { 'Authorization': `Bearer ${data.access_token}` }
                      });
                      const userData = await userResp.json();
                      
                      login({
                        id: userData.id.toString(),
                        name: userData.email.split('@')[0],
                        email: userData.email,
                        currency: 'USD',
                        language: 'en'
                      });
                      toast.success('Successfully logged in with Google');
                      router.push('/dashboard');
                    } else {
                      toast.error('Google login failed on backend');
                    }
                  } catch (e) {
                    toast.error('Network error during Google login');
                  }
                }}
                onError={() => {
                  toast.error('Google Login Failed');
                }}
                theme="filled_black"
                shape="pill"
              />
            </div>

            <p className="mt-8 text-center text-sm text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
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
