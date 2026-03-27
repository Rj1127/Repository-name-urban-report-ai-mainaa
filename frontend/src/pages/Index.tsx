import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Camera, MapPin, Zap, CheckCircle, BarChart3, ArrowRight, Sparkles, Building2, Trash2, ChevronLeft, ChevronRight, Eye, GitMerge, Activity } from 'lucide-react';
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

// Slides configuration — slides 2 & 3 use bgContent (JSX overlay) instead of a real image file.
// Only slide 1 (the hero) uses a real image asset.
const slides = [
  {
    image: heroImage,
    useImage: true,
    title: (
      <span className="text-white drop-shadow-2xl">
        Rapid Issue<br />
        Resolution
      </span>
    ),
    subtitle: "ACTIVE GOVERNANCE — CIVILDRISHTI BHARAT",
    subtitleColor: "text-amber-400 bg-amber-400/20 border-amber-400/40",
    showCard: true,
    bg: ""
  },
  {
    // Slide 2: AI Flow — CSS gradient + icons, no image file needed
    useImage: false,
    title: null,
    subtitle: "HOW CDB AI WORKS",
    subtitleColor: "text-emerald-400 bg-emerald-400/20 border-emerald-400/40",
    showCard: false,
    bg: "bg-gradient-to-br from-[#0a1a0f] via-[#0d2318] to-[#050d0a]"
  },
  {
    // Slide 3: Platform Stats — CSS gradient, no image file needed
    useImage: false,
    title: null,
    subtitle: "PLATFORM AT A GLANCE",
    subtitleColor: "text-blue-400 bg-blue-400/20 border-blue-400/40",
    showCard: false,
    bg: "bg-gradient-to-br from-[#050a1a] via-[#0a1030] to-[#07091f]"
  }
];

