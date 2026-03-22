import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, MapPin, Search, AlertCircle, CheckCircle, Clock, Map, Sparkles, Navigation, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import ImageAnalyzer from '@/components/ImageAnalyzer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-city.jpg';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition, onLocationChange }: { position: any, setPosition: any, onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints?user_id=${user?._id || user?.id}`);
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  const captureLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          reverseGeocode(lat, lng);
        },
        () => toast.error("Please allow location access")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis) return toast.error("Please analyze an image first");
    if (!address && !location) return toast.error("Please provide a location");

    setSubmitting(true);
    try {
      const payload = {
        user_email: user?.email,
        issue_type: analysis.issueType,
        description: description || analysis.description,
        latitude: location?.lat,
        longitude: location?.lng,
        address,
        image_url: analysis.imageUrl,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`Complaint Submitted! Ref: ${data.ref}`);

      // Reset
      setAnalysis(null);
      setDescription('');
      setAddress('');
      setLocation(null);
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async (id: number, satisfied: boolean) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/complaints/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: id, satisfied, citizen_id: user?.id })
      });
      toast.success(satisfied ? "Thank you for confirming resolution." : "Complaint reopened & warning issued.");
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Forwarded': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Assigned': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'In Progress': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Resolved': return 'gradient-primary text-white border-primary/20 shadow-glow';
      case 'Closed': return 'bg-secondary text-muted-foreground border-border';
      default: return 'bg-secondary text-foreground';
    }
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'High') return <Badge variant="destructive" className="animate-pulse shadow-glow">High Severity</Badge>;
    if (sev === 'Medium') return <Badge variant="default" className="bg-orange-500 hover:bg-orange-500">Medium Severity</Badge>;
    return <Badge variant="secondary" className="bg-green-500/20 text-green-500">Low Severity</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1400px] mx-auto">
        <DashboardSidebar />
        <main className="flex-1 container max-w-6xl py-8 overflow-y-auto hide-scrollbar">

          {/* Attactive Hero Banner inside Dashboard */}
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-background shadow-elevated h-[200px] lg:h-[240px] flex items-center group">
            <img src={heroImage} alt="City Skyline" className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent/10 pointer-events-none" />
            <div className="relative z-10 px-6 lg:px-10 w-full max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Real-World AI Enabled
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground/95 mb-4 drop-shadow-sm">
                  Citizen <span className="text-gradient-primary font-black drop-shadow-sm">Command Center</span>
                </h1>
                <p className="text-base lg:text-lg text-foreground/80 font-bold leading-relaxed max-w-xl drop-shadow-sm">
                  Upload photos of civic issues. Our Vision AI accurately detects, classifies, and filters irrelevant images instantly for rapid city resolution.
                </p>
              </motion.div>
            </div>
          </div>



          <div className="grid grid-cols-1 gap-8 items-start">

            {/* CASE 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Stats Cards - inside Dashboard section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="glass-panel border-border/50 shadow-elevated">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 text-muted-foreground">
                      <CardTitle className="text-sm font-bold tracking-wider uppercase">Sent Applications</CardTitle>
                      <FileText className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-foreground">{complaints.length}</div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Total submitted</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-panel border-border/50 shadow-elevated">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 text-muted-foreground">
                      <CardTitle className="text-sm font-bold tracking-wider uppercase">Active Complaints</CardTitle>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-foreground">
                        {complaints.filter((c: any) => ['New', 'In Progress', 'Assigned', 'Forwarded'].includes(c.status)).length}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Currently being processed</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-panel border-border/50 shadow-elevated">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 text-muted-foreground">
                      <CardTitle className="text-sm font-bold tracking-wider uppercase">Complaints Reviewed</CardTitle>
                      <Search className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-foreground">
                        {complaints.filter((c: any) => ['Forwarded', 'Assigned', 'In Progress', 'Resolved', 'Closed'].includes(c.status)).length}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Acknowledged by officials</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-panel border-border/50 shadow-elevated">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 text-muted-foreground">
                      <CardTitle className="text-sm font-bold tracking-wider uppercase">Issues Resolved</CardTitle>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-foreground">
                        {complaints.filter((c: any) => c.status === 'Resolved' || c.status === 'Closed').length}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Successfully completed</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-black flex items-center gap-2 mb-2">
                    <Clock className="h-6 w-6 text-primary" /> Application History
                  </h2>
                  {loading ? (
                    <div className="flex items-center justify-center p-12 text-muted-foreground">Loading history...</div>
                  ) : complaints.length === 0 ? (
                    <Card className="glass-panel border-dashed p-12 text-center text-muted-foreground font-semibold">
                      You haven't submitted any civic issue reports yet.
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {complaints.map((c) => (
                        <motion.div key={c.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                          <Card className="glass-panel overflow-hidden border-border/40 shadow-card hover:border-primary/30 transition-shadow">
                            <div className="p-5 flex gap-5">
                              {c.before_image && (
                                <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden border border-border/50">
                                  <img src={c.before_image} alt="Issue" className="h-full w-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-foreground uppercase truncate">{c.issue_type.replace('_', ' ')}</h3>
                                  <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-1">{c.address}</p>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/70 uppercase">
                                  <span>Ref: {c.reference_number}</span>
                                  <span>•</span>
                                  <span className="text-primary">{c.predicted_days} Days Est.</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CASE 2: REPORT PORTAL */}
            {activeTab === 'report' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: SUBMIT FORM */}
                <div className={`transition-all duration-500 ${analysis ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
                  <Card className="glass-panel border-border/50 shadow-elevated">
                    <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4 text-center">
                      <CardTitle className="inline-flex items-center gap-2 text-2xl font-black uppercase tracking-tight">
                        <Upload className="h-6 w-6 text-primary" /> Report Interface
                      </CardTitle>
                      <CardDescription className="font-bold">Upload and analyze civic issues instantly</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                      <ImageAnalyzer onAnalysisComplete={setAnalysis} />
                      {analysis && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-4 border-t border-border/50">
                          <div className="space-y-1 bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="text-sm font-bold text-primary flex items-center uppercase tracking-wide"><MapPin className="h-4 w-4 mr-2" /> Set Location</p>
                            <p className="text-xs text-muted-foreground/80 font-medium">Please pinpoint the issue on the map or use Auto-GPS.</p>
                          </div>
                          <Button onClick={() => navigate('/file-complaint', { state: { analysis, location, address } })} className="w-full h-14 gradient-primary text-primary-foreground font-black text-xl hover:opacity-90 transition-all shadow-glow mt-4 group">
                            File a Complaint <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1" />
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT: DYNAMIC (MAP or INFO) */}
                {analysis && (
                  <div className="lg:col-span-8 space-y-6">
                    <Card className="glass-panel border-border/50 shadow-elevated overflow-hidden">
                      <CardHeader className="bg-primary/10 border-b border-border/50 p-5">
                        <CardTitle className="text-xl font-black flex items-center gap-2 text-primary uppercase">
                          <Sparkles className="h-6 w-6" /> AI Analysis Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 flex items-center gap-6 text-foreground">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-success/20 shadow-inner">
                          <CheckCircle className="h-10 w-10 text-success" />
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-3">
                            <h2 className="text-3xl font-black uppercase leading-none">{analysis.issueType.replace('_', ' ')}</h2>
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-xs">{(analysis.confidence * 100).toFixed(1)}% Confidence</Badge>
                          </div>
                          <p className="mt-3 text-base text-muted-foreground font-bold leading-relaxed">{analysis.description}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-panel border-border/50 shadow-elevated overflow-hidden flex flex-col h-[600px]">
                      <CardHeader className="bg-secondary/20 border-b border-border/50 shrink-0 p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-2xl font-black flex items-center gap-3 uppercase">
                              <MapPin className="h-6 w-6 text-primary" /> Pinpoint Location
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-bold">Drag or click to set coordinates</CardDescription>
                          </div>
                          <Button variant="outline" onClick={captureLocation} className="h-12 px-6 hover:bg-primary/10 hover:text-primary border-border/50 group font-bold">
                            <Navigation className="h-5 w-5 mr-2 group-hover:animate-bounce" /> Auto-GPS
                          </Button>
                        </div>
                      </CardHeader>
                      <div className="flex-1 relative z-0">
                        <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                          <LocationMarker position={location} setPosition={setLocation} onLocationChange={reverseGeocode} />
                        </MapContainer>
                        <div className="absolute bottom-6 left-6 right-6 z-[400] bg-background/95 backdrop-blur-md p-5 rounded-2xl border border-border/50 shadow-2xl">
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                            <Input placeholder="Manually type address..." value={address} onChange={e => setAddress(e.target.value)} className="flex-1 bg-secondary/50 h-12 font-bold" />
                            {location && <Badge className="h-12 px-5 text-sm font-black bg-primary/10 text-primary border-primary/20">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Badge>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
