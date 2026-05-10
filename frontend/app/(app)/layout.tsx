'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Map as MapIcon, 
  Search, 
  Compass, 
  CircleDollarSign, 
  CheckSquare, 
  User, 
  BookOpen, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  LogOut,
  Plane,
  Settings,
  Globe,
  Calendar,
  Clock,
  Menu,
  X as CloseIcon
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'New Trip', icon: PlusCircle, href: '/trips/new' },
  { label: 'My Trips', icon: MapIcon, href: '/trips' },
  { label: 'Builder', icon: Settings, href: '/builder' },
  { label: 'Timeline', icon: Clock, href: '/timeline' },
  { label: 'Explore', icon: Search, href: '/explore/cities' },
  { label: 'Activities', icon: Compass, href: '/explore/activities' },
  { label: 'Budget', icon: CircleDollarSign, href: '/budget' },
  { label: 'Checklist', icon: CheckSquare, href: '/checklist' },
  { label: 'Shared', icon: Globe, href: '/shared' },
  { label: 'Journal', icon: BookOpen, href: '/journal' },
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoaded } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      // Default collapse on tablet
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    // Close mobile sidebar on route change
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!isLoaded || !user) return <div className="min-h-screen bg-obsidian" />;

  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  
  const sidebarWidth = isMobile ? '0px' : (isCollapsed ? '80px' : '240px');

  const bottomNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Trips', icon: MapIcon, href: '/trips' },
    { label: 'Explore', icon: Search, href: '/explore/cities' },
    { label: 'Budget', icon: CircleDollarSign, href: '/budget' },
    { label: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-obsidian text-cream selection:bg-gold/30">
      {/* Sidebar - Desktop & Tablet */}
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={{ width: sidebarWidth }}
          className="fixed left-0 top-0 h-screen bg-ink border-r border-slate/50 z-50 flex flex-col transition-all duration-500 ease-in-out overflow-hidden"
        >
          {/* Logo */}
          <Link href="/">
            <div className="p-6 mb-4 flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Plane className="text-obsidian w-6 h-6" />
              </div>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-playfair text-xl tracking-[0.2em] font-light group-hover:text-gold transition-colors whitespace-nowrap"
                >
                  TRAVELOOP
                </motion.span>
              )}
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
            {navItems.filter(item => item.label !== 'Builder').map((item) => {
              // Exact match for dashboard, startswith for others except /trips/new which is distinct from /trips
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard'
                : item.href === '/trips'
                  ? pathname === '/trips' || (pathname.startsWith('/trips/') && !pathname.startsWith('/trips/new'))
                  : pathname.startsWith(item.href);
              
              return (
                <Link key={item.label + item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                      isActive ? 'bg-gold/10 text-gold' : 'text-muted hover:text-cream'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav-desktop"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold rounded-full"
                      />
                    )}
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-gold' : ''}`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-16 px-2 py-1 bg-gold text-obsidian text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-[60]">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-slate/50 space-y-2">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3 text-muted hover:text-ruby transition-colors rounded-xl group relative"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
              {isCollapsed && (
                <div className="absolute left-16 px-2 py-1 bg-ruby text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-[60]">
                  Logout
                </div>
              )}
            </button>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center gap-4 px-4 py-3 text-muted hover:text-gold transition-colors rounded-xl"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
            </button>
          </div>
        </motion.aside>
      )}

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-ink border-r border-slate/50 z-[101] flex flex-col"
            >
              <div className="p-6 border-b border-slate/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plane className="text-gold w-6 h-6" />
                  <span className="font-playfair text-xl tracking-wider">TRAVELOOP</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-muted hover:text-cream">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                {navItems.filter(item => item.label !== 'Builder').map((item) => {
                  const isActive = item.href === '/dashboard' 
                    ? pathname === '/dashboard'
                    : item.href === '/trips'
                      ? pathname === '/trips' || (pathname.startsWith('/trips/') && !pathname.startsWith('/trips/new'))
                      : pathname.startsWith(item.href);
                      
                  return (
                    <Link key={item.label} href={item.href}>
                      <div className={`flex items-center gap-4 px-4 py-4 rounded-xl ${isActive ? 'bg-gold/10 text-gold' : 'text-muted'}`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate/50">
                <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-4 text-ruby font-medium">
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-500 ease-in-out ${isMobile ? 'pb-24' : ''}`}
        style={{ marginLeft: isMobile ? '0px' : sidebarWidth }}
      >
        {/* Top Bar */}
        <header className="h-20 border-b border-slate/50 bg-obsidian/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-muted hover:text-gold transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted">
              {isMobile ? (
                <div className="flex items-center gap-2">
                   <Plane className="text-gold w-5 h-5" />
                   <span className="font-playfair tracking-wider text-cream">TRAVELOOP</span>
                </div>
              ) : (
                <>
                  <span>App</span>
                  <span className="opacity-30">/</span>
                  <span className="text-cream font-medium capitalize">
                    {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {!isMobile && (
              <button className="relative text-muted hover:text-gold transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-ruby rounded-full border-2 border-obsidian" />
              </button>
            )}
            
            <Link href="/profile">
              <div className="flex items-center gap-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-cream group-hover:text-gold transition-colors">{user.name}</p>
                  <p className="text-[10px] text-muted uppercase tracking-tighter">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate/50 p-1 group-hover:border-gold transition-colors">
                  <div className="w-full h-full rounded-full bg-slate flex items-center justify-center text-gold font-bold text-xs">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className={`p-4 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-ink border-t border-slate/50 z-50 flex items-center justify-around px-4">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <div className={`flex flex-col items-center gap-1 ${isActive ? 'text-gold' : 'text-muted'}`}>
                  <item.icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
