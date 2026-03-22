import { useState, useEffect } from 'react';
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
import { getStates, getDistricts, getBlocks } from '@/data/indiaLocationData';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91',
    password: '',
    role: 'citizen',
    gov_id_type: '',
    gov_id_number: '',
    gov_id_file: null as File | null,
    area: '',
    district: '',
    state: '',
    pincode: '',
    dept_name: '',
    head_of_dept: '',
    experience_level: '',
    position: '',
    area_expertise: ''
  });

  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInput = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  const handleStateChange = (value: string) => {
    setFormData(prev => ({ ...prev, state: value, district: '', area: '' }));
  };

  const handleDistrictChange = (value: string) => {
    setFormData(prev => ({ ...prev, district: value, area: '' }));
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, otp: undefined };
      const res = await register(payload);
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
      const payload = { ...formData, otp: step === 'otp' ? otp : undefined };
      const res = await register(payload);

      if (res && res.requireOtp) {
        toast.success(res.message || 'OTP sent to email. Please verify.');
        setStep('otp');
        return;
      }

      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const states = getStates();
  const districts = formData.state ? getDistricts(formData.state) : [];
  const blocks = formData.state && formData.district ? getBlocks(formData.state, formData.district) : [];

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
              <p className="text-sm text-muted-foreground mt-2 font-medium">Join Smart Nagar Reporting portal(SNRP)'s unified civic protection network</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {step === 'register' ? (
                  <>
                    {/* 1. BASIC INFORMATION */}
                    <div className="space-y-4 rounded-xl bg-secondary/20 p-6 border border-border/30 shadow-inner">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-5 flex items-center"><UserPlus className="h-4 w-4 mr-2" /> Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-foreground flex items-center">Full Name</Label>
                          <Input id="name" value={formData.name} onChange={handleInput('name')} required placeholder="John Doe" className="bg-background border-border/50 h-11 focus:border-primary transition-colors hover:border-primary/50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-foreground flex items-center"><Phone className="h-3 w-3 mr-1" /> Phone Number</Label>
                          <div className="flex h-11 rounded-md border border-border/50 bg-background overflow-hidden focus-within:border-primary hover:border-primary/50 transition-colors">
                            <span className="flex items-center px-3 bg-muted/60 border-r border-border/50 text-sm font-semibold text-foreground select-none shrink-0">+91</span>
                            <input
                              id="phone"
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              minLength={10}
                              pattern="[0-9]{10}"
                              required
                              placeholder="10 digit number"
                              value={formData.phone.replace(/^\+91/, '')}
                              onChange={e => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData(prev => ({ ...prev, phone: '+91' + digits }));
                              }}
                              className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50"
                            />
                          </div>
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
                          className="space-y-5 rounded-xl bg-secondary/20 p-5 border border-border/30 overflow-hidden"
                        >
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Customer Details</h3>

                          {/* Government ID Section */}
                          <div className="space-y-4 rounded-lg bg-primary/5 p-4 border border-primary/10">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center"><Shield className="h-3.5 w-3.5 mr-1.5" /> Government ID Verification</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-foreground">ID Type</Label>
                                <Select onValueChange={val => setFormData(prev => ({ ...prev, gov_id_type: val }))}>
                                  <SelectTrigger className="bg-background border-border/50"><SelectValue placeholder="Select ID Type" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                    <SelectItem value="pan">PAN Card</SelectItem>
                                    <SelectItem value="driving_licence">Driving Licence</SelectItem>
                                    <SelectItem value="voter_id">Voter ID</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-foreground">ID Number</Label>
                                <Input value={formData.gov_id_number} onChange={handleInput('gov_id_number')} required placeholder="Enter your ID number" className="bg-background border-border/50" />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-foreground">Upload ID Document</Label>
                                <Input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={e => setFormData(prev => ({ ...prev, gov_id_file: e.target.files?.[0] || null }))}
                                  className="bg-background border-border/50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Location Section */}
                          <div className="space-y-4 rounded-lg bg-primary/5 p-4 border border-primary/10">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center"><MapPin className="h-3.5 w-3.5 mr-1.5" /> Address Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-foreground">State</Label>
                                <Select value={formData.state} onValueChange={handleStateChange}>
                                  <SelectTrigger className="bg-background border-border/50"><SelectValue placeholder="Select State" /></SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-foreground">District</Label>
                                <Select value={formData.district} onValueChange={handleDistrictChange} disabled={!formData.state}>
                                  <SelectTrigger className="bg-background border-border/50"><SelectValue placeholder={formData.state ? "Select District" : "Select State first"} /></SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-foreground">Block / Area</Label>
                                <Select value={formData.area} onValueChange={val => setFormData(prev => ({ ...prev, area: val }))} disabled={!formData.district}>
                                  <SelectTrigger className="bg-background border-border/50"><SelectValue placeholder={formData.district ? "Select Block" : "Select District first"} /></SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {blocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-foreground">Pin Code</Label>
                                <Input value={formData.pincode} onChange={handleInput('pincode')} required placeholder="6-digit pin code" maxLength={6} pattern="[0-9]{6}" className="bg-background border-border/50" />
                              </div>
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
                              <Input value={formData.gov_id_number} onChange={handleInput('gov_id_number')} required placeholder="Admin-ID-1234" className="bg-secondary/50 focus:border-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground flex items-center"><MapPin className="h-3 w-3 mr-1" /> State</Label>
                              <Select value={formData.state} onValueChange={handleStateChange}>
                                <SelectTrigger className="bg-secondary/50 border-border/30 focus:border-blue-500"><SelectValue placeholder="Select State" /></SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
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
                              <Select value={formData.state} onValueChange={handleStateChange}>
                                <SelectTrigger className="bg-secondary/50 border-border/30"><SelectValue placeholder="Select State" /></SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 py-8">
                    <div className="text-center mb-6">
                      <Label className="text-muted-foreground text-base">Enter the 6-digit code sent to <b className="text-foreground">{formData.email}</b></Label>
                    </div>
                    <Input autoFocus id="otp" type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required placeholder="123456" className="h-16 text-center text-3xl tracking-[0.5em] font-bold bg-secondary/50 border-border/30 focus:border-primary/50 transition-colors" />
                    <div className="flex items-center justify-between text-sm mt-4 px-2">
                      <span className="text-muted-foreground font-medium text-base">OTP expires in: <span className={timeLeft > 60 ? "text-primary" : "text-destructive"}>{formatTime(timeLeft)}</span></span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={timeLeft > 0 || loading}
                        className={`font-bold transition-colors text-base ${timeLeft > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-primary hover:text-blue-500 underline underline-offset-4'}`}
                      >
                        Resend Code
                      </button>
                    </div>
                  </motion.div>
                )}

                <Button type="submit" className="w-full h-14 gradient-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all duration-300 hover:shadow-glow group mt-2" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                  {step === 'register' ? 'Continue to Verification' : 'Verify & Create Account'}
                  {!loading && step === 'register' && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
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