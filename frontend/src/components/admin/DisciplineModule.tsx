import { useState, useEffect } from 'react';
import { 
  Shield, Users, AlertTriangle, CheckCircle, 
  Search, MoreVertical, Eye, 
  AlertOctagon, Ban, History, Download, 
  Clock, Info, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton";

interface Engineer {
  id: string;
  _id: string;
  name: string;
  department: string;
  assigned: number;
  violations: number;
  lateTasks: number;
  complianceScore: number;
  status: string;
  is_suspended: boolean;
  email: string;
  phone: string;
}

interface DisciplinaryLog {
  _id: string;
  engineer_id: string;
  admin_id: string;
  complaint_id: {
    reference_number: string;
    issue_type: string;
    status: string;
  };
  message: string;
  reason: string;
  responded: boolean;
  admin_decision: string;
  admin_notes: string;
  created_at: string;
}

interface DisciplineData {
  engineers: Engineer[];
  summary: {
    totalEngineers: number;
    violationsToday: number;
    activeWarnings: number;
    suspendedEngineers: number;
  };
}

export default function DisciplineModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DisciplineData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [logs, setLogs] = useState<DisciplinaryLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchDisciplineData();
  }, []);

  const fetchDisciplineData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/engineers/discipline`);
      if (!res.ok) throw new Error("Failed to load compliance data");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (id: string) => {
    setLoadingLogs(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/engineers/discipline/${id}/logs`);
      const result = await res.json();
      setLogs(result);
    } catch (err) {
      toast.error("Failed to load violation logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAction = async (engineerId: string, action: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/engineers/discipline/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineerId, action, reason: "Manual admin action" })
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success(`${action} applied successfully`);
      fetchDisciplineData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openDetails = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    fetchLogs(engineer.id || engineer._id);
    setDetailsModalOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (score >= 50) return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Good': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">GOOD</Badge>;
      case 'Warning': return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">WARNING</Badge>;
      case 'Critical': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">CRITICAL</Badge>;
      case 'Suspend Candidate': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">SUSPEND READY</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-secondary/50" />)}
        </div>
        <Skeleton className="h-[500px] rounded-2xl bg-secondary/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-destructive/5 rounded-3xl border-2 border-dashed border-destructive/20 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-black text-foreground mb-2">Failed to load compliance data</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchDisciplineData} className="gradient-primary">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry Connection
        </Button>
      </div>
    );
  }

  const engineers = data?.engineers || [];
  const filteredEngineers = engineers.filter((eng: Engineer) => {
    const matchesSearch = eng.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "All" || eng.department === deptFilter;
    const matchesStatus = statusFilter === "All" || eng.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = ["All", ...new Set(engineers.map((e: Engineer) => e.department))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-destructive" /> Compliance & Discipline
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Monitor engineer accountability and enforce operational discipline.</p>
        </div>
        <div className="hidden md:flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl font-bold bg-secondary/20 border-border/40">
                <Download className="h-4 w-4 mr-2" /> Export Report
            </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Engineers', value: data.summary.totalEngineers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Violations Today', value: data.summary.violationsToday, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Active Warnings', value: data.summary.activeWarnings, icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Suspended Engineers', value: data.summary.suspendedEngineers, icon: Ban, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="glass-panel border-border/40 hover:border-border transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bg} rounded-bl-full opacity-50 group-hover:scale-110 transition-transform`} />
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-4xl font-black text-foreground mb-1">{stat.value}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FILTER PANEL */}
      <Card className="glass-panel border-border/40 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search engineer name..." 
              className="pl-10 h-11 bg-secondary/30 border-border/40 rounded-xl font-medium" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-11 bg-secondary/30 border border-border/40 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none min-w-[150px] appearance-none cursor-pointer"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            {(departments as string[]).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            className="h-11 bg-secondary/30 border border-border/40 rounded-xl px-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none min-w-[150px] appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Good">Good</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
            <option value="Suspend Candidate">Suspend Candidate</option>
          </select>
        </div>
      </Card>

      {/* ENGINEER DISCIPLINE TABLE */}
      <div className="overflow-hidden rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/50 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Engineer Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Violations</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredEngineers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-50">
                        <Users className="h-12 w-12 mb-2 text-muted-foreground" />
                        <p className="font-bold text-lg text-muted-foreground italic">No discipline records found matching your criteria</p>
                        <p className="text-sm text-muted-foreground">Start monitoring engineer compliance by assigning tasks.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEngineers.map((eng: Engineer) => (
                  <tr key={eng.id || eng._id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs ${getScoreColor(eng.complianceScore)}`}>
                          {eng.name.charAt(0)}
                        </div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{eng.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-muted-foreground">{eng.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black">{eng.assigned}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-black ${eng.violations > 0 ? 'text-destructive animate-pulse' : 'text-emerald-500'}`}>
                        {eng.violations}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-lg font-black ${getScoreColor(eng.complianceScore).split(' ')[0]}`}>
                        {eng.complianceScore}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(eng.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl h-9 hover:bg-secondary/80 font-bold"
                          onClick={() => openDetails(eng)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-panel border-border/40 w-48">
                              <DropdownMenuItem onClick={() => handleAction(eng.id || eng._id, 'WARNING')} className="font-bold focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer p-3">
                                  <AlertOctagon className="h-4 w-4 mr-2" /> Issue Warning
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(eng.id || eng._id, 'PENALTY')} className="font-bold focus:bg-destructive/10 focus:text-destructive cursor-pointer p-3">
                                  <AlertTriangle className="h-4 w-4 mr-2" /> Apply Penalty
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(eng.id || eng._id, 'SUSPEND')} className="font-bold text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer p-3">
                                  <Ban className="h-4 w-4 mr-2" /> Suspend
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS MODAL */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl glass-panel border-border/40 rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <div className="flex justify-between items-start">
               <div className="flex gap-4 text-left">
                  <div className={`h-16 w-16 rounded-3xl flex shrink-0 items-center justify-center font-black text-2xl shadow-glow-sm ${selectedEngineer ? getScoreColor(selectedEngineer.complianceScore) : ''}`}>
                    {selectedEngineer?.name?.charAt(0)}
                  </div>
                  <div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black tracking-widest mb-1">PRO-RESOLVER UNIT</Badge>
                    <DialogTitle className="text-3xl font-black text-foreground">{selectedEngineer?.name}</DialogTitle>
                    <p className="text-muted-foreground font-bold">{selectedEngineer?.department}</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className={`text-4xl font-black ${selectedEngineer ? getScoreColor(selectedEngineer.complianceScore).split(' ')[0] : ''}`}>{selectedEngineer?.complianceScore}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Compliance Score</div>
               </div>
            </div>
          </DialogHeader>

          <div className="p-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/20 text-center">
                   <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total Assignments</p>
                   <p className="text-xl font-black">{selectedEngineer?.assigned}</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/20 text-center">
                   <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Critical Violations</p>
                   <p className="text-xl font-black text-destructive">{selectedEngineer?.violations}</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/20 text-center">
                   <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Late Resolutions</p>
                   <p className="text-xl font-black text-orange-500">{selectedEngineer?.lateTasks}</p>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                   <History className="h-4 w-4" /> Disciplinary Timeline
                </h3>
                
                {loadingLogs ? (
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-secondary/30" />)}
                   </div>
                ) : logs.length === 0 ? (
                   <div className="p-12 text-center bg-secondary/10 rounded-3xl border-2 border-dashed border-border/40 text-muted-foreground italic">
                      Zero disciplinary logs found. Excellent compliance record.
                   </div>
                ) : (
                   <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
                      {logs.map((log, i) => (
                         <div key={log._id || i} className="relative pl-10 group text-left">
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${log.admin_decision === 'Rejected' ? 'bg-destructive' : 'bg-primary'}`}>
                                <div className="h-1.5 w-1.5 rounded-full bg-background" />
                            </div>
                            <div className="p-4 glass-panel border-border/20 rounded-2xl">
                               <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-sm">Case REF: {log.complaint_id?.reference_number || 'N/A'}</h4>
                                  <Badge variant="outline" className={`text-[10px] uppercase font-black ${log.admin_decision === 'Rejected' ? 'text-destructive' : 'text-emerald-500'}`}>{log.admin_decision}</Badge>
                               </div>
                               <p className="text-xs text-muted-foreground mb-3 italic">"{log.message}"</p>
                               <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className="text-primary flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(log.created_at).toLocaleDateString()}</span>
                                  <span className="text-muted-foreground uppercase">{log.complaint_id?.issue_type?.replace('_', ' ')}</span>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <div className="mt-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-start gap-4 text-left">
                <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                   <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">AI Recommendation</p>
                   <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {selectedEngineer?.complianceScore >= 90 
                        ? "Top performing engineer. Eligible for incentive program and mentoring roles."
                        : selectedEngineer?.complianceScore >= 70
                        ? "Stable performance. Monitor recent minor delays in resolution feedback."
                        : selectedEngineer?.complianceScore >= 50
                        ? "High risk detected. Immediate performance review and retraining suggested."
                        : "Candidate for temporary suspension. Repeated violations detected in core protocols."}
                   </p>
                </div>
             </div>
          </div>

          <DialogFooter className="p-8 bg-secondary/10 border-t border-border/40">
             <div className="flex w-full justify-between items-center">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-mono">RID: {selectedEngineer?.id || selectedEngineer?._id}</div>
                <Button onClick={() => setDetailsModalOpen(false)} className="rounded-xl px-8 font-black uppercase text-xs tracking-widest gradient-primary text-white">Close Dashboard</Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
