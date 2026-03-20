import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, MapPin, Search, AlertCircle, CheckCircle, Clock, Map, Sparkles, Navigation } from 'lucide-react';
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints?user_id=${user?.id}`);
      const data = await res.json();
      setComplaints(data);
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
            <img src={heroImage} alt="City Skyline" className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:scale-105 group-hover:opacity-30 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none" />
            <div className="relative z-10 px-6 lg:px-10 w-full max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Real-World AI Enabled
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">
                  Citizen <span className="text-gradient-primary">Command Center</span>
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                  Upload photos of civic issues. Our Vision AI accurately detects, classifies, and filters irrelevant images instantly for rapid city resolution.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT: SUBMIT FORM */}
            <div className={`transition-all duration-500 ${analysis ? 'lg:col-span-4' : 'lg:col-span-5'}`}>
              <Card className="glass-panel border-border/50 shadow-elevated">
                <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Upload className="h-5 w-5 text-primary" /> Report Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">

                  <ImageAnalyzer onAnalysisComplete={setAnalysis} />

                  {analysis && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-4 border-t border-border/50">
                      <div className="space-y-1 bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <p className="text-sm font-semibold text-primary flex items-center"><MapPin className="h-4 w-4 mr-1.5" /> Set Location</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Please pinpoint the exact location on the large map to the right or use Auto-GPS.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Additional Context (Optional)</label>
                        <Input
                          placeholder={analysis.description || "Add any specific details..."}
                          value={description} onChange={e => setDescription(e.target.value)}
                          className="bg-secondary/50"
                        />
                      </div>

                      <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 gradient-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all shadow-glow mt-2">
                        {submitting ? 'Submitting...' : 'Dispatch to Authorities'}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: DYNAMIC (MAP or HISTORY) */}
            <div className={`transition-all duration-500 ${analysis ? 'lg:col-span-8' : 'lg:col-span-7'} space-y-4`}>
              {analysis ? (
                <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  {/* NEW AI REPORT CARD */}
                  <Card className="glass-panel border-border/50 shadow-elevated overflow-hidden">
                    <CardHeader className="bg-primary/10 border-b border-border/50 p-4">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" /> AI Analysis Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/20">
                        <CheckCircle className="h-7 w-7 text-success" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-extrabold capitalize text-foreground text-xl">
                            {analysis.issueType.replace('_', ' ')}
                          </span>
                          <span className="ml-3 rounded-md bg-primary/10 border border-primary/30 px-2 py-0.5 text-xs font-bold text-primary">
                            {(analysis.confidence * 100).toFixed(1)}% Confidence
                          </span>
                        </div>
                        {analysis.description && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">{analysis.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-border/50 shadow-elevated overflow-hidden flex flex-col h-[500px]">
                    <CardHeader className="bg-secondary/20 border-b border-border/50 shrink-0 p-4 lg:p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" /> Pinpoint Exact Location
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm">Drag the map or click to set the exact coordinates for the issue.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={captureLocation} className="h-9 hover:bg-primary/10 hover:text-primary transition-colors border-border/50 group">
                          <Navigation className="h-4 w-4 mr-2 group-hover:animate-bounce" /> Auto-GPS
                        </Button>
                      </div>
                    </CardHeader>
                    <div className="flex-1 relative w-full h-full z-0 p-0">
                      <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={location} setPosition={setLocation} onLocationChange={reverseGeocode} />
                      </MapContainer>

                      {/* Address overlay inside map */}
                      <div className="absolute bottom-6 left-6 right-6 z-[400] bg-background/95 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-elevated">
                        <div className="flex flex-col md:flex-row gap-4">
                          <Input
                            placeholder="Or manually type the street address..."
                            value={address} onChange={e => setAddress(e.target.value)}
                            className="flex-1 bg-secondary/50 h-11"
                          />
                          {location && (
                            <div className="shrink-0 flex items-center px-4 h-11 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                              <MapPin className="h-4 w-4 mr-2" /> Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Tracking History
                  </h2>

                  {loading ? (
                    <div className="flex items-center justify-center p-12 text-muted-foreground">Loading history...</div>
                  ) : !Array.isArray(complaints) || complaints.length === 0 ? (
                    <Card className="glass-panel border-dashed p-12 text-center">
                      <p className="text-muted-foreground font-medium">No complaints submitted yet.</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {complaints.map((c) => (
                          <motion.div key={c.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} layout>
                            <Card className="glass-panel overflow-hidden border-border/40 shadow-card hover:border-primary/30 transition-colors">
                              <div className="p-5 flex flex-col md:flex-row gap-5">

                                {/* Left: Thumbnail */}
                                {c.before_image && (
                                  <div className="w-full md:w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-border/50 relative group">
                                    <img src={c.before_image} alt="Issue" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-1 left-1">
                                      {getSeverityBadge(c.severity)}
                                    </div>
                                  </div>
                                )}

                                {/* Right: Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-bold text-foreground text-lg uppercase truncate">{c.issue_type.replace('_', ' ')}</h3>
                                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                                        <MapPin className="h-3 w-3 mr-1" /> {c.address || `${c.latitude}, ${c.longitude}`}
                                      </p>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(c.status)}`}>
                                      {c.status}
                                    </span>
                                  </div>

                                  <p className="text-sm text-foreground mb-4 line-clamp-2">{c.description}</p>

                                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> Ref: {c.reference_number}</span>
                                    <span className="flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1 text-primary" /> AI Est. Resolution: {c.predicted_days} Days</span>
                                  </div>
                                </div>
                              </div>

                              {/* RESOLVED STATE - BEFORE / AFTER FEEDBACK UI */}
                              {c.status === 'Resolved' && c.after_image && (
                                <div className="border-t border-border/50 bg-secondary/10 p-5">
                                  <h4 className="font-bold text-sm text-primary mb-3 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1.5" /> Engineer Work Verification
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-border/50">
                                      <span className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-foreground">Before</span>
                                      <img src={c.before_image} className="w-full h-32 object-cover" alt="Before" />
                                    </div>
                                    <div className="relative rounded-lg overflow-hidden border-2 border-primary shadow-glow">
                                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm">After Resolution</span>
                                      <img src={c.after_image} className="w-full h-32 object-cover" alt="After" />
                                    </div>
                                  </div>

                                  {!c.citizen_satisfied ? (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                      <Button onClick={() => handleFeedback(c.id, true)} className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-glow">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Satisfied - Close Ticket
                                      </Button>
                                      <Button onClick={() => handleFeedback(c.id, false)} variant="destructive" className="flex-1">
                                        <AlertCircle className="mr-2 h-4 w-4" /> Not Satisfied - Reopen
                                      </Button>
                                    </div>
                                  ) : (
                                    <p className="text-sm font-bold text-success flex items-center justify-center p-2 bg-success/10 rounded-lg">
                                      <CheckCircle className="mr-2 h-4 w-4" /> You confirmed this issue was successfully resolved.
                                    </p>
                                  )}
                                </div>
                              )}

                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
