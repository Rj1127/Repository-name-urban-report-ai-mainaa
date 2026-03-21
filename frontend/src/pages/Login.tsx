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
import { Loader2, Shield, ArrowRight } from 'lucide-react';

const getDashboardForRole = (role: string | null) => {
  if (role === 'admin') return '/admin';
  if (role === 'resolver') return '/resolver';
  return '/dashboard';
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role) navigate(getDashboardForRole(user.role));
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(getDashboardForRole(storedUser.role || 'citizen'));
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
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
              <p className="text-sm text-muted-foreground mt-1">Sign in to your Smart Nagar Reporting portal(SNRP) account</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="h-11 bg-secondary/50 border-border/30 focus:border-primary/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="h-11 bg-secondary/50 border-border/30 focus:border-primary/50 transition-colors" />
                </div>
                <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all duration-300 hover:shadow-glow group" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Sign In
                  {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
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