export default function Index() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
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

      {/* Hero Carousel Section */}
      <section className="relative pt-12 pb-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`relative aspect-[21/9] w-full overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10 ${!slides[currentSlide].useImage ? slides[currentSlide].bg : ''}`}
              >
                {/* Slide 1: Real hero image background */}
                {slides[currentSlide].useImage && slides[currentSlide].image && (
                  <>
                    <motion.img
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 10, ease: "linear" }}
                      src={slides[currentSlide].image}
                      alt="Slide Background"
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  </>
                )}

                {/* Slide 2: AI Flow — CSS-only content panel */}
                {currentSlide === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
                    <div className="w-full max-w-3xl">
                      <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-8">CivicDrishti Bharat — AI Processing Pipeline</p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {[
                          { icon: Camera, label: 'Citizen', sub: 'Uploads Photo', color: 'from-emerald-500 to-emerald-700' },
                          { icon: Eye, label: 'AI Vision', sub: 'Classifies Issue', color: 'from-blue-500 to-blue-700' },
                          { icon: MapPin, label: 'GPS Tag', sub: 'Pinpoints Area', color: 'from-purple-500 to-purple-700' },
                          { icon: GitMerge, label: 'Smart Route', sub: 'Assigns Engineer', color: 'from-orange-500 to-orange-700' },
                          { icon: CheckCircle, label: 'Resolved', sub: 'Verified by AI', color: 'from-green-500 to-green-700' },
                        ].map((step, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-[80px]">
                            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                              <step.icon className="h-7 w-7 text-white" />
                            </div>
                            <p className="text-white font-black text-sm">{step.label}</p>
                            <p className="text-white/60 text-[10px] font-bold text-center">{step.sub}</p>
                            {i < 4 && <div className="hidden sm:block absolute" />}
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 grid grid-cols-3 gap-4">
                        {[
                          { value: '98%', label: 'AI Accuracy', color: 'text-emerald-400' },
                          { value: '<2hr', label: 'Avg Resolution', color: 'text-blue-400' },
                          { value: '10K+', label: 'Issues Solved', color: 'text-amber-400' },
                        ].map((stat, i) => (
                          <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Slide 3: Platform stats — CSS-only content panel */}
                {currentSlide === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
                    <div className="w-full max-w-3xl text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-black text-lg">CDB</span>
                          </div>
                          <div className="text-left">
                            <p className="text-white font-black text-2xl tracking-tight">CivicDrishti Bharat</p>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Urban AI Governance Platform</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { value: '50+', label: 'Cities Active', icon: Building2, color: 'from-blue-500 to-blue-700' },
                          { value: '99.98%', label: 'Platform Uptime', icon: Activity, color: 'from-emerald-500 to-green-700' },
                          { value: '24/7', label: 'AI Monitoring', icon: Eye, color: 'from-purple-500 to-purple-700' },
                          { value: '10K+', label: 'Complaints Resolved', icon: CheckCircle, color: 'from-amber-500 to-orange-600' },
                        ].map((item, i) => (
                          <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3`}>
                              <item.icon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-white font-black text-xl">{item.value}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mt-1">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtitle badge overlay (all slides) */}
                <div className="absolute bottom-12 left-12 z-20 max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${slides[currentSlide].subtitleColor}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {slides[currentSlide].subtitle}
                  </motion.div>

                  {slides[currentSlide].title && (
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] text-white drop-shadow-2xl">
                      {slides[currentSlide].title}
                    </h1>
                  )}
                </div>

                {/* CTA Button (slide 1 only) */}
                {slides[currentSlide].showCard && (
                  <div className="absolute bottom-12 right-12 z-20 hidden md:block">
                    <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="px-8 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest hover:shadow-glow transition-all"
                    >
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>


            {/* Navigation Dots (Outside/Below Container) */}
            <div className="mt-8 flex justify-center gap-2.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 transition-all duration-500 rounded-full ${currentSlide === idx ? 'w-10 bg-primary shadow-glow-sm' : 'w-2 bg-primary/20 hover:bg-primary/40'}`}
                />
              ))}
            </div>
            
            {/* Side Controls (Floating) */}
            <div className="absolute top-1/2 -left-6 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="h-12 w-12 rounded-full glass border-white/10 text-white hover:bg-white/10 shadow-xl">
                 <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute top-1/2 -right-6 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)} className="h-12 w-12 rounded-full glass border-white/10 text-white hover:bg-white/10 shadow-xl">
                 <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Report Section (Moved below hero for consistency) */}
      {slides[0].showCard && (
        <section className="container max-w-4xl mx-auto px-4 mb-24 -mt-12 relative z-40">
           <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
           >
             <Card className="glass-strong border-white/10 shadow-2xl p-4 sm:p-8 backdrop-blur-2xl rounded-[2rem]">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                         <Shield className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-2xl tracking-tight">CDB Command Centre</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Autonomous Governance Hub</p>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-6 justify-center">
                      {[
                        { label: "AI Verification", value: "Active", color: "text-emerald-400" },
                        { label: "Pan-Bharat", value: "Coverage", color: "text-blue-400" },
                        { label: "Uptime", value: "99.98%", color: "text-amber-400" }
                      ].map((item, idx) => (
                        <div key={idx} className="text-center px-4 border-r border-white/5 last:border-0">
                          <p className={`text-lg font-black uppercase ${item.color}`}>{item.value}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                        </div>
                      ))}
                   </div>

                   <Button onClick={() => navigate('/register')} className="gradient-primary text-white font-black uppercase tracking-widest px-8 rounded-xl h-12">
                      Join Platform
                   </Button>
                </div>
             </Card>
           </motion.div>
        </section>
      )}

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
              How <span className="text-gradient-primary">CivicDrishti Bharat</span> Works
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
            <span className="font-bold text-foreground">CivicDrishti Bharat</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CivicDrishti Bharat — Smart Civic Issue Detection Platform</p>
        </div>
      </footer>
    </div>
  );
}
