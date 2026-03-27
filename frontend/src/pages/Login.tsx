import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Loader2, Shield, ArrowRight, ShieldAlert } from 'lucide-react';

const getDashboardForRole = (role: string | null) => {
  if (role === 'admin') return '/admin';
  if (role === 'resolver') return '/resolver';
  return '/dashboard';
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  // Track suspension state for showing a dedicated error UI
  const [suspendedError, setSuspendedError] = useState<string | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  useEffect(() => {
    if (user && user.role) navigate(getDashboardForRole(user.role));
  }, [user, navigate]);

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await login(email, password, undefined);
      if (res && res.requireOtp) {
        toast.success('A fresh OTP has been sent to your email');
        setTimeLeft(300);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setSuspendedError(null); // reset on each attempt
      const res = await login(email, password, step === 'otp' ? otp : undefined);

      if (res && res.requireOtp) {
        toast.success(res.message || 'OTP sent to email');
        setStep('otp');
        return;
      }

      toast.success('Logged in successfully');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(getDashboardForRole(storedUser.role || 'citizen'));
    } catch (err: any) {
      // Detect suspension-related errors from the backend (403)
      if (err.message && (err.message.includes('Account Suspended') || err.message.includes('suspended'))) {
        setSuspendedError(err.message);
      } else {
        toast.error(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative flex items-center justify-center py-20 min-h-[calc(100vh-64px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-right bg-no-repeat opacity-[0.25] dark:opacity-[0.25]"
          style={{ backgroundImage: "url('/map-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(160_84%_39%/0.15),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md px-4"
        >
          <Card className="border-border/30 shadow-elevated glass-strong">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-foreground">Welcome Back</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your CivicDrishti Bharat account</p>
            </CardHeader>
            <CardContent>
              {/* --- SUSPENSION NOTIFICATION BLOCK ---
                  Displays when a suspended engineer attempts to log in.
                  The block shows the full suspension message from the backend. */}
              {suspendedError && (
                <div className="mb-5 p-4 rounded-xl border-2 border-destructive bg-destructive/10">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldAlert className="h-6 w-6 text-destructive shrink-0" />
                    <p className="text-sm font-black text-destructive uppercase tracking-wider">Account Suspended</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {suspendedError.replace('⛔ ', '')}
                  </p>
                  <p className="text-[10px] text-destructive font-bold mt-3 uppercase tracking-widest">
                    Contact your administrator for the official suspension order.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                {step === 'login' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="h-11 bg-secondary/50 border-border/30 focus:border-primary/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                      <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="h-11 bg-secondary/50 border-border/30 focus:border-primary/50 transition-colors" />
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="text-center mb-4">
                      <Label className="text-muted-foreground text-sm">Enter the 6-digit code sent to <b className="text-foreground">{email}</b></Label>
                    </div>
                    <Input autoFocus id="otp" type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required placeholder="123456" className="h-14 text-center text-2xl tracking-[0.5em] font-bold bg-secondary/50 border-border/30 focus:border-primary/50 transition-colors" />
                    <div className="flex items-center justify-between text-sm mt-3 px-1">
                      <span className="text-muted-foreground font-medium">OTP expires in: <span className={timeLeft > 60 ? "text-primary" : "text-destructive"}>{formatTime(timeLeft)}</span></span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={timeLeft > 0 || loading}
                        className={`font-bold transition-colors ${timeLeft > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-primary hover:text-blue-500 underline underline-offset-2'}`}
                      >
                        Resend Code
                      </button>
                    </div>
                  </motion.div>
                )}
                <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all duration-300 hover:shadow-glow group" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {step === 'login' ? 'Sign In' : 'Verify Code'}
                  {!loading && step === 'login' && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Create Account
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}