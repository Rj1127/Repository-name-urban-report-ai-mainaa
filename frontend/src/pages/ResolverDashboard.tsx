import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, CheckCircle, Clock, MapPin, Upload, Camera, AlertTriangle, Hash, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function ResolverDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution Flow
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints?engineer_id=${user?.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openResolveModal = (task: any) => {
    setSelectedTask(task);
    setAfterImagePreview(null);
    setResolveModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAfterImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitResolution = async () => {
    if (!afterImagePreview) return toast.error("Please upload proof of resolution");

    setUploading(true);
    try {
      // POST the after_image to the backend to trigger AI Validation
      const payload = {
        complaint_id: selectedTask.id,
        engineer_id: user?.id,
        after_image: afterImagePreview
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit resolution");

      toast.success(data.message);
      setResolveModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message, { duration: 5000 });
      // Clear image if AI fake-validator caught it
      if (err.message.includes("AI Warning")) {
        setAfterImagePreview(null);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1400px] mx-auto">
        <DashboardSidebar />
        <main className="container max-w-5xl py-8 flex-1 overflow-y-auto hide-scrollbar">
          <div className="mb-8 p-6 bg-secondary/20 border border-border/50 rounded-2xl flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
              <Wrench className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Engineer Field Terminal</h1>
              <p className="text-muted-foreground mt-1 text-sm">Active deployments: {Array.isArray(tasks) ? tasks.filter(t => !['Resolved', 'Closed'].includes(t.status)).length : 0}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-12 text-muted-foreground">Syncing Tasks...</div>
          ) : !Array.isArray(tasks) || tasks.length === 0 ? (
            <Card className="glass-panel p-12 text-center text-muted-foreground flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-success/50 mb-4" />
              <p className="font-medium text-lg">No active assignments.</p>
              <p className="text-sm mt-1">Stand by for dispatch from Command Center.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {tasks.map(task => {
                  const isCompleted = ['Resolved', 'Closed'].includes(task.status);
                  return (
                    <motion.div key={task.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className={`glass-panel overflow-hidden border ${isCompleted ? 'opacity-70 border-success/30' : 'border-primary/20 hover:border-primary/50'} transition-all shadow-card h-full flex flex-col group`}>

                        <div className="relative h-48 w-full bg-secondary shrink-0 overflow-hidden">
                          {task.before_image ?
                            <img src={task.before_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Issue" /> :
                            <div className="flex h-full items-center justify-center"><AlertTriangle className="h-8 w-8 text-muted-foreground" /></div>
                          }
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Badge className={`${isCompleted ? 'bg-success text-white' : 'bg-orange-500 text-white animate-pulse shadow-glow'}`}>{task.status}</Badge>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-foreground text-lg uppercase truncate">{task.issue_type?.replace('_', ' ')}</h3>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">
                              <Hash className="h-3 w-3 inline mr-0.5" />{task.reference_number}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 line-clamp-2 flex-1">{task.description}</p>

                          <div className="mt-4 space-y-2 mb-6">
                            <p className="text-xs text-muted-foreground flex items-center bg-secondary/50 p-2 rounded-md">
                              <MapPin className="h-4 w-4 mr-2 text-primary" /> {task.address || `Coordinates: ${task.latitude}, ${task.longitude}`}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center bg-secondary/50 p-2 rounded-md">
                              <Clock className="h-4 w-4 mr-2 text-orange-500" /> Allocated Duration: {task.predicted_days} Days
                            </p>
                          </div>

                          <div className="mt-auto">
                            {!isCompleted ? (
                              <Button onClick={() => openResolveModal(task)} className="w-full gradient-primary hover:shadow-glow font-bold text-primary-foreground">
                                Record Completion & Upload Proof
                              </Button>
                            ) : (
                              <Button disabled className="w-full bg-success/20 text-success border border-success/30 font-bold opacity-100">
                                <CheckCircle className="h-4 w-4 mr-2" /> Pending Citizen Approval
                              </Button>
                            )}
                          </div>
                        </div>

                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* RESOLUTION UPLOAD DIALOG */}
        <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
          <DialogContent className="sm:max-w-[450px] glass-strong border-primary/20 shadow-elevated">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Upload Proof of Work
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                UrbanShield AI automatically compares your After image with the Before image. Ensure the repair is clearly visible to prevent AI rejection.
              </p>
            </DialogHeader>

            <div className="my-4">
              {afterImagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border/50 group">
                  <img src={afterImagePreview} alt="Resolution" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button variant="secondary" size="sm" onClick={() => setAfterImagePreview(null)}>Retake</Button>
                  </div>
                </div>
              ) : (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-secondary/20 transition-all hover:bg-primary/5 hover:border-primary">
                  <Camera className="mb-2 h-10 w-10 text-primary opacity-80" />
                  <span className="text-sm font-bold text-foreground">Tap to capture image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              )}

              <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex gap-3 text-orange-500 text-xs">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <p><strong>Warning:</strong> The AI validator will block duplicate uploads of the Before image or identical scene states.</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setResolveModalOpen(false)}>Cancel</Button>
              <Button onClick={submitResolution} disabled={uploading || !afterImagePreview} className="gradient-primary text-primary-foreground shadow-glow">
                {uploading ? 'Validating AI...' : 'Submit Resolution Proof'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
