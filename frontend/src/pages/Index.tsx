import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Camera, MapPin, Zap, CheckCircle, BarChart3, ArrowRight, Sparkles, Building2, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import heroImage from '@/assets/hero-city.jpg';

const features = [
  { icon: Camera, title: 'AI Vision Detection', desc: 'Upload a photo and our AI instantly identifies potholes, garbage, drains & road damage with precision', gradient: 'from-primary/20 to-primary/5' },
  { icon: MapPin, title: 'GPS Pinpointing', desc: 'Automatic GPS detection marks the exact location on an interactive heatmap', gradient: 'from-accent/20 to-accent/5' },
  { icon: Zap, title: 'Instant Routing', desc: 'Smart assignment routes issues to the nearest resolver for rapid action', gradient: 'from-warning/20 to-warning/5' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time dashboards with KPIs, heatmaps, and AI-verified resolution tracking', gradient: 'from-success/20 to-success/5' },
];

const stats = [
  { value: '10K+', label: 'Issues Resolved' },
  { value: '98%', label: 'AI Accuracy' },
  { value: '<2hr', label: 'Avg Response' },
  { value: '50+', label: 'Cities Active' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Official State Emblem Banner */}
      <div className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-y-2 border-red-500/50 py-3 overflow-hidden relative shadow-lg z-40">
        <div className="container relative flex items-center justify-between">
          <div className="flex items-center gap-5 z-10 w-full">
            {/* Ashoka Lion Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="shrink-0 bg-white flex items-center justify-center h-14 w-14 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] border-2 border-amber-500 p-1.5 z-20"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                alt="Satyameva Jayate"
                className="h-full w-full object-contain"
              />
            </motion.div>

            {/* Animated Marquee Text */}
            <div className="flex-1 overflow-hidden relative flex items-center h-full [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                className="flex whitespace-nowrap items-center text-white font-bold tracking-widest text-[13px] sm:text-[15px] uppercase"
              >
                {[...Array(6)].map((_, i) => (
                  <span key={i} className="flex items-center gap-8 mx-6">
                    <span className="flex items-center gap-2.5 text-amber-300 drop-shadow-md">
                      <Shield className="h-5 w-5" /> SMART MUNICIPAL GOVERNANCE
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70"></span>
                    <span className="flex items-center gap-2.5 text-blue-200 drop-shadow-md">
                      <Building2 className="h-5 w-5" /> AI CIVIC REPORTING
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70"></span>
                    <span className="flex items-center gap-2.5 text-emerald-200 drop-shadow-md">
                      <Trash2 className="h-5 w-5" /> RAPID CITY RESOLUTION
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70"></span>
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Smart city" className="h-full w-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(160_84%_39%/0.08),transparent_60%)]" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="container relative grid gap-12 py-24 lg:grid-cols-2 lg:py-36">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Civic Intelligence Platform
            </motion.div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground lg:text-6xl xl:text-7xl leading-[1.1]">
              Report Issues.{' '}
              <span className="text-gradient-primary">AI Detects.</span>
              <br />City Resolves.
            </h1>
            <p className="mb-10 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Smart Nagar Reporting portal(SNRP) uses computer vision to instantly detect civic infrastructure problems.
              Upload a photo → AI classifies it → Track resolution in real-time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="h-13 px-8 gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all duration-300 hover:shadow-glow group"
              >
                Start Reporting
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="h-13 px-8 border-border/50 text-foreground font-semibold text-base hover:bg-secondary hover:border-primary/30 transition-all duration-300"
              >
                Sign In
              </Button>
            </div>

            {/* Testing Links - Easy Dashboard Access */}
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Quick Test Navigation
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                >
                  Citizen Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                >
                  Admin Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/resolver')}
                  className="bg-background/50 hover:bg-background border border-border/50 shadow-sm transition-all"
                >
                  Resolver Dashboard
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:flex items-center justify-center"
          >
            <Card className="w-full max-w-md glass-strong shadow-elevated border-border/30 hover:shadow-glow transition-shadow duration-500">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Quick Report</h3>
                </div>
                <div className="space-y-5">
                  {['Upload Photo', 'AI Detects Issue', 'Submit & Track'].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-secondary"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <span className="font-semibold text-foreground">{step}</span>
                      {i < 2 && <CheckCircle className="ml-auto h-5 w-5 text-primary/60" />}
                    </motion.div>
                  ))}
                </div>
                <Button
                  className="mt-6 w-full h-12 gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-300 hover:shadow-glow"
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-secondary/30">
        <div className="container py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {stats.map(s => (
              <motion.div key={s.label} variants={itemVariants} className="text-center">
                <p className="text-3xl font-extrabold text-gradient-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-extrabold text-foreground lg:text-4xl">
              How <span className="text-gradient-primary">Smart Nagar Reporting portal(SNRP)</span> Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              End-to-end civic issue management powered by AI vision, GPS tracking, and real-time analytics
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="group h-full border-2 border-primary/10 bg-primary/5 backdrop-blur-sm shadow-card transition-all duration-500 hover:shadow-glow hover:bg-primary/10 hover:border-primary/30 hover:-translate-y-1">
                  <CardContent className="p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className={`shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} transition-transform duration-500 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] shadow-sm bg-white/50`}>
                      <f.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold text-foreground">{f.title}</h3>
                      <p className="text-[15px] leading-relaxed text-muted-foreground">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 text-center">
        <div className="container">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Smart Nagar Reporting portal(SNRP)</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Smart Nagar Reporting portal(SNRP) — Smart Civic Issue Detection Platform</p>
        </div>
      </footer>
    </div>
  );
}
