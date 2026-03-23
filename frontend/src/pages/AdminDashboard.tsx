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
  const [providedTime, setProvidedTime] = useState<number>(24);

  // Detail Modals
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState<any>(null);
  const [engineerModalOpen, setEngineerModalOpen] = useState(false);
  const [viewingEngineer, setViewingEngineer] = useState<any>(null);
  
  // Notice Modal
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("Show-cause: The resolution provided is unsatisfactory. Provide a valid reason within 24h.");
  
  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<'created_at' | 'predicted_days' | 'severity'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
    
    // AI RECOMMENDER LOGIC (Advanced Department & Expertise Match)
    const suggested = engineers.map(eng => {
      let score = 0;
      
      // 1. Strategic Department Alignment
      let primaryDept = "Roads & Civil Works";
      if (['waterlogging', 'leak', 'drainage'].includes(complaint.issue_type)) primaryDept = "Water & Sanitation";
      if (['broken_streetlight', 'wires', 'electricity'].includes(complaint.issue_type)) primaryDept = "Electricity Board";
      if (['garbage', 'waste', 'dumping'].includes(complaint.issue_type)) primaryDept = "Sanitation & Waste";
      if (['pothole', 'structural_damage'].includes(complaint.issue_type)) primaryDept = "Roads & Highways";

      if (eng.dept_name === primaryDept) score += 5;

      // 2. Specialty Keyword Match (Area of Expertise)
      const expertiseArr = (eng.area_expertise || "").toLowerCase().split(',').map((s: string) => s.trim());
      const issueTypeStr = (complaint.issue_type || "").toLowerCase();
      
      if (expertiseArr.some((ex: string) => ex.includes(issueTypeStr) || issueTypeStr.includes(ex))) {
        score += 15; // Higher weight for direct expertise
      }
      
      // 3. Experience & Seniority Tiering
      if (eng.experience_level === 'Expert') score += 5;
      if (eng.experience_level === 'Senior') score += 3;

      // 4. Operational Bandwidth Penalty
      score -= (eng.active_tasks || 0) * 3; // Heavily penalize busy engineers
      
      // 5. Availability Bonus
      if (eng.activity_status === 'Available') score += 5;
      
      return { ...eng, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);

    setFilteredEngineers(suggested);
    
    const defaultHours = ((complaint.predicted_days || 1) + 1) * 24;
    setProvidedTime(defaultHours);
    setAssignModalOpen(true);
  };

  const handleAssign = async (engineerId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          complaint_id: selectedComplaint.id || selectedComplaint._id, 
          engineer_id: engineerId,
          provided_time: providedTime
        })
      });
      if (!res.ok) throw new Error("Assignment failed");
      toast.success("Engineer Assigned Successfully");
      setAssignModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSendNotice = async () => {
    try {
      const assignment = await fetch(`${import.meta.env.VITE_API_URL}/complaints/notices/find?complaint_id=${selectedComplaint._id || selectedComplaint.id}`).then(res => res.json());
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint_id: selectedComplaint._id || selectedComplaint.id,
          engineer_id: selectedComplaint.engineer_id || assignment.engineer_id,
          admin_id: "65f1a2b3c4d5e6f7a8b9c0d1", // Hardcoded Admin ID for now or get from auth
          message: noticeMessage
        })
      });
      if (!res.ok) throw new Error("Failed to send notice");
      toast.success("Notice Issued to Engineer");
      setNoticeModalOpen(false);
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

  const sortedComplaints = [...complaints].sort((a, b) => {
    // Top Priority: Dissatisfied Citizens
    if (a.satisfaction_status === 'Dissatisfied' && b.satisfaction_status !== 'Dissatisfied') return -1;
    if (a.satisfaction_status !== 'Dissatisfied' && b.satisfaction_status === 'Dissatisfied') return 1;

    let valA = a[sortBy];
    let valB = b[sortBy];

    // Severity weighing for sorting
    if (sortBy === 'severity') {
      const weights: any = { 'High': 3, 'Medium': 2, 'Low': 1 };
      valA = weights[a.severity] || 0;
      valB = weights[b.severity] || 0;
    }

    if (sortOrder === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

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
                  <div className="flex gap-2">
                    <select 
                      value={sortBy} 
                      onChange={(e: any) => setSortBy(e.target.value as any)}
                      className="bg-secondary/30 border border-border/50 rounded-md px-3 text-sm h-12 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="created_at">Report Date</option>
                      <option value="predicted_days">AI Predicted Time</option>
                      <option value="severity">Severity Level</option>
                    </select>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12 border-border/50"
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                      <TrendingUp className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center p-12"><Activity className="animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-4">
                    {sortedComplaints.map(c => (
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
                              <span className="flex items-center text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md">
                                <Clock className="h-3.5 w-3.5 mr-1" /> AI ETA: {c.predicted_days} Days
                              </span>
                              {c.status !== "New" && c.assigned_engineer_name && (
                                <span className="flex items-center text-purple-500 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                                  <Users className="h-3.5 w-3.5 mr-1" /> Assigned: {c.assigned_engineer_name} ({c.assigned_engineer_dept || 'Resolver'})
                                </span>
                              )}
                              <span className="flex items-center text-muted-foreground">
                                {new Date(c.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                            <div className="flex flex-col items-center justify-end shrink-0 md:justify-start mt-4 md:mt-0 gap-2">
                            <Button variant="outline" onClick={() => { setViewingComplaint(c); setComplaintModalOpen(true); }} className="w-full md:w-auto border-primary/30 hover:bg-primary/10 font-bold">
                              View Details
                            </Button>
                            {c.status === "New" && (
                              <Button onClick={() => handleOpenAssign(c)} className="w-full md:w-auto gradient-primary text-primary-foreground font-bold shadow-glow">
                                AI Suggest Engineer
                              </Button>
                            )}
                            {c.satisfaction_status === "Dissatisfied" && (
                              <Button 
                                variant="destructive" 
                                onClick={() => { 
                                  setSelectedComplaint(c); 
                                  setNoticeMessage(`Disciplinary Notice: A citizen has reported dissatisfaction with your resolution for Ref: ${c.reference_number}. AI Analysis: ${c.resolution_analysis?.analysis || 'Conflict detected'}. Please provide a formal explanation immediately.`);
                                  setNoticeModalOpen(true); 
                                }} 
                                className="w-full md:w-auto font-black shadow-glow animate-pulse"
                              >
                                <AlertOctagon className="mr-2 h-4 w-4" /> Issue One-Click Notice
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
                         <div className="flex-1">
                           <h4 className="text-xl font-bold text-foreground">{eng.name}</h4>
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
                        <Button onClick={() => { setViewingEngineer(eng); setEngineerModalOpen(true); }} className="w-full mt-6 bg-secondary text-foreground hover:bg-secondary/80 font-bold">View Full Profile</Button>
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
          <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Set Resolution Deadline</h4>
            <div className="flex items-center gap-4">
               <div className="flex-1">
                  <Input 
                    type="number" 
                    value={providedTime} 
                    onChange={(e) => setProvidedTime(parseInt(e.target.value) || 1)}
                    className="h-10 bg-background border-border"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                    Total hours allocated for resolution (Includes 1 Day SNRP Buffer)
                  </p>
               </div>
               <div className="px-4 py-2 bg-secondary rounded-lg text-xs font-bold whitespace-nowrap">
                  ≈ {(providedTime / 24).toFixed(1)} Days
               </div>
            </div>
          </div>

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

      {/* COMPLAINT DETAIL DIALOG */}
      <Dialog open={complaintModalOpen} onOpenChange={setComplaintModalOpen}>
        <DialogContent className="sm:max-w-[700px] glass-strong border-primary/20 shadow-elevated max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
              <FileText className="h-6 w-6 text-primary" /> Complaint Details
            </DialogTitle>
          </DialogHeader>

          {viewingComplaint && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-border/50 bg-secondary/20 aspect-video">
                    {viewingComplaint.before_image ? (
                      <img src={viewingComplaint.before_image} alt="Issue" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mb-2" />
                        <p className="font-bold">No Image Provided</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(viewingComplaint.status)}>{viewingComplaint.status}</Badge>
                    <div className="flex gap-2">
                       {getSeverityBadge(viewingComplaint.severity)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Issue Type</h4>
                    <p className="text-lg font-bold text-foreground capitalize">{viewingComplaint.issue_type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Reference Number</h4>
                    <p className="text-sm font-mono font-bold text-primary">{viewingComplaint.reference_number}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Reported By</h4>
                    <p className="text-sm font-bold text-foreground">{viewingComplaint.citizen_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Reported At</h4>
                    <p className="text-sm text-foreground">{new Date(viewingComplaint.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Location Address</h4>
                  <p className="text-sm text-foreground flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {viewingComplaint.address || 'Manual Location Set'}
                  </p>
                  {(viewingComplaint.latitude && viewingComplaint.longitude) && (
                    <p className="text-[10px] text-muted-foreground font-bold mt-1 ml-6">
                      GPS: {viewingComplaint.latitude.toFixed(6)}, {viewingComplaint.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm text-foreground leading-relaxed bg-secondary/20 p-4 rounded-xl border border-border/30">
                    {viewingComplaint.description || "No additional description provided."}
                  </p>
                </div>
              </div>

              {viewingComplaint.status === 'New' && (
                <div className="pt-4 border-t border-border/30">
                   <Button onClick={() => { setComplaintModalOpen(false); handleOpenAssign(viewingComplaint); }} className="w-full h-12 gradient-primary text-primary-foreground font-bold shadow-glow">
                      Proceed to Engineer Assignment
                   </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ENGINEER DETAIL DIALOG */}
      <Dialog open={engineerModalOpen} onOpenChange={setEngineerModalOpen}>
        <DialogContent className="sm:max-w-[500px] glass-strong border-purple-500/20 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
              <Users className="h-6 w-6 text-purple-500" /> Engineer Profile
            </DialogTitle>
          </DialogHeader>

          {viewingEngineer && (
            <div className="space-y-6 py-4">
               <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                     <Users className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-foreground">{viewingEngineer.name}</h3>
                     <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">{viewingEngineer.dept_name || 'N/A'}</p>
                     <Badge className={`mt-2 ${getEngineerStatusColor(viewingEngineer.activity_status)}`}>
                        {viewingEngineer.activity_status}
                     </Badge>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Email Address</h4>
                    <p className="text-sm font-bold text-foreground truncate">{viewingEngineer.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Phone Number</h4>
                    <p className="text-sm font-bold text-foreground">{viewingEngineer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Experience</h4>
                    <p className="text-sm font-bold text-foreground">{viewingEngineer.experience_level || 'Senior'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Government ID</h4>
                    <p className="text-sm font-mono font-bold text-primary">{viewingEngineer.gov_id || 'VERIFIED'}</p>
                  </div>
               </div>

               <div className="space-y-3 pt-4 border-t border-border/30">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Expertise & Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {viewingEngineer.area_expertise?.split(',').map((ex: string) => (
                          <Badge key={ex} variant="secondary" className="bg-secondary/50 font-bold">{ex.trim()}</Badge>
                        )) || <Badge variant="secondary">Civic Management</Badge>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Service Area</h4>
                    <p className="text-sm text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      {viewingEngineer.city ? `${viewingEngineer.area || ''}, ${viewingEngineer.city}, ${viewingEngineer.state || ''}` : 'Regional Head Office'}
                    </p>
                  </div>
                  <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Workload Status</span>
                        <span className="text-sm font-black text-purple-500">{viewingEngineer.active_tasks} Active Tasks</span>
                     </div>
                  </div>
               </div>

               <Button onClick={() => setEngineerModalOpen(false)} className="w-full bg-secondary text-foreground hover:bg-secondary/80 font-bold">
                  Close Profile
               </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ISSUE NOTICE DIALOG */}
      <Dialog open={noticeModalOpen} onOpenChange={setNoticeModalOpen}>
        <DialogContent className="sm:max-w-[450px] glass-strong border-destructive/20 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
              <AlertOctagon className="h-5 w-5" /> Issue Disciplinary Notice
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
             <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Notice Message</h4>
                <textarea 
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full h-32 bg-secondary/30 border border-destructive/20 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-destructive"
                />
             </div>
             <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                <p className="text-xs text-destructive font-bold">
                  This notice will be pinned to the engineer's terminal and requires a mandatory response.
                </p>
             </div>
          </div>

          <DialogFooter>
             <Button variant="ghost" onClick={() => setNoticeModalOpen(false)}>Cancel</Button>
             <Button onClick={handleSendNotice} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold shadow-glow-destructive">
                Confirm & Send Notice
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
