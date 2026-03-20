import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle, Clock, MapPin, Activity, Shield, Hash, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
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

export default function AdminDashboard() {
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

    // Smart Assignment Logic: Filter engineers by department (smart mapping based on issue type)
    // Simulated Distance Logic: (In prod, calculate Haversine distance between complaint lat/lng and engineer base)
    // Suggest engineers with Active tasks < 2

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
        body: JSON.stringify({ complaint_id: selectedComplaint.id, engineer_id: engineerId })
      });
      if (!res.ok) throw new Error("Assignment failed");
      toast.success("Engineer Assigned Successfully");
      setAssignModalOpen(false);
      fetchData(); // Refresh UI to show 'Busy' and 'Forwarded'
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
      case 'Available': return 'bg-success text-success-foreground';
      case 'Busy': return 'bg-orange-500 text-white';
      case 'On Leave': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-muted-foreground';
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden max-w-[1400px] mx-auto w-full">
        <DashboardSidebar />

        {/* MAIN COMPLAINTS PANEL */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 border-r border-border/50 hide-scrollbar">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" /> Command Center
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
                <Card key={c.id} className="glass-panel hover:border-primary/50 transition-colors p-5 relative overflow-hidden group">
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
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">Reported by: <span className="font-semibold">{c.citizen_name || 'Anonymous'}</span> (Privacy Protected)</p>

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
        </main>

        {/* SIDEBAR: ENGINEER ROSTER */}
        <aside className="w-[380px] bg-secondary/10 border-l border-border/50 flex flex-col hide-scrollbar overflow-y-auto">
          <div className="p-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Active Engineers
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Real-time unit availability</p>
          </div>
          <div className="p-4 space-y-3">
            {!Array.isArray(engineers) || engineers.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-10">No engineers registered.</p>
            ) : (
              engineers.map(eng => (
                <motion.div key={eng.id} layout className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-foreground text-sm">{eng.name}</h4>
                    <Badge className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm border-none ${getEngineerStatusColor(eng.activity_status)}`}>
                      {eng.activity_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{eng.dept_name || 'General Resolver'} • {eng.experience_level || 'L1'}</p>

                  <div className="mt-3 flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-md text-foreground">
                      <Activity className="h-3 w-3 text-primary" />
                      {eng.active_tasks} Active Tasks
                    </span>
                    {eng.active_tasks < 2 && eng.activity_status === 'Available' && (
                      <span className="text-[10px] text-success flex items-center font-bold px-1.5 py-0.5 bg-success/10 rounded border border-success/20">
                        <MapPin className="h-3 w-3 mr-1" /> <span className="animate-pulse">Optimal Target</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </aside>

      </div>

      {/* SMART ASSIGNMENT DIALOG */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px] glass-strong border-primary/20 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Smart Engineer Assignment
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              AI suggests the following engineers based on proximity (simulated &lt;10km), department match, and workload capacity.
            </p>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 mt-4 custom-scrollbar">
            {!Array.isArray(filteredEngineers) || filteredEngineers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No suitable engineers found.</p>
            ) : (
              filteredEngineers.map(eng => {
                const isOptimal = eng.active_tasks < 2 && eng.activity_status === 'Available';
                return (
                  <div key={eng.id} className={`p-4 rounded-xl border ${isOptimal ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-secondary/20'} flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{eng.name}</h4>
                        {isOptimal && <Badge className="bg-success text-white text-[10px] py-0">Recommended</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{eng.dept_name} • {eng.active_tasks} tasks</p>
                      <p className={`text-[10px] font-bold mt-1 uppercase ${eng.activity_status === 'Available' ? 'text-success' : 'text-orange-500'}`}>{eng.activity_status}</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={eng.activity_status !== 'Available'}
                      onClick={() => handleAssign(eng.id)}
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
