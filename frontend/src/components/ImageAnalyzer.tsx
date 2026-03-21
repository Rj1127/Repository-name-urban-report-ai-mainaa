import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { IssueType } from '@/types/database';

interface Props {
  onAnalysisComplete: (result: {
    issueType: IssueType | string;
    confidence: number;
    description: string;
    imageUrl: string;
  }) => void;
}

export default function ImageAnalyzer({ onAnalysisComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [rejected, setRejected] = useState<string | null>(null);

  // WebRTC Camera State
  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setUseWebcam(true);
    } catch (err) {
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseWebcam(false);
  };

  useEffect(() => {
    return () => { stopWebcam(); };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreview(dataUrl);
        canvas.toBlob(blob => {
          if (blob) setFile(new File([blob], "camera-capture.jpg", { type: "image/jpeg" }));
        }, 'image/jpeg');
        stopWebcam();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setRejected(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const analyzeImage = async () => {
    if (!file || !preview) return;
    setAnalyzing(true);
    setRejected(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: preview })
      });

      const data = await res.json();

      if (!res.ok) {
        setRejected(data.error || "Failed to analyze image with AI.");
        setAnalyzing(false);
        return;
      }

      if (data.issueType === 'other' || data.confidence < 0.5) {
        setRejected('Deep Analysis Warning: Image lacks clear evidence of a civic issue. Please upload a clearer photograph.');
        setAnalyzing(false);
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setResult(data);
      onAnalysisComplete({ ...data, imageUrl });
      setAnalyzing(false);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Network error during deep AI analysis.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {useWebcam ? (
          <div className="group relative overflow-hidden rounded-xl border border-border/50 shadow-card bg-black h-[280px] flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover transform -scale-x-100" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
              <Button onClick={capturePhoto} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-12 px-6 shadow-glow border border-emerald-400/50">
                <Camera className="mr-2 h-5 w-5" /> Snap Photo
              </Button>
              <Button onClick={stopWebcam} variant="destructive" size="icon" className="h-12 w-12 rounded-full border border-destructive-foreground/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : preview ? (
          <div className="group relative overflow-hidden rounded-xl border border-border/50 shadow-card">
            <img src={preview} alt="Issue preview" className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        ) : (
          <div className="flex flex-col h-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/20 transition-all duration-300 hover:border-primary/50 group px-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

            <div className="flex items-center gap-6 mb-5 relative z-10">
              <label className="flex flex-col items-center justify-center cursor-pointer group/btn">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-all group-hover/btn:bg-blue-500/20 group-hover/btn:shadow-glow border border-blue-500/20">
                  <Upload className="h-7 w-7" />
                </motion.div>
                <span className="mt-3 text-sm font-bold text-foreground transition-colors group-hover/btn:text-blue-500">Upload Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>

              <div className="w-px bg-primary/20 h-16 rounded-full" />

              <label className="flex flex-col items-center justify-center cursor-pointer group/btn" onClick={(e) => { e.preventDefault(); startWebcam(); }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all group-hover/btn:bg-emerald-500/20 group-hover/btn:shadow-glow border border-emerald-500/20">
                  <Camera className="h-7 w-7" />
                </motion.div>
                <span className="mt-3 text-sm font-bold text-foreground transition-colors group-hover/btn:text-emerald-500">Take Photo</span>
              </label>
            </div>

            <span className="text-base font-bold text-foreground relative z-10">Provide Issue Evidence</span>
            <span className="mt-1.5 text-xs text-muted-foreground font-medium max-w-[280px] relative z-10 leading-relaxed">Smart Nagar Reporting portal (SNRP) will detect the problem automatically</span>
          </div>
        )}
      </div>

      {preview && !result && !rejected && !useWebcam && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={analyzeImage} disabled={analyzing} className="w-full h-14 gradient-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all duration-300 hover:shadow-glow translate-y-2">
            {analyzing ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing Environment…</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />Generate AI Report</>
            )}
          </Button>
        </motion.div>
      )}

      {preview && !useWebcam && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setPreview(null); setFile(null); setResult(null); setRejected(null); }}
          className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors pt-4"
        >
          Choose Different Image
        </Button>
      )}
    </div>
  );
}
