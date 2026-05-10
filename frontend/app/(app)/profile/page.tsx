'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Settings, 
  Globe, 
  CircleDollarSign, 
  ShieldCheck, 
  Bell, 
  Trash2, 
  Save, 
  Camera,
  LogOut,
  MapPin,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { toast } from '@/components/Toast';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
  });

  const [prefForm, setPrefForm] = useState({
    currency: user?.currency || 'USD',
    language: user?.language || 'English',
    notifications: true,
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    toast.success('Profile details updated.');
  };

  const handleUpdatePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ currency: prefForm.currency, language: prefForm.language });
    toast.success('Application preferences saved.');
  };

  const handleClearData = () => {
    if (confirm('CAUTION: This will delete all your local trips, expenses, and notes permanently. Proceed?')) {
      localStorage.clear();
      toast.error('All local data has been purged.');
      window.location.reload();
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-12 pb-32">
      <div className="space-y-2">
        <p className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Identity</p>
        <h1 className="font-playfair text-4xl md:text-5xl font-light">Account <span className="italic">Curator</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Sidebar */}
        <aside className="space-y-4">
          {[
            { id: 'profile', label: 'Personal Details', icon: User },
            { id: 'preferences', label: 'App Preferences', icon: Settings },
            { id: 'security', label: 'Security & Access', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm transition-all ${
                activeTab === tab.id ? 'bg-gold text-obsidian font-bold shadow-lg shadow-gold/20' : 'bg-slate/20 text-muted hover:text-cream border border-slate/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}

          <div className="pt-8 space-y-4">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm text-ruby hover:bg-ruby/10 transition-all border border-ruby/20"
            >
              <LogOut className="w-5 h-5" /> Logout Session
            </button>
          </div>
        </aside>

        {/* Form Content */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 rounded-[3rem] space-y-10"
            >
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-2 border-gold p-1">
                    <div className="w-full h-full rounded-full bg-slate flex items-center justify-center text-4xl font-playfair text-gold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-gold text-obsidian rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-playfair">{user.name}</h2>
                  <p className="text-muted">{user.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="text" 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="email" 
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="tel" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="text" 
                      value={`${profileForm.city}${profileForm.city && profileForm.country ? ', ' : ''}${profileForm.country}`}
                      onChange={(e) => {
                        const [city, country] = e.target.value.split(',').map(s => s.trim());
                        setProfileForm({ ...profileForm, city: city || '', country: country || '' });
                      }}
                      placeholder="Paris, France"
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="bg-gold text-obsidian px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-light transition-all shadow-lg shadow-gold/20">
                    <Save className="w-5 h-5" /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 rounded-[3rem] space-y-10"
            >
              <h2 className="text-3xl font-playfair">Global Preferences</h2>
              
              <form onSubmit={handleUpdatePrefs} className="space-y-8 max-w-xl">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Base Currency</label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <select 
                      value={prefForm.currency}
                      onChange={(e) => setPrefForm({ ...prefForm, currency: e.target.value })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all appearance-none"
                    >
                      <option value="USD" className="bg-ink">United States Dollar (USD)</option>
                      <option value="EUR" className="bg-ink">Euro (EUR)</option>
                      <option value="GBP" className="bg-ink">British Pound (GBP)</option>
                      <option value="JPY" className="bg-ink">Japanese Yen (JPY)</option>
                      <option value="INR" className="bg-ink">Indian Rupee (INR)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted font-bold ml-1">Default Language</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <select 
                      value={prefForm.language}
                      onChange={(e) => setPrefForm({ ...prefForm, language: e.target.value })}
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all appearance-none"
                    >
                      <option value="English" className="bg-ink">English (UK/US)</option>
                      <option value="French" className="bg-ink">Français (French)</option>
                      <option value="Spanish" className="bg-ink">Español (Spanish)</option>
                      <option value="Japanese" className="bg-ink">日本語 (Japanese)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate/20 rounded-2xl border border-slate/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate flex items-center justify-center text-gold">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-[10px] text-muted">Receive alerts for upcoming activities</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPrefForm({ ...prefForm, notifications: !prefForm.notifications })}
                    className={`w-12 h-6 rounded-full transition-all relative ${prefForm.notifications ? 'bg-gold' : 'bg-slate/50'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-obsidian transition-all ${prefForm.notifications ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <button type="submit" className="bg-gold text-obsidian px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-light transition-all shadow-lg shadow-gold/20">
                  <Save className="w-5 h-5" /> Update Preferences
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="glass-card p-10 rounded-[3rem] space-y-10">
                <h2 className="text-3xl font-playfair">Security & Session</h2>
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Update Password</p>
                    <input 
                      type="password" 
                      placeholder="Current Password"
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                    />
                    <input 
                      type="password" 
                      placeholder="New Password"
                      className="w-full bg-slate/20 border border-slate/50 rounded-2xl p-4 focus:border-gold outline-none transition-all"
                    />
                    <button className="bg-gold text-obsidian px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest">Update Password</button>
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-[3rem] border-2 border-dashed border-ruby/30 bg-ruby/5 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-ruby">Danger Zone</h3>
                  <p className="text-sm text-muted">Irreversible actions concerning your travel data.</p>
                </div>
                <button 
                  onClick={handleClearData}
                  className="flex items-center gap-2 px-6 py-3 bg-ruby text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-ruby-dark transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Purge Local Storage
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
