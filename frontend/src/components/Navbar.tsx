import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'resolver') return '/resolver';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 glass-strong">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary transition-shadow group-hover:shadow-glow">
            <img src={logo} alt="UrbanShield AI" className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Urban<span className="text-gradient-primary">Shield</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(getDashboardPath())}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); navigate('/'); }}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-muted-foreground hover:text-foreground transition-all"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 hover:shadow-glow transition-all duration-300"
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex flex-row items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-card overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-2">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => { navigate(getDashboardPath()); setMobileOpen(false); }} className="justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                  <Button variant="ghost" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="justify-start text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { navigate('/login'); setMobileOpen(false); }} className="justify-start">Sign In</Button>
                  <Button onClick={() => { navigate('/register'); setMobileOpen(false); }} className="gradient-primary text-primary-foreground">Get Started</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
