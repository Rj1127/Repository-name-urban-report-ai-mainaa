import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle, Clock, MapPin, Activity, Shield, Hash, Search, BarChart3, Map as MapIcon, TrendingUp, AlertOctagon, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'command-center';
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [filteredEngineers, setFilteredEngineers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [compRes, engRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/complaints`),
        fetch(`${import.meta.env.VITE_API_URL}/engineers`)
      ]);
      const compData = await compRes.json();
      const engData = await engRes.json();
      setComplaints(compData);
      setEngineers(engData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (complaint: any) => {
    setSelectedComplaint(complaint);
    let suggestedDept = "Roads & Highways";
    if (['waterlogging', 'leak'].includes(complaint.issue_type)) suggestedDept = "Water & Sanitation";
    if (['broken_streetlight', 'wires'].includes(complaint.issue_type)) suggestedDept = "Electricity board";

    const suggested = engineers.filter(e => e.dept_name === suggestedDept || !e.dept_name)
      .sort((a, b) => a.active_tasks - b.active_tasks);

    setFilteredEngineers(suggested.length > 0 ? suggested : engineers);
    setAssignModalOpen(true);
  };

  const handleAssign = async (engineerId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: selectedComplaint.id || selectedComplaint._id, engineer_id: engineerId })
      });
      if (!res.ok) throw new Error("Assignment failed");
      toast.success("Engineer Assigned Successfully");
      setAssignModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'High') return <Badge variant="destructive" className="animate-pulse shadow-glow">HIGH</Badge>;
    if (sev === 'Medium') return <Badge className="bg-orange-500 hover:bg-orange-500">MEDIUM</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-500 text-white">LOW</Badge>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-500';
      case 'Forwarded': return 'bg-yellow-500/10 text-yellow-500';
      case 'Assigned': return 'bg-purple-500/10 text-purple-500';
      case 'In Progress': return 'bg-orange-500/10 text-orange-500';
      case 'Resolved': return 'bg-green-500/10 text-green-500 border border-green-500';
      case 'Closed': return 'bg-secondary text-muted-foreground';
      default: return 'bg-secondary text-foreground';
    }
  };

  const getEngineerStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500 text-white';
      case 'Busy': return 'bg-orange-500 text-white';
      case 'On Leave': return 'bg-destructive text-white';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden w-full max-w-[1400px] mx-auto">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* 1. COMMAND CENTRE */}
            {activeTab === 'command-center' && (
              <motion.div key="command" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" /> Command Centre
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">Monitor regional infrastructure issues and dispatch engineers.</p>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by Reference # or Type..." className="pl-10 h-12 bg-secondary/30 border-border/50" />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center p-12"><Activity className="animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(complaints) && complaints.map(c => (
                      <Card key={c.id || c._id} className="glass-panel hover:border-primary/50 transition-colors p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 flex gap-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border border-transparent ${getStatusColor(c.status)}`}>
                            {c.status}
                          </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-5 pr-20">
                          <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-border/50">
                            {c.before_image ?
                              <img src={c.before_image} alt="Issue" className="w-full h-full object-cover" /> :
                              <div className="w-full h-full bg-secondary flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-muted-foreground" /></div>
                            }
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityBadge(c.severity)}
                              <span className="text-xs font-bold tracking-wider text-muted-foreground flex items-center">
                                <Hash className="h-3 w-3 mr-[2px]" />{c.reference_number}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg text-foreground capitalize mb-1">{c.issue_type?.replace('_', ' ') || 'Unknown Issue'}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">Reported by: <span className="font-semibold">{c.citizen_name || 'Anonymous'}</span></p>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium mt-3">
                              <span className="flex items-center text-primary bg-primary/10 px-2 py-1 rounded-md">
                                <MapPin className="h-3.5 w-3.5 mr-1" /> {c.address || `Lat: ${c.latitude?.toFixed(4)}, Lng: ${c.longitude?.toFixed(4)}`}
                              </span>
                              <span className="flex items-center text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md">
                                <Clock className="h-3.5 w-3.5 mr-1" /> AI ETA: {c.predicted_days} Days
                              </span>
                              <span className="flex items-center text-muted-foreground">
                                {new Date(c.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end shrink-0 md:justify-start mt-4 md:mt-0">
                            {c.status === 'New' && (
                              <Button onClick={() => handleOpenAssign(c)} className="gradient-primary text-primary-foreground font-bold shadow-glow hover:scale-105 transition-transform">
                                Assign Engineer
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. ADMIN DASHBOARD (STATS) */}
            {activeTab === 'dashboard' && (
              <motion.div key="stats" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-blue-500" /> Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">System-wide performance overview and civic health metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Complaints', value: complaints.length, icon: FileText, color: 'text-blue-500' },
                    { label: 'Resolved Cases', value: complaints.filter(c => c.status === 'Closed' || c.status === 'Resolved').length, icon: CheckCircle, color: 'text-emerald-500' },
                    { label: 'Active Tasks', value: complaints.filter(c => ['Assigned', 'In Progress', 'Forwarded'].includes(c.status)).length, icon: Activity, color: 'text-orange-500' },
                    { label: 'Avg. Response', value: '1.2 Days', icon: Clock, color: 'text-purple-500' }
                  ].map((stat, i) => (
                    <Card key={i} className="glass-panel border-border/40">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-bold text-muted-foreground uppercase">{stat.label}</p>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div className="text-3xl font-black text-foreground">{stat.value}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="glass-panel border-border/40 min-h-[400px]">
                    <CardHeader><CardTitle className="text-lg font-bold uppercase tracking-wider">Issue Distribution</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Garbage', value: complaints.filter(c => c.issue_type === 'garbage').length },
                          { name: 'Pothole', value: complaints.filter(c => c.issue_type === 'pothole').length },
                          { name: 'Water', value: complaints.filter(c => c.issue_type === 'waterlogging').length },
                          { name: 'Light', value: complaints.filter(c => c.issue_type === 'broken_streetlight').length },
                        ]}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))'}} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-border/40 min-h-[400px]">
                    <CardHeader><CardTitle className="text-lg font-bold uppercase tracking-wider">Operational Efficiency</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center">
                       <div className="text-center">
                          <TrendingUp className="h-16 w-16 text-emerald-500 mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground font-medium">94% Efficiency Rate</p>
                          <p className="text-4xl font-black text-foreground mt-2">+12% from last month</p>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* 3. ENGINEER DETAILS */}
            {activeTab === 'engineers' && (
              <motion.div key="engineers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <Users className="h-8 w-8 text-purple-500" /> Engineer Details
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">Manage field personnel, track workloads, and monitor unit availability.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {engineers.map(eng => (
                    <Card key={eng.id || eng._id} className="glass-panel hover:border-purple-500/50 transition-colors p-6 overflow-hidden relative">
                       <div className={`absolute top-0 right-0 w-2 h-full ${getEngineerStatusColor(eng.activity_status)}`} />
                       <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="text-xl font-bold text-foreground">{eng.name}</h3>
                            <p className="text-sm text-muted-foreground">{eng.dept_name || 'General Resolver'}</p>
                         </div>
                         <Badge className={getEngineerStatusColor(eng.activity_status)}>{eng.activity_status}</Badge>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                             <span className="text-muted-foreground font-medium">Experience</span>
                             <span className="text-foreground font-bold">{eng.experience_level || 'Senior'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                             <span className="text-muted-foreground font-medium">Active Tasks</span>
                             <span className="text-primary font-bold">{eng.active_tasks}</span>
                          </div>
                          <div className="pt-4 border-t border-border/30">
                             <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Expertise</h4>
                             <div className="flex flex-wrap gap-2">
                                {eng.area_expertise?.split(',').map((ex: string) => (
                                  <Badge key={ex} variant="secondary" className="bg-secondary/50">{ex.trim()}</Badge>
                                )) || <Badge variant="secondary">Civic Management</Badge>}
                             </div>
                          </div>
                       </div>
                       <Button className="w-full mt-6 bg-secondary text-foreground hover:bg-secondary/80 font-bold">View History</Button>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. FLOOD RISK PREDICTOR */}
            {activeTab === 'flood-risk' && (
              <motion.div key="flood" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <Activity className="h-8 w-8 text-orange-500" /> Flood Risk Predictor
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">AI-driven early warning system based on weather data and drainage topology.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 glass-panel border-orange-500/20 h-[500px] overflow-hidden">
                    <CardHeader className="bg-orange-500/10 border-b border-orange-500/20">
                      <CardTitle className="text-orange-500 flex items-center gap-2"><MapPin className="h-5 w-5" /> Risk Hotspots</CardTitle>
                    </CardHeader>
                    <div className="h-full relative z-0">
                      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Circle center={[19.0760, 72.8777]} radius={50000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}>
                          <Popup>Mumbai: Critical Flood Risk (High Tide)</Popup>
                        </Circle>
                        <Circle center={[22.5726, 88.3639]} radius={40000} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.3 }}>
                          <Popup>Kolkata: Moderate Risk (Heavy Rainfall predicted)</Popup>
                        </Circle>
                      </MapContainer>
                    </div>
                  </Card>

                  <div className="space-y-6">
                     <Card className="glass-panel border-red-500/30 bg-red-500/5">
                        <CardHeader><CardTitle className="text-red-500 flex items-center gap-2"><AlertOctagon className="h-5 w-5" /> Critical Alert</CardTitle></CardHeader>
                        <CardContent>
                           <p className="text-sm font-bold text-foreground">Western Suburbs at 85% Risk level for coming 48 hours due to cyclonic circulation.</p>
                           <Button className="w-full mt-4 bg-red-500 text-white hover:bg-red-600 font-bold">Issue Evacuation Advisory</Button>
                        </CardContent>
                     </Card>
                     <Card className="glass-panel">
                        <CardHeader><CardTitle className="text-lg font-bold">Prediction Logic</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex justify-between items-center text-sm">
                              <span>Rainfall Intensity</span>
                              <Badge className="bg-red-100 text-red-600 border-none font-bold">Extreme</Badge>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span>Drainage Capacity</span>
                              <Badge className="bg-orange-100 text-orange-600 border-none font-bold">45%</Badge>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span>Soil Moisture</span>
                              <Badge className="bg-blue-100 text-blue-600 border-none font-bold">Saturated</Badge>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. LIVE CITY HEATMAP */}
            {activeTab === 'heatmap' && (
              <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <MapIcon className="h-8 w-8 text-emerald-500" /> Live City Heatmap
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">Real-time density mapping of reported civic issues across regions.</p>
                </div>

                <Card className="glass-panel border-emerald-500/20 h-[650px] overflow-hidden relative">
                  <div className="absolute top-6 left-6 z-[1000] p-4 bg-background/80 backdrop-blur-md border border-border/50 rounded-xl shadow-xl w-64">
                     <h3 className="font-bold text-sm uppercase tracking-wider mb-3">Density Legend</h3>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-red-500" /> Critical ({'>'}20 cases)</div>
                        <div className="flex items-center gap-2 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-orange-500" /> Active (10-20 cases)</div>
                        <div className="flex items-center gap-2 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-blue-500" /> Emerging (1-10 cases)</div>
                     </div>
                  </div>
                  
                  <div className="h-full relative z-0">
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="grayscale" />
                      {complaints.filter(c => c.latitude && c.longitude).map(c => (
                        <Circle 
                          key={c.id || c._id} 
                          center={[c.latitude, c.longitude]} 
                          radius={10000} 
                          pathOptions={{ 
                             color: c.severity === 'High' ? 'red' : c.severity === 'Medium' ? 'orange' : 'blue',
                             fillColor: c.severity === 'High' ? 'red' : c.severity === 'Medium' ? 'orange' : 'blue',
                             fillOpacity: 0.4 
                          }}
                        >
                          <Popup>
                             <div className="font-bold">{c.issue_type?.toUpperCase()}</div>
                             <div className="text-xs text-muted-foreground">{c.address}</div>
                          </Popup>
                        </Circle>
                      ))}
                    </MapContainer>
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* SMART ASSIGNMENT DIALOG */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px] glass-strong border-primary/20 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Smart Engineer Assignment
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              AI suggests engineers based on department match and workload capacity.
            </p>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 mt-4 custom-scrollbar">
            {!Array.isArray(filteredEngineers) || filteredEngineers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No suitable engineers found.</p>
            ) : (
              filteredEngineers.map(eng => {
                const isOptimal = eng.active_tasks < 2 && eng.activity_status === 'Available';
                return (
                  <div key={eng.id || eng._id} className={`p-4 rounded-xl border ${isOptimal ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-secondary/20'} flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{eng.name}</h4>
                        {isOptimal && <Badge className="bg-emerald-500 text-white text-[10px] py-0">Recommended</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{eng.dept_name} • {eng.active_tasks} tasks</p>
                      <p className={`text-[10px] font-bold mt-1 uppercase ${eng.activity_status === 'Available' ? 'text-emerald-500' : 'text-orange-500'}`}>{eng.activity_status}</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={eng.activity_status !== 'Available'}
                      onClick={() => handleAssign(eng.id || eng._id)}
                      className={isOptimal ? 'gradient-primary hover:scale-105 shadow-glow' : 'bg-secondary text-foreground hover:bg-secondary/80'}
                    >
                      Dispatch
                    </Button>
                  </div>
                )
              })
            )}
          </div>
          <DialogFooter className="mt-2 pt-4 border-t border-border/20">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
