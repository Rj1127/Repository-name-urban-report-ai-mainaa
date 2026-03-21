import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, LayoutDashboard, Menu, X, Landmark, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { WeatherWidget } from '@/components/WeatherWidget';
import { TimeWidget } from '@/components/TimeWidget';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Smart Nagar Reporting portal(<span className="text-gradient-primary">SNRP</span>)
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <WeatherWidget />
          <TimeWidget />
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 flex items-center gap-2 pl-1.5 pr-3 rounded-full hover:bg-secondary border border-border/50 transition-all">
                    <Avatar className="h-6 w-6 border border-border/50 shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=800000,000000`} alt={user.name} />
                      <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-semibold">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground tracking-tight">{user.name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 border-border/50 shadow-lg mt-1" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <LanguageToggle />
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
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-border/50 bg-secondary/20 rounded-lg mx-2 mt-2">
                    <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=800000,000000`} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => { navigate('/profile'); setMobileOpen(false); }} className="justify-start mx-2">
                    <User className="mr-2 h-4 w-4" /> View Profile
                  </Button>
                  <Button variant="ghost" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="justify-start text-destructive hover:bg-destructive/10 mx-2">
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
