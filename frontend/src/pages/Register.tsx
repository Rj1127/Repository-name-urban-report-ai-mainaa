import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Loader2, UserPlus, ArrowRight, Shield, Wrench, Building, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'citizen',
    gov_id: '',
    area: '',
    city: '',
    state: '',
    dept_name: '',
    head_of_dept: '',
    experience_level: '',
    position: '',
    area_expertise: ''
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInput = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative flex items-center justify-center py-20 px-4 min-h-[calc(100vh-64px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-right bg-no-repeat opacity-[0.25] dark:opacity-[0.25]"
          style={{ backgroundImage: "url('/map-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(160_84%_39%/0.15),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-2xl"
        >
          <Card className="border-border/30 shadow-elevated glass-strong">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 shadow-glow">
                <UserPlus className="h-7 w-7 text-primary" />
              </div>
              <div className="flex -space-x-3 mb-6 justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-background gradient-primary flex items-center justify-center shadow-md z-30"><UserPlus className="h-5 w-5 text-white" /></div>
                <div className="h-10 w-10 rounded-full border-2 border-background bg-blue-500 flex items-center justify-center shadow-md z-20"><Shield className="h-5 w-5 text-white" /></div>
                <div className="h-10 w-10 rounded-full border-2 border-background bg-orange-500 flex items-center justify-center shadow-md z-10"><Wrench className="h-5 w-5 text-white" /></div>
              </div>
              <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 pb-1">Create Your Account</CardTitle>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Join UrbanShield's unified civic protection network</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. UNIFIED COMMON FIELDS */}
                <div className="space-y-4 rounded-xl bg-secondary/20 p-6 border border-border/30 shadow-inner">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-5 flex items-center"><UserPlus className="h-4 w-4 mr-2" /> Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground flex items-center">Full Name</Label>
                      <Input id="name" value={formData.name} onChange={handleInput('name')} required placeholder="John Doe" className="bg-background border-border/50 h-11 focus:border-primary transition-colors hover:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground flex items-center"><Phone className="h-3 w-3 mr-1" /> Phone Number</Label>
                      <Input id="phone" value={formData.phone} onChange={handleInput('phone')} required placeholder="+1 234 567 8900" className="bg-background border-border/50 h-11 focus:border-primary transition-colors hover:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleInput('email')} required placeholder="you@example.com" className="bg-background border-border/50 h-11 focus:border-primary transition-colors hover:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <Input id="password" type="password" value={formData.password} onChange={handleInput('password')} required placeholder="••••••••" className="bg-background border-border/50 h-11 focus:border-primary transition-colors hover:border-primary/50" />
                    </div>
                  </div>
                </div>

                {/* 2. ROLE SELECTION */}
                <div className="space-y-4 rounded-xl bg-primary/5 p-5 border border-primary/20">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Account Type</h3>
                  <div className="space-y-2">
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className="h-12 bg-card border-primary/30 font-medium">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Customer (Citizen)</SelectItem>
                        <SelectItem value="resolver">Engineer (Resolver)</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 3. CONDITIONAL FIELDS BASED ON ROLE */}
                <AnimatePresence mode="popLayout">
                  {formData.role === 'citizen' && (
                    <motion.div
                      key="citizen"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 rounded-xl bg-secondary/20 p-5 border border-border/30 overflow-hidden"
                    >
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Customer Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Government ID (Demo Upload)</Label>
                          <Select onValueChange={val => setFormData(prev => ({ ...prev, gov_id: val }))}>
                            <SelectTrigger className="bg-secondary/50 border-border/30">
                              <SelectValue placeholder="Select demo preloaded ID" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }).map((_, i) => (
                                <SelectItem key={i} value={`demo_id_0${i + 1}.jpg`}>Demo ID 0{i + 1}.jpg</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Area</Label>
                          <Input value={formData.area} onChange={handleInput('area')} required placeholder="e.g. Downtown" className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">City</Label>
                          <Input value={formData.city} onChange={handleInput('city')} required placeholder="Metropolis" className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">State</Label>
                          <Input value={formData.state} onChange={handleInput('state')} required placeholder="NY" className="bg-secondary/50" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formData.role === 'admin' && (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 rounded-xl bg-secondary/20 p-5 border border-border/30 overflow-hidden"
                    >
                      <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500 mb-4 flex items-center"><Shield className="h-4 w-4 mr-2" /> Admin Authority Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center"><Building className="h-3 w-3 mr-1" /> Department Name</Label>
                          <Input value={formData.dept_name} onChange={handleInput('dept_name')} required placeholder="e.g. Public Works" className="bg-secondary/50 focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center"><Briefcase className="h-3 w-3 mr-1" /> Head of Department</Label>
                          <Input value={formData.head_of_dept} onChange={handleInput('head_of_dept')} required placeholder="Manager Name" className="bg-secondary/50 focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center"><Shield className="h-3 w-3 mr-1" /> Government ID Number</Label>
                          <Input value={formData.gov_id} onChange={handleInput('gov_id')} required placeholder="Admin-ID-1234" className="bg-secondary/50 focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center"><MapPin className="h-3 w-3 mr-1" /> City</Label>
                          <Input value={formData.city} onChange={handleInput('city')} required placeholder="City Name" className="bg-secondary/50 focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center"><MapPin className="h-3 w-3 mr-1" /> State</Label>
                          <Input value={formData.state} onChange={handleInput('state')} required placeholder="State Name" className="bg-secondary/50 focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center"><GraduationCap className="h-3 w-3 mr-1" /> Experience Level</Label>
                          <Select onValueChange={val => setFormData(prev => ({ ...prev, experience_level: val }))}>
                            <SelectTrigger className="bg-secondary/50 border-border/30 focus:border-blue-500"><SelectValue placeholder="Years" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Junior (1-3)">Junior (1-3 yrs)</SelectItem>
                              <SelectItem value="Mid (4-7)">Mid (4-7 yrs)</SelectItem>
                              <SelectItem value="Senior (8+)">Senior (8+ yrs)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formData.role === 'resolver' && (
                    <motion.div
                      key="engineer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 rounded-xl bg-secondary/20 p-5 border border-border/30 overflow-hidden"
                    >
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Engineer Operational Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Department</Label>
                          <Select onValueChange={val => setFormData(prev => ({ ...prev, dept_name: val }))}>
                            <SelectTrigger className="bg-secondary/50 border-border/30"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Roads & Highways">Roads & Highways</SelectItem>
                              <SelectItem value="Water & Sanitation">Water & Sanitation</SelectItem>
                              <SelectItem value="Electricity board">Electricity Board</SelectItem>
                              <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Position</Label>
                          <Input value={formData.position} onChange={handleInput('position')} required placeholder="e.g. Field Technician" className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Experience Level</Label>
                          <Select onValueChange={val => setFormData(prev => ({ ...prev, experience_level: val }))}>
                            <SelectTrigger className="bg-secondary/50 border-border/30"><SelectValue placeholder="Level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Junior">Junior</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Senior">Senior</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Area Expertise</Label>
                          <Input value={formData.area_expertise} onChange={handleInput('area_expertise')} required placeholder="e.g. Pipe plumbing, asphalt" className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-foreground">State Assigned</Label>
                          <Input value={formData.state} onChange={handleInput('state')} required placeholder="State Name" className="bg-secondary/50" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full h-14 gradient-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all duration-300 hover:shadow-glow group mt-2" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                  Complete Registration
                  {!loading && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign In
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